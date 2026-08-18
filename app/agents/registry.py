"""Agent registry: agents are config bundles (doc 5 §5.1). YAML files under
config/agents/ are the shared library; syncing them into the `agents` table
per tenant creates that tenant's AI employees (tenant-specific overrides are
then edited in the DB/admin UI without touching the shared library)."""
from pathlib import Path

import yaml
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.config import AGENTS_CONFIG_DIR, PROMPTS_DIR, REPO_ROOT
from app.models import Agent


def load_agent_configs() -> list[dict]:
    configs = []
    for path in sorted(Path(AGENTS_CONFIG_DIR).glob("*.yaml")):
        with open(path) as f:
            configs.append(yaml.safe_load(f))
    return configs


def sync_agents_for_tenant(session: Session, tenant_id: str) -> list[Agent]:
    """Create any missing agents for a tenant from the config library."""
    existing = {a.key: a for a in session.scalars(
        select(Agent).where(Agent.tenant_id == tenant_id)).all()}
    agents = []
    for cfg in load_agent_configs():
        if cfg["key"] in existing:
            agents.append(existing[cfg["key"]])
            continue
        agent = Agent(
            tenant_id=tenant_id,
            key=cfg["key"],
            name=cfg["name"],
            description=cfg.get("description", ""),
            system_prompt_ref=cfg["system_prompt_ref"],
            model_tier=cfg.get("model_tier", "frontier"),
            tools=cfg.get("tools", []),
            knowledge_scope=cfg.get("knowledge_scope", []),
            autonomy=cfg.get("autonomy", "approve"),
            guardrails=cfg.get("guardrails", {}) or {},
        )
        session.add(agent)
        agents.append(agent)
    session.flush()
    return agents


def read_prompt(ref: str) -> str:
    path = REPO_ROOT / ref
    if not path.exists():
        path = PROMPTS_DIR / ref
    return path.read_text()
