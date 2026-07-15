from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.agents.manager import chat as manager_chat
from app.api.deps import get_tenant
from app.db import get_session
from app.models import Tenant

router = APIRouter(prefix="/api/manager", tags=["manager"])


class ChatTurn(BaseModel):
    role: str = "user"
    content: str = ""


class ChatRequest(BaseModel):
    message: str
    history: list[ChatTurn] = Field(default_factory=list)


@router.post("/chat")
def chat(body: ChatRequest, tenant: Tenant = Depends(get_tenant),
         session: Session = Depends(get_session)):
    result = manager_chat(session, tenant, body.message,
                          [t.model_dump() for t in body.history])
    session.commit()
    return result
