from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.agents import rag
from app.api.deps import get_tenant
from app.db import get_session
from app.models import KnowledgeDoc, Tenant

router = APIRouter(prefix="/api/knowledge", tags=["knowledge"])


class DocIn(BaseModel):
    title: str
    kind: str = "faq"  # sop|policy|product|script|faq|training|brand
    body: str


@router.post("/docs")
def add_doc(body: DocIn, tenant: Tenant = Depends(get_tenant),
            session: Session = Depends(get_session)):
    doc = KnowledgeDoc(tenant_id=tenant.id, title=body.title, kind=body.kind, body=body.body)
    session.add(doc)
    session.flush()
    n = rag.chunk_and_store(session, tenant.id, doc.id, doc.title, doc.kind, doc.body)
    session.commit()
    return {"doc_id": doc.id, "chunks": n}


@router.get("/docs")
def list_docs(tenant: Tenant = Depends(get_tenant),
              session: Session = Depends(get_session)):
    docs = session.scalars(select(KnowledgeDoc)
                           .where(KnowledgeDoc.tenant_id == tenant.id)).all()
    return [{"id": d.id, "title": d.title, "kind": d.kind, "status": d.status} for d in docs]


@router.get("/search")
def search(q: str, tenant: Tenant = Depends(get_tenant),
           session: Session = Depends(get_session)):
    chunks = rag.retrieve(session, tenant.id, q, top_k=5)
    return [{"doc_title": c.doc_title, "kind": c.doc_kind, "text": c.text} for c in chunks]
