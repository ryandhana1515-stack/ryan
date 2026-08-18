# Deploying AI-BOS to DigitalOcean App Platform

Turns the system into an always-on web app with its own URL. ~15 minutes.

## What you need

- A DigitalOcean account (with billing set up)
- This GitHub repository connected to your GitHub account

## Steps

1. In the DigitalOcean control panel click **Create → App Platform**.
2. Source: **GitHub** → authorize DigitalOcean → pick the repo
   `ryandhana1515-stack/ryan` → branch `claude/ai-business-os-design-erucf4`
   (or `main` after merging) → Autodeploy ON.
3. DigitalOcean detects the **Dockerfile** automatically. Instance size:
   **Basic, 512MB** is enough to start (~$5/mo).
4. Click **Add Resource → Database → Dev Database (PostgreSQL)** (~$7/mo).
   App Platform automatically injects its connection string as
   `DATABASE_URL` — the app picks it up with zero config.
5. Under **Environment Variables** for the app component, add:
   | Key | Value |
   |---|---|
   | `ADMIN_PASSWORD` | a strong password — the app is locked with it |
   | `SECRET_KEY` | a long random string — signs customer login sessions (mark Encrypted). Changing it logs everyone out |
   | `OPENROUTER_API_KEY` | your OpenRouter key (mark Encrypted) |
   | `FAL_KEY` | your fal.ai key (mark Encrypted) |
6. Click **Create Resources**. First build takes a few minutes.
7. Open the URL DigitalOcean gives you (like `https://xxxxx.ondigitalocean.app`).
   Go to `/login` and sign in with any email + your `ADMIN_PASSWORD` —
   that opens the owner workspace. Customers create their own accounts
   on the same page ("Create account" tab).

## Notes

- **Data:** business data lives in the managed Postgres — it survives
  restarts and redeploys. Generated media (`/generated`) is ephemeral on
  App Platform; move it to DO Spaces (S3) when it matters.
- **Custom domain:** App Settings → Domains → add
  `app.yourbusiness.com` and follow the DNS instructions.
- **Updates:** every push to the connected branch redeploys automatically.
- **Never** commit real keys to the repo — they go in App Platform
  environment variables only.
