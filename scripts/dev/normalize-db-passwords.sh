#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
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

wait_postgres_ready() {
  local container="$1"
  local user="$2"
  local timeout_seconds="${3:-120}"
  local started_at=$SECONDS

  until docker exec "$container" pg_isready -h 127.0.0.1 -U "$user" -d postgres >/dev/null 2>&1; do
    if (( SECONDS - started_at >= timeout_seconds )); then
      log "timed out waiting for postgres readiness in ${container}"
      return 1
    fi
    sleep 2
  done

  log "postgres is ready in ${container}"
}

verify_postgres_password() {
  local container="$1"
  local user="$2"
  local password="$3"
  local database="${4:-postgres}"
  local container_ip

  container_ip="$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' "$container")"
  if [[ -z "$container_ip" ]]; then
    log "could not resolve container IP for ${container}"
    return 1
  fi

  docker exec -e PGPASSWORD="$password" "$container" \
    sh -lc "psql -h \"$container_ip\" -U \"$user\" -d \"$database\" -Atqc 'select 1'" >/dev/null

  log "verified postgres password over bridge network for ${container}/${user}"
}

normalize_postgres_password() {
  local container="$1"
  local user="$2"
  local password="$3"

  wait_postgres_ready "$container" "$user"

  docker exec -i "$container" psql -h 127.0.0.1 -U "$user" -d postgres \
    -v db_user="$user" \
    -v db_password="$password" >/dev/null <<'SQL'
SELECT format('ALTER USER %I WITH PASSWORD %L', :'db_user', :'db_password') \gexec
SQL

  log "normalized postgres password for ${container}/${user}"
  verify_postgres_password "$container" "$user" "$password"
}

normalize_postgres_password \
  "identity-postgres" \
  "${IDENTITY_POSTGRES_USER:-postgres}" \
  "${IDENTITY_POSTGRES_PASSWORD:-postgres}"

normalize_postgres_password \
  "job-postgres" \
  "${JOB_POSTGRES_USER:-postgres}" \
  "${JOB_POSTGRES_PASSWORD:-postgres}"

normalize_postgres_password \
  "notification-postgres" \
  "${NOTIFICATION_POSTGRES_USER:-postgres}" \
  "${NOTIFICATION_POSTGRES_PASSWORD:-postgres}"
