#!/usr/bin/env python3
"""
Bio Green Elixirs — Agent Terminal
Install: pip install textual
Run:     python agents.py
"""

from textual.app import App, ComposeResult
from textual.widgets import Header, Footer, ListView, ListItem, Label, Static, RichLog
from textual.containers import Horizontal, Vertical, ScrollableContainer
from textual.binding import Binding
from textual import on
from rich.text import Text
from rich.panel import Panel
import subprocess, os, sys

# ── Agent roster ──────────────────────────────────────────────────────────────

AGENTS = [
    {
        "id": "ceo",
        "icon": "👑",
        "name": "CEO AGENT",
        "codename": "BOSS",
        "color": "#FFD700",
        "pixel": [
            " ╭─────╮ ",
            " │▀█▀█▀│ ",
            " │(◕‿◕)│ ",
            " │ CEO │ ",
            " ╰──┬──╯ ",
            "   ▐█▌   ",
        ],
        "role": "Master Coordinator",
        "desc": (
            "Routes ANY request to the right agents.\n"
            "Coordinates multiple agents working together.\n"
            "Just tell me what you want to achieve."
        ),
        "example": "\"Launch a TikTok campaign for BIO N:OV this week\"",
    },
    {
        "id": "ads",
        "icon": "📊",
        "name": "ADS AGENT",
        "codename": "RYAN-1",
        "color": "#FF4444",
        "pixel": [
            " ╭─────╮ ",
            " │▀▄▀▄▀│ ",
            " │(◔‿◔)│ ",
            " │ ADS │ ",
            " ╰──┬──╯ ",
            "   ▐█▌   ",
        ],
        "role": "Paid Advertising",
        "desc": (
            "Facebook & TikTok paid ad campaigns.\n"
            "Meta Advantage+ and TikTok Smart+.\n"
            "Ad copy, targeting, budgets."
        ),
        "example": "\"Write a Facebook ad for BIO N:OV blood pressure angle\"",
    },
    {
        "id": "content",
        "icon": "✍️",
        "name": "CONTENT AGENT",
        "codename": "ALEX-1",
        "color": "#00DCFF",
        "pixel": [
            " ╭─────╮ ",
            " │▀█▀█▀│ ",
            " │(◕‿◕)│ ",
            " │ CNT │ ",
            " ╰──┬──╯ ",
            "   ▐█▌   ",
        ],
        "role": "Copywriting & Content",
        "desc": (
            "Instagram captions, TikTok scripts.\n"
            "Ad copy, emails, product descriptions.\n"
            "Blog posts, WhatsApp broadcasts."
        ),
        "example": "\"Write 5 Instagram captions for BIO N:OV\"",
    },
    {
        "id": "image",
        "icon": "🖼️",
        "name": "IMAGE AGENT",
        "codename": "MIA-1",
        "color": "#FF69B4",
        "pixel": [
            " ╭─────╮ ",
            " │▀▄▀▄▀│ ",
            " │(◑‿◐)│ ",
            " │ IMG │ ",
            " ╰──┬──╯ ",
            "   ▐█▌   ",
        ],
        "role": "Visual & Product Images",
        "desc": (
            "Product photography via fal.ai.\n"
            "Ad banners, social media visuals.\n"
            "FLUX Pro, Recraft V3, Seedream V3."
        ),
        "example": "\"Generate a product photo of BIO N:OV on marble\"",
    },
    {
        "id": "video",
        "icon": "🎬",
        "name": "VIDEO AGENT",
        "codename": "LEO-1",
        "color": "#FF8C00",
        "pixel": [
            " ╭─────╮ ",
            " │▀█▀█▀│ ",
            " │(▶‿▶)│ ",
            " │ VID │ ",
            " ╰──┬──╯ ",
            "   ▐█▌   ",
        ],
        "role": "Video & TikTok Reels",
        "desc": (
            "TikTok videos and reels via fal.ai.\n"
            "Video scripts and storyboards.\n"
            "Seedance V2, Kling 3.0, Veo 3.1."
        ),
        "example": "\"Make a 30-second TikTok about blood pressure\"",
    },
    {
        "id": "research",
        "icon": "🔬",
        "name": "RESEARCH AGENT",
        "codename": "SAM-1",
        "color": "#00FF7F",
        "pixel": [
            " ╭─────╮ ",
            " │▀▄▀▄▀│ ",
            " │(◉‿◉)│ ",
            " │ RES │ ",
            " ╰──┬──╯ ",
            "   ▐█▌   ",
        ],
        "role": "Market Intelligence",
        "desc": (
            "Competitor analysis and ad intel.\n"
            "TikTok trends, keyword research.\n"
            "Market opportunities in SEA."
        ),
        "example": "\"Research top blood pressure supplement ads on TikTok\"",
    },
    {
        "id": "affiliate",
        "icon": "🤝",
        "name": "AFFILIATE AGENT",
        "codename": "ZARA-1",
        "color": "#DA70D6",
        "pixel": [
            " ╭─────╮ ",
            " │▀█▀█▀│ ",
            " │(◕‿◕)│ ",
            " │ AFF │ ",
            " ╰──┬──╯ ",
            "   ▐█▌   ",
        ],
        "role": "Influencer & Affiliates",
        "desc": (
            "TikTok creator recruitment.\n"
            "Outreach DMs and email templates.\n"
            "GoAffPro setup, commission structure."
        ),
        "example": "\"Write a DM to recruit a health influencer\"",
    },
    {
        "id": "website",
        "icon": "🌐",
        "name": "WEBSITE AGENT",
        "codename": "MAX-1",
        "color": "#40E0D0",
        "pixel": [
            " ╭─────╮ ",
            " │▀▄▀▄▀│ ",
            " │(◑‿◑)│ ",
            " │ WEB │ ",
            " ╰──┬──╯ ",
            "   ▐█▌   ",
        ],
        "role": "Shopify & Web",
        "desc": (
            "Shopify store and landing pages.\n"
            "React + Three.js ORYZO website.\n"
            "Checkout optimization, SEO fixes."
        ),
        "example": "\"Fix the ORYZO website coaster animation\"",
    },
]

