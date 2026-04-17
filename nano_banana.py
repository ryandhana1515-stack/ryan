import os
import base64
import requests
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

OPENROUTER_API_KEY = os.environ["OPENROUTER_API_KEY"]
MODEL = "google/gemini-3.1-flash-image-preview"
API_URL = "https://openrouter.ai/api/v1/chat/completions"


def generate_image(prompt: str, aspect_ratio: str = "1:1", output_path: str = "output/image.png") -> str:
    """Generate an image using Nano Banana 2 (Gemini 3.1 Flash Image Preview) via OpenRouter."""
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
    }

    payload = {
        "model": MODEL,
        "messages": [
            {
                "role": "user",
                "content": prompt,
            }
        ],
        "extra_body": {
            "aspect_ratio": aspect_ratio,
        },
    }

    response = requests.post(API_URL, headers=headers, json=payload)
    response.raise_for_status()
    data = response.json()

    content = data["choices"][0]["message"]["content"]

    # Extract image data from response (may be base64 or a URL)
    if isinstance(content, list):
        for part in content:
            if isinstance(part, dict) and part.get("type") == "image_url":
                image_url = part["image_url"]["url"]
                if image_url.startswith("data:"):
                    # base64 encoded image
                    header, b64data = image_url.split(",", 1)
                    image_bytes = base64.b64decode(b64data)
                    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
                    Path(output_path).write_bytes(image_bytes)
                    print(f"Image saved to: {output_path}")
                    return output_path
                else:
                    # URL — download it
                    img_response = requests.get(image_url)
                    img_response.raise_for_status()
                    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
                    Path(output_path).write_bytes(img_response.content)
                    print(f"Image saved to: {output_path}")
                    return output_path
    elif isinstance(content, str):
        print("Response text:", content)
        return content

    raise ValueError(f"Unexpected response format: {data}")


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Generate images with Nano Banana 2 via OpenRouter")
    parser.add_argument("prompt", help="Image generation prompt")
    parser.add_argument("--aspect-ratio", default="1:1", help="Aspect ratio (e.g. 1:1, 16:9, 4:3)")
    parser.add_argument("--output", default="output/image.png", help="Output file path")
    args = parser.parse_args()

    generate_image(args.prompt, args.aspect_ratio, args.output)
