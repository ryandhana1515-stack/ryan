#!/usr/bin/env bash
# Fallback hosting when Vercel refuses a deploy (for example the Hobby plan's 100-deployments-a-day limit). Runs
# INSIDE the Higgsfield sandbox (sandbox_exec). It builds a mock-up folder made from this kit, film included, and
# places it in a Higgsfield website checkout, ready to commit, push and deploy. Higgsfield sites sit behind the
# Higgsfield sign-in, so this link is for Ryan to review, not for customers (Ryan, 2026-09-29: a login link is fine).
#
# usage: bash higgsfield-host.sh <mockup folder> <website checkout path from website_repo_access>
# Proven on the Atelier Noir preview (2026-09-29): Node 20.9 in the sandbox runs kit.mjs and media.mjs; Vite 8
# needs Node 22 (npx node@22) and rolldown's native binding installed explicitly.
set -euo pipefail
SRC="$1"; WEB="$2"
cd "$SRC"
npm install --no-audit --no-fund > /tmp/hf-install.log 2>&1
V=$(node -p "require('./node_modules/rolldown/package.json').version")
npm i --no-save --no-audit --no-fund "@rolldown/binding-linux-x64-gnu@$V" >> /tmp/hf-install.log 2>&1 || true
node scripts/kit.mjs
node scripts/media.mjs
npx -y node@22 node_modules/vite/bin/vite.js build
PUB="$WEB/app/public"
mkdir -p "$PUB/assets"
[ -d dist/film ] && cp -r dist/film "$PUB/"
cp -r dist/assets/. "$PUB/assets/"
for f in dist/*.html; do cp "$f" "$PUB/$(basename "$f")"; done
cp dist/index.html "$PUB/home.html"
# The home route sends visitors to the static site (assets normally serve / from public/index.html already).
cat > "$WEB/app/src/routes/index.tsx" <<'EOF'
import { createFileRoute, redirect } from "@tanstack/react-router";

// The mock-up is a static site in public/ (built by the FusionTech site kit).
export const Route = createFileRoute("/")({
  beforeLoad: () => {
    throw redirect({ href: "/home.html", reloadDocument: true });
  },
  component: () => null,
});
EOF
cd "$WEB"
git add -A
git -c user.email=zaphiel@fusiontech.ai -c user.name=Zaphiel commit -q -m "FusionTech mock-up (site kit build)"
echo "READY: now website_repo_access push, then deploy_website"
du -sh "$PUB"
