#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="/opt/it-job/it-job-platform"
ROOT_ENV_FILE="$ROOT_DIR/.env"
FRONTEND_PORT="${FRONTEND_PORT:-3000}"
KAFKA_TOPICS_FILE="$ROOT_DIR/infrastructure/kafka/topics.txt"
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

wait_kafka_topic_leaders() {
  if [[ ! -f "$KAFKA_TOPICS_FILE" ]]; then
    log "kafka topics file not found at $KAFKA_TOPICS_FILE"
    return 1
  fi

  local topics=()
  local topic
  while IFS= read -r topic || [[ -n "$topic" ]]; do
    [[ -z "$topic" ]] && continue
    topics+=("$topic")
  done < "$KAFKA_TOPICS_FILE"

  if (( ${#topics[@]} == 0 )); then
    log "no kafka topics configured for leader readiness check"
    return 0
  fi

  log "waiting for kafka topic leaders"
  local started_at=$SECONDS

  while true; do
    local not_ready=()
    local describe_output

    for topic in "${topics[@]}"; do
      describe_output="$(docker compose exec -T kafka kafka-topics --bootstrap-server kafka:9092 --describe --topic "$topic" 2>/dev/null || true)"
      if [[ -z "$describe_output" ]] || grep -Eiq 'Leader:[[:space:]]*(-1|none)' <<<"$describe_output"; then
        not_ready+=("$topic")
      fi
    done

    if (( ${#not_ready[@]} == 0 )); then
      log "all kafka topic leaders are ready"
      return 0
    fi

    if (( SECONDS - started_at >= KAFKA_WAIT_TIMEOUT_SECONDS )); then
      log "timed out waiting for kafka topic leaders: ${not_ready[*]}"
      return 1
    fi

    sleep 3
  done
}

ensure_kafka_topics() {
  if [[ ! -f "$KAFKA_TOPICS_FILE" ]]; then
    log "kafka topics file not found at $KAFKA_TOPICS_FILE"
    return 1
  fi

  local existing_topics=()
  mapfile -t existing_topics < <(docker compose exec -T kafka kafka-topics --bootstrap-server kafka:9092 --list)

  local topic
  local missing_topics=()
  declare -A existing_topic_lookup=()

  for topic in "${existing_topics[@]}"; do
    existing_topic_lookup["$topic"]=1
  done

  while IFS= read -r topic || [[ -n "$topic" ]]; do
    [[ -z "$topic" ]] && continue
    if [[ -z "${existing_topic_lookup[$topic]:-}" ]]; then
      missing_topics+=("$topic")
    fi
  done < "$KAFKA_TOPICS_FILE"

  if (( ${#missing_topics[@]} == 0 )); then
    log "all kafka topics already exist"
    return
  fi

  log "creating missing kafka topics: ${missing_topics[*]}"

  for topic in "${missing_topics[@]}"; do
    docker compose exec -T kafka kafka-topics \
      --bootstrap-server kafka:9092 \
      --create \
      --if-not-exists \
      --topic "$topic" \
      --replication-factor 1 \
      --partitions 3 >/dev/null
  done

  log "kafka topics ensured"
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

bash ./scripts/dev/normalize-db-passwords.sh
wait_kafka

ensure_kafka_topics
wait_kafka_topic_leaders

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

log "pulling application images"
docker compose -f docker-compose.yml -f docker-compose.app.yml pull

log "starting application stack"
docker compose -f docker-compose.yml -f docker-compose.app.yml up -d --force-recreate

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
