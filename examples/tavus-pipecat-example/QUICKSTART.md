# Quick Start Guide

## Prerequisites

### Environment Setup

1. **Create and activate virtual environment:**

```bash
cd /Users/ashishheda/tavus/pipecat-tavus

# Create virtual environment
python -m venv env

# Activate virtual environment
# On macOS/Linux:
source env/bin/activate
# On Windows:
# env\Scripts\activate
```

2. **Install Python dependencies:**

```bash
pip install -r requirements.txt
```

3. **Install Frontend dependencies:**

```bash
cd frontend
npm install
cd ..
```

## Setup & Run

### 1. Start the Pipecat Bot (Terminal 1)

```bash
cd /Users/ashishheda/tavus/pipecat-tavus

# Make sure virtual environment is activated
source env/bin/activate

python tavus-pipecat.py --transport webrtc --host localhost --port 8080
```

Wait until you see:
```
🚀 Bot ready!
   → Open http://localhost:8080/client in your browser
```

### 2. Start the Frontend (Terminal 2)

```bash
cd /Users/ashishheda/tavus/pipecat-tavus/frontend
npm install  # Only needed first time
npm start
```

The app will open at `http://localhost:3000`

### 3. Grant Permissions

When the page loads:
- Allow camera access
- Allow microphone access
- The video should start automatically!

## Troubleshooting

### Check Browser Console
Open Developer Tools (F12) and check the Console tab for:
- `Sending offer to Pipecat server...`
- `Received answer from server:`
- `WebRTC connection established`

### Common Issues

**"Could not access camera/microphone"**
- Grant permissions in your browser
- Check that no other app is using your camera

**"Connection failed"**
- Make sure Pipecat bot is running on port 8080
- Check the Pipecat terminal for errors

**"Server error: 500"**
- Check the Pipecat terminal logs
- Ensure all environment variables are set (.env file)

### Environment Variables Required

Make sure your `.env` file has:
```
DEEPGRAM_API_KEY=...
CARTESIA_API_KEY=...
GOOGLE_API_KEY=...
TAVUS_API_KEY=...
TAVUS_REPLICA_ID=...
```

## Helpful Resources

### Documentation
- **Tavus Documentation**: [https://docs.tavus.io/sections/introduction](https://docs.tavus.io/sections/introduction)

### Pipecat Resources
- **Voice UI Kit**: [https://github.com/pipecat-ai/voice-ui-kit](https://github.com/pipecat-ai/voice-ui-kit) - Components and templates for building React voice AI applications
- **Pipecat Examples**: [https://github.com/pipecat-ai/pipecat-examples](https://github.com/pipecat-ai/pipecat-examples) - Example applications and patterns for building voice AI apps
