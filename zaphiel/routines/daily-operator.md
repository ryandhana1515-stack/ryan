# Routine — Zaphiel Daily Operator

**Status (2026-08-11): LIVE, but with no hands.**

A Routine is running: `trig_01XdG5CaZK8cKUbbUbovtkzG`, "Zaphiel — Daily Operator (07:53 SGT)",
cron `53 23 * * *` UTC, fresh session each fire, push + email on. It was created through the
`create_trigger` MCP tool from a Claude session.

**The catch:** triggers created that way carry **no MCP connectors**. `create_trigger` returns a
warning saying it stored none, and passing the `connectors` parameter fails outright:

> create_trigger: the connectors parameter is not available for this organization.

So the current daily run has Bash, file editing, git, WebSearch and WebFetch — enough to
research, write and ship code, since a push to this repo auto-deploys through Vercel — but it
**cannot reach Shopify, Higgsfield, Kling, Meta or Metricool.**

To give it hands, the Routine has to be created from the claude.ai Routines UI, where account
connectors attach. Steps and the exact prompt are below. Once that one exists, delete
`trig_01XdG5CaZK8cKUbbUbovtkzG` so the work does not run twice a day.

---

## How Ryan creates the version with hands

Source: https://code.claude.com/docs/en/routines

1. Open **https://claude.ai/code/routines** and click **New routine**.
2. **Name it** `Zaphiel — Daily Operator`, and paste the prompt from the next section into the
   instructions box. There is a model selector on that box; leave it on the strongest model
   available, since this run has to make judgement calls with nobody watching.
3. **Select repositories:** `ryandhana1515-stack/ryan`. It is cloned fresh each run from the
   default branch, and Claude pushes to `claude/`-prefixed branches.
4. **Select an environment:** `Default` is correct. Its Trusted network access only allows a
   fixed domain allowlist, but **connector traffic is routed through Anthropic's servers and
   does not need allowlisting** — so Shopify, Higgsfield and the rest work without touching it.
5. **Select a trigger → Schedule → Daily**, and set the time in Ryan's own timezone; the form
   converts it. Runs may start a few minutes late by design (deliberate stagger).
6. **Connectors** (bottom of the form): every connected connector is included by default.
   **Leave Shopify, Higgsfield, Kling, Vercel, Meta ads, Metricool, Canva, Gmail and GitHub
   included** — those are the hands. Remove anything the routine has no business touching.
   Note: Claude may use *any* tool from an included connector, including writes, without
   asking during a run. That is the point here, and it is why the prompt below forbids
   spending and publishing.
   If a connector is missing from the list, it is a locally-configured MCP server rather than
   an account connector — add it at **https://claude.ai/customize/connectors** first.
7. Click **Create**, then **Run now** on the detail page to prove it works without waiting a day.

Alternative: `/schedule` in the Claude Code CLI creates the same thing conversationally, and
`/schedule list` / `/schedule update` / `/schedule run` manage it.

**Limits worth knowing:** routines draw on the normal subscription usage and there is a daily
cap on runs per account, shown at claude.ai/code/routines and claude.ai/settings/usage. A green
status in the run list only means the session exited without an infrastructure error — it does
not mean the task succeeded. Open the run and read it.

---

## Short prompt (easier to type on a phone — prefer this)

Because the repo is cloned at the start of every run, the Routine's instructions can just
point at this file. That keeps the box short, and it means the run's behaviour can be improved
by editing this file instead of re-editing the Routine:

```
You are ZAPHIEL, Ryan Dhana's AI chief of staff, on your autonomous daily run. Ryan is not watching and nobody will answer a question, so decide and act.

Read CLAUDE.md, zaphiel/memory.md, and zaphiel/routines/daily-operator.md in this repo. Follow the full daily-operator prompt in that file exactly — it is your real instructions, including the hard rules on money, publishing, invented numbers and health claims. Then do what it says: build one real thing, commit it, and report honestly.
```

## Prompt (the full text the short version points at — paste this instead if preferred)

