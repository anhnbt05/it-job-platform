#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="${ROOT_DIR:-/opt/it-job/it-job-platform}"
RUN_SEED="${RUN_SEED:-0}"
START_OBSERVABILITY="${START_OBSERVABILITY:-1}"
VERIFY_FRONTEND="${VERIFY_FRONTEND:-1}"
FRONTEND_PORT="${FRONTEND_PORT:-3000}"

cd "$ROOT_DIR"

log() {
  printf '>>> [%s] %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$*"
}

wait_tcp() {
  local host="$1"
  local port="$2"
  local name="$3"

  until bash -c "</dev/tcp/${host}/${port}" >/dev/null 2>&1; do
    sleep 2
  done

  log "${name} is ready on ${host}:${port}"
}

wait_http() {
  local url="$1"
  local name="$2"

  until curl -fsS "$url" >/dev/null 2>&1; do
    sleep 3
  done

  log "${name} is responding at ${url}"
}

wait_kafka() {
  log "waiting for kafka warmup"
  sleep 20

  until docker compose exec -T kafka kafka-topics --bootstrap-server kafka:9092 --list >/dev/null 2>&1; do
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

wait_tcp 127.0.0.1 5432 identity-postgres
wait_tcp 127.0.0.1 5433 job-postgres
wait_tcp 127.0.0.1 5434 notification-postgres
wait_tcp 127.0.0.1 3306 organization-mysql
wait_tcp 127.0.0.1 27018 application-mongo
wait_tcp 127.0.0.1 6379 redis
wait_tcp 127.0.0.1 29092 kafka-external
wait_http http://127.0.0.1:8000 kong

wait_kafka

log "creating kafka topics"
docker compose rm -f kafka-init >/dev/null 2>&1 || true
docker compose up kafka-init

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

wait_http http://127.0.0.1:3001/health identity-service
wait_http http://127.0.0.1:3002/health organization-service
wait_http http://127.0.0.1:3003/health notification-service
wait_http http://127.0.0.1:8082/api/health job-service
wait_http http://127.0.0.1:8083/api/health application-service
wait_http http://127.0.0.1:8084/api/health dashboard-service
wait_http http://127.0.0.1:8000/identity/health kong-identity

if [[ "$VERIFY_FRONTEND" == "1" ]]; then
  wait_http "http://127.0.0.1:${FRONTEND_PORT}" frontend
fi

log "backend deployment completed"
