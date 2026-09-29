#!/usr/bin/env bash
# Creates a LOCAL development Postgres (dev + test databases) with random passwords and writes .env.local.
# Development only: fake data, never a client's data. Needs a local PostgreSQL 16 (or run it against Docker).
set -euo pipefail
cd "$(dirname "$0")/.."
OWNER_PW=$(openssl rand -hex 16); APP_PW=$(openssl rand -hex 16)
PSQL="psql -v ON_ERROR_STOP=1 -q"
if command -v pg_ctlcluster >/dev/null && ! pg_lsclusters | grep -q online; then pg_ctlcluster 16 main start; fi
su postgres -c "$PSQL" <<SQL
DO \$\$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='edg_owner') THEN CREATE ROLE edg_owner LOGIN SUPERUSER; END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='edg_app') THEN CREATE ROLE edg_app LOGIN NOSUPERUSER NOBYPASSRLS; END IF;
END \$\$;
ALTER ROLE edg_owner PASSWORD '$OWNER_PW';
ALTER ROLE edg_app PASSWORD '$APP_PW';
SQL
for db in edg_dev edg_test; do
  su postgres -c "psql -tAc \"SELECT 1 FROM pg_database WHERE datname='$db'\"" | grep -q 1 || su postgres -c "createdb -O edg_owner $db"
done
cat > .env.local <<ENV
DATABASE_URL=postgres://edg_owner:$OWNER_PW@localhost:5432/edg_dev
TEST_DATABASE_URL=postgres://edg_owner:$OWNER_PW@localhost:5432/edg_test
APP_DATABASE_URL=postgres://edg_app:$APP_PW@localhost:5432/edg_dev
TEST_APP_DATABASE_URL=postgres://edg_app:$APP_PW@localhost:5432/edg_test
EDG_ENV=development
ENV
echo "Local databases ready; connection strings written to .env.local (not committed)."
