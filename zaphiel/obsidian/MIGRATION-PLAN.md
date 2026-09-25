# Zaphiel's brain → Obsidian (planned, not executed)

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

## What Ryan does (one time, ~10 minutes)

1. Install Obsidian. Create a new vault, choosing the folder `zaphiel/vault` inside a local clone
   of this repo (or open that folder as a vault).
2. Install the community plugin **Obsidian Git** and enable auto-pull/auto-commit (every 10 min
   is fine). Its git remote is this repo, branch = the default branch.
3. Tell Zaphiel "vault is ready". Then step 4 runs.

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
