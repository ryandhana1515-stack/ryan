# Zaphiel's brain → Obsidian — EXECUTED 2026-09-25

> Status: Ryan opened `zaphiel/vault/` in Obsidian and said "vault is ready". The vault is the
> brain; `zaphiel/memory.md` is a stub and the last full copy sits in `zaphiel/archive/`.
> `build-vault.js` was a one-time migration tool — do not run it again (it would overwrite
> Ryan's edits with the archived memory).

# Original plan (kept for history)

Decision (Ryan, 2026-09-25): Zaphiel's persistent memory moves from `zaphiel/memory.md` into an
Obsidian vault. Ryan sets the vault up; until then `zaphiel/memory.md` stays the source of truth
and nothing is moved.

## How it will connect (so every system reads ONE brain)

```
Obsidian app (Ryan)  ⇄  vault folder = this repo, path zaphiel/vault/  ⇄  GitHub
                                                                          ├─ Claude sessions (clone the repo → read/write notes, commit, push)
                                                                          └─ n8n (GitHub credential already exists → read notes; write via commits)
```

The vault lives INSIDE this repo. That is the whole trick: Obsidian edits a folder, the
Obsidian Git plugin (or Ryan's own git push) syncs it, and every Claude session and every n8n
workflow already reach the repo. No new credential, no new service.

## What Ryan does (one time, ~5 minutes) — updated 2026-09-25

The vault already exists in this repo at `zaphiel/vault/` (generated notes + the FusionTech brain) and
the **Obsidian Git** plugin is pre-installed and pre-configured inside it (auto pull / commit / push
every 10 minutes). So:

1. Install **GitHub Desktop**, sign in, File → Clone repository → `ryandhana1515-stack/ryan`.
2. In Obsidian: Open another vault → **Open folder as vault** → choose `ryan/zaphiel/vault`.
   Click "Trust author and enable plugins" when asked. Git sync is now running.
3. Tell Zaphiel "vault is ready".

## What Zaphiel does when the vault is ready

4. `node zaphiel/obsidian/build-vault.js` — splits `memory.md` into linked notes under
   `zaphiel/vault/` (one note per section, a `00 Home` map-of-content, frontmatter with dates),
   plus a `CEO Brain` note linking the ceo-brain docs. Dry-run tested 2026-09-25.
5. Replace `zaphiel/memory.md` with a stub that points at the vault; update `CLAUDE.md` first
   moves to read `zaphiel/vault/00 Home.md`; update the n8n "Email Daily Market Brief" workflow
   and any future workflow to read from `zaphiel/vault/` via the GitHub node.
6. Board of Advisors dossiers and CEO Brain docs get linked from the vault, not duplicated.

## Rules once live

- Vault is the source of truth. `memory.md` is retired (kept as history, never edited).
- Zaphiel keeps the same discipline: read `00 Home` first, append real changes before ending a
  session, commit, push.
- No secrets in the vault, ever (it syncs to GitHub).
- **Ryan's rule (2026-09-25): the vault is the MAIN brain from the day it exists.** At the end of
  EVERY session Zaphiel adds the important information Ryan gave and everything that was built
  (decisions, new workflows, new agents, IDs, blockers) to the vault — then commit + push.
- `zaphiel/knowledge/*.md` (e.g. the FusionTech Master Company Brain) is copied into the vault
  verbatim by `build-vault.js` as `knowledge` notes; the agents (John, Website Builder) are briefed
  from those documents, so editing them in Obsidian is how Ryan updates John's brain (rebuild +
  redeploy the workflows afterwards).
