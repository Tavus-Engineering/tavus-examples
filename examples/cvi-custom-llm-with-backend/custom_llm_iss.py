from flask import Flask, request, Response, stream_with_context
import requests
from openai import OpenAI
import os
import time
import asyncio
import aiohttp
from functools import lru_cache
from concurrent.futures import ThreadPoolExecutor
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

# Set up your OpenAI API key and client
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=OPENAI_API_KEY)

# Open Notify API endpoint for ISS location
ISS_LOCATION_ENDPOINT = "http://api.open-notify.org/iss-now.json"

@lru_cache(maxsize=1)
def get_iss_location():
    response = requests.get(ISS_LOCATION_ENDPOINT)
    response.raise_for_status()
    return response.json()

async def get_iss_location_async():
    async with aiohttp.ClientSession() as session:
        async with session.get(ISS_LOCATION_ENDPOINT) as response:
            return await response.json()

def run_async(coro):
    loop = asyncio.new_event_loop()
    return loop.run_until_complete(coro)

@app.route("/chat/completions", methods=["POST"])
def chat_completion():
    try:
        start_time = time.perf_counter()
        data = request.json
        messages = data.get("messages", [])

        # Use ThreadPoolExecutor to run async function
        with ThreadPoolExecutor() as executor:
            iss_data_future = executor.submit(run_async, get_iss_location_async())

        # Prepare the initial messages
        initial_messages = [
            {"role": "system", "content": "You are a helpful assistant with knowledge about the ISS."},
            {"role": "user", "content": "\n".join([f"{m['role']}: {m['content']}" for m in messages])}
        ]

        # Wait for ISS data
        iss_data = iss_data_future.result()
        iss_location = iss_data['iss_position']

        # Update the last message with ISS data
        initial_messages[-1]["content"] += f"\n\nCurrent ISS Location: Latitude {iss_location['latitude']}, Longitude {iss_location['longitude']}"

        # Start the completion stream
        completion_stream = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=initial_messages,
            stream=True
        )

        print(f"Time taken to start streaming: {time.perf_counter() - start_time}")

        def generate():
            for chunk in completion_stream:
                if chunk.choices[0].delta.content is not None:
                    yield chunk.choices[0].delta.content

        return Response(stream_with_context(generate()), content_type='text/plain')

    except Exception as e:
        return Response(str(e), content_type='text/plain', status=500)

if __name__ == "__main__":
    app.run(debug=True)