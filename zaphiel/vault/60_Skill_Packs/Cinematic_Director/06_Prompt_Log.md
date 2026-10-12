---
tags: [zaphiel, skill-pack, cinematic, log]
---
# Prompt log: what worked, what failed, what it cost

The director appends one row per generation batch (newest at the bottom). This is how it learns. Never rewrite old
rows.

## Measured costs (fill in on first use; credits per item)
| Tool / model | Setting | Credits per item | Measured on | Notes |
|---|---|---|---|---|
| Kling `text_to_image` kling-image-v3_0_omni | 2K, 1 image | (measure) | | |
| Kling `image_to_image` kling-image-v3_0_omni | 2K, 1 image | (measure) | | |
| Kling `image_to_video` kling-video-v3_0 | 5 s, 1080p, first+tail, no audio | (measure) | | |
| Kling `image_to_video` kling-video-v2_6 | 5 s, 1080p, first+tail | (measure) | | |
| Higgsfield `kling_o3_flf` | 5 s, pro | (measure) | | |
| Higgsfield `seedance_2_0` | 5 s, 1080p, std | (measure) | | |

## Results
| Date | Project | Scene | Model | Prompt (short) | Result | Keep / fix |
|---|---|---|---|---|---|---|
| 2026-09-29 | Atelier Noir (proof) | 5 suit scenes | Kling | scene film, chained first/tail frames | Worked; black gaps between scenes came from the site, not the film (fixed with `.film-sequence`) | Keep the chain method |
