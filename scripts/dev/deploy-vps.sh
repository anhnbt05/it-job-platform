#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="/opt/it-job/it-job-platform"
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

wait_kafka() {
  log "waiting for kafka warmup"
  sleep 20

  until docker compose exec -T kafka kafka-topics --bootstrap-server kafka:9092 --list >/dev/null 2>&1; do
    sleep 3
  done

  log "kafka broker is ready for admin operations"
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

wait_tcp 127.0.0.1 5432 identity-postgres
wait_tcp 127.0.0.1 5433 job-postgres
wait_tcp 127.0.0.1 5434 notification-postgres
wait_tcp 127.0.0.1 3306 organization-mysql
wait_tcp 127.0.0.1 27018 application-mongo
wait_tcp 127.0.0.1 6379 redis
wait_tcp 127.0.0.1 29092 kafka-external
wait_tcp 127.0.0.1 8000 kong

wait_kafka

log "creating kafka topics"
docker compose rm -f kafka-init || true
docker compose up kafka-init

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
curl -fsS http://127.0.0.1:3001/health >/dev/null
curl -fsS http://127.0.0.1:3002/health >/dev/null
curl -fsS http://127.0.0.1:3003/health >/dev/null
curl -fsS http://127.0.0.1:8082/api/health >/dev/null
curl -fsS http://127.0.0.1:8083/api/health >/dev/null
curl -fsS http://127.0.0.1:8084/api/health >/dev/null
curl -fsS http://127.0.0.1:8000/identity/health >/dev/null
curl -fsS http://127.0.0.1/ >/dev/null

log "deployment completed successfully"