# ── Styles ────────────────────────────────────────────────────────────────────

CSS = """
Screen {
    background: #0a0e1a;
}

#sidebar {
    width: 22;
    background: #0d1221;
    border-right: solid #00DCFF;
    padding: 0 0;
}

#sidebar-title {
    background: #00DCFF;
    color: #0a0e1a;
    text-align: center;
    padding: 0 1;
    text-style: bold;
    height: 3;
    content-align: center middle;
}

ListView {
    background: #0d1221;
    border: none;
    padding: 0;
}

ListItem {
    padding: 0 1;
    height: 3;
    background: #0d1221;
    color: #7a8ab0;
}

ListItem:hover {
    background: #1a2540;
    color: #ffffff;
}

ListItem.--highlight {
    background: #162035;
    color: #00DCFF;
    border-left: solid #00DCFF;
}

#main {
    background: #0a0e1a;
    padding: 0;
}

#agent-display {
    height: 1fr;
    background: #0a0e1a;
    padding: 1 2;
    border-bottom: dashed #1a2540;
}

#command-panel {
    height: 1fr;
    background: #0a0e1a;
    padding: 1 2;
}

Header {
    background: #0a0e1a;
    color: #00DCFF;
    text-style: bold;
    height: 3;
}

Footer {
    background: #0d1221;
    color: #7a8ab0;
}
"""

# ── Widgets ───────────────────────────────────────────────────────────────────

