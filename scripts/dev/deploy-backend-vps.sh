#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="${ROOT_DIR:-/opt/it-job/it-job-platform}"
RUN_SEED="${RUN_SEED:-0}"
START_OBSERVABILITY="${START_OBSERVABILITY:-1}"
VERIFY_FRONTEND="${VERIFY_FRONTEND:-1}"
DEPLOY_FRONTEND="${DEPLOY_FRONTEND:-0}"
FRONTEND_PORT="${FRONTEND_PORT:-3000}"
PREVIOUS_DEPLOY_SHA="${PREVIOUS_DEPLOY_SHA:-}"
CURRENT_DEPLOY_SHA="${CURRENT_DEPLOY_SHA:-}"
ROOT_ENV_FILE="$ROOT_DIR/.env"
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

bash ./scripts/dev/sync-service-env-files.sh >/dev/null

log() {
  printf '>>> [%s] %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$*"
}

BACKEND_SERVICES=(
  identity-service
  organization-service
  notification-service
  job-service
  application-service
  dashboard-service
)
MIGRATABLE_SERVICES=(
  identity-service
  organization-service
  notification-service
)
CHANGED_BUILD_SERVICES=()

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

service_in_list() {
  local target="$1"
  shift

  local item
  for item in "$@"; do
    if [[ "$item" == "$target" ]]; then
      return 0
    fi
  done

  return 1
}

append_unique_service() {
  local target="$1"
  if ! service_in_list "$target" "${CHANGED_BUILD_SERVICES[@]}"; then
    CHANGED_BUILD_SERVICES+=("$target")
  fi
}

