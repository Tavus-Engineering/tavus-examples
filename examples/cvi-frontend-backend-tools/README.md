# Quick startup guide

This example demonstrates how to use Tavus with a frontend and backend. You can use LLM tools to add products to your cart, checkout, and more, all while integrating this with your frontend.

## Setup

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

## Start ngrok

```bash
ngrok http 8080
```

## Add the ngrok URL to the .env file

```bash
NGROK_URL="https://4290-2601-646-4200-a830-b837-c808-f27e-2fbe.ngrok-free.app"
```

## Running the server (connects to your LLM )

```bash
python server.py
```

## Start the replica

```bash
python spawn_room.py
```
