"""Media utilities: one image in -> every platform size out.

Each platform wants its own dimensions; this endpoint takes one uploaded
image and returns a full pack of platform-ready versions (cover-crop from
the center), saved as shareable files.
"""
import io
import uuid

from fastapi import APIRouter, Depends, HTTPException, UploadFile
from PIL import Image
from sqlalchemy.orm import Session

from app import config
from app.api.deps import get_tenant
from app.db import get_session
from app.models import Tenant

router = APIRouter(prefix="/api/media", tags=["media"])

PLATFORM_SIZES = [
    ("facebook_instagram_feed", 1080, 1350),
    ("square_post", 1080, 1080),
    ("story_reel_tiktok", 1080, 1920),
    ("youtube_thumbnail", 1280, 720),
    ("xiaohongshu", 1242, 1660),
]


def _cover_crop(img: Image.Image, w: int, h: int) -> Image.Image:
    """Scale to fill the target box, then crop the overflow from the center."""
    src_ratio = img.width / img.height
    dst_ratio = w / h
    if src_ratio > dst_ratio:
        new_h = h
        new_w = int(h * src_ratio)
    else:
        new_w = w
        new_h = int(w / src_ratio)
    img = img.resize((new_w, new_h), Image.LANCZOS)
    left = (new_w - w) // 2
    top = (new_h - h) // 2
    return img.crop((left, top, left + w, top + h))


@router.post("/resize-pack")
async def resize_pack(file: UploadFile, tenant: Tenant = Depends(get_tenant),
                      session: Session = Depends(get_session)):
    raw = await file.read()
    if len(raw) > 25 * 1024 * 1024:
        raise HTTPException(413, "image too large (max 25MB)")
    try:
        img = Image.open(io.BytesIO(raw)).convert("RGB")
    except Exception:
        raise HTTPException(422, "could not read the image — use JPG or PNG")

    config.GENERATED_DIR.mkdir(parents=True, exist_ok=True)
    batch = uuid.uuid4().hex[:8]
    results = []
    for name, w, h in PLATFORM_SIZES:
        out = _cover_crop(img, w, h)
        path = config.GENERATED_DIR / f"pack_{batch}_{name}_{w}x{h}.jpg"
        out.save(path, "JPEG", quality=90)
        results.append({"platform": name, "width": w, "height": h,
                        "url": f"/generated/{path.name}"})
    return {"pack": results}
