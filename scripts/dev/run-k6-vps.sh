#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="${ROOT_DIR:-/opt/it-job/it-job-platform}"
SCENARIO="${1:-smoke}"
TEST_ID="${2:-manual-k6}"
FAIL_FAST="${FAIL_FAST:-true}"
PREPARE_DEMO_DATA="${PREPARE_DEMO_DATA:-false}"
PEAK_VUS="${PEAK_VUS:-}"

log() {
  printf '>>> [%s] %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$*"
}

install_node_seed_dependencies() {
  local services=(
    "identity-service"
    "organization-service"
    "notification-service"
  )

  for svc in "${services[@]}"; do
    if [[ -d "$ROOT_DIR/services/$svc/node_modules" ]]; then
      continue
    fi

    log "installing npm dependencies for ${svc}"
    (
      cd "$ROOT_DIR/services/$svc"
      npm install --no-fund --no-audit
    )
  done
}

prepare_demo_data() {
  if [[ "$PREPARE_DEMO_DATA" != "true" ]]; then
    log "skip demo data bootstrap"
    return
  fi

  log "preparing demo schema and seed data for k6 scenario=$SCENARIO"
  install_node_seed_dependencies

  bash "$ROOT_DIR/scripts/db/seed.sh" identity-service
  bash "$ROOT_DIR/scripts/db/seed.sh" organization-service
  bash "$ROOT_DIR/scripts/db/seed.sh" notification-service
}

cd "$ROOT_DIR"
prepare_demo_data
bash "$ROOT_DIR/scripts/dev/wait-app-stack-vps.sh" --skip-frontend
cd "$ROOT_DIR/infrastructure/load-testing"

if [[ -n "$PEAK_VUS" ]]; then
  log "running k6 scenario=$SCENARIO test_id=$TEST_ID peak_vus=$PEAK_VUS"
else
  log "running k6 scenario=$SCENARIO test_id=$TEST_ID"
fi

SCENARIO="$SCENARIO" \
TEST_ID="$TEST_ID" \
PEAK_VUS="$PEAK_VUS" \
FAIL_FAST="$FAIL_FAST" \
docker compose up --abort-on-container-exit --exit-code-from k6
