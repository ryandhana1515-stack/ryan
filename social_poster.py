import os
import time
import requests
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

GRAPH_URL = "https://graph.facebook.com/v19.0"
TIKTOK_API_URL = "https://open.tiktokapis.com/v2"


class InstagramPoster:
    def __init__(self):
        self.account_id = os.environ["INSTAGRAM_BUSINESS_ACCOUNT_ID"]
        self.token = os.environ["INSTAGRAM_ACCESS_TOKEN"]

    def post_photo(self, image_url: str, caption: str) -> str:
        # Instagram requires a publicly accessible image URL
        container = requests.post(
            f"{GRAPH_URL}/{self.account_id}/media",
            params={"image_url": image_url, "caption": caption, "access_token": self.token},
        )
        container.raise_for_status()
        container_id = container.json()["id"]

        # Wait for media to process
        for _ in range(10):
            status = requests.get(
                f"{GRAPH_URL}/{container_id}",
                params={"fields": "status_code", "access_token": self.token},
            ).json()
            if status.get("status_code") == "FINISHED":
                break
            time.sleep(3)

        publish = requests.post(
            f"{GRAPH_URL}/{self.account_id}/media_publish",
            params={"creation_id": container_id, "access_token": self.token},
        )
        publish.raise_for_status()
        post_id = publish.json()["id"]
        print(f"[Instagram] Posted successfully — ID: {post_id}")
        return post_id

    def post_video(self, video_url: str, caption: str) -> str:
        container = requests.post(
            f"{GRAPH_URL}/{self.account_id}/media",
            params={
                "video_url": video_url,
                "caption": caption,
                "media_type": "REELS",
                "access_token": self.token,
            },
        )
        container.raise_for_status()
        container_id = container.json()["id"]

        for _ in range(20):
            status = requests.get(
                f"{GRAPH_URL}/{container_id}",
                params={"fields": "status_code", "access_token": self.token},
            ).json()
            if status.get("status_code") == "FINISHED":
                break
            time.sleep(5)

        publish = requests.post(
            f"{GRAPH_URL}/{self.account_id}/media_publish",
            params={"creation_id": container_id, "access_token": self.token},
        )
        publish.raise_for_status()
        post_id = publish.json()["id"]
        print(f"[Instagram] Video posted successfully — ID: {post_id}")
        return post_id


class FacebookPoster:
    def __init__(self):
        self.page_id = os.environ["FACEBOOK_PAGE_ID"]
        self.token = os.environ["FACEBOOK_PAGE_ACCESS_TOKEN"]

    def post_text(self, message: str) -> str:
        resp = requests.post(
            f"{GRAPH_URL}/{self.page_id}/feed",
            params={"message": message, "access_token": self.token},
        )
        resp.raise_for_status()
        post_id = resp.json()["id"]
        print(f"[Facebook] Text posted successfully — ID: {post_id}")
        return post_id

    def post_photo(self, image_path: str, caption: str) -> str:
        with open(image_path, "rb") as f:
            resp = requests.post(
                f"{GRAPH_URL}/{self.page_id}/photos",
                data={"caption": caption, "access_token": self.token},
                files={"source": f},
            )
        resp.raise_for_status()
        post_id = resp.json()["id"]
        print(f"[Facebook] Photo posted successfully — ID: {post_id}")
        return post_id

    def post_video(self, video_path: str, description: str, title: str = "") -> str:
        with open(video_path, "rb") as f:
            resp = requests.post(
                f"{GRAPH_URL}/{self.page_id}/videos",
                data={"description": description, "title": title, "access_token": self.token},
                files={"source": f},
            )
        resp.raise_for_status()
        post_id = resp.json()["id"]
        print(f"[Facebook] Video posted successfully — ID: {post_id}")
        return post_id


