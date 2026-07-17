import base64
import os
from pathlib import Path

import requests
from dotenv import load_dotenv

load_dotenv()

FAL_KEY = os.environ["FAL_KEY"]
FAL_URL = "https://fal.run/fal-ai/flux/dev"

PROMPT = (
    "Professional product photography of BIO N:OV premium skincare serum, "
    "sleek glass dropper bottle with minimalist label featuring the text 'BIO N:OV', "
    "matte white and deep forest green color palette, gold accents, "
    "surrounded by fresh green botanical leaves and bio-organic elements, "
    "soft studio lighting with subtle reflections, "
    "placed on a clean white marble surface, "
    "luxury beauty brand aesthetic, ultra high detail, commercial product shot"
)


def generate_bio_nov_image(
    output_path: str = "output/bio_nov_product.jpg",
    image_size: str = "portrait_4_3",
) -> str:
    """Generate a BIO N:OV product image via fal.ai flux/dev."""
    response = requests.post(
        FAL_URL,
        headers={"Authorization": f"Key {FAL_KEY}", "Content-Type": "application/json"},
        json={
            "prompt": PROMPT,
            "image_size": image_size,
            "num_inference_steps": 28,
            "guidance_scale": 3.5,
            "num_images": 1,
            "output_format": "jpeg",
            "sync_mode": True,
        },
        timeout=120,
    )
    response.raise_for_status()
    data = response.json()

    image_url = data["images"][0]["url"]

    if image_url.startswith("data:"):
        _, b64data = image_url.split(",", 1)
        image_bytes = base64.b64decode(b64data)
    else:
        img_response = requests.get(image_url, timeout=30)
        img_response.raise_for_status()
        image_bytes = img_response.content

    out = Path(output_path)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_bytes(image_bytes)
    print(f"Image saved to: {output_path}")
    return output_path


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Generate BIO N:OV product image via fal.ai")
    parser.add_argument("--output", default="output/bio_nov_product.jpg", help="Output file path")
    parser.add_argument(
        "--size",
        default="portrait_4_3",
        choices=["square", "square_hd", "portrait_4_3", "portrait_16_9", "landscape_4_3", "landscape_16_9"],
        help="Image size preset",
    )
    args = parser.parse_args()

    generate_bio_nov_image(args.output, args.size)
