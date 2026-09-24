#!/usr/bin/env bash
# Sends the John Tan test lead to the DEPLOYED n8n workflow and prints the structured result.
# Usage: bash tests/live-test.sh [mock|live] [fixture.json]
#   mock = rule engine only (no AI credits)     live = Claude via n8n Gateway credits
# Requires: curl, python3. No credentials needed (the webhook is public in Phase 1).
set -euo pipefail
MODE="${1:-mock}"
FIXTURE="${2:-$(dirname "$0")/fixtures/john-tan.json}"
BASE="${N8N_BASE_URL:-https://ryan1515.app.n8n.cloud}"
URL="$BASE/webhook/ceo-brain/lead"
BODY=$(python3 -c "import json,sys; d=json.load(open(sys.argv[1])); d['test_mode']=True; d['ai_mode']=sys.argv[2]; print(json.dumps(d))" "$FIXTURE" "$MODE")
echo "POST $URL (ai_mode=$MODE, test_mode=true)"
curl -sS -X POST "$URL" -H 'content-type: application/json' -d "$BODY" | python3 -m json.tool
