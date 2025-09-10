import os
import requests
from dotenv import load_dotenv

load_dotenv()


# -- Create a new persona --
persona_url = "https://tavusapi.com/v2/personas"

persona_payload = {
    "persona_name": "Life Coach",
    "system_prompt": "As a Life Coach, you are a dedicated professional who specializes in helping individuals achieve their personal and professional goals. You have a deep understanding of human behavior and motivation, and you use your expertise to guide and support your clients on their journey to success. You are compassionate, empathetic, and non-judgmental, and you are committed to helping your clients overcome obstacles and reach their full potential.",
    "context": "Here are a few times that you have helped an individual make a breakthrough in their life: 1. You helped a client overcome their fear of public speaking and deliver a successful presentation at work. 2. You supported a client in setting boundaries with their family and creating a healthier relationship dynamic. 3. You guided a client through a career transition and helped them find a job that aligns with their values and passions.",
    "default_replica_id": "r79e1c033f",
    "layers": {
        "llm": {
            "model": "your-model-name",
            "base_url": os.getenv("NGROK_URL", "http://localhost:5000"), # ngrok URL or fallback to localhost
            "api_key": "random-api-key",
        },
        "vqa": {"enable_vision": "false"}
    }
}
headers = {
    "x-api-key": os.getenv("TAVUS_API_KEY"),
    "Content-Type": "application/json"
}

try:
    response = requests.request("POST", persona_url, json=persona_payload, headers=headers)
    print(f"Persona creation response status: {response.status_code}")
    response.raise_for_status()  # Raise an exception for bad status codes
    response_data = response.json()
    persona_id = response_data["persona_id"]
    print(f"Persona created successfully! ID: {persona_id}")
except requests.exceptions.RequestException as e:
    print(f"Error creating persona: {e}")
    if hasattr(e, 'response') and e.response is not None:
        print(f"Response content: {e.response.text}")
    exit(1)

# -- Create a new conversation with that persona --
conversation_url = "https://tavusapi.com/v2/conversations"

conversation_payload = {
    "replica_id": "r79e1c033f",
    "persona_id": persona_id,
    "callback_url": "https://yourwebsite.com/webhook",
    "conversation_name": "Jared - Life Coach",
    "conversational_context": "You are about to talk to Keith, who comes to you looking for advice on how to navigate his promotion at work.",
    "custom_greeting": "Hey there Keith, long time no see!",
    "properties": {
        "max_call_duration": 600,
        "participant_left_timeout": 60,
    }
}

try:
    response = requests.request("POST", conversation_url, json=conversation_payload, headers=headers)
    print(f"Conversation creation response status: {response.status_code}")
    response.raise_for_status()  # Raise an exception for bad status codes
    print("Conversation created successfully!")
    print(response.json())
except requests.exceptions.RequestException as e:
    print(f"Error creating conversation: {e}")
    if hasattr(e, 'response') and e.response is not None:
        print(f"Response content: {e.response.text}")
    exit(1)