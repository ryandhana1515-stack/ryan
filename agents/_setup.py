"""
Shared setup for all Bio Green Elixirs agents.
Every agent imports this to get the FAL key loaded.
"""

import os
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), "../.env"))
os.environ["FAL_KEY"] = os.getenv("FAL_KEY", "")
