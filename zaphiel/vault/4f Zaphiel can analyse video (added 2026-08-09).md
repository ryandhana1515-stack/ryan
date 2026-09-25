---
generated_by: build-vault.js
source: zaphiel/memory.md
source_last_updated: 2026-09-25 (session 2, final: Obsidian vault is LIVE — this file is archived, the vault is the brain)
built: 2026-09-25
tags: [zaphiel, memory]
---
# Zaphiel can analyse video (added 2026-08-09)

Ryan kept pointing at reference creators and asking for "that". Zaphiel now has a
documented path to actually watch a clip rather than guess — skill §10.
- Higgsfield `video_analysis_create` takes a **YouTube URL directly**, or a `video_input_id`
  for something already uploaded. Poll `video_analysis_status` (3-5 min).
- **TikTok/Instagram URLs are rejected** — the page is HTML, not a video file. Ryan must
  save or screen-record the clip and upload it; then `media_upload`/`media_confirm` into
  Higgsfield. `media_import_url` only works on direct file URLs (verified on
  raw.githubusercontent.com).
- `virality_predictor` reads hook strength and retention, on references and on our own cuts.
- Open reference Ryan wants studied: TikTok @hugovar.ai (an AI-persona account). Blocked
  from this environment — tiktok.com is refused by the egress proxy. Needs an upload.

Up: [[00 Home]]
