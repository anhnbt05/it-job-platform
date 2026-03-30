#!/usr/bin/env bash
# Reset DB: revert migrations then re-run + seed
# Usage:
#   ./scripts/db/reset.sh                   # reset all services
#   ./scripts/db/reset.sh identity-service

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
SERVICES_DIR="$ROOT_DIR/services"

PRISMA_SERVICES=("identity-service")
TYPEORM_SERVICES=("organization-service" "notification-service")

confirm() {
  read -r -p "This will RESET the database for '$1'. Continue? [y/N] " ans
  [[ "$ans" =~ ^[Yy]$ ]] || { echo "Aborted."; exit 0; }
}

reset_prisma() {
  local svc="$1"
  echo ">>> [prisma] reset: $svc"
  cd "$SERVICES_DIR/$svc"
  npm run db:reset
}

reset_typeorm() {
  local svc="$1"
  echo ">>> [typeorm] revert migration: $svc"
  cd "$SERVICES_DIR/$svc"
  npm run migration:revert
}

reset_service() {
  local svc="$1"
  confirm "$svc"

  for s in "${PRISMA_SERVICES[@]}"; do
    [[ "$s" == "$svc" ]] && { reset_prisma "$svc"; return; }
  done

  for s in "${TYPEORM_SERVICES[@]}"; do
    [[ "$s" == "$svc" ]] && { reset_typeorm "$svc"; return; }
  done

  echo "ERROR: Unknown service '$svc'" >&2
  exit 1
}

if [[ $# -eq 1 ]]; then
  reset_service "$1"
else
  echo "=== Resetting ALL service databases ==="
  read -r -p "This will RESET ALL databases. Are you sure? [y/N] " ans
  [[ "$ans" =~ ^[Yy]$ ]] || { echo "Aborted."; exit 0; }

  for svc in "${PRISMA_SERVICES[@]}"; do
    reset_prisma "$svc"
  done
  for svc in "${TYPEORM_SERVICES[@]}"; do
    reset_typeorm "$svc"
  done
  echo "=== Reset done ==="
fi
