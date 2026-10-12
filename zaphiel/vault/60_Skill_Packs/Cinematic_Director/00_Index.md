---
tags: [zaphiel, skill-pack, cinematic, moc]
owner: Ryan
version: 1.0 (2026-10-12)
---
# Cinematic Director: training pack

The agent `.claude/agents/cinematic-director.md` plans and produces the **film assets** that make a website feel
3D, on **Kling** and **Higgsfield**:
1. **Products that split into pieces and come back together** as the visitor scrolls ([[01_Split_and_Reassemble]]).
2. **Photoreal medical anatomy** for doctors' websites: heart and coronary arteries, blood flow in vessels, veins,
   brain, spine, knee, eye, teeth, skin, lungs ([[02_Medical_Anatomy_Films]]).

Ryan's decisions (2026-10-12): films from Kling and Higgsfield, **not** code-drawn 3D models. The agent is
**trained to direct and produce**. It does **not** build websites: the Website Build Worker (site kit, Vercel) and
Lovable (clinics) build from its hand-off.

| Note | What it teaches |
|---|---|
| [[01_Split_and_Reassemble]] | The keyframe method (hero still → exploded still made from it → film between them; reverse scroll = reassembly), model choice, choreography, recipes (watch, car, perfume, sneaker, device, jewellery, furniture, food, building), failure fixes |
| [[02_Medical_Anatomy_Films]] | The medical look bible, the in → explain → out journey, anatomy facts to check, recipes per specialty, medical rules |
| [[03_Production_Runbook]] | Storyboard → prompts → cost card → STOP → produce with approval → keep files → hand-off |
| [[04_Medical_Rules_SG]] | Singapore rules for doctors' and clinics' websites and ads |
| [[05_QA]] | Checks on stills (before paying for video), on films, before hand-off |
| [[06_Prompt_Log]] | What worked, what failed, real credit costs. The agent appends here every project |

**Accounts (checked 2026-10-12):** Kling Pro, 1,508 credits · Higgsfield Plus, 1,000 credits. Kling MCP version
1.3.3 on that date. If `who_am_i` reports a newer version, Ryan reconnects Kling and starts a new session.

**Tests:** dry runs in `80_Clients/_Test/cinematic-director/` (watch, cardiology). Their findings were folded into
these notes on 2026-10-12.

**Builds on:** [[Knowledge/Full Master Cinematic Website Agent 2026]] (doctrine), [[Knowledge/Wow website playbook]],
`ceo-brain/agents/website-builder/brief.js` (`WB_TRANSFORM`, `WB_EXPLAINER`), `ceo-brain/agents/website-build-worker/ROUTINE.md`,
`ceo-brain/site-kit/README.md` (how films go on the site). Agents: [[10_Agents/05_Website_App_General]],
[[10_Agents/06_Medical_3D_Web]], [[10_Agents/05a_Website_Intelligence]].

## How to use it (Ryan)
- "Use cinematic-director: a luxury watch that comes apart and back together for <brand>. Storyboard and cost card."
- "Use cinematic-director: anatomy film for a heart specialist's website, heart, arteries, blood flow."
- After the cost card: "APPROVED: up to 300 Kling credits." Then it produces the films and hands them to the builders.
