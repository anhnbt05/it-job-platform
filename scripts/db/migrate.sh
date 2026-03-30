#!/usr/bin/env bash
# Usage:
#   ./scripts/db/migrate.sh                 # migrate all services
#   ./scripts/db/migrate.sh identity-service

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
SERVICES_DIR="$ROOT_DIR/services"

# Prisma services
PRISMA_SERVICES=("identity-service")

# TypeORM services
TYPEORM_SERVICES=("organization-service" "notification-service")

run_prisma_migrate() {
  local svc="$1"
  echo ">>> [prisma] migrate: $svc"
  cd "$SERVICES_DIR/$svc"
  npm run prisma:migrate
}

run_typeorm_migrate() {
  local svc="$1"
  echo ">>> [typeorm] migrate: $svc"
  cd "$SERVICES_DIR/$svc"
  npm run migration:run
}

migrate_service() {
  local svc="$1"

  for s in "${PRISMA_SERVICES[@]}"; do
    [[ "$s" == "$svc" ]] && { run_prisma_migrate "$svc"; return; }
  done

  for s in "${TYPEORM_SERVICES[@]}"; do
    [[ "$s" == "$svc" ]] && { run_typeorm_migrate "$svc"; return; }
  done

  echo "ERROR: Unknown service '$svc'" >&2
  exit 1
}

if [[ $# -eq 1 ]]; then
  migrate_service "$1"
else
  echo "=== Running migrations for all services ==="
  for svc in "${PRISMA_SERVICES[@]}"; do
    run_prisma_migrate "$svc"
  done
  for svc in "${TYPEORM_SERVICES[@]}"; do
    run_typeorm_migrate "$svc"
  done
  echo "=== All migrations done ==="
fi
