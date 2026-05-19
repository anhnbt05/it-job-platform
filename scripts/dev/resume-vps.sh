#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="/opt/it-job/it-job-platform"
ROOT_ENV_FILE="$ROOT_DIR/.env"
cd "$ROOT_DIR"

if [[ -f "$ROOT_ENV_FILE" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "$ROOT_ENV_FILE"
  set +a
fi

log() {
  printf '>>> [%s] %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$*"
}

log "running migrate + seed"
bash ./scripts/db/seed.sh

log "pulling application images"
docker compose -f docker-compose.yml -f docker-compose.app.yml pull

log "starting application stack"
docker compose -f docker-compose.yml -f docker-compose.app.yml up -d --force-recreate

log "verifying health endpoints"
curl -fsS "http://127.0.0.1:${IDENTITY_SERVICE_PORT:-3001}/health" >/dev/null
curl -fsS "http://127.0.0.1:${ORGANIZATION_SERVICE_PORT:-3002}/health" >/dev/null
curl -fsS "http://127.0.0.1:${NOTIFICATION_SERVICE_PORT:-3003}/health" >/dev/null
curl -fsS "http://127.0.0.1:${JOB_SERVICE_PORT:-8082}/api/health" >/dev/null
curl -fsS "http://127.0.0.1:${APPLICATION_SERVICE_PORT:-8083}/api/health" >/dev/null
curl -fsS "http://127.0.0.1:${DASHBOARD_SERVICE_PORT:-8084}/api/health" >/dev/null
curl -fsS "http://127.0.0.1:${KONG_PROXY_PORT:-8000}/identity/health" >/dev/null
curl -fsS "http://127.0.0.1:${FRONTEND_PORT:-3000}" >/dev/null

log "resume completed successfully"
