from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy import select

from app.api import agents_api, crm, dashboard, knowledge, manager_api
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

app.include_router(crm.router)
app.include_router(agents_api.router)
app.include_router(knowledge.router)
app.include_router(dashboard.router)
app.include_router(manager_api.router)

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


@app.get("/health", include_in_schema=False)
def health():
    return {"status": "ok"}
