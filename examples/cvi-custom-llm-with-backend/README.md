# Custom LLM Demo with Tavus CVI

This Flask application provides a chat completion API that can be used as a custom LLM backend for Tavus Conversational Video Interface (CVI). The example incorporates real-time International Space Station (ISS) location data into your conversation, alongside hitting an LLM.

This is meant to show that you can do anything in the LLM layer (not just calling an LLM), as long as you parse the input and structure the output in the [OpenAI formats](https://platform.openai.com/docs/api-reference/chat).

**Important:** To use your custom LLM with Tavus CVI, you need to deploy it such that the `/chat/completions` endpoint is accessible over the internet. This guide shows you how to use ngrok for local development.

## Features
- Chat completion using OpenAI's GPT model
- Real-time ISS location integration
- Asynchronous API calls for improved performance
- Streaming responses

## Prerequisites

- Python 3.7+
- OpenAI API key
- Tavus API key
- ngrok (for local development)
- All Python dependencies (listed in requirements.txt)

## Installation

1. Clone the repository:
   ```bash
   git clone git@github.com:Tavus-Engineering/tavus-examples.git
   cd examples/cvi-custom-llm-with-backend
   ```

2. Create and activate a virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install the required packages:
   ```bash
   pip install -r requirements.txt
   ```

4. Install ngrok (if not already installed):
   ```bash
   # On macOS with Homebrew
   brew install ngrok
   
   # Or download from https://ngrok.com/download
   ```

5. Create a `.env` file in the project root and add your API keys:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   TAVUS_API_KEY=your_tavus_api_key_here
   NGROK_URL=https://your-ngrok-url.ngrok-free.app
   ```

## Usage

### Step 1: Start the Flask Server

1. Activate your virtual environment:
   ```bash
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Start the Flask server:
   ```bash
   python custom_llm_iss.py
   ```
   
   The server will start on `http://127.0.0.1:8000` (Note: We use port 8000 to avoid conflicts with macOS AirPlay on port 5000)

### Step 2: Expose Your Local Server with ngrok

1. In a new terminal window, start ngrok:
   ```bash
   ngrok http 8000
   ```

2. Copy the ngrok URL (e.g., `https://abc123.ngrok-free.app`) and update your `.env` file:
   ```env
   NGROK_URL=https://abc123.ngrok-free.app
   ```

### Step 3: Test Your API

Test your endpoint with curl:
```bash
curl -X POST https://your-ngrok-url.ngrok-free.app/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer random-api-key" \
  -d '{"messages": [{"role": "user", "content": "Hello!"}]}'
```

### Step 4: Create a Tavus Persona and Conversation

Run the conversation creation script:
```bash
python conversation_creation.py
```

This will:
1. Create a new Tavus persona with your custom LLM endpoint
2. Create a conversation using that persona
3. Return the conversation details

**Expected Response:**
```json
{
  "conversation_id": "c0eaa60a267274af",
  "conversation_name": "Jared Life Coach", 
  "conversation_url": "https://tavus.daily.co/c0eaa60a267274af",
  "status": "active",
  "callback_url": "https://yourwebsite.com/webhook",
  "created_at": "2025-09-10T00:35:24.310570Z"
}
```

### Step 5: Test Your Conversation

Click on the `conversation_url` from the response (e.g., `https://tavus.daily.co/c0eaa60a267274af`) to start a video conversation with your custom LLM-powered AI avatar!

**Important Notes:**
- The API expects requests with an `Authorization: Bearer <token>` header
- Tavus will send requests in the standard OpenAI chat completions format
- Your endpoint should return streaming responses for the best user experience
- Make sure your ngrok tunnel stays active while testing

## API Endpoints

### POST /chat/completions

Initiates a chat completion that forwards requests to OpenAI's API with authentication.

**Headers:**
- `Content-Type: application/json`
- `Authorization: Bearer <your-api-key>` (any non-empty string works for this demo)

**Request Body:**
```json
{
  "messages": [
    {"role": "user", "content": "Your message here"}
  ]
}
```

**Response:**
A streaming response in OpenAI chat completions format:
```
data: {"choices": [{"delta": {"content": "Hello"}}]}
data: {"choices": [{"delta": {"content": "!"}}]}
data: [DONE]
```

## How It Works

1. **Authentication**: The Flask app checks for an API key in the `Authorization` header
2. **Request Processing**: Incoming requests are parsed and forwarded to OpenAI's API
3. **Streaming Response**: The response is streamed back in real-time using OpenAI's streaming format
4. **Tavus Integration**: Tavus CVI calls your endpoint and receives the streaming response for natural conversations

## Troubleshooting

### Common Issues

2. **ngrok tunnel expires**: Free ngrok tunnels expire after 2 hours. Restart ngrok and update your `.env` file
3. **Authentication errors**: Make sure you're sending the `Authorization: Bearer <token>` header
4. **502 Bad Gateway**: Check that your Flask app is running and ngrok is pointing to the correct port

### Debug Mode

The Flask app includes debug logging. Check the console output for:
- Request headers and authentication status
- OpenAI API call timing
- Error messages and stack traces

## License

This project is licensed under the MIT License.