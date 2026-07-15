from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.responses import FileResponse

from app.api import agents_api, crm, dashboard, knowledge
from app.db import init_db
from app.workflows import register_all


@asynccontextmanager
async def lifespan(_: FastAPI):
    init_db()
    register_all()
    yield


app = FastAPI(title="AI Business Operating System", version="0.1.0", lifespan=lifespan)

app.include_router(crm.router)
app.include_router(agents_api.router)
app.include_router(knowledge.router)
app.include_router(dashboard.router)

_STATIC = Path(__file__).parent / "static"


@app.get("/", include_in_schema=False)
def root():
    """The CEO Dashboard."""
    return FileResponse(_STATIC / "dashboard.html")


@app.get("/health", include_in_schema=False)
def health():
    return {"status": "ok"}
