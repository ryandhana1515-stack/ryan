import os
import base64
import requests
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

FAL_KEY = os.environ["FAL_KEY"]
API_URL = "https://fal.run/fal-ai/flux/schnell"


def generate_bionov_image(
    output_path: str = "output/bionov_product.png",
    image_size: str = "square_hd",
) -> str:
    """Generate a BIO N:OV product image using fal.ai FLUX."""
    prompt = (
        "Professional product photography of BIO N:OV skincare serum bottle, "
        "clean minimalist aesthetic, soft natural lighting, white marble background, "
        "premium luxury cosmetics branding, botanical green leaf accents, "
        "studio quality, high resolution"
    )

    headers = {
        "Authorization": f"Key {FAL_KEY}",
        "Content-Type": "application/json",
    }

    payload = {
        "prompt": prompt,
        "image_size": image_size,
        "num_inference_steps": 4,
        "num_images": 1,
        "enable_safety_checker": True,
    }

    response = requests.post(API_URL, headers=headers, json=payload)
    response.raise_for_status()
    data = response.json()

    images = data.get("images", [])
    if not images:
        raise ValueError(f"No images returned: {data}")

    image_info = images[0]
    image_url = image_info.get("url", "")

    if image_url.startswith("data:"):
        _, b64data = image_url.split(",", 1)
        image_bytes = base64.b64decode(b64data)
    else:
        img_response = requests.get(image_url)
        img_response.raise_for_status()
        image_bytes = img_response.content

    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    Path(output_path).write_bytes(image_bytes)
    print(f"BIO N:OV product image saved to: {output_path}")
    return output_path


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Generate BIO N:OV product image via fal.ai")
    parser.add_argument("--output", default="output/bionov_product.png", help="Output file path")
    parser.add_argument(
        "--size",
        default="square_hd",
        choices=["square_hd", "square", "portrait_4_3", "portrait_16_9", "landscape_4_3", "landscape_16_9"],
        help="Image size preset",
    )
    args = parser.parse_args()

    generate_bionov_image(args.output, args.size)
