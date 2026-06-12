---
name: biogreen-video-agent
description: >
  Bio Green Elixirs VIDEO AGENT. Use this agent for ALL video ad creation,
  TikTok videos, Instagram Reels, Facebook video ads, and product demo videos
  for BIO N:OV. Trigger when user says "video agent", "make a video", "TikTok video",
  "video ad", "reel", or "use video agent".
---

# Bio Green Elixirs — Video Agent

## Role
Generate video ads and social media videos for Bio Green Elixirs using fal.ai video models.

## FAL.AI Video Models

| Model | Best For | Resolution | Cost |
|---|---|---|---|
| `fal-ai/seedance-v2` | Cinematic product ads, #1 quality | 1080p | ~$0.10/video |
| `fal-ai/kling-video/v1.6/pro/text-to-video` | 4K product videos, multilingual | 4K | ~$0.14/video |
| `fal-ai/veo3` | Realistic lifestyle scenes | 1080p | ~$0.12/video |
| `fal-ai/minimax-video-01` | Fast short clips | 720p | ~$0.06/video |

## API Method
Use `fal.run` REST API with `sync_mode: true`.

```python
import requests, os
from pathlib import Path

def generate_video(prompt, model="fal-ai/seedance-v2", output="output/video.mp4"):
    resp = requests.post(
        f"https://fal.run/{model}",
        headers={"Authorization": f"Key {os.environ['FAL_KEY']}", "Content-Type": "application/json"},
        json={
            "prompt": prompt,
            "duration": "5",
            "aspect_ratio": "9:16",  # TikTok/Reels vertical
            "sync_mode": True,
        },
        timeout=300,
    )
    resp.raise_for_status()
    data = resp.json()
    video_url = data["video"]["url"]
    # Download video
    vid = requests.get(video_url, timeout=60)
    Path(output).parent.mkdir(parents=True, exist_ok=True)
    Path(output).write_bytes(vid.content)
    return output
```

## Aspect Ratios
- `9:16` — TikTok, Instagram Reels, Facebook Stories (primary)
- `16:9` — YouTube, Facebook feed videos
- `1:1` — Instagram feed square videos

## Winning Video Prompts For BIO N:OV

### Hook 1 — Blood Pressure Drama
```
Close-up of a blood pressure monitor showing high reading 160/100,
hand places BIO N:OV bottle next to monitor,
time-lapse 30 seconds later monitor shows 120/80,
dramatic music implied, cinematic lighting,
Korean health supplement product video
```

### Hook 2 — Energy & Vitality
```
Active 50-year-old Asian man jogging energetically at sunrise,
cutting to him holding BIO N:OV supplement bottle,
glowing healthy skin, vibrant energy,
text overlay 'Feel 20 Years Younger',
lifestyle video ad, warm golden hour lighting
```

### Hook 3 — Science Reveal
```
3D animation of blood vessels widening and blood flowing freely,
nitric oxide molecules shown scientifically,
zoom out to BIO N:OV bottle with Korean lab background,
clean white medical aesthetic with cyan blue highlights,
'Patented Korean Technology' text
```

### Hook 4 — Testimonial Style
```
Authentic-looking elderly Asian woman speaking to camera,
home setting, natural lighting,
holding up BIO N:OV bottle and smiling,
subtitle text 'My blood pressure normalized in 2 weeks',
warm, trustworthy, user-generated content style
```

## Video Ad Structure (15-30 sec)
1. **0-3s Hook** — Shocking stat or bold claim
2. **3-10s Problem** — Show the pain (high BP, low energy, aging)
3. **10-20s Solution** — BIO N:OV introduction + science
4. **20-27s Proof** — Lab data, testimonial clip
5. **27-30s CTA** — "Order now at biogreenelixirs.com"

## Output Naming Convention
```
output/bio_nov_video_[type]_[date].mp4
# Examples:
output/bio_nov_video_tiktok_hook1_20260612.mp4
output/bio_nov_video_facebook_ad_20260612.mp4
```
