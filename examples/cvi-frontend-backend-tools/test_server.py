import requests
import json
import os

from spawn_room import INSTRUCTIONS, TOOLS

from dotenv import load_dotenv

assert load_dotenv(".env", override=True), "Failed to load .env file"

url = f"{os.getenv('NGROK_URL')}/v1/chat/completions"

# The payload for the request
payload = {
    "model": "dummy",
    "stream": True,
    "messages": [
        {"role": "system", "content": INSTRUCTIONS},
        {"role": "user", "content": "Can you add pink headphones to my cart?"},
    ],
    "tools": TOOLS,
}

# Send the request
response = requests.post(url, headers={"Content-Type": "application/json"}, json=payload)
response.raise_for_status()
print("Status Code:", response.status_code)
