#!/usr/bin/env bash
# Usage:
#   ./scripts/db/seed.sh                    # seed all services
#   ./scripts/db/seed.sh identity-service
#   ./scripts/db/seed.sh organization-service

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
SERVICES_DIR="$ROOT_DIR/services"

# prisma db seed (chạy qua db:dev = migrate + seed)
PRISMA_SERVICES=("identity-service")

# npm run db:seed
TYPEORM_SERVICES=("organization-service")

run_seed() {
  local svc="$1"
  local cmd="$2"
  echo ">>> [seed] $svc"
  cd "$SERVICES_DIR/$svc"
  npm run "$cmd"
}

seed_service() {
  local svc="$1"

  for s in "${PRISMA_SERVICES[@]}"; do
    [[ "$s" == "$svc" ]] && { run_seed "$svc" "db:dev"; return; }
  done

  for s in "${TYPEORM_SERVICES[@]}"; do
    [[ "$s" == "$svc" ]] && { run_seed "$svc" "db:seed"; return; }
  done

  echo "ERROR: '$svc' is not a seedable service or does not exist" >&2
  exit 1
}

if [[ $# -eq 1 ]]; then
  seed_service "$1"
else
  echo "=== Seeding all services ==="
  for svc in "${PRISMA_SERVICES[@]}"; do
    run_seed "$svc" "db:dev"
  done
  for svc in "${TYPEORM_SERVICES[@]}"; do
    run_seed "$svc" "db:seed"
  done
  echo "=== Seed done ==="
fi
