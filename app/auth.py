"""Minimal gate for going on the internet: when ADMIN_PASSWORD is set, every
route except /health requires it (HTTP Basic, any username). This is the
Phase 1 lock — full multi-user auth (Keycloak, roles per docs/08) replaces
it in the SaaS phase.
"""
import base64
import secrets

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response

PUBLIC_PATHS = {"/health", "/welcome", "/signup", "/offer", "/how", "/agents",
                "/favicon.ico", "/api/public/plans", "/api/public/signup"}
PUBLIC_PREFIXES = ("/static/brand/",)  # logo assets used by public pages


class BasicAuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        from app import config

        path = request.url.path
        if (not config.ADMIN_PASSWORD or path in PUBLIC_PATHS
                or path.startswith(PUBLIC_PREFIXES)):
            return await call_next(request)

        header = request.headers.get("authorization", "")
        if header.lower().startswith("basic "):
            try:
                decoded = base64.b64decode(header[6:]).decode("utf-8")
                _user, _, password = decoded.partition(":")
                if secrets.compare_digest(password, config.ADMIN_PASSWORD):
                    return await call_next(request)
            except Exception:
                pass
        return Response("Authentication required", status_code=401,
                        headers={"WWW-Authenticate": 'Basic realm="AI Business OS"'})
