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
  local network_name
  local client_image

  network_name="$(docker inspect -f '{{range $name, $_ := .NetworkSettings.Networks}}{{println $name}}{{end}}' "$container" | head -n 1 | tr -d '[:space:]')"
  client_image="$(docker inspect -f '{{.Config.Image}}' "$container" | tr -d '[:space:]')"

  if [[ -z "$network_name" ]]; then
    log "could not resolve network for ${container}"
    return 1
  fi

  if [[ -z "$client_image" ]]; then
    log "could not resolve image for ${container}"
    return 1
  fi

  docker run --rm \
    --network "$network_name" \
    -e PGPASSWORD="$password" \
    "$client_image" \
    psql -h "$container" -U "$user" -d "$database" -Atqc 'select 1' >/dev/null

  log "verified postgres password from peer container for ${container}/${user}"
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
