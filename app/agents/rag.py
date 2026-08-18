"""Knowledge retrieval (doc 5 §5.4). Phase 1 uses keyword-overlap scoring in
SQL-fetched chunks; isolation rules are enforced here in code, never in the
prompt: tenant filter + agent knowledge_scope filter happen before scoring.
Upgrading to pgvector similarity replaces only `_score`.
"""
import re

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import KnowledgeChunk

_STOP = {"the", "a", "an", "is", "are", "to", "of", "and", "or", "for", "in",
         "on", "my", "i", "you", "we", "it", "do", "does", "how", "what", "can"}


def _tokens(text: str) -> set[str]:
    return {w for w in re.findall(r"[a-z0-9]+", text.lower()) if w not in _STOP and len(w) > 2}


def _score(query_tokens: set[str], chunk: KnowledgeChunk) -> float:
    if not query_tokens:
        return 0.0
    chunk_tokens = _tokens(chunk.text + " " + chunk.doc_title)
    return len(query_tokens & chunk_tokens) / len(query_tokens)


def retrieve(session: Session, tenant_id: str, query: str,
             scope: list[str] | None = None, top_k: int = 3) -> list[KnowledgeChunk]:
    stmt = select(KnowledgeChunk).where(KnowledgeChunk.tenant_id == tenant_id)
    if scope:
        stmt = stmt.where(KnowledgeChunk.doc_kind.in_(scope))
    chunks = session.scalars(stmt).all()
    q = _tokens(query)
    ranked = sorted(chunks, key=lambda c: _score(q, c), reverse=True)
    return [c for c in ranked[:top_k] if _score(q, c) > 0]


def chunk_and_store(session: Session, tenant_id: str, doc_id: str, title: str,
                    kind: str, body: str, max_chars: int = 800) -> int:
    """Split a doc into paragraph-bounded chunks and store them."""
    paras = [p.strip() for p in body.split("\n\n") if p.strip()]
    chunks, current = [], ""
    for p in paras:
        if len(current) + len(p) > max_chars and current:
            chunks.append(current)
            current = p
        else:
            current = f"{current}\n\n{p}".strip()
    if current:
        chunks.append(current)
    for text in chunks:
        session.add(KnowledgeChunk(tenant_id=tenant_id, doc_id=doc_id,
                                   doc_title=title, doc_kind=kind, text=text))
    return len(chunks)
