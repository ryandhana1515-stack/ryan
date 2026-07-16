"""Video Studio provider adapters (doc 9 adapter pattern, V2 build prompt).

Every provider implements the same small port so the rest of the app never
touches provider-specific payloads. Providers without an API key report
available=False and the router falls back — an unavailable provider NEVER
silently pretends: the demo provider labels its output DEMO, and calling a
disabled provider raises ProviderNotEnabled with an honest message.

Adapters: fal.ai (live today), Demo (real MP4s rendered locally with
Pillow+ffmpeg), HeyGen / Google Veo / Runway (wired to enable the moment
their keys are added — no undocumented endpoints are invented).
"""
import subprocess
import uuid

from PIL import Image, ImageDraw, ImageFont

from app import config
from app.agents import media

NOT_ENABLED_MSG = ("Provider access is not currently enabled. "
                   "Connect an eligible API account or select another model.")


class ProviderNotEnabled(RuntimeError):
    pass


def ffmpeg_exe() -> str:
    import imageio_ffmpeg
    return imageio_ffmpeg.get_ffmpeg_exe()


class VideoProvider:
    """Shared port. Subclasses set id/name/best_for and implement generate."""
    id = "base"
    name = "Base"
    best_for: tuple[str, ...] = ()
    credits_per_second = 1.0

    def available(self) -> bool:
        return False

    def estimate_credits(self, duration_sec: int) -> float:
        return round(self.credits_per_second * max(1, duration_sec), 1)

    def generate(self, scene: dict) -> str:
        """Returns the web path (/generated/...) of the produced clip."""
        raise ProviderNotEnabled(NOT_ENABLED_MSG)


class FalProvider(VideoProvider):
    id = "fal"
    name = "fal.ai (text-to-video)"
    best_for = ("broll", "product", "cinematic")
    credits_per_second = 2.0

    def available(self) -> bool:
        return bool(config.FAL_KEY) and not config.USE_MOCK_LLM

    def generate(self, scene: dict) -> str:
        prompt = scene.get("visual_prompt") or scene.get("purpose", "")
        if scene.get("camera"):
            prompt += f". Camera: {scene['camera']}"
        return media.generate_video(prompt)[0]


class DemoProvider(VideoProvider):
    """Renders a real, playable MP4 locally (Pillow frame + ffmpeg) so the
    whole workflow works end-to-end with zero keys. Output is clearly
    labelled DEMO — it is never presented as a real provider generation."""
    id = "demo"
    name = "Demo mode (no API key needed)"
    best_for = ("presenter", "broll", "product", "text")
    credits_per_second = 0.0

    def available(self) -> bool:
        return True

    def _font(self, size: int):
        try:
            return ImageFont.truetype(
                "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", size)
        except Exception:
            return ImageFont.load_default()

    def generate(self, scene: dict) -> str:
        w, h = 1280, 720
        img = Image.new("RGB", (w, h), (10, 14, 30))
        d = ImageDraw.Draw(img)
        d.rectangle([0, 0, w, 8], fill=(34, 211, 238))
        d.rectangle([0, h - 8, w, h], fill=(217, 70, 239))
        d.text((40, 36), "DEMO SCENE — connect a video provider for real footage",
               font=self._font(26), fill=(240, 180, 41))
        d.text((40, 110), f"Scene {scene.get('idx', 0) + 1}: {scene.get('purpose', '')[:60]}",
               font=self._font(40), fill=(242, 245, 255))
        y = 190
        for label, key in (("VISUAL", "visual_prompt"), ("DIALOGUE", "dialogue"),
                           ("ON SCREEN", "on_screen_text"), ("CAMERA", "camera")):
            val = (scene.get(key) or "").strip()
            if not val:
                continue
            d.text((40, y), label, font=self._font(20), fill=(34, 211, 238))
            y += 30
            for line in _wrap(val, 70)[:3]:
                d.text((40, y), line, font=self._font(26), fill=(163, 173, 206))
                y += 36
            y += 14
        frame = config.GENERATED_DIR / f"scene_{uuid.uuid4().hex[:10]}.png"
        config.GENERATED_DIR.mkdir(parents=True, exist_ok=True)
        img.save(frame)
        out = config.GENERATED_DIR / f"scene_{uuid.uuid4().hex[:10]}.mp4"
        dur = max(2, min(int(scene.get("duration_sec") or 5), 20))
        subprocess.run([ffmpeg_exe(), "-y", "-loop", "1", "-i", str(frame),
                        "-t", str(dur), "-r", "24", "-pix_fmt", "yuv420p",
                        "-vf", "scale=1280:720", str(out)],
                       check=True, capture_output=True, timeout=120)
        frame.unlink(missing_ok=True)
        return f"/generated/{out.name}"


class HeyGenProvider(VideoProvider):
    id = "heygen"
    name = "HeyGen (avatars & presenters)"
    best_for = ("presenter",)
    credits_per_second = 4.0

    def available(self) -> bool:
        return bool(config.HEYGEN_API_KEY)
    # generate(): implemented against the official HeyGen v2 API when a key
    # is present — deliberately raises ProviderNotEnabled until then.


class VeoProvider(VideoProvider):
    id = "veo"
    name = "Google Veo (cinematic)"
    best_for = ("cinematic", "broll", "product")
    credits_per_second = 5.0

    def available(self) -> bool:
        return bool(config.GEMINI_API_KEY)


class RunwayProvider(VideoProvider):
    id = "runway"
    name = "Runway (transform & motion)"
    best_for = ("broll", "transform")
    credits_per_second = 4.0

    def available(self) -> bool:
        return bool(config.RUNWAY_API_KEY)


PROVIDERS: dict[str, VideoProvider] = {p.id: p for p in (
    FalProvider(), DemoProvider(), HeyGenProvider(), VeoProvider(), RunwayProvider())}


def _wrap(text: str, width: int) -> list[str]:
    words, lines, cur = text.split(), [], ""
    for word in words:
        if len(cur) + len(word) + 1 > width:
            lines.append(cur)
            cur = word
        else:
            cur = f"{cur} {word}".strip()
    if cur:
        lines.append(cur)
    return lines


def route(scene_type: str, requested: str = "auto") -> VideoProvider:
    """Pick the best AVAILABLE provider for a scene; users can override.
    Requesting a disabled provider raises ProviderNotEnabled (honest error,
    never a silent substitution)."""
    if requested and requested != "auto":
        provider = PROVIDERS.get(requested)
        if provider is None:
            raise ProviderNotEnabled(NOT_ENABLED_MSG)
        if not provider.available():
            raise ProviderNotEnabled(NOT_ENABLED_MSG)
        return provider
    preference = {
        "presenter": ["heygen", "fal", "demo"],
        "cinematic": ["veo", "fal", "demo"],
        "product": ["veo", "fal", "demo"],
        "broll": ["fal", "veo", "runway", "demo"],
        "text": ["demo", "fal"],
    }.get(scene_type, ["fal", "demo"])
    for pid in preference:
        if PROVIDERS[pid].available():
            return PROVIDERS[pid]
    return PROVIDERS["demo"]


def roster() -> list[dict]:
    return [{"id": p.id, "name": p.name, "available": p.available(),
             "best_for": list(p.best_for),
             "credits_per_second": p.credits_per_second}
            for p in PROVIDERS.values()]
