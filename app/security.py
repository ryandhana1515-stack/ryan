"""Password hashing and signed session tokens (stdlib only).

Sessions are HMAC-signed cookies: base64(payload-json) + signature.
SECRET_KEY env configures the signing key (falls back to ADMIN_PASSWORD
so single-operator deployments work with zero extra config).
"""
import base64
import hashlib
import hmac
import json
import os
import secrets
import time


def _secret() -> bytes:
    key = os.getenv("SECRET_KEY") or os.getenv("ADMIN_PASSWORD") or "omnix-dev-secret"
    return key.encode()


# ------------------------------------------------------------- passwords

def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    digest = hashlib.scrypt(password.encode(), salt=salt.encode(),
                            n=2**14, r=8, p=1, dklen=32)
    return f"scrypt${salt}${digest.hex()}"


def verify_password(password: str, stored: str) -> bool:
    try:
        _algo, salt, hex_digest = stored.split("$")
        digest = hashlib.scrypt(password.encode(), salt=salt.encode(),
                                n=2**14, r=8, p=1, dklen=32)
        return hmac.compare_digest(digest.hex(), hex_digest)
    except Exception:
        return False


# -------------------------------------------------------------- sessions

SESSION_COOKIE = "omnix_session"
SESSION_TTL = 60 * 60 * 24 * 30  # 30 days


def create_session_token(user_id: str, tenant_id: str) -> str:
    payload = {"u": user_id, "t": tenant_id, "exp": int(time.time()) + SESSION_TTL}
    raw = base64.urlsafe_b64encode(json.dumps(payload).encode()).decode()
    sig = hmac.new(_secret(), raw.encode(), hashlib.sha256).hexdigest()
    return f"{raw}.{sig}"


def verify_session_token(token: str) -> dict | None:
    try:
        raw, sig = token.rsplit(".", 1)
        expected = hmac.new(_secret(), raw.encode(), hashlib.sha256).hexdigest()
        if not hmac.compare_digest(sig, expected):
            return None
        payload = json.loads(base64.urlsafe_b64decode(raw.encode()))
        if payload.get("exp", 0) < time.time():
            return None
        return payload
    except Exception:
        return None
