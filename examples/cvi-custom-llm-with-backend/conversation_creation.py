import requests


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
            "base_url": "localhost:5000", # (replace with your base URL)
            "api_key": "your-api-key",
        },
        "vqa": {"enable_vision": "false"}
    }
}
headers = {
    "x-api-key": "your-api-key",
    "Content-Type": "application/json"
}

response = requests.request("POST", persona_url, json=persona_payload, headers=headers)
persona_id = response["persona_id"]

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

response = requests.request("POST", conversation_url, json=conversation_payload, headers=headers)
print(response.text)