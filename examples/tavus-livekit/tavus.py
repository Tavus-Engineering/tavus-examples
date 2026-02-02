from dotenv import load_dotenv

load_dotenv()

from livekit import agents
from livekit.agents import Agent, AgentSession, RoomOutputOptions, WorkerOptions, cli, inference
from livekit.plugins import tavus


async def entrypoint(ctx: agents.JobContext):
    await ctx.connect()

    session = AgentSession(
        stt=inference.STT(
            model="deepgram/nova-3",
            language="en",
        ),
        llm=inference.LLM(model="openai/gpt-4o"),
        tts=inference.TTS(
            model="cartesia/sonic-3",
            voice="7f6faf30-0a37-4bdd-925a-c3caff49f3b9",
            language="en",
        ),
        turn_detection="vad",
    )

    agent = Agent(
        instructions="You are a helpful AI assistant with a friendly personality. Engage in natural conversation and help users with their questions."
    )

    avatar = tavus.AvatarSession(
        replica_id="rf4703150052",
        persona_id="p7fb2f122a0f",
    )

    await avatar.start(session, room=ctx.room)

    await session.start(
        agent=agent,
        room=ctx.room,
        room_output_options=RoomOutputOptions(
            audio_enabled=False,
        ),
    )


if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint))

