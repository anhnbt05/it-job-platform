#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="${ROOT_DIR:-/opt/it-job/it-job-platform}"
ROOT_ENV_FILE="$ROOT_DIR/.env"
TAIL_LINES="${TAIL_LINES:-120}"
WAIT_AFTER_START="${WAIT_AFTER_START:-1}"
WAIT_ATTEMPTS="${WAIT_ATTEMPTS:-60}"
WAIT_SLEEP_SECONDS="${WAIT_SLEEP_SECONDS:-2}"

usage() {
  printf '%s\n' \
    "Usage:" \
    "  bash ./scripts/dev/service-vps.sh <action> <service|group> [service...]" \
    "" \
    "Actions:" \
    "  start      Start service(s)" \
    "  stop       Stop service(s)" \
    "  restart    Restart service(s)" \
    "  status     Show compose status" \
    "  logs       Show recent logs" \
    "" \
    "Groups:" \
    "  app, backend, infra, observability, all" \
    "" \
    "Examples:" \
    "  bash ./scripts/dev/service-vps.sh stop job-service" \
    "  bash ./scripts/dev/service-vps.sh start job-service" \
    "  bash ./scripts/dev/service-vps.sh restart notification-service" \
    "  bash ./scripts/dev/service-vps.sh status app" \
    "  bash ./scripts/dev/service-vps.sh logs notification-service"
}

action="${1:-}"
if [[ -z "$action" || "$action" == "-h" || "$action" == "--help" ]]; then
  usage
  exit 0
fi
shift || true

cd "$ROOT_DIR"

if [[ -f "$ROOT_ENV_FILE" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "$ROOT_ENV_FILE"
  set +a
fi

COMPOSE=(docker compose -f docker-compose.yml -f docker-compose.app.yml)

APP_SERVICES=(
  frontend
  identity-service
  organization-service
  notification-service
  job-service
  application-service
  dashboard-service
)

INFRA_SERVICES=(
  identity-postgres
  job-postgres
  notification-postgres
  organization-mysql
  application-mongo
  redis
  kafka
  kafka-ui
  kong
)

OBSERVABILITY_SERVICES=(
  prometheus
  loki
  promtail
  grafana
  jaeger
)

ALL_SERVICES=(
  "${APP_SERVICES[@]}"
  "${INFRA_SERVICES[@]}"
  "${OBSERVABILITY_SERVICES[@]}"
)

log() {
  printf '>>> [%s] %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$*"
}

contains() {
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

append_unique() {
  local target="$1"
  shift
  local -n out_ref="$1"

  if ! contains "$target" "${out_ref[@]}"; then
    out_ref+=("$target")
  fi
}

resolve_targets() {
  local targets=()
  local arg

  for arg in "$@"; do
    case "$arg" in
      app|backend)
        local svc
        for svc in "${APP_SERVICES[@]}"; do
          append_unique "$svc" targets
        done
        ;;
      infra)
        local svc
        for svc in "${INFRA_SERVICES[@]}"; do
          append_unique "$svc" targets
        done
        ;;
      observability)
        local svc
        for svc in "${OBSERVABILITY_SERVICES[@]}"; do
          append_unique "$svc" targets
        done
        ;;
      all)
        local svc
        for svc in "${ALL_SERVICES[@]}"; do
          append_unique "$svc" targets
        done
        ;;
      *)
        if ! contains "$arg" "${ALL_SERVICES[@]}"; then
          printf 'Unknown service or group: %s\n\n' "$arg" >&2
          usage >&2
          exit 2
        fi
        append_unique "$arg" targets
        ;;
    esac
  done

  printf '%s\n' "${targets[@]}"
}

wait_http() {
  local url="$1"
  local name="$2"
  local attempt=1

  while (( attempt <= WAIT_ATTEMPTS )); do
    if curl -fsS "$url" >/dev/null 2>&1; then
      log "${name} is ready at ${url}"
      return 0
    fi

    sleep "$WAIT_SLEEP_SECONDS"
    attempt=$((attempt + 1))
  done

  log "timed out waiting for ${name} at ${url}"
  return 1
}

wait_service() {
  local service="$1"

  case "$service" in
    frontend)
      wait_http "http://127.0.0.1:${FRONTEND_PORT:-3000}" "$service"
      ;;
    identity-service)
      wait_http "http://127.0.0.1:${IDENTITY_SERVICE_PORT:-3001}/health" "$service"
      ;;
    organization-service)
      wait_http "http://127.0.0.1:${ORGANIZATION_SERVICE_PORT:-3002}/health" "$service"
      ;;
    notification-service)
      wait_http "http://127.0.0.1:${NOTIFICATION_SERVICE_PORT:-3003}/health" "$service"
      ;;
    job-service)
      wait_http "http://127.0.0.1:${JOB_SERVICE_PORT:-8082}/api/health" "$service"
      ;;
    application-service)
      wait_http "http://127.0.0.1:${APPLICATION_SERVICE_PORT:-8083}/api/health" "$service"
      ;;
    dashboard-service)
      wait_http "http://127.0.0.1:${DASHBOARD_SERVICE_PORT:-8084}/api/health" "$service"
      ;;
    kong)
      wait_http "http://127.0.0.1:${KONG_PROXY_PORT:-8000}/identity/health" "$service"
      ;;
    prometheus)
      wait_http "http://127.0.0.1:${PROMETHEUS_PORT:-9090}/-/ready" "$service"
      ;;
    grafana)
      wait_http "http://127.0.0.1:${GRAFANA_PORT:-3005}/api/health" "$service"
      ;;
    jaeger)
      wait_http "http://127.0.0.1:${JAEGER_UI_PORT:-16686}" "$service"
      ;;
    kafka-ui)
      wait_http "http://127.0.0.1:${KAFKA_UI_PORT:-8080}" "$service"
      ;;
  esac
}

case "$action" in
  start|stop|restart|status|logs)
    ;;
  *)
    printf 'Unknown action: %s\n\n' "$action" >&2
    usage >&2
    exit 2
    ;;
esac

if [[ "$action" != "status" && "$#" -eq 0 ]]; then
  printf 'Missing service or group.\n\n' >&2
  usage >&2
  exit 2
fi

mapfile -t TARGETS < <(resolve_targets "${@:-all}")

case "$action" in
  start)
    log "starting: ${TARGETS[*]}"
    "${COMPOSE[@]}" up -d "${TARGETS[@]}"
    if [[ "$WAIT_AFTER_START" == "1" ]]; then
      for service in "${TARGETS[@]}"; do
        wait_service "$service"
      done
    fi
    ;;
  stop)
    log "stopping: ${TARGETS[*]}"
    "${COMPOSE[@]}" stop "${TARGETS[@]}"
    ;;
  restart)
    log "restarting: ${TARGETS[*]}"
    "${COMPOSE[@]}" restart "${TARGETS[@]}"
    if [[ "$WAIT_AFTER_START" == "1" ]]; then
      for service in "${TARGETS[@]}"; do
        wait_service "$service"
      done
    fi
    ;;
  status)
    "${COMPOSE[@]}" ps "${TARGETS[@]}"
    ;;
  logs)
    "${COMPOSE[@]}" logs --tail "$TAIL_LINES" "${TARGETS[@]}"
    ;;
esac
