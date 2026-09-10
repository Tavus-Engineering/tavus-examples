from dotenv import load_dotenv

load_dotenv()

import asyncio
import json
import logging
import os
import time

from livekit import agents, rtc
from livekit.agents import Agent, AgentSession, RoomOutputOptions, WorkerOptions, cli, inference
from livekit.plugins import tavus

logger = logging.getLogger("tavus-latency")

# Topic used for the per-step latency marks published over the LiveKit data channel.
# The browser UI in static/index.html listens on the same topic and merges these
# with its own client-side marks into a single timeline.
LATENCY_TOPIC = "latency"


class Timeline:
    """Records wall-clock marks for each step of avatar startup and publishes them
    to the room so a client can build an end-to-end timeline.

    Marks recorded before the room is connected are buffered and flushed on attach().
    """

    def __init__(self) -> None:
        self.marks: list[dict] = []
        self._room: rtc.Room | None = None
        self._pending: list[dict] = []
        self._first: dict[str, bool] = {}

    def mark(self, name: str, **extra) -> dict:
        rec = {"source": "agent", "name": name, "t_ms": int(time.time() * 1000), **extra}
        prev = self.marks[-1]["t_ms"] if self.marks else rec["t_ms"]
        self.marks.append(rec)
        logger.info(
            "[latency] %-34s +%6d ms since previous  %s",
            name,
            rec["t_ms"] - prev,
            json.dumps(extra) if extra else "",
        )
        if self._room is not None and self._room.isconnected():
            asyncio.create_task(self._send(rec))
        else:
            self._pending.append(rec)
        return rec

    def mark_once(self, name: str, **extra) -> None:
        """Record a mark only the first time it is seen (e.g. first video frame)."""
        if self._first.get(name):
            return
        self._first[name] = True
        self.mark(name, **extra)

    def attach(self, room: rtc.Room) -> None:
        self._room = room
        pending, self._pending = self._pending, []
        for rec in pending:
            asyncio.create_task(self._send(rec))

    async def _send(self, rec: dict) -> None:
        if self._room is None:
            return
        try:
            await self._room.local_participant.publish_data(
                json.dumps(rec), reliable=True, topic=LATENCY_TOPIC
            )
        except Exception:
            logger.exception("failed to publish latency mark %s", rec["name"])

    def delta(self, a: str, b: str) -> int | None:
        ta = next((m["t_ms"] for m in self.marks if m["name"] == a), None)
        tb = next((m["t_ms"] for m in self.marks if m["name"] == b), None)
        if ta is None or tb is None:
            return None
        return tb - ta


# Cartesia "Jacqueline" — the voice used in LiveKit's own Inference docs/starter.
# Override with TTS_VOICE. (The previous default voice no longer produces audio:
# the gateway returns "TTS provider completed without producing audio".)
DEFAULT_TTS_VOICE = "db6b0ed5-d5d3-463d-ae85-518a07d3c2b4"


def _build_tts():
    # LiveKit Inference is the default. Set TTS_PROVIDER=cartesia to call Cartesia
    # directly with CARTESIA_API_KEY (useful if Inference returns no audio frames).
    voice = os.getenv("TTS_VOICE", DEFAULT_TTS_VOICE)
    if os.getenv("TTS_PROVIDER", "inference").lower() == "cartesia":
        from livekit.plugins import cartesia

        return cartesia.TTS(
            model=os.getenv("CARTESIA_MODEL", "sonic-3.6"),
            voice=voice,
            language="en",
        )
    return inference.TTS(
        model=os.getenv("INFERENCE_TTS_MODEL", "cartesia/sonic-3"),
        voice=voice,
        language="en",
    )


