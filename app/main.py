from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy import select

from app.api import agents_api, crm, dashboard, knowledge, manager_api, public
from app.config import GENERATED_DIR
from app.db import SessionLocal, init_db
from app.workflows import register_all


@asynccontextmanager
async def lifespan(_: FastAPI):
    init_db()
    register_all()
    GENERATED_DIR.mkdir(parents=True, exist_ok=True)
    # New agents added to config/agents/ appear for existing tenants on restart
    from app.agents.registry import sync_agents_for_tenant
    from app.models import Tenant

    with SessionLocal() as session:
        for tenant in session.scalars(select(Tenant)).all():
            sync_agents_for_tenant(session, tenant.id)
        session.commit()
    yield


app = FastAPI(title="AI Business Operating System", version="0.2.0", lifespan=lifespan)

from app.auth import BasicAuthMiddleware  # noqa: E402

app.add_middleware(BasicAuthMiddleware)

app.include_router(crm.router)
app.include_router(agents_api.router)
app.include_router(knowledge.router)
app.include_router(dashboard.router)
app.include_router(manager_api.router)
app.include_router(public.router)

_STATIC = Path(__file__).parent / "static"
GENERATED_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/generated", StaticFiles(directory=GENERATED_DIR), name="generated")


@app.get("/", include_in_schema=False)
def root():
    """The CEO Dashboard."""
    return FileResponse(_STATIC / "dashboard.html")


@app.get("/chat", include_in_schema=False)
def chat_page():
    """The Manager AI chat — one agent that commands all the others."""
    return FileResponse(_STATIC / "chat.html")


@app.get("/welcome", include_in_schema=False)
def landing_page():
    """Public marketing landing page (multi-language)."""
    return FileResponse(_STATIC / "landing.html")


@app.get("/signup", include_in_schema=False)
def signup_page():
    """Public signup funnel — creates a lead in the owner's own tenant."""
    return FileResponse(_STATIC / "signup.html")


@app.get("/health", include_in_schema=False)
def health():
    return {"status": "ok"}
