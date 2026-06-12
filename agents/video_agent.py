"""
AGENT: Video Ad Generator
USE FOR: TikTok ads, Facebook video ads, Instagram Reels, product demo videos

Models available:
- kling    → 4K cinematic product ads (best quality)
- veo3     → Google realistic scenes with audio
- wan      → Fast cheap promo videos
- hailuo   → Smooth motion product videos
"""

import os, fal_client
os.environ["FAL_KEY"] = open(os.path.join(os.path.dirname(__file__), "../.env")).read().split("FAL_KEY=")[1].strip()

MODELS = {
    "kling":   "fal-ai/kling-video/v2.1/master",
    "veo3":    "fal-ai/veo3",
    "wan":     "fal-ai/wan/v2.1/text-to-video",
    "hailuo":  "fal-ai/minimax/video-01",
}

def run(prompt: str, model: str = "kling", duration: int = 5) -> str:
    result = fal_client.subscribe(
        MODELS[model],
        arguments={"prompt": prompt, "duration": duration},
        with_logs=True,
    )
    url = result["video"]["url"]
    print(f"Video ready → {url}")
    return url

if __name__ == "__main__":
    run(
        prompt="Cinematic product ad: BIO N:OV Korean supplement bottle glowing on dark surface, cyan light pulses through blood vessels, text appears: 'Lower Blood Pressure in 30 Minutes', premium health brand feel",
        model="kling",
    )
