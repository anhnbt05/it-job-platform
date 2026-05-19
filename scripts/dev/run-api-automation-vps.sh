#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="${ROOT_DIR:-/opt/it-job/it-job-platform}"
PREPARE_DEMO_DATA="${PREPARE_DEMO_DATA:-false}"

log() {
  printf '>>> [%s] %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$*"
}

prepare_demo_data() {
  if [[ "$PREPARE_DEMO_DATA" != "true" ]]; then
    log "skip demo data bootstrap"
    return
  fi

  log "preparing demo schema and seed data for API automation"
  bash "$ROOT_DIR/scripts/db/seed.sh"
}

cd "$ROOT_DIR"
prepare_demo_data

log "running API automation tests"
node --test ./tests/api/*.test.mjs