async def entrypoint(ctx: agents.JobContext):
    tl = Timeline()
    tl.mark("agent.job_received", room=ctx.room.name)

    await ctx.connect()
    tl.attach(ctx.room)
    tl.mark(
        "agent.room_connected",
        remote_participants=[p.identity for p in ctx.room.remote_participants.values()],
    )

    session = AgentSession(
        stt=inference.STT(
            model="deepgram/nova-3",
            language="en",
        ),
        llm=inference.LLM(model="openai/gpt-4o"),
        tts=_build_tts(),
        turn_detection="vad",
    )

    agent = Agent(
        instructions="You are a helpful AI assistant with a friendly personality. Engage in natural conversation and help users with their questions."
    )

    avatar = tavus.AvatarSession(
        face_id=os.getenv("TAVUS_FACE_ID", "rc39f215e8cb"),
        pal_id=os.getenv("TAVUS_PAL_ID", "p192574ecb04"),
    )
    avatar_identity = avatar.avatar_identity

    # --- Room-level events for the Tavus avatar participant --------------------
    @ctx.room.on("participant_connected")
    def _on_participant_connected(p: rtc.RemoteParticipant):
        if p.identity == avatar_identity:
            tl.mark_once("agent.avatar_participant_joined", identity=p.identity)

    @ctx.room.on("track_published")
    def _on_track_published(pub: rtc.RemoteTrackPublication, p: rtc.RemoteParticipant):
        if p.identity != avatar_identity:
            return
        kind = "video" if pub.kind == rtc.TrackKind.KIND_VIDEO else "audio"
        tl.mark_once(f"agent.avatar_{kind}_published", sid=pub.sid)

    @ctx.room.on("track_subscribed")
    def _on_track_subscribed(
        track: rtc.Track, pub: rtc.RemoteTrackPublication, p: rtc.RemoteParticipant
    ):
        if p.identity != avatar_identity:
            return
        kind = "video" if track.kind == rtc.TrackKind.KIND_VIDEO else "audio"
        tl.mark_once(f"agent.avatar_{kind}_subscribed", sid=pub.sid)

    # --- Agent session events --------------------------------------------------
    @session.on("agent_state_changed")
    def _on_agent_state(ev):
        if ev.new_state == "speaking":
            tl.mark_once("agent.first_speaking")
        elif ev.new_state == "thinking":
            tl.mark_once("agent.first_thinking")

    @session.on("user_state_changed")
    def _on_user_state(ev):
        if ev.new_state == "speaking":
            tl.mark_once("agent.first_user_speech")

    # --- Tavus REST: POST /v2/conversations ------------------------------------
    tl.mark("agent.tavus_rest_start")
    try:
        await avatar.start(session, room=ctx.room)
    except Exception as e:
        tl.mark("agent.tavus_rest_failed", error=str(e))
        raise
    tl.mark("agent.tavus_rest_done", conversation_id=avatar.conversation_id)

    await session.start(
        agent=agent,
        room=ctx.room,
        room_output_options=RoomOutputOptions(
            audio_enabled=False,
        ),
    )
    tl.mark("agent.session_started")

    # Greet so the avatar speaks as soon as its video is up; gives a
    # first-speaking mark without needing the user to talk first.
    session.generate_reply(instructions="Greet the user briefly and ask how you can help.")

    # Emit a summary once the avatar video is actually flowing (or give up after 60s).
    async def _summary():
        for _ in range(600):
            if any(m["name"] == "agent.avatar_video_subscribed" for m in tl.marks):
                break
            await asyncio.sleep(0.1)
        tl.mark(
            "agent.summary",
            conversation_id=avatar.conversation_id,
            tavus_rest_ms=tl.delta("agent.tavus_rest_start", "agent.tavus_rest_done"),
            rest_done_to_avatar_joined_ms=tl.delta(
                "agent.tavus_rest_done", "agent.avatar_participant_joined"
            ),
            avatar_joined_to_video_published_ms=tl.delta(
                "agent.avatar_participant_joined", "agent.avatar_video_published"
            ),
            rest_done_to_video_subscribed_ms=tl.delta(
                "agent.tavus_rest_done", "agent.avatar_video_subscribed"
            ),
            job_to_video_subscribed_ms=tl.delta(
                "agent.job_received", "agent.avatar_video_subscribed"
            ),
        )

    asyncio.create_task(_summary())


if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint))
