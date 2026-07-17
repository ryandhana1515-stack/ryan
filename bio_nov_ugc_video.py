"""
Bio Green Elixirs — UGC Video Ad Generator
Generates a UGC-style TikTok/Reels video ad for BIO N:OV using fal.ai Kling.

UGC SCRIPT (for voiceover or caption overlay):
-----------------------------------------------
[0-3s]  "I cannot believe no one told me about this sooner..."
[3-8s]  "I'm 52, and my blood pressure was sitting at 160/100 for years.
         I tried everything. Medications made me dizzy. Diet changes barely helped."
[8-15s] "Then my friend in Korea told me about BIO N:OV —
         a 3rd generation nitric oxide supplement developed by 8 Korean professors.
         It works WITHOUT enzymes, zero side effects."
[15-22s] "I took it, and within 30 minutes... my reading dropped.
          Blood pressure. Blood sugar. Energy. Even my skin got better.
          84% of testers saw wrinkle reduction. I believe it."
[22-27s] "It's patented Korean technology. Natural garlic, lettuce, soybean.
          Nothing synthetic."
[27-30s] "Link in bio. Try it. biogreenelixirs.com"
"""

import os
import time
import requests
from pathlib import Path
from dotenv import load_dotenv
import fal_client

load_dotenv()

MODEL = "fal-ai/kling-video/v1.6/pro/text-to-video"

# UGC clip prompts — generate each scene separately then edit together
UGC_CLIPS = {
    "hook": (
        "Authentic UGC style vertical TikTok video, close-up of a 52-year-old Asian woman "
        "sitting casually at her kitchen table, looking directly into camera with a surprised "
        "and genuine expression, holding up one finger as if about to share a secret, "
        "natural window daylight, handheld slightly shaky camera, casual home clothes, "
        "no makeup or light makeup, warm cozy kitchen background, user generated content"
    ),
    "product_reveal": (
        "Authentic UGC TikTok style, 52-year-old Asian woman in home kitchen, "
        "holding up a small white supplement bottle labeled BIO N:OV towards camera, "
        "smiling genuinely, sunlight on the bottle, casual outfit, natural lighting, "
        "vertical 9:16, handheld phone camera style, close-up of product in hand"
    ),
    "blood_pressure": (
        "UGC style vertical video, close-up of a digital blood pressure monitor on a table "
        "showing reading 120/80 in green numbers, a hand placing BIO N:OV supplement bottle "
        "next to the monitor, warm home lighting, authentic real-person video style, "
        "natural setting, not overly produced, TikTok aesthetic"
    ),
    "energy_result": (
        "Authentic UGC TikTok video, energetic 52-year-old Asian woman standing in her "
        "sunny home, arms out wide, big smile, glowing healthy skin, looking vibrant and full "
        "of energy, holding BIO N:OV bottle up in one hand, casual outfit, natural window light, "
        "vertical 9:16, handheld camera, genuine happy expression, lifestyle content"
    ),
}


def poll_for_result(handle) -> dict:
    """Poll fal.ai queue until job completes using handle's built-in URLs."""
    headers = {"Authorization": f"Key {os.environ['FAL_KEY']}"}
    start = time.time()
    while True:
        r = requests.get(handle.status_url, headers=headers, timeout=15)
        r.raise_for_status()
        data = r.json()
        status = data.get("status", "")
        print(f"  Status: {status} ({int(time.time()-start)}s)")
        if status == "COMPLETED":
            result = requests.get(handle.response_url, headers=headers, timeout=15)
            result.raise_for_status()
            return result.json()
        if status == "FAILED":
            raise RuntimeError(f"Job failed: {data}")
        time.sleep(10)


def download_video(url: str, output_path: str) -> str:
    """Download video from URL. If CDN blocks server IP, saves URL to .txt for browser download."""
    headers = {"Authorization": f"Key {os.environ['FAL_KEY']}"}
    r = requests.get(url, headers=headers, timeout=120)
    if r.status_code == 403:
        # CDN host restriction — save URL so user can download directly in browser
        txt_path = output_path.replace(".mp4", "_url.txt")
        Path(txt_path).parent.mkdir(parents=True, exist_ok=True)
        Path(txt_path).write_text(f"Video URL (open in browser):\n{url}\n")
        print(f"\n  CDN blocked server download. Open this URL in your browser:")
        print(f"  {url}")
        print(f"  URL also saved to: {txt_path}")
        return txt_path
    r.raise_for_status()
    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    Path(output_path).write_bytes(r.content)
    return output_path


def generate_ugc_clip(clip_name: str, prompt: str) -> str:
    """Generate a single UGC video clip."""
    output = f"output/bio_nov_ugc_{clip_name}.mp4"
    print(f"\nGenerating clip: {clip_name}")
    print(f"Prompt: {prompt[:80]}...")

    handle = fal_client.submit(
        MODEL,
        arguments={
            "prompt": prompt,
            "duration": "5",
            "aspect_ratio": "9:16",
            "mode": "pro",
        },
    )
    print(f"  Request ID: {handle.request_id}")
    result = poll_for_result(handle)

    video_url = result.get("video", {}).get("url", "")
    if not video_url:
        raise ValueError(f"No video URL in result: {result}")

    print(f"  Video URL: {video_url[:60]}...")
    download_video(video_url, output)
    print(f"  Saved to: {output}")
    return output


def generate_all_clips() -> list[str]:
    """Generate all 4 UGC clips."""
    saved = []
    for name, prompt in UGC_CLIPS.items():
        try:
            path = generate_ugc_clip(name, prompt)
            saved.append(path)
        except Exception as e:
            print(f"  ERROR on {name}: {e}")
    return saved


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Generate BIO N:OV UGC video clips")
    parser.add_argument(
        "--clip",
        choices=list(UGC_CLIPS.keys()) + ["all"],
        default="product_reveal",
        help="Which clip to generate (default: product_reveal)",
    )
    args = parser.parse_args()

    if args.clip == "all":
        clips = generate_all_clips()
        print(f"\nDone. Generated {len(clips)} clips:")
        for c in clips:
            print(f"  {c}")
    else:
        path = generate_ugc_clip(args.clip, UGC_CLIPS[args.clip])
        print(f"\nDone: {path}")
