"""MediaPort: fal.ai adapter for the Image/Video agents (doc 9 adapter
pattern). Falls back to local SVG placeholders when no FAL_KEY is set or
mock mode is on, so the whole flow stays testable offline. Generated files
are saved under app/static/generated and served at /generated/<name>."""
import time
import uuid
from pathlib import Path

import requests

from app import config


def _ensure_dir() -> Path:
    config.GENERATED_DIR.mkdir(parents=True, exist_ok=True)
    return config.GENERATED_DIR


def _web_path(path: Path) -> str:
    return f"/generated/{path.name}"


def _placeholder(prompt: str, kind: str) -> str:
    """Offline stand-in: an SVG card showing what would be generated."""
    safe = (prompt[:160].replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;"))
    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360">
  <rect width="100%" height="100%" fill="#1a1a19"/>
  <text x="24" y="48" fill="#3987e5" font-family="sans-serif" font-size="20" font-weight="bold">
    {kind.upper()} PLACEHOLDER (no FAL_KEY set)</text>
  <foreignObject x="24" y="72" width="592" height="260">
    <div xmlns="http://www.w3.org/1999/xhtml"
         style="color:#c3c2b7;font-family:sans-serif;font-size:15px;line-height:1.5">
      Prompt: {safe}</div>
  </foreignObject>
</svg>"""
    path = _ensure_dir() / f"{kind}_{uuid.uuid4().hex[:10]}.svg"
    path.write_text(svg)
    return _web_path(path)


def _download(url: str, kind: str, default_ext: str) -> str:
    ext = url.split("?")[0].rsplit(".", 1)[-1].lower()
    if len(ext) > 4 or "/" in ext:
        ext = default_ext
    path = _ensure_dir() / f"{kind}_{uuid.uuid4().hex[:10]}.{ext}"
    resp = requests.get(url, timeout=120)
    resp.raise_for_status()
    path.write_bytes(resp.content)
    return _web_path(path)


def _fal_headers() -> dict:
    return {"Authorization": f"Key {config.FAL_KEY}", "Content-Type": "application/json"}


def generate_image(prompt: str) -> list[str]:
    """Returns web paths of generated image(s)."""
    if config.USE_MOCK_LLM or not config.FAL_KEY:
        return [_placeholder(prompt, "image")]
    resp = requests.post(f"https://fal.run/{config.FAL_IMAGE_MODEL}",
                         headers=_fal_headers(), json={"prompt": prompt}, timeout=300)
    resp.raise_for_status()
    data = resp.json()
    urls = [img["url"] for img in data.get("images", []) if img.get("url")]
    if not urls and data.get("image", {}).get("url"):
        urls = [data["image"]["url"]]
    if not urls:
        raise RuntimeError(f"fal.ai returned no images: {list(data.keys())}")
    return [_download(u, "image", "png") for u in urls[:4]]


def generate_video(prompt: str) -> list[str]:
    """Video generation is slow -> fal queue API with polling."""
    if config.USE_MOCK_LLM or not config.FAL_KEY:
        return [_placeholder(prompt, "video")]
    submit = requests.post(f"https://queue.fal.run/{config.FAL_VIDEO_MODEL}",
                           headers=_fal_headers(), json={"prompt": prompt}, timeout=60)
    submit.raise_for_status()
    job = submit.json()
    status_url = job["status_url"]
    response_url = job["response_url"]
    deadline = time.monotonic() + config.FAL_VIDEO_TIMEOUT
    while time.monotonic() < deadline:
        status = requests.get(status_url, headers=_fal_headers(), timeout=30).json()
        if status.get("status") == "COMPLETED":
            break
        if status.get("status") in ("FAILED", "ERROR"):
            raise RuntimeError(f"fal.ai video job failed: {status}")
        time.sleep(5)
    else:
        raise TimeoutError("fal.ai video generation timed out")
    result = requests.get(response_url, headers=_fal_headers(), timeout=60).json()
    url = (result.get("video") or {}).get("url")
    if not url:
        raise RuntimeError(f"fal.ai returned no video: {list(result.keys())}")
    return [_download(url, "video", "mp4")]
