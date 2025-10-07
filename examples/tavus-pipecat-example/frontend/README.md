# Tavus AI Conversation - Simple Video Interface

A minimal video conversation interface that auto-connects to your Pipecat AI assistant.

## Setup

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Start the Pipecat bot (in one terminal):
```bash
python tavus-pipecat.py --transport webrtc --host localhost --port 8080
```

3. Start the frontend (in another terminal):
```bash
npm start
```

The app will open at `http://localhost:3000` and automatically start the conversation.

## Component Structure

- `VideoConversation` - Main component that handles WebRTC connection and displays video
- Auto-connects on mount
- Shows loading state while connecting
- Displays error with retry button if connection fails