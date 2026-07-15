"""Central configuration. Everything comes from environment variables so the
same code runs in dev (SQLite, mock LLM) and prod (Postgres, real LLM)."""
import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

REPO_ROOT = Path(__file__).resolve().parent.parent
PROMPTS_DIR = REPO_ROOT / "prompts"
AGENTS_CONFIG_DIR = REPO_ROOT / "config" / "agents"

DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{REPO_ROOT / 'aibos.db'}")

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")

# Model routing policy (doc 3 §3.3): frontier for conversations, small for
# classification. Overridable per deployment.
MODEL_FRONTIER = os.getenv("AIBOS_MODEL_FRONTIER", "claude-sonnet-5")
MODEL_SMALL = os.getenv("AIBOS_MODEL_SMALL", "claude-haiku-4-5-20251001")
OPENROUTER_MODEL_FRONTIER = os.getenv("AIBOS_OR_MODEL_FRONTIER", "anthropic/claude-sonnet-4.5")
OPENROUTER_MODEL_SMALL = os.getenv("AIBOS_OR_MODEL_SMALL", "anthropic/claude-haiku-4.5")

# Force the deterministic mock LLM even when keys are present (tests/demos).
USE_MOCK_LLM = os.getenv("AIBOS_MOCK_LLM", "").lower() in ("1", "true", "yes")

# Hard safety rails (doc 8 §8.4) — deterministic, not model-enforced.
MAX_MESSAGES_PER_AGENT_PER_DAY = int(os.getenv("AIBOS_MAX_AGENT_MESSAGES_DAY", "500"))
MAX_AI_COST_PER_TENANT_PER_DAY = float(os.getenv("AIBOS_MAX_AI_COST_DAY", "50.0"))
