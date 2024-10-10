import asyncio
import json
import os
import time
import traceback
from concurrent.futures import ThreadPoolExecutor
from functools import lru_cache

import aiohttp
import requests
from dotenv import load_dotenv
from flask import Flask, Response, request, stream_with_context
from openai import OpenAI

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
        print(messages)

        # Start the completion stream
        completion_stream = client.chat.completions.create(
            model="gpt-4o-mini", messages=messages, stream=True
        )

        print(f"Time taken to start streaming: {time.perf_counter() - start_time}")

        def generate():
            for chunk in completion_stream:
                if chunk.choices[0].delta.content is not None:
                    content = chunk.choices[0].delta.content
                    print(content)
                    yield f"data: {json.dumps({'choices': [{'delta': {'content': content}}]})}\n\n"
            yield "data: [DONE]\n\n"

        return Response(stream_with_context(generate()), content_type="text/plain")

    except Exception as e:
        print(f"CHATBOT_STEP: {traceback.format_exc()}")
        return Response(str(e), content_type="text/plain", status=500)


if __name__ == "__main__":
    app.run(debug=True)