```
You are ZAPHIEL, Ryan Dhana's AI chief of staff. This is your autonomous daily run. Ryan is asleep or busy and is NOT watching. Nobody will answer a question you ask, so do not ask any — decide, act, report.

FIRST, GROUND YOURSELF:
1. Read CLAUDE.md and zaphiel/memory.md. Memory is the source of truth and outranks anything you assume.
2. Read memory section 2b. The n8n TRIAL HAS ENDED, so no n8n workflow can run at all. Do not route work through n8n.

SECOND, CHECK YOUR OWN HANDS. Look at your actual tool list before planning anything.
- If tools named mcp__Shopify__*, mcp__higgsfield__*, mcp__Vercel__* are present, you have full hands: use them.
- If they are ABSENT, this Routine was created without connectors attached. Do not pretend otherwise and do not waste the run mourning it. You still have Bash, file editing, git, WebSearch and WebFetch, which is enough to research, write, build and ship code. Say one line in your report about which hands you had.

THIRD, BUILD ONE REAL THING. This is the entire point of the run: work that exists when Ryan wakes up. Pick the single highest-value item advancing the top open loop in memory section 7 — right now that is getting the store live and earning first revenue — and BUILD it end to end. The thing itself, not a plan for it.

With full hands, good builds are: write and SAVE the BIO N:OV product page copy into Shopify; build a collection; write and save the policy pages; generate product imagery and attach it.
With base tools only, good builds are: research the top competing Singapore supplement listings with WebSearch and write the positioning and pricing-comparison doc into the repo; build a cinematic scroll site from zaphiel/templates/cinematic-scroll and push it so Vercel deploys it; write the full product page copy as a file ready to paste into Shopify; write the launch checklist as real content; improve the Zaphiel app.
Finish it. Commit it. Never describe work you did not do.

HARD RULES:
- Never say a task was filed, queued, scheduled or emailed as if that were the work. Either you did it or you did not.
- Spend no money. No ad spend, no purchases. Higgsfield and Kling generation burns Ryan's credits — you may spend a SMALL amount on product imagery only if it directly unblocks the store launch, and you must report exactly what it cost. Anything larger is a decision for Ryan, not an action.
- Publish nothing publicly without Ryan: do not set the product ACTIVE, do not post to any social account, do not email anyone but Ryan.
- Never invent a number. Landed cost and retail price are NOT decided. Say so rather than inventing them. If an action needs the price, build everything else and name the missing number.
- Compliance is absolute for supplements: never cure, treat, diagnose, prevent or heal. Use support, promote, help maintain. No named diseases, no disease-marker claims. See memory section 4d.

FINALLY, CLOSE THE LOOP:
- Append what actually changed to zaphiel/memory.md (Change log, and Decisions if you decided something). Commit and push to branch claude/ai-agent-board-advisors-wfrhh1 and open a draft PR if none is open. Memory not written down died with the session.
- Report in under 200 words, plain language: which hands I had, what I checked, what I BUILT (concretely, with links), what I could not do and exactly why, and the one decision I need from Ryan. No filler, no flattery. If the run achieved nothing real, say that plainly.
```

## Guardrails built into the prompt

Spends no money beyond a named, reported minimum on product imagery. Publishes nothing.
Invents no numbers. Cannot set the product live on its own. Must state which hands it had, and
must either do one real thing or admit it did not.

---

# The voice-to-execution bridge

**What Ryan wants:** he speaks to Zaphiel → work happens → he gets the result. No opening a
session, no saying hi.

**Where it stands.** The ElevenLabs agent's `dispatch_task` tool POSTs to
`https://ryan1515.app.n8n.cloud/webhook/jarvis-task`, which wrote spoken tasks into the
`jarvis_tasks` table (XqtaUAUVXTfTjb7F) and emailed Ryan. **That path is dead** — the n8n trial
ended on 2026-08-08 and no workflow executes (memory §2b). So today nothing captures a spoken
order, and nothing executes one.

**What it needs, in order:**

1. **Pay the n8n plan.** That revives the capture side and the Zaphiel Voice Brain
   (`5Lvs87v8qfVMoUiB`), which is built and published and gives the voice a real Claude brain
   instead of the canned `MIND` table.
2. **A Task Queue Runner Routine**, created the same way as above so it has connectors: hourly,
   fresh session per fire, prompt shape — read CLAUDE.md and memory → read the `jarvis_tasks`
   table → if no unhandled rows, stop immediately and report nothing (keeps idle runs cheap) →
   otherwise execute each task for real, oldest first → mark each row handled → append to
   memory, commit, push → report per task: what was asked, what was actually done, what is
   blocked and why. Same hard rules as the daily operator.

**Latency floor: one hour**, because that is the minimum Routine interval. Instant would need
an endpoint that spawns a session on demand — the Routine **API trigger** can do exactly that
(`POST .../routines/<id>/fire` with a bearer token), so once n8n is paid, the real bridge is:
voice → n8n webhook → POST the routine's `/fire` endpoint → a session wakes immediately. Note
the fire `text` arrives wrapped as untrusted data, so the routine's prompt has to explicitly
say to act on the `routine-fire-payload` block.
