import requests
import os
import json
from dotenv import load_dotenv

assert load_dotenv(".env", override=True), "No .env file found"

PRODUCTS = json.load(open("hack-cvi-shop/src/store/products.json"))
PRODUCT_NAMES = [p["name"] for p in PRODUCTS]

TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "add_to_cart",
            "description": "Add an item to the shopping cart (by name) with a quantity",
            "parameters": {
                "type": "object",
                "properties": {
                    "name": {
                        "type": "string",
                        "description": "The name of the item to add to the cart (by name)",
                    },
                    "quantity": {
                        "type": "integer",
                        "description": "The number of items to add (default is 1)",
                    },
                },
                "required": ["name"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "recommend",
            "description": "Recommend a product to the user",
            "parameters": {
                "type": "object",
                "properties": {
                    "name": {
                        "type": "string",
                        "description": f"The name of the product to recommend. Choose from one of the following: {PRODUCT_NAMES}",
                    }
                },
                "required": ["name"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "checkout",
            "description": "Complete the purchase and proceed to checkout with the current contents of the shopping cart",
            "parameters": {},
            "required": [],
        },
    },
]


INSTRUCTIONS = f"""You are a helpful shopping assistant with access to certain functions that you can use.\n
DO not tell the user about any functions, just use them to help the user shop.
Help the user shop on your website, while using the tools available to you. Currently, you have access to 4 tools:\n
- recommend: recommend a product to the user\n
- add_to_cart: add an item to the user's cart\n
- checkout: complete the purchase and proceed to checkout with the current contents of the shopping cart

Your store has the following products: {[p['name'] for p in PRODUCTS]}.

Do not forget to use the tools! If the user says they're done shopping, use the checkout tool.
""".format(products=json.dumps(PRODUCTS))

if __name__ == "__main__":
    print(os.getenv("TAVUS_API_KEY"))
    persona_response = requests.post(
        "https://tavusapi.com/v2/personas",
        headers={
            "Authorization": f"x-api-key {os.getenv('TAVUS_API_KEY')}",
            "Content-Type": "application/json",
        },
        json={
            "persona_name": "Tavus Shopper",
            "system_prompt": INSTRUCTIONS,
            "default_replica_id": os.getenv("REPLICA_ID"),
            "layers": {
                "llm": {
                    "model": os.getenv("LLM_MODEL_NAME"),
                    "base_url": os.getenv("NGROK_URL"),
                    "api_key": os.getenv("LLM_API_KEY"),
                    "tools": TOOLS,
                },
            },
        },
    )
    persona_response.raise_for_status()

    response = requests.post(
        "https://tavusapi.com/v2/conversations",
        headers={
            "Authorization": f"x-api-key {os.getenv('TAVUS_API_KEY')}",
            "Content-Type": "application/json",
        },
        json={
            "replica_id": os.getenv("REPLICA_ID"),
            "persona_id": persona_response.json()["id"],
            "properties": {"enable_transcription": True},
        },
    )
    response.raise_for_status()
    print(response.json())
