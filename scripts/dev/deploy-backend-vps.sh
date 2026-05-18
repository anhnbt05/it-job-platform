#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="${ROOT_DIR:-/opt/it-job/it-job-platform}"
RUN_SEED="${RUN_SEED:-0}"
START_OBSERVABILITY="${START_OBSERVABILITY:-1}"
VERIFY_FRONTEND="${VERIFY_FRONTEND:-1}"
FRONTEND_PORT="${FRONTEND_PORT:-3000}"
ROOT_ENV_FILE="$ROOT_DIR/.env"
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

install_seed_dependencies() {
  for svc in identity-service organization-service notification-service; do
    log "npm install for ${svc}"
    (
      cd "services/${svc}"
      npm install --no-fund --no-audit
    )
  done
}

log "starting infrastructure"
docker compose up -d \
  identity-postgres \
  job-postgres \
  notification-postgres \
  organization-mysql \
  application-mongo \
  redis \
  kafka \
  kafka-ui \
  kong

if [[ "$START_OBSERVABILITY" == "1" ]]; then
  log "starting observability"
  docker compose up -d prometheus loki promtail grafana jaeger
fi

wait_tcp 127.0.0.1 "${IDENTITY_POSTGRES_PORT:-5432}" identity-postgres
wait_tcp 127.0.0.1 "${JOB_POSTGRES_PORT:-5433}" job-postgres
wait_tcp 127.0.0.1 "${NOTIFICATION_POSTGRES_PORT:-5434}" notification-postgres
wait_tcp 127.0.0.1 "${ORGANIZATION_MYSQL_PORT:-3306}" organization-mysql
wait_tcp 127.0.0.1 "${APPLICATION_MONGO_PORT:-27018}" application-mongo
wait_tcp 127.0.0.1 "${REDIS_PORT:-6379}" redis
wait_tcp 127.0.0.1 "${KAFKA_EXTERNAL_PORT:-29092}" kafka-external
wait_tcp 127.0.0.1 "${KONG_PROXY_PORT:-8000}" kong-proxy
wait_tcp 127.0.0.1 "${KONG_ADMIN_PORT:-8001}" kong-admin

bash ./scripts/dev/normalize-db-passwords.sh
wait_kafka

log "creating kafka topics"
docker compose rm -f kafka-init >/dev/null 2>&1 || true
docker compose run --rm --no-deps kafka-init

if [[ "$RUN_SEED" == "1" ]]; then
  log "installing host dependencies for seed"
  install_seed_dependencies

  log "running migrate + seed"
  bash ./scripts/db/seed.sh
fi

log "building backend application images"
docker compose -f docker-compose.yml -f docker-compose.app.yml build \
  identity-service \
  organization-service \
  notification-service \
  job-service \
  application-service \
  dashboard-service

log "starting backend application stack"
docker compose -f docker-compose.yml -f docker-compose.app.yml up -d \
  identity-service \
  organization-service \
  notification-service \
  job-service \
  application-service \
  dashboard-service \
  frontend

wait_http "http://127.0.0.1:${IDENTITY_SERVICE_PORT:-3001}/health" identity-service
wait_http "http://127.0.0.1:${ORGANIZATION_SERVICE_PORT:-3002}/health" organization-service
wait_http "http://127.0.0.1:${NOTIFICATION_SERVICE_PORT:-3003}/health" notification-service
wait_http "http://127.0.0.1:${JOB_SERVICE_PORT:-8082}/api/health" job-service
wait_http "http://127.0.0.1:${APPLICATION_SERVICE_PORT:-8083}/api/health" application-service
wait_http "http://127.0.0.1:${DASHBOARD_SERVICE_PORT:-8084}/api/health" dashboard-service
wait_http "http://127.0.0.1:${KONG_PROXY_PORT:-8000}/identity/health" kong-identity

if [[ "$VERIFY_FRONTEND" == "1" ]]; then
  wait_http "http://127.0.0.1:${FRONTEND_PORT}" frontend
fi

log "backend deployment completed"