class TikTokPoster:
    def __init__(self):
        self.access_token = os.environ["TIKTOK_ACCESS_TOKEN"]

    def _headers(self) -> dict:
        return {
            "Authorization": f"Bearer {self.access_token}",
            "Content-Type": "application/json; charset=UTF-8",
        }

    def post_photo(self, image_paths: list[str], caption: str, privacy: str = "PUBLIC_TO_EVERYONE") -> str:
        # TikTok photo post (carousel/single image)
        resp = requests.post(
            f"{TIKTOK_API_URL}/post/publish/content/init/",
            headers=self._headers(),
            json={
                "post_info": {
                    "title": caption[:2200],
                    "privacy_level": privacy,
                    "disable_comment": False,
                },
                "source_info": {
                    "source": "FILE_UPLOAD",
                    "photo_cover_index": 0,
                    "photo_images": [open(p, "rb").read().hex() for p in image_paths],
                },
                "post_mode": "DIRECT_POST",
                "media_type": "PHOTO",
            },
        )
        resp.raise_for_status()
        publish_id = resp.json()["data"]["publish_id"]
        print(f"[TikTok] Photo posted successfully — publish_id: {publish_id}")
        return publish_id

    def post_video(self, video_path: str, title: str, privacy: str = "PUBLIC_TO_EVERYONE") -> str:
        video_size = Path(video_path).stat().st_size

        # Step 1: Initialize upload
        init_resp = requests.post(
            f"{TIKTOK_API_URL}/post/publish/video/init/",
            headers=self._headers(),
            json={
                "post_info": {
                    "title": title[:2200],
                    "privacy_level": privacy,
                    "disable_duet": False,
                    "disable_comment": False,
                    "disable_stitch": False,
                },
                "source_info": {
                    "source": "FILE_UPLOAD",
                    "video_size": video_size,
                    "chunk_size": video_size,
                    "total_chunk_count": 1,
                },
            },
        )
        init_resp.raise_for_status()
        data = init_resp.json()["data"]
        publish_id = data["publish_id"]
        upload_url = data["upload_url"]

        # Step 2: Upload video bytes
        with open(video_path, "rb") as f:
            video_bytes = f.read()

        upload_resp = requests.put(
            upload_url,
            headers={
                "Content-Type": "video/mp4",
                "Content-Range": f"bytes 0-{video_size - 1}/{video_size}",
            },
            data=video_bytes,
        )
        upload_resp.raise_for_status()
        print(f"[TikTok] Video uploaded — publish_id: {publish_id}")
        return publish_id


def post_photo_to_all(image_path: str, caption: str, image_url: str) -> dict:
    """
    Post a photo to Instagram, Facebook, and TikTok.
    image_path: local file path (used for Facebook and TikTok)
    image_url:  publicly accessible URL (required for Instagram)
    caption:    post caption/description
    """
    results = {}

    # Instagram
    try:
        ig = InstagramPoster()
        results["instagram"] = {"success": True, "id": ig.post_photo(image_url, caption)}
    except KeyError as e:
        print(f"[Instagram] Skipped — missing env var: {e}")
        results["instagram"] = {"success": False, "error": f"Missing env var: {e}"}
    except Exception as e:
        print(f"[Instagram] Failed — {e}")
        results["instagram"] = {"success": False, "error": str(e)}

    # Facebook
    try:
        fb = FacebookPoster()
        results["facebook"] = {"success": True, "id": fb.post_photo(image_path, caption)}
    except KeyError as e:
        print(f"[Facebook] Skipped — missing env var: {e}")
        results["facebook"] = {"success": False, "error": f"Missing env var: {e}"}
    except Exception as e:
        print(f"[Facebook] Failed — {e}")
        results["facebook"] = {"success": False, "error": str(e)}

    # TikTok
    try:
        tt = TikTokPoster()
        results["tiktok"] = {"success": True, "id": tt.post_photo([image_path], caption)}
    except KeyError as e:
        print(f"[TikTok] Skipped — missing env var: {e}")
        results["tiktok"] = {"success": False, "error": f"Missing env var: {e}"}
    except Exception as e:
        print(f"[TikTok] Failed — {e}")
        results["tiktok"] = {"success": False, "error": str(e)}

    return results


def post_video_to_all(video_path: str, caption: str, video_url: str = "") -> dict:
    """
    Post a video to Instagram (Reels), Facebook, and TikTok.
    video_path: local file path
    video_url:  publicly accessible URL (required for Instagram Reels)
    caption:    post caption/description
    """
    results = {}

    # Instagram Reels
    try:
        ig = InstagramPoster()
        results["instagram"] = {"success": True, "id": ig.post_video(video_url, caption)}
    except KeyError as e:
        print(f"[Instagram] Skipped — missing env var: {e}")
        results["instagram"] = {"success": False, "error": f"Missing env var: {e}"}
    except Exception as e:
        print(f"[Instagram] Failed — {e}")
        results["instagram"] = {"success": False, "error": str(e)}

    # Facebook
    try:
        fb = FacebookPoster()
        results["facebook"] = {"success": True, "id": fb.post_video(video_path, caption)}
    except KeyError as e:
        print(f"[Facebook] Skipped — missing env var: {e}")
        results["facebook"] = {"success": False, "error": f"Missing env var: {e}"}
    except Exception as e:
        print(f"[Facebook] Failed — {e}")
        results["facebook"] = {"success": False, "error": str(e)}

    # TikTok
    try:
        tt = TikTokPoster()
        results["tiktok"] = {"success": True, "id": tt.post_video(video_path, caption)}
    except KeyError as e:
        print(f"[TikTok] Skipped — missing env var: {e}")
        results["tiktok"] = {"success": False, "error": f"Missing env var: {e}"}
    except Exception as e:
        print(f"[TikTok] Failed — {e}")
        results["tiktok"] = {"success": False, "error": str(e)}

    return results