class AgentCard(Static):
    def __init__(self, agent: dict):
        super().__init__()
        self.agent = agent

    def render(self):
        a = self.agent
        lines = []
        lines.append(f"[bold {a['color']}]{a['icon']} {a['name']}[/]  [{a['color']}]{a['codename']}[/]")
        lines.append(f"[dim]─────────────────────────────────────────[/]")
        lines.append("")

        # Pixel art + description side by side
        pixel = a["pixel"]
        desc_lines = a["desc"].split("\n")
        for i in range(max(len(pixel), len(desc_lines) + 1)):
            p = pixel[i] if i < len(pixel) else " " * 10
            if i == 0:
                d = f"[bold white]{a['role']}[/]"
            elif i - 1 < len(desc_lines):
                d = f"[dim]{desc_lines[i-1]}[/]"
            else:
                d = ""
            lines.append(f"[{a['color']}]{p}[/]  {d}")

        lines.append("")
        lines.append(f"[dim]Example command:[/]")
        lines.append(f"[italic {a['color']}]{a['example']}[/]")
        lines.append("")
        lines.append(f"[dim]─────────────────────────────────────────[/]")
        lines.append(f"[dim]Press [/][bold white]ENTER[/][dim] to open Claude with this agent │ [/][bold white]↑↓[/][dim] to switch agents[/]")
        return "\n".join(lines)


class CommandLog(RichLog):
    pass


# ── Main App ──────────────────────────────────────────────────────────────────

class AgentTerminal(App):
    CSS = CSS
    TITLE = "BIO GREEN ELIXIRS — AGENT COMMAND CENTER"
    BINDINGS = [
        Binding("q", "quit", "Quit"),
        Binding("enter", "launch_agent", "Launch Agent"),
        Binding("escape", "quit", "Quit"),
    ]

    def __init__(self):
        super().__init__()
        self.selected_agent = AGENTS[0]

    def compose(self) -> ComposeResult:
        yield Header(show_clock=True)
        with Horizontal():
            with Vertical(id="sidebar"):
                yield Static("◈ AGENTS", id="sidebar-title")
                with ListView() as lv:
                    self._listview = lv
                    for a in AGENTS:
                        yield ListItem(Label(f"{a['icon']} {a['name'][:12]}"), id=f"agent-{a['id']}")
            with Vertical(id="main"):
                yield AgentCard(self.selected_agent)
                yield CommandLog(id="log", highlight=True, markup=True)
        yield Footer()

    def on_mount(self) -> None:
        log = self.query_one(CommandLog)
        log.write("[bold #00DCFF]BIO GREEN ELIXIRS AGENT TERMINAL[/]")
        log.write("[dim]─────────────────────────────────────────────[/]")
        log.write("[dim]Select an agent from the sidebar → press ENTER to launch Claude[/]")
        log.write("[dim]Or just talk to the 👑 CEO Agent — it routes everything automatically[/]")
        log.write("")
        log.write(f"[bold white]8 agents ready:[/] CEO · Ads · Content · Image · Video · Research · Affiliate · Website")

    @on(ListView.Highlighted)
    def on_list_view_highlighted(self, event: ListView.Highlighted) -> None:
        if event.item:
            item_id = event.item.id
            if item_id and item_id.startswith("agent-"):
                agent_id = item_id.replace("agent-", "")
                for a in AGENTS:
                    if a["id"] == agent_id:
                        self.selected_agent = a
                        card = self.query_one(AgentCard)
                        card.agent = a
                        card.refresh()
                        break

    def action_launch_agent(self) -> None:
        agent = self.selected_agent
        log = self.query_one(CommandLog)
        log.write("")
        log.write(f"[bold {agent['color']}]⚡ Launching {agent['name']} ({agent['codename']})...[/]")
        log.write(f"[dim]Opening Claude Code with {agent['name']} context[/]")

        # Build the claude launch command
        prompt = (
            f"You are {agent['codename']}, the {agent['name']} for Bio Green Elixirs. "
            f"Role: {agent['role']}. "
            f"Product: BIO N:OV blood pressure supplement. "
            f"Owner: Ryan Dhana. "
            f"Activate now and ask Ryan what he needs."
        )

        # Launch claude in a new terminal window
        if sys.platform == "win32":
            cmd = f'start cmd /k claude --print "{prompt}"'
            os.system(cmd)
        else:
            subprocess.Popen(["claude", "--print", prompt])

        log.write(f"[bold #00FF7F]✓ {agent['codename']} is online[/]")


# ── Entry point ───────────────────────────────────────────────────────────────

if __name__ == "__main__":
    app = AgentTerminal()
    app.run()
