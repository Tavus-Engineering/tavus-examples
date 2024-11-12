import os
from typing import Generator
from flask import Flask, request, Response, stream_with_context, copy_current_request_context

from openai import OpenAI
from openai.types.chat import ChatCompletionChunk

import json
import traceback
from dotenv import load_dotenv

from daily import CallClient, Daily

assert load_dotenv(".env", override=True), "No .env file found"

from functions import available_functions
from spawn_room import TOOLS, ROOM_URL

app = Flask(__name__)
NGROK_URL = os.getenv("NGROK_URL", "")

LLM_API_KEY = os.getenv("YOUR_LLM_API_KEY", "")
LLM_ENDPOINT = os.getenv("YOUR_LLM_ENDPOINT", "")
LLM_MODEL_NAME = os.getenv("YOUR_LLM_MODEL_NAME", "")


### EXAMPLE:
# LLM_API_KEY = os.getenv("OPENAI_API_KEY", "")
# LLM_MODEL_NAME = "gpt-4o"
# LLM_ENDPOINT = "https://api.openai.com/v1"


call_client = None
client = OpenAI(api_key=LLM_API_KEY, base_url=LLM_ENDPOINT)


@app.route("/v1/chat/completions", methods=["POST"])
def chat_completions():
    try:
        global call_client
        if not call_client:
            try:
                Daily.init()
                call_client = CallClient()
                call_client.join(ROOM_URL)
                print(f"Joined room: {ROOM_URL}")
            except Exception as e:
                print(f"Error joining room: {e}")
                raise
        data = request.json

        # Extract relevant information from the request
        messages = data.get("messages", [])
        model = LLM_MODEL_NAME
        tools = data.get("tools", TOOLS)

        cerebras_response = client.chat.completions.create(
            model=model, messages=messages, stream=True, tools=tools, tool_choice="auto"
        )

        @copy_current_request_context
        def generate() -> Generator[str, None, None]:
            try:
                total_response = ""
                for chunk in cerebras_response:
                    if chunk.choices[0].delta.tool_calls is not None:
                        function_call = chunk.choices[0].delta.tool_calls[0].function
                        if function_call and function_call.name in available_functions:
                            function_name = function_call.name
                            if function_call.arguments:
                                function_args = json.loads(function_call.arguments)

                                print(
                                    f'RUNNING {function_name}({", ".join([f"{k}={v}" for k,v in function_args.items()])})'
                                )
                                app_message, llm_response = available_functions[function_name](
                                    **function_args
                                )
                                print(f"SENDING APP MESSAGE: {app_message}")
                                call_client.send_app_message(app_message)
                                print(
                                    f"SENDING POST-TOOL RESPONSE: {llm_response.choices[0].delta.content}"
                                )
                                if True:  # different LLMs might need the full response object
                                    yield f"data: {llm_response.model_dump_json()}\n\n"
                                else:
                                    yield llm_response.choices[0].delta.content
                        elif function_call.name:
                            print(f"tried calling non-existent function: {function_call}")
                    if chunk.choices[0].delta.content is not None:
                        if (
                            "FN_CALL=True" in chunk.choices[0].delta.content
                            or "FN_CALL=False" in chunk.choices[0].delta.content
                        ):
                            continue
                        total_response += chunk.choices[0].delta.content
                        if True:  # different LLMs might need the full response object
                            yield f"data: {chunk.model_dump_json()}\n\n"
                        else:
                            yield chunk.choices[0].delta.content
                print(f"LLM RESPONSE: {total_response}")
            except Exception as e:
                print(traceback.format_exc())
                yield json.dumps({"error": str(e)})

        return Response(stream_with_context(generate()), content_type="text/plain")
    except Exception as e:
        print(traceback.format_exc())
        return Response(json.dumps({"error": str(e)}), content_type="application/json", status=500)


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=8080)
