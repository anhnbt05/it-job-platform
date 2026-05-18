#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="${ROOT_DIR:-/opt/it-job/it-job-platform}"
ROOT_ENV_FILE="$ROOT_DIR/.env"
RESET_KAFKA="${RESET_KAFKA:-1}"
RESET_REDIS="${RESET_REDIS:-0}"
RESET_OBSERVABILITY="${RESET_OBSERVABILITY:-0}"
START_OBSERVABILITY="${START_OBSERVABILITY:-1}"
VERIFY_FRONTEND="${VERIFY_FRONTEND:-1}"

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

remove_volume_if_exists() {
  local volume_name="$1"

  if docker volume inspect "$volume_name" >/dev/null 2>&1; then
    log "removing volume ${volume_name}"
    docker volume rm -f "$volume_name" >/dev/null
  else
    log "volume ${volume_name} does not exist, skip"
  fi
}

project_name="${COMPOSE_PROJECT_NAME:-$(basename "$ROOT_DIR")}"

volumes_to_remove=(
  "${project_name}_identity_postgres_data"
  "${project_name}_job_postgres_data"
  "${project_name}_notification_postgres_data"
  "${project_name}_organization_mysql_data"
  "${project_name}_application_mongo_data"
)

if [[ "$RESET_KAFKA" == "1" ]]; then
  volumes_to_remove+=("${project_name}_kafka_data")
fi

if [[ "$RESET_REDIS" == "1" ]]; then
  volumes_to_remove+=("${project_name}_redis_data")
fi

if [[ "$RESET_OBSERVABILITY" == "1" ]]; then
  volumes_to_remove+=("${project_name}_loki_data")
fi

log "stopping current stack"
docker compose -f docker-compose.yml -f docker-compose.app.yml down --remove-orphans || true

for volume_name in "${volumes_to_remove[@]}"; do
  remove_volume_if_exists "$volume_name"
done

log "running clean deploy from scratch"
RUN_SEED=1 \
START_OBSERVABILITY="$START_OBSERVABILITY" \
VERIFY_FRONTEND="$VERIFY_FRONTEND" \
bash ./scripts/dev/deploy-vps.sh

log "reset demo completed"
