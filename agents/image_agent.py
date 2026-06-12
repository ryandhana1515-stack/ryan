"""
AGENT: Image Generator
USE FOR: Product photos, ad banners, social media images, website visuals

Models available:
- flux-pro    → Best photorealistic product shots
- seedream    → High detail product photos
- recraft     → Banners and images with text
- ideogram    → Text-on-image ads
"""

import os, fal_client
os.environ["FAL_KEY"] = open(os.path.join(os.path.dirname(__file__), "../.env")).read().split("FAL_KEY=")[1].strip()

MODELS = {
    "flux-pro": "fal-ai/flux-pro",
    "seedream":  "fal-ai/seedream-3",
    "recraft":   "fal-ai/recraft-v3",
    "ideogram":  "fal-ai/ideogram-v3",
}

def run(prompt: str, model: str = "flux-pro", size: str = "square_hd") -> str:
    result = fal_client.subscribe(
        MODELS[model],
        arguments={"prompt": prompt, "image_size": size},
        with_logs=True,
    )
    url = result["images"][0]["url"]
    print(f"Image ready → {url}")
    return url

if __name__ == "__main__":
    run(
        prompt="BIO N:OV Korean supplement bottle, dark navy background, cyan teal glow, futuristic luxury health brand, photorealistic",
        model="flux-pro",
    )
