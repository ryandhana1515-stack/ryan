# Local B-roll Library

Every clip the router downloads or you generate gets saved into `clips/` and
indexed in `index.json`. Within ~60 days you should have 500+ clips and stop
paying per-pull for ~70% of shots. This folder is a real asset — back it up.

`index.json` format (one entry per clip):

```json
[
  {"file": "a1b2c3d4e5-clip_00.mp4", "tags": ["office", "laptop", "typing"], "source": "pexels"},
  {"file": "f6g7h8i9j0-n8n-canvas.mp4", "tags": ["n8n", "workflow", "canvas"], "source": "own"}
]
```

- `tags` — lowercase words; the router matches a keyword when all its words
  appear in the tags. Add generous tags when you file your own clips.
- `source` — `pexels` | `pixabay` | `artgrid` | `kling` | `own`.

To add your own screen recordings (the `screen_recording` source class only
ever pulls from here): drop the MP4 into `clips/` and append an entry to
`index.json`.

`clips/` is git-ignored — videos don't belong in the repo.