detect_changed_backend_build_services() {
  CHANGED_BUILD_SERVICES=()

  if [[ -z "$PREVIOUS_DEPLOY_SHA" || -z "$CURRENT_DEPLOY_SHA" ]]; then
    log "missing deploy SHAs, falling back to full backend build"
    CHANGED_BUILD_SERVICES=("${BACKEND_SERVICES[@]}")
    return
  fi

  if ! git rev-parse --verify "${PREVIOUS_DEPLOY_SHA}^{commit}" >/dev/null 2>&1; then
    log "previous deploy SHA is unavailable locally, falling back to full backend build"
    CHANGED_BUILD_SERVICES=("${BACKEND_SERVICES[@]}")
    return
  fi

  if ! git rev-parse --verify "${CURRENT_DEPLOY_SHA}^{commit}" >/dev/null 2>&1; then
    log "current deploy SHA is unavailable locally, falling back to full backend build"
    CHANGED_BUILD_SERVICES=("${BACKEND_SERVICES[@]}")
    return
  fi

  local changed_files=()
  mapfile -t changed_files < <(git diff --name-only "$PREVIOUS_DEPLOY_SHA" "$CURRENT_DEPLOY_SHA")

  if (( ${#changed_files[@]} == 0 )); then
    log "no file changes detected between ${PREVIOUS_DEPLOY_SHA} and ${CURRENT_DEPLOY_SHA}"
    return
  fi

  log "detected ${#changed_files[@]} changed files between ${PREVIOUS_DEPLOY_SHA} and ${CURRENT_DEPLOY_SHA}"

  local path
  for path in "${changed_files[@]}"; do
    case "$path" in
      docker-compose.app.yml)
        log "docker-compose.app.yml changed, falling back to full backend build"
        CHANGED_BUILD_SERVICES=("${BACKEND_SERVICES[@]}")
        return
        ;;
      services/identity-service/*)
        append_unique_service identity-service
        ;;
      services/organization-service/*)
        append_unique_service organization-service
        ;;
      services/notification-service/*)
        append_unique_service notification-service
        ;;
      services/job-service/*)
        append_unique_service job-service
        ;;
      services/application-service/*)
        append_unique_service application-service
        ;;
      services/dashboard-service/*)
        append_unique_service dashboard-service
        ;;
    esac
  done
}

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

ensure_kafka_topics() {
  if [[ ! -f "$KAFKA_TOPICS_FILE" ]]; then
    log "kafka topics file not found at $KAFKA_TOPICS_FILE"
    return 1
  fi

  local existing_topics=()
  mapfile -t existing_topics < <(docker compose exec -T kafka kafka-topics --bootstrap-server kafka:9092 --list)

  local missing_topics=()
  local topic
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

install_seed_dependencies() {
  for svc in identity-service organization-service notification-service; do
    log "npm install for ${svc}"
    (
      cd "services/${svc}"
      npm install --no-fund --no-audit
    )
  done
}

install_service_dependencies() {
  local svc="$1"
  log "npm install for ${svc}"
  (
    cd "services/${svc}"
    npm install --no-fund --no-audit
  )
}

run_service_migration() {
  local svc="$1"
  log "running migrations for ${svc}"

  (
    cd "services/${svc}"
    case "$svc" in
      identity-service)
        npm run prisma:generate
        npm run prisma:deploy
        ;;
      organization-service|notification-service)
        npm run migration:run
        ;;
      *)
        log "no migration handler configured for ${svc}"
        ;;
    esac
  )
}

run_changed_service_migrations() {
  local migratable_changed=()
  local svc

  for svc in "${CHANGED_BUILD_SERVICES[@]}"; do
    if service_in_list "$svc" "${MIGRATABLE_SERVICES[@]}"; then
      migratable_changed+=("$svc")
    fi
  done

  if (( ${#migratable_changed[@]} == 0 )); then
    log "no migratable backend service changes detected"
    return
  fi

  for svc in "${migratable_changed[@]}"; do
    install_service_dependencies "$svc"
    run_service_migration "$svc"
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

detect_changed_backend_build_services

declare -A existing_topic_lookup=()
ensure_kafka_topics

if [[ "$RUN_SEED" == "1" ]]; then
  log "installing host dependencies for seed"
  install_seed_dependencies

  log "running migrate + seed"
  bash ./scripts/db/seed.sh
else
  run_changed_service_migrations
fi

if (( ${#CHANGED_BUILD_SERVICES[@]} > 0 )); then
  log "building changed backend services: ${CHANGED_BUILD_SERVICES[*]}"
  docker compose -f docker-compose.yml -f docker-compose.app.yml build "${CHANGED_BUILD_SERVICES[@]}"
else
  log "skipping backend image build because no backend service files changed"
fi

log "starting backend application stack"
APP_UP_SERVICES=(
  identity-service
  organization-service
  notification-service
  job-service
  application-service
  dashboard-service
)

if [[ "$DEPLOY_FRONTEND" == "1" ]]; then
  APP_UP_SERVICES+=(frontend)
fi

docker compose -f docker-compose.yml -f docker-compose.app.yml up -d --force-recreate \
  "${APP_UP_SERVICES[@]}"

wait_http "http://127.0.0.1:${IDENTITY_SERVICE_PORT:-3001}/health" identity-service
wait_http "http://127.0.0.1:${ORGANIZATION_SERVICE_PORT:-3002}/health" organization-service
wait_http "http://127.0.0.1:${NOTIFICATION_SERVICE_PORT:-3003}/health" notification-service
wait_http "http://127.0.0.1:${JOB_SERVICE_PORT:-8082}/api/health" job-service
wait_http "http://127.0.0.1:${APPLICATION_SERVICE_PORT:-8083}/api/health" application-service
wait_http "http://127.0.0.1:${DASHBOARD_SERVICE_PORT:-8084}/api/health" dashboard-service
wait_http "http://127.0.0.1:${KONG_PROXY_PORT:-8000}/identity/health" kong-identity

if [[ "$DEPLOY_FRONTEND" == "1" && "$VERIFY_FRONTEND" == "1" ]]; then
  wait_http "http://127.0.0.1:${FRONTEND_PORT}" frontend
fi

log "backend deployment completed"
