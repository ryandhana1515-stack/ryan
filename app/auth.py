"""Auth gate for the workspace.

Three ways in, checked in order:
1. Session cookie (customer accounts — /login, /api/auth/*).
2. HTTP Basic with ADMIN_PASSWORD (the founder's original lock; also keeps
   curl/scripts working).
3. If ADMIN_PASSWORD is unset (local dev), everything is open.

Unauthenticated browsers asking for a page are redirected to /login;
API calls get a plain 401.
"""
import base64
import secrets

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import RedirectResponse, Response

from app.security import SESSION_COOKIE, verify_session_token

PUBLIC_PATHS = {"/health", "/welcome", "/signup", "/offer", "/how", "/agents",
                "/videos", "/favicon.ico", "/login",
                "/api/public/plans", "/api/public/signup",
                "/api/auth/register", "/api/auth/login", "/api/auth/logout"}
PUBLIC_PREFIXES = ("/static/brand/", "/static/videos/", "/generated/")  # public assets + shareable AI-generated funnels


class BasicAuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        from app import config

        path = request.url.path
        if path in PUBLIC_PATHS or path.startswith(PUBLIC_PREFIXES):
            return await call_next(request)

        token = request.cookies.get(SESSION_COOKIE)
        if token:
            payload = verify_session_token(token)
            if payload:
                request.state.session = payload
                return await call_next(request)

        if not config.ADMIN_PASSWORD:
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

        wants_page = (request.method == "GET" and not path.startswith("/api")
                      and "text/html" in request.headers.get("accept", ""))
        if wants_page:
            return RedirectResponse("/login", status_code=303)
        return Response("Authentication required", status_code=401,
                        headers={"WWW-Authenticate": 'Basic realm="AI Business OS"'})
