# Custom LLM Demo

This Flask application provides a chat completion API that incorporates real-time International Space Station (ISS) location data into your conversation, alongside hitting an LLM.

This is meant to show that you can do anything in the LLM layer (not just calling an LLM), as long as you parse the input and structure the output in the [OpenAI formats](https://platform.openai.com/docs/api-reference/chat).

Please note that in order to use your custom LLM with CVI, you will need to deploy it such that the `/chat/completions` endpoint is accessible over the broader network.

## Features
- Chat completion using OpenAI's GPT model
- Real-time ISS location integration
- Asynchronous API calls for improved performance
- Streaming responses

## Prerequisites

- Python 3.7+
- Flask
- OpenAI Python client
- requests
- aiohttp
- python-dotenv

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/iss-chat-api.git
   cd iss-chat-api
   ```

2. Install the required packages:
   ```
   pip install -r requirements.txt
   ```

3. Create a `.env` file in the project root and add your OpenAI API key:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

## Usage

1. Start the Flask server:
   ```
   python app.py
   ```

2. Send a POST request to `http://localhost:5000/chat/completions` with a JSON payload containing the messages:
   ```json
   {
     "messages": [
       {"role": "user", "content": "What is the current location of the ISS?"}
     ]
   }
   ```
   Here you're actually receiving this exact format from us, thus parsing this body is standardized. If you don't disable the VQA layer during Persona creation, you'll get our system prompt that incorporates visual data into the prompt.
   
   **Note that if you have your backend that serves requests at `http://localhost:5000/chat/completions`, your endpoint when specifying the LLM layer should be `http://localhost:5000`!**

3. The API will respond with a streaming completion that includes the current ISS location. If you respond to us via streaming when designing your backend, we can stream out the response and drastically improve the overall conversation experience.

## API Endpoints

### POST /chat/completions

Initiates a chat completion with real-time ISS location data.

**Request Body:**
```json
{
  "messages": [
    {"role": "user", "content": "Your message here"}
  ]
}
```

**Response:**
A streaming response containing the chat completion.

## How It Works

1. The application fetches the current ISS location from the Open Notify API.
2. It then prepares the initial messages, including the system prompt and user input.
3. The ISS location is appended to the user's message.
4. The application streams the chat completion from the OpenAI API, incorporating the ISS data.

## License

This project is licensed under the MIT License.