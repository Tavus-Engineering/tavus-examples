"""Minimal token server + static host for the latency-timeline UI.

    uv run python server.py            # serves http://localhost:8080

GET /getToken?room=<name>&identity=<id>  -> {"url", "token", "room", "identity", "t_ms"}
GET /                                    -> static/index.html
"""

from dotenv import load_dotenv

load_dotenv()

import os
import pathlib
import time
import uuid

from aiohttp import web
from livekit import api

STATIC_DIR = pathlib.Path(__file__).parent / "static"


async def get_token(request: web.Request) -> web.Response:
    t0 = time.time()
    url = os.environ["LIVEKIT_URL"]
    key = os.environ["LIVEKIT_API_KEY"]
    secret = os.environ["LIVEKIT_API_SECRET"]

    room = request.query.get("room") or f"latency-{uuid.uuid4().hex[:8]}"
    identity = request.query.get("identity") or f"user-{uuid.uuid4().hex[:6]}"

    token = (
        api.AccessToken(api_key=key, api_secret=secret)
        .with_identity(identity)
        .with_name(identity)
        .with_grants(
            api.VideoGrants(
                room_join=True,
                room=room,
                can_publish=True,
                can_subscribe=True,
                can_publish_data=True,
            )
        )
        .to_jwt()
    )
    return web.json_response(
        {
            "url": url,
            "token": token,
            "room": room,
            "identity": identity,
            "t_ms": int(t0 * 1000),
            "server_ms": int((time.time() - t0) * 1000),
        }
    )


async def index(_: web.Request) -> web.FileResponse:
    return web.FileResponse(STATIC_DIR / "index.html")


def main() -> None:
    app = web.Application()
    app.router.add_get("/", index)
    app.router.add_get("/getToken", get_token)
    app.router.add_static("/static", STATIC_DIR)
    port = int(os.getenv("PORT", "8080"))
    print(f"latency UI: http://localhost:{port}")
    web.run_app(app, port=port, print=None)


if __name__ == "__main__":
    main()
