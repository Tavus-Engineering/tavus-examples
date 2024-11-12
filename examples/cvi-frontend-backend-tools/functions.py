import json
from typing import Any, Callable
import time

from openai.types.chat.chat_completion_chunk import ChatCompletionChunk, Choice, ChoiceDelta

PRODUCTS = json.load(open("hack-cvi-shop/src/store/products.json"))
CART = []


def recommend(name: str) -> tuple[dict, ChatCompletionChunk]:
    """Recommend an item to the user"""
    product = next((p for p in PRODUCTS if p["name"] == name), None)
    if not product:
        return (
            "Product not found",
            f"Sorry, I couldn't find a product called '{name}' to recommend. Maybe I can recommend something else?",
        )
    app_message = {"event": "recommend", "data": {"id": product["id"]}}
    llm_string = f"Of course! I really like {product['name']}, it's a great product. Would you like to add it to your cart?"
    chunk = ChatCompletionChunk(
        **{
            "id": "0",
            "object": "chat.completion.chunk",
            "created": int(time.time()),
            "model": "blah",
            "choices": [
                Choice(
                    **{
                        "index": 0,
                        "finish_reason": "stop",
                        "delta": ChoiceDelta(**{"content": llm_string}),
                    }
                )
            ],
        }
    )

    return app_message, chunk


def add_to_cart(name: str, quantity: int = 1) -> tuple[dict, ChatCompletionChunk]:
    """Add an item to the shopping cart"""

    product = next((p for p in PRODUCTS if p["name"] == name), None)
    if not product:
        return (
            "Product not found",
            f"Sorry, I couldn't find a product called '{name}' to add to your cart. Maybe I can recommend something else?",
        )

    app_message = {
        "event": "add_to_cart",
        "data": {
            "id": product["id"],
            "item": name,
            "quantity": quantity,
            "price": product["price"],
        },
    }
    CART.append(app_message["data"])
    llm_string = (
        f"Cool, I added {quantity} {name} to your cart. Let me know if you need anything else."
    )
    chunk = ChatCompletionChunk(
        **{
            "id": "0",
            "object": "chat.completion.chunk",
            "created": int(time.time()),
            "model": "blah",
            "choices": [
                Choice(
                    **{
                        "index": 0,
                        "finish_reason": "stop",
                        "delta": ChoiceDelta(**{"content": llm_string}),
                    }
                )
            ],
        }
    )

    return app_message, chunk


def checkout() -> tuple[dict, ChatCompletionChunk]:
    """Checkout the current contents of the shopping cart"""
    app_message = {
        "event": "checkout",
        "data": {},
    }
    llm_string = "Thank you for your purchase! Hope you enjoyed shopping with Tavus."

    chunk = ChatCompletionChunk(
        **{
            "id": "0",
            "object": "chat.completion.chunk",
            "created": int(time.time()),
            "model": "blah",
            "choices": [
                Choice(
                    **{
                        "index": 0,
                        "finish_reason": "stop",
                        "delta": ChoiceDelta(**{"content": llm_string}),
                    }
                )
            ],
        }
    )
    return app_message, chunk


available_functions: dict[str, Callable[..., tuple[dict, ChatCompletionChunk]]] = {
    "add_to_cart": add_to_cart,
    "checkout": checkout,
    "recommend": recommend,
}
