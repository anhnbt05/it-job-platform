#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="/opt/it-job/it-job-platform"
ROOT_ENV_FILE="$ROOT_DIR/.env"
FRONTEND_PORT="${FRONTEND_PORT:-3000}"
TCP_WAIT_TIMEOUT_SECONDS="${TCP_WAIT_TIMEOUT_SECONDS:-180}"
HTTP_WAIT_TIMEOUT_SECONDS="${HTTP_WAIT_TIMEOUT_SECONDS:-180}"
KAFKA_WAIT_TIMEOUT_SECONDS="${KAFKA_WAIT_TIMEOUT_SECONDS:-180}"
HEALTHCHECK_CURL_TIMEOUT_SECONDS="${HEALTHCHECK_CURL_TIMEOUT_SECONDS:-5}"
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

print_diagnostics() {
  log "diagnostics: docker compose ps"
  docker compose ps || true

  log "diagnostics: recent service logs"
  docker compose logs --tail 60 \
    identity-service \
    organization-service \
    notification-service \
    job-service \
    application-service \
    dashboard-service \
    frontend \
    kong \
    kafka 2>/dev/null || true
}

on_error() {
  local exit_code=$?
  log "deployment failed with exit code ${exit_code}"
  print_diagnostics
  exit "$exit_code"
}

trap on_error ERR

wait_tcp() {
  local host="$1"
  local port="$2"
  local name="$3"
  local timeout_seconds="${4:-$TCP_WAIT_TIMEOUT_SECONDS}"
  local started_at=$SECONDS

  until bash -c "</dev/tcp/${host}/${port}" >/dev/null 2>&1; do
    if (( SECONDS - started_at >= timeout_seconds )); then
      log "timed out waiting for ${name} on ${host}:${port}"
      return 1
    fi
    sleep 2
  done

  log "${name} is ready on ${host}:${port}"
}

wait_http() {
  local url="$1"
  local name="$2"
  local timeout_seconds="${3:-$HTTP_WAIT_TIMEOUT_SECONDS}"
  local started_at=$SECONDS

  until curl -fsS --max-time "$HEALTHCHECK_CURL_TIMEOUT_SECONDS" "$url" >/dev/null 2>&1; do
    if (( SECONDS - started_at >= timeout_seconds )); then
      log "timed out waiting for ${name} at ${url}"
      return 1
    fi
    sleep 3
  done

  log "${name} is responding at ${url}"
}

wait_kafka() {
  log "waiting for kafka warmup"
  sleep 20
  local started_at=$SECONDS

  until docker compose exec -T kafka kafka-topics --bootstrap-server kafka:9092 --list >/dev/null 2>&1; do
    if (( SECONDS - started_at >= KAFKA_WAIT_TIMEOUT_SECONDS )); then
      log "timed out waiting for kafka broker admin readiness"
      return 1
    fi
    sleep 3
  done

  log "kafka broker is ready for admin operations"
}

normalize_postgres_password() {
  local container="$1"
  local user="$2"
  local password="$3"
  local escaped_password="${password//\'/\'\'}"

  docker exec -i "$container" psql -U postgres -d postgres \
    -c "ALTER USER \"$user\" WITH PASSWORD '$escaped_password';" >/dev/null

  log "normalized postgres password for ${container}/${user}"
}

normalize_database_credentials() {
  normalize_postgres_password "identity-postgres" \
    "${IDENTITY_POSTGRES_USER:-postgres}" \
    "${IDENTITY_POSTGRES_PASSWORD:-postgres}"

  normalize_postgres_password "job-postgres" \
    "${JOB_POSTGRES_USER:-postgres}" \
    "${JOB_POSTGRES_PASSWORD:-postgres}"

  normalize_postgres_password "notification-postgres" \
    "${NOTIFICATION_POSTGRES_USER:-postgres}" \
    "${NOTIFICATION_POSTGRES_PASSWORD:-postgres}"
}

log "stopping any previous stack remnants"
docker compose -f docker-compose.yml -f docker-compose.app.yml down --remove-orphans || true

log "starting infrastructure and observability"
docker compose up -d \
  identity-postgres \
  job-postgres \
  notification-postgres \
  organization-mysql \
  application-mongo \
  redis \
  kafka \
  kafka-ui \
  kong \
  prometheus \
  loki \
  promtail \
  grafana \
  jaeger

wait_tcp 127.0.0.1 "${IDENTITY_POSTGRES_PORT:-5432}" identity-postgres
wait_tcp 127.0.0.1 "${JOB_POSTGRES_PORT:-5433}" job-postgres
wait_tcp 127.0.0.1 "${NOTIFICATION_POSTGRES_PORT:-5434}" notification-postgres
wait_tcp 127.0.0.1 "${ORGANIZATION_MYSQL_PORT:-3306}" organization-mysql
wait_tcp 127.0.0.1 "${APPLICATION_MONGO_PORT:-27018}" application-mongo
wait_tcp 127.0.0.1 "${REDIS_PORT:-6379}" redis
wait_tcp 127.0.0.1 "${KAFKA_EXTERNAL_PORT:-29092}" kafka-external
wait_tcp 127.0.0.1 "${KONG_PROXY_PORT:-8000}" kong

normalize_database_credentials
wait_kafka

log "creating kafka topics"
docker compose rm -f kafka-init || true
docker compose run --rm --no-deps kafka-init

log "installing host dependencies for seedable node services"
for svc in identity-service organization-service notification-service; do
  log "npm install for ${svc}"
  (
    cd "services/${svc}"
    npm install --no-fund --no-audit
  )
done

log "running migrate + seed"
bash ./scripts/db/seed.sh

log "building application images"
docker compose -f docker-compose.yml -f docker-compose.app.yml build

log "starting application stack"
docker compose -f docker-compose.yml -f docker-compose.app.yml up -d

log "verifying health endpoints"
wait_http "http://127.0.0.1:${IDENTITY_SERVICE_PORT:-3001}/health" identity-service
wait_http "http://127.0.0.1:${ORGANIZATION_SERVICE_PORT:-3002}/health" organization-service
wait_http "http://127.0.0.1:${NOTIFICATION_SERVICE_PORT:-3003}/health" notification-service
wait_http "http://127.0.0.1:${JOB_SERVICE_PORT:-8082}/api/health" job-service
wait_http "http://127.0.0.1:${APPLICATION_SERVICE_PORT:-8083}/api/health" application-service
wait_http "http://127.0.0.1:${DASHBOARD_SERVICE_PORT:-8084}/api/health" dashboard-service
wait_http "http://127.0.0.1:${KONG_PROXY_PORT:-8000}/identity/health" kong-identity
wait_http "http://127.0.0.1:${FRONTEND_PORT:-3000}" frontend

log "deployment completed successfully"
