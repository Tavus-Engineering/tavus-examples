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

## Startup latency timeline (observability harness)

`tavus.py` records a wall-clock mark at every step of avatar startup (job received,
room connected, Tavus `POST /v2/conversations` start/done, avatar participant joined,
avatar video published/subscribed, session started, first speech) and publishes each
mark into the room over the LiveKit data channel (topic `latency`). The browser UI in
`static/index.html` records its own marks (click → token → connected → SDP → subscribed
→ first frame), merges the agent's marks, and snapshots `getStats()` on the avatar video
at first frame, +5s, +10s and +15s (resolution, fps, codec, dropped frames, freezes).

```bash
# terminal 1 — agent worker
uv run python tavus.py dev

# terminal 2 — token server + UI on http://localhost:8080
uv run python server.py
```

Open the UI, choose settings, click **Start conversation**. Each click creates a fresh
room, so the agent is dispatched and a new Tavus conversation is created every run.

Controls for isolating client-side effects:

- **adaptiveStream** — on (default) lets the LiveKit SDK choose the simulcast layer from
  the `<video>` element size; turn it off to see the published layer.
- **force VideoQuality.HIGH** — calls `setVideoQuality(HIGH)` on the avatar track after
  subscribe.
- **video element width** — 320 / 640 / 1280 px; with adaptiveStream on, this drives
  which layer you receive.
- **microphone / camera** — pick the input device for each (click **refresh** to grant
  permission and load device labels); switching while connected hot-swaps the published
  track. "publish camera" starts the call with your camera on.
- **Mute mic / Camera on** — toggle the local mic and camera while connected; your camera
  shows in the small "you" self-view. Toggles are recorded as marks (`fe.mic_muted`,
  `fe.camera_on`, …) so they line up with the agent's timeline.
- **Export JSON** — dumps all marks + quality snapshots for the run.

Browser marks use the browser clock, agent marks use the worker clock; on the same
machine they agree, across machines allow for clock skew on the "cross-clock" rows.

Optional env for the agent: `TAVUS_FACE_ID`, `TAVUS_PAL_ID`, `TTS_VOICE`,
`TTS_PROVIDER=cartesia` (call Cartesia directly with `CARTESIA_API_KEY` instead of
LiveKit Inference).

## Project Structure

```
├── tavus.py           # Main agent code (instrumented with latency marks)
├── server.py          # Token endpoint + static host for the latency UI
├── static/index.html  # Browser timeline / getStats UI
├── pyproject.toml     # Python dependencies
└── .env               # Environment variables (create this)
```

## Configuration

### Tavus Avatar

Edit `tavus.py` to customize your avatar:

```python
avatar = tavus.AvatarSession(
    face_id="your-face-id",    # Your Tavus face (formerly replica_id)
    pal_id="your-pal-id",      # Your Tavus pal (formerly persona_id)
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

