"""
AGENT: Ad Creative Generator
USE FOR: Facebook ads, TikTok ads, Instagram ads, Google ads

Generates:
- Ad copy (headline, body, CTA)
- Ad image prompts (feed into image_agent)
- Ad video prompts (feed into video_agent)
- Full ad packages for any platform
"""

import os, sys
sys.path.append(os.path.dirname(__file__))

AD_HOOKS = [
    "Doctors hate this — Korean supplement lowers blood pressure in 30 minutes",
    "After 40, your body loses 20% Nitric Oxide every decade — here's the fix",
    "I was on blood pressure meds for 5 years — then I tried this Korean supplement",
    "99.9% of human diseases are linked to Nitric Oxide deficiency — are you at risk?",
    "What if you could feel 20 years younger in 30 minutes?",
]

PLATFORMS = {
    "facebook": {"image_size": "landscape_4_3", "video_duration": 15, "max_copy": 125},
    "tiktok":   {"image_size": "portrait_16_9",  "video_duration": 30, "max_copy": 150},
    "instagram":{"image_size": "square_hd",       "video_duration": 15, "max_copy": 125},
}

def generate_ad_copy(hook_index: int = 0, platform: str = "facebook") -> dict:
    hook = AD_HOOKS[hook_index]
    ad = {
        "platform": platform,
        "headline": hook,
        "body": (
            f"{hook}\n\n"
            "BIO N:OV is a 3rd Generation Nitric Oxide supplement developed by 8 Korean university professors.\n\n"
            "✅ Supports healthy blood pressure in 30 minutes\n"
            "✅ Zero side effects — 100% natural\n"
            "✅ GMP Certified Korean manufacturing\n"
            "✅ Works for EVERYONE including heart patients\n\n"
            "Join thousands who've made the switch to BIO N:OV."
        ),
        "cta": "Shop Now",
        "url": "biogreenelixirs.com",
        "hashtags": "#BioGreenElixirs #BIONOV #NitricOxide #BloodPressure #KoreanHealth",
    }
    return ad

def generate_image_prompt(hook_index: int = 0) -> str:
    prompts = [
        "Before/after blood pressure reading, Korean supplement bottle BIO N:OV, dark navy background, cyan glow, scientific, photorealistic",
        "Middle-aged man looking energetic and healthy, BIO N:OV bottle beside him, Korean health supplement, premium lifestyle",
        "Close-up BIO N:OV supplement bottle with Korean characters, dark luxury background, cyan teal light, ultra detailed",
        "Human blood vessels glowing with cyan energy, BIO N:OV bottle, nitric oxide concept, futuristic medical visualization",
        "Healthy active 50-year-old couple, BIO N:OV product, Korean wellness, bright and premium lifestyle photography",
    ]
    return prompts[hook_index % len(prompts)]

if __name__ == "__main__":
    for i, hook in enumerate(AD_HOOKS):
        print(f"\n--- Ad {i+1} ---")
        ad = generate_ad_copy(i, "facebook")
        print(f"Hook: {ad['headline']}")
        print(f"Image prompt: {generate_image_prompt(i)}")
