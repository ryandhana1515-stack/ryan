"""
Bio Green Elixirs — FAL.AI Agent
Run any AI model for image generation, video ads, and more.
"""

import os
import fal_client
from dotenv import load_dotenv

load_dotenv()
os.environ["FAL_KEY"] = os.getenv("FAL_KEY")

# ─────────────────────────────────────────────
# AGENT 1 — PRODUCT IMAGE GENERATION
# ─────────────────────────────────────────────

def generate_product_image(prompt: str, model: str = "flux-pro") -> str:
    """
    Generate a product image for BIO N:OV.

    Models:
      - "flux-pro"     → fal-ai/flux-pro         (photorealistic, $0.05)
      - "seedream"     → fal-ai/seedream-3        (detailed product, $0.04)
      - "recraft"      → fal-ai/recraft-v3        (banners with text, $0.04)
      - "ideogram"     → fal-ai/ideogram-v3       (text-on-image ads, $0.04)
    """
    model_map = {
        "flux-pro":  "fal-ai/flux-pro",
        "seedream":  "fal-ai/seedream-3",
        "recraft":   "fal-ai/recraft-v3",
        "ideogram":  "fal-ai/ideogram-v3",
    }
    model_id = model_map.get(model, "fal-ai/flux-pro")
    print(f"Generating image with {model_id}...")

    result = fal_client.subscribe(
        model_id,
        arguments={"prompt": prompt},
        with_logs=True,
    )
    url = result["images"][0]["url"]
    print(f"Image ready: {url}")
    return url


# ─────────────────────────────────────────────
# AGENT 2 — VIDEO AD GENERATION
# ─────────────────────────────────────────────

def generate_video_ad(prompt: str, model: str = "kling") -> str:
    """
    Generate a video ad for BIO N:OV.

    Models:
      - "kling"     → fal-ai/kling-video/v2.1/master  (4K cinematic, ~$0.28)
      - "veo3"      → fal-ai/veo3                     (Google realistic + audio, ~$0.50)
      - "wan"       → fal-ai/wan/v2.1/text-to-video   (fast + cheap, $0.02)
      - "hailuo"    → fal-ai/minimax/video-01          (smooth motion, $0.05)
    """
    model_map = {
        "kling":   "fal-ai/kling-video/v2.1/master",
        "veo3":    "fal-ai/veo3",
        "wan":     "fal-ai/wan/v2.1/text-to-video",
        "hailuo":  "fal-ai/minimax/video-01",
    }
    model_id = model_map.get(model, "fal-ai/kling-video/v2.1/master")
    print(f"Generating video with {model_id}...")

    result = fal_client.subscribe(
        model_id,
        arguments={"prompt": prompt},
        with_logs=True,
    )
    url = result["video"]["url"]
    print(f"Video ready: {url}")
    return url


# ─────────────────────────────────────────────
# QUICK DEMO — run this file to test
# ─────────────────────────────────────────────

if __name__ == "__main__":
    print("=== Bio Green Elixirs FAL.AI Agent ===\n")

    # Test image generation
    image_prompt = (
        "Premium Korean health supplement product shot. "
        "BIO N:OV bottle on a sleek dark navy background with cyan teal glowing light. "
        "Futuristic, scientific, luxury health brand aesthetic. "
        "Ultra high detail, photorealistic."
    )
    img_url = generate_product_image(image_prompt, model="flux-pro")
    print(f"\nProduct Image URL:\n{img_url}\n")
