#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="/opt/it-job/it-job-platform"
cd "$ROOT_DIR"

log() {
  printf '>>> [%s] %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$*"
}

log "running migrate + seed"
bash ./scripts/db/seed.sh

log "building application images"
docker compose -f docker-compose.yml -f docker-compose.app.yml build

log "starting application stack"
docker compose -f docker-compose.yml -f docker-compose.app.yml up -d

log "verifying health endpoints"
curl -fsS http://127.0.0.1:3001/health >/dev/null
curl -fsS http://127.0.0.1:3002/health >/dev/null
curl -fsS http://127.0.0.1:3003/health >/dev/null
curl -fsS http://127.0.0.1:8082/api/health >/dev/null
curl -fsS http://127.0.0.1:8083/api/health >/dev/null
curl -fsS http://127.0.0.1:8084/api/health >/dev/null
curl -fsS http://127.0.0.1:8000/identity/health >/dev/null
curl -fsS http://127.0.0.1/ >/dev/null

log "resume completed successfully"
