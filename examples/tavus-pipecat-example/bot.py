"""
Tavus bot — user joins TAVUS_DAILY_ROOM directly in their browser.

Architecture (two-room):
  • User room  : TAVUS_DAILY_ROOM  — user's browser + Pipecat bot (DailyTransport)
  • Tavus room : fresh private room — Pipecat bot + Tavus replica (TavusVideoService)

Pipecat joins TAVUS_DAILY_ROOM as a bot participant (DailyTransport).
TavusVideoService creates a separate private conversation with the replica.
Audio from the user goes through STT → LLM → TTS → Tavus.
Video frames from the Tavus replica are forwarded to the user room via DailyTransport.

Run:
  python bot.py
  Open TAVUS_DAILY_ROOM in your browser to join the call.

Set in .env:
  TAVUS_DAILY_ROOM=https://tavus.daily.co/your-room
  TAVUS_REPLICA_ID=rca8a38779a8
"""

import asyncio
import os

import aiohttp
from dotenv import load_dotenv
from loguru import logger

from pipecat.audio.turn.smart_turn.base_smart_turn import SmartTurnParams
from pipecat.audio.turn.smart_turn.local_smart_turn_v3 import LocalSmartTurnAnalyzerV3
from pipecat.audio.vad.silero import SileroVADAnalyzer
from pipecat.audio.vad.vad_analyzer import VADParams
from pipecat.frames.frames import LLMRunFrame
from pipecat.pipeline.pipeline import Pipeline
from pipecat.pipeline.runner import PipelineRunner
from pipecat.pipeline.task import PipelineParams, PipelineTask
from pipecat.processors.aggregators.llm_context import LLMContext
from pipecat.processors.aggregators.llm_response_universal import LLMContextAggregatorPair
from pipecat.services.cartesia.tts import CartesiaTTSService
from pipecat.services.deepgram.stt import DeepgramSTTService
from pipecat.services.openai.llm import OpenAILLMService
from pipecat.services.tavus.video import TavusVideoService
from pipecat.transports.daily.transport import DailyParams, DailyTransport

load_dotenv(override=True)


async def end_stale_conversations(session: aiohttp.ClientSession):
    """End all active Tavus conversations so the room starts clean."""
    headers = {"Content-Type": "application/json", "x-api-key": os.getenv("TAVUS_API_KEY")}
    async with session.get("https://tavusapi.com/v2/conversations", headers=headers) as r:
        data = await r.json()
    conversations = data.get("data", [])
    active = [c for c in conversations if c.get("status") == "active"]
    for c in active:
        cid = c["conversation_id"]
        async with session.delete(
            f"https://tavusapi.com/v2/conversations/{cid}", headers=headers
        ) as r:
            logger.info(f"Ended stale conversation {cid}: {r.status}")


async def run_bot():
    daily_room = os.getenv("TAVUS_DAILY_ROOM")
    if not daily_room:
        raise ValueError("TAVUS_DAILY_ROOM must be set in .env")

    logger.info(f"Starting bot — user room: {daily_room}")

    async with aiohttp.ClientSession() as session:
        await end_stale_conversations(session)

        # User-facing transport: Pipecat joins the user's Daily room as a bot participant.
        # The user opens TAVUS_DAILY_ROOM in their browser and talks directly.
        transport = DailyTransport(
            room_url=daily_room,
            token=None,
            bot_name="Pipecat Bot",
            params=DailyParams(
                audio_in_enabled=True,
                audio_out_enabled=True,
                video_out_enabled=True,
                video_out_is_live=True,
                video_out_width=1280,
                video_out_height=720,
                vad_analyzer=SileroVADAnalyzer(params=VADParams(stop_secs=0.2)),
                turn_analyzer=LocalSmartTurnAnalyzerV3(params=SmartTurnParams()),
            ),
        )

        stt = DeepgramSTTService(api_key=os.getenv("DEEPGRAM_API_KEY"))
        tts = CartesiaTTSService(
            api_key=os.getenv("CARTESIA_API_KEY"),
            voice_id="a167e0f3-df7e-4d52-a9c3-f949145efdab",
        )
        llm = OpenAILLMService(api_key=os.getenv("OPENAI_API_KEY"))

        # TavusVideoService creates its own fresh private conversation room.
        # It connects Pipecat to the Tavus replica for audio/video streaming.
        # The replica's video frames come back here and are forwarded to the user room.
        tavus = TavusVideoService(
            api_key=os.getenv("TAVUS_API_KEY"),
            replica_id=os.getenv("TAVUS_REPLICA_ID"),
            session=session,
        )

        messages = [
            {
                "role": "system",
                "content": (
                    "You are a helpful AI assistant in a video call. "
                    "Your output will be converted to audio so don't include special characters. "
                    "Respond to what the user said in a creative and helpful way."
                ),
            },
        ]
        context = LLMContext(messages)
        context_aggregator = LLMContextAggregatorPair(context)

        pipeline = Pipeline(
            [
                transport.input(),
                stt,
                context_aggregator.user(),
                llm,
                tts,
                tavus,
                transport.output(),
                context_aggregator.assistant(),
            ]
        )

        task = PipelineTask(
            pipeline,
            params=PipelineParams(
                audio_in_sample_rate=16000,
                audio_out_sample_rate=24000,
                enable_metrics=True,
                enable_usage_metrics=True,
            ),
        )

        @transport.event_handler("on_first_participant_joined")
        async def on_first_participant_joined(transport, participant):
            logger.info(f"First participant joined: {participant.get('id')}")
            messages.append({"role": "system", "content": "Start by greeting the user and ask how you can help."})
            await task.queue_frames([LLMRunFrame()])

        @transport.event_handler("on_participant_left")
        async def on_participant_left(transport, participant, reason):
            logger.info(f"Participant left: {participant.get('id')}, reason: {reason}")
            await task.cancel()

        runner = PipelineRunner(handle_sigint=True)
        await runner.run(task)


if __name__ == "__main__":
    asyncio.run(run_bot())
