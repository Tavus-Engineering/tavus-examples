# Tavus CVI Microphone-Only Example

A voice-only interface for conversing with Tavus Replicas using microphone input. This example demonstrates how to selectively join Daily.co streams depending on app requirements.

[LIVE DEMO](https://andy-tavus.github.io/microphone-only-cvi/)

## Getting Started

### Prerequisites

- A Tavus account with API access
- A conversation ID from the [Tavus Platform](https://platform.tavus.io) or [Create Conversation API](https://docs.tavus.io/api-reference/conversations/create-conversation)

### Setup

1. Clone this repository:
   ```bash
   git clone https://github.com/andy-tavus/microphone-only-cvi.git
   cd microphone-only-cvi
   ```

2. Open `index.html` in a web browser or serve it using a local web server:
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Using Node.js (if you have http-server installed)
   npx http-server
   ```

3. Navigate to `http://localhost:8000` in your browser

### Usage

1. **Create a Conversation**: Generate a conversation using the [Tavus Platform](https://platform.tavus.io) or the [Create Conversation API](https://docs.tavus.io/api-reference/conversations/create-conversation)

2. **Enter Conversation ID**: Input your conversation ID in the text field

3. **Start Voice Chat**: Click "Start Voice Chat" and allow microphone access when prompted

4. **Talk to Your Replica**: Speak naturally - your replica will respond with both audio and video

5. **Use Controls**: 
   - Click the **Mute** button to toggle your microphone
   - Click **Leave** to end the conversation

## How It Works

This application uses:

- **[Daily.co](https://daily.co)** for WebRTC video calling infrastructure
- **[Tavus API](https://docs.tavus.io)** for AI replica conversations [[memory:2987291]]
- **Web Audio API** for microphone access and audio processing

The flow is:
1. User joins a Daily.co room associated with their Tavus conversation
2. Microphone audio is streamed to the Tavus replica
3. The replica processes speech and responds with audio/video
4. User sees and hears the replica's response in real-time

## Configuration

### URL Parameters

You can pre-populate the conversation ID using URL parameters:

```
https://your-domain.com/?conversation_id=c123abc
```
