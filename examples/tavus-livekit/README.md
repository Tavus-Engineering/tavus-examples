# Tavus Avatar Agent

A conversational AI avatar powered by [LiveKit Agents](https://docs.livekit.io/agents/) and [Tavus](https://www.tavus.io/).

## Prerequisites

- Python 3.11+
- [uv](https://docs.astral.sh/uv/) (Python package manager)
- API keys for the following services:
  - [LiveKit Cloud](https://cloud.livekit.io/) (or self-hosted LiveKit server)
  - [OpenAI](https://platform.openai.com/)
  - [Deepgram](https://deepgram.com/)
  - [Cartesia](https://cartesia.ai/)
  - [Tavus](https://www.tavus.io/)

## Quick Start

### 1. Clone & Install

```bash
git clone <repo-url>
cd tavus-livekit

# Install dependencies
uv sync
```

### 2. Configure Environment

Create a `.env` file in the project root:

```env
# LiveKit credentials (from https://cloud.livekit.io/)
LIVEKIT_URL=wss://your-project.livekit.cloud
LIVEKIT_API_KEY=your-api-key
LIVEKIT_API_SECRET=your-api-secret

# AI service API keys
OPENAI_API_KEY=sk-...
DEEPGRAM_API_KEY=...
CARTESIA_API_KEY=...
TAVUS_API_KEY=...
```

### 3. Run the Agent

```bash
uv run python tavus.py dev
```

The agent will start and wait for participants to join a LiveKit room.

### 4. Join the Room

Open the [LiveKit Agents Playground](https://agents-playground.livekit.io/) and select **Connect** to connect with your LiveKit URL and a token. This lets you interact with the avatar directly in your browser.

## Project Structure

```
├── tavus.py           # Main agent code
├── pyproject.toml     # Python dependencies
└── .env               # Environment variables (create this)
```

## Configuration

### Tavus Avatar

Edit `tavus.py` to customize your avatar:

```python
avatar = tavus.AvatarSession(
    replica_id="your-replica-id",    # Your Tavus replica
    persona_id="your-persona-id",    # Your Tavus persona
)
```

Get these IDs from your [Tavus dashboard](https://platform.tavus.io/).

### AI Models

The agent uses:
- **STT**: Deepgram Nova 3
- **LLM**: OpenAI GPT-4o
- **TTS**: Cartesia Sonic 3

Modify these in `tavus.py`:

```python
session = AgentSession(
    stt=inference.STT(model="deepgram/nova-3", language="en"),
    llm=inference.LLM(model="openai/gpt-4o"),
    tts=inference.TTS(model="cartesia/sonic-3", voice="your-voice-id", language="en"),
)
```

### Agent Personality

Customize the agent's behavior:

```python
agent = Agent(
    instructions="Your custom instructions here..."
)
```

## Troubleshooting

### Agent not connecting
- Verify your `LIVEKIT_URL`, `LIVEKIT_API_KEY`, and `LIVEKIT_API_SECRET` are correct
- Check that the LiveKit server is accessible

### Avatar not appearing
- Confirm your `TAVUS_API_KEY` is valid
- Verify the `replica_id` and `persona_id` exist in your Tavus account

### Audio/Speech issues
- Check `DEEPGRAM_API_KEY` and `CARTESIA_API_KEY` are set correctly
- Ensure your microphone permissions are enabled in the browser

## Resources

- [LiveKit Agents Playground](https://agents-playground.livekit.io/) - Connect and test your agent
- [LiveKit Agents Documentation](https://docs.livekit.io/agents/)
- [Tavus Documentation](https://docs.tavus.io/)
- [LiveKit Cloud](https://cloud.livekit.io/)

