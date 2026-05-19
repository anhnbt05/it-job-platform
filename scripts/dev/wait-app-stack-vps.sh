#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="${ROOT_DIR:-/opt/it-job/it-job-platform}"
ROOT_ENV_FILE="${ROOT_DIR}/.env"
WAIT_ATTEMPTS="${WAIT_ATTEMPTS:-60}"
WAIT_SLEEP_SECONDS="${WAIT_SLEEP_SECONDS:-2}"
SKIP_FRONTEND=false

if [[ "${1:-}" == "--skip-frontend" ]]; then
  SKIP_FRONTEND=true
fi

if [[ -f "$ROOT_ENV_FILE" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "$ROOT_ENV_FILE"
  set +a
fi

log() {
  printf '>>> [%s] %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$*"
}

wait_http() {
  local url="$1"
  local name="$2"
  local attempt=1

  while (( attempt <= WAIT_ATTEMPTS )); do
    if curl -fsS "$url" >/dev/null 2>&1; then
      log "${name} is ready at ${url}"
      return 0
    fi

    sleep "$WAIT_SLEEP_SECONDS"
    attempt=$((attempt + 1))
  done

  log "timed out waiting for ${name} at ${url}"
  return 1
}

cd "$ROOT_DIR"

log "waiting for application stack readiness"
wait_http "http://127.0.0.1:${IDENTITY_SERVICE_PORT:-3001}/health" "identity-service"
wait_http "http://127.0.0.1:${ORGANIZATION_SERVICE_PORT:-3002}/health" "organization-service"
wait_http "http://127.0.0.1:${NOTIFICATION_SERVICE_PORT:-3003}/health" "notification-service"
wait_http "http://127.0.0.1:${JOB_SERVICE_PORT:-8082}/api/health" "job-service"
wait_http "http://127.0.0.1:${APPLICATION_SERVICE_PORT:-8083}/api/health" "application-service"
wait_http "http://127.0.0.1:${DASHBOARD_SERVICE_PORT:-8084}/api/health" "dashboard-service"
wait_http "http://127.0.0.1:${KONG_PROXY_PORT:-8000}/identity/health" "kong-identity"

if [[ "$SKIP_FRONTEND" != "true" ]]; then
  wait_http "http://127.0.0.1:${FRONTEND_PORT:-3000}" "frontend"
fi

log "application stack is ready"
