#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="${ROOT_DIR:-/opt/it-job/it-job-platform}"
WAIT_TIMEOUT_SECONDS="${WAIT_TIMEOUT_SECONDS:-120}"
CURL_TIMEOUT_SECONDS="${CURL_TIMEOUT_SECONDS:-8}"
START_DATE="${START_DATE:-2026-01-01}"
END_DATE="${END_DATE:-2026-12-31}"

JOB_HEALTH_URL="${JOB_HEALTH_URL:-http://127.0.0.1:8082/api/health}"
DASHBOARD_HEALTH_URL="${DASHBOARD_HEALTH_URL:-http://127.0.0.1:8084/api/health}"
DASHBOARD_SUMMARY_URL="${DASHBOARD_SUMMARY_URL:-http://127.0.0.1:8084/api/dashboard/summary?startDate=${START_DATE}&endDate=${END_DATE}}"

APP_COMPOSE_ARGS=(
  -f "$ROOT_DIR/docker-compose.yml"
  -f "$ROOT_DIR/docker-compose.app.yml"
)

log() {
  printf '>>> [%s] %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$*"
}

fetch_url() {
  local url="$1"
  curl -fsS --max-time "$CURL_TIMEOUT_SECONDS" "$url"
}

wait_http() {
  local url="$1"
  local name="$2"
  local timeout_seconds="${3:-$WAIT_TIMEOUT_SECONDS}"
  local deadline=$((SECONDS + timeout_seconds))

  until fetch_url "$url" >/dev/null 2>&1; do
    if (( SECONDS >= deadline )); then
      echo "Timed out waiting for ${name} at ${url}" >&2
      return 1
    fi

    sleep 3
  done

  log "${name} is responding at ${url}"
}

wait_http_down() {
  local url="$1"
  local name="$2"
  local timeout_seconds="${3:-$WAIT_TIMEOUT_SECONDS}"
  local deadline=$((SECONDS + timeout_seconds))

  until ! fetch_url "$url" >/dev/null 2>&1; do
    if (( SECONDS >= deadline )); then
      echo "Timed out waiting for ${name} to stop responding at ${url}" >&2
      return 1
    fi

    sleep 3
  done

  log "${name} is no longer responding at ${url}"
}

fetch_dashboard_summary() {
  fetch_url "$DASHBOARD_SUMMARY_URL"
}

print_dashboard_summary() {
  local body
  body="$(fetch_dashboard_summary)"
  printf '%s\n' "$body"
}

wait_for_summary_flag() {
  local expected_flag="$1"
  local timeout_seconds="${2:-$WAIT_TIMEOUT_SECONDS}"
  local deadline=$((SECONDS + timeout_seconds))
  local body=""

  until body="$(fetch_dashboard_summary 2>/dev/null)"; do
    if (( SECONDS >= deadline )); then
      echo "Timed out waiting for dashboard summary to respond." >&2
      return 1
    fi

    sleep 3
  done

  until grep -q "\"degraded\":${expected_flag}" <<<"$body"; do
    if (( SECONDS >= deadline )); then
      echo "Timed out waiting for dashboard summary degraded=${expected_flag}." >&2
      printf '%s\n' "$body" >&2
      return 1
    fi

    sleep 3
    body="$(fetch_dashboard_summary)"
  done

  if [[ "$expected_flag" == "true" ]]; then
    log "dashboard summary is now degraded as expected"
  else
    log "dashboard summary is healthy again"
  fi

  printf '%s\n' "$body"
}

stop_job_service() {
  log "stopping job-service"
  (
    cd "$ROOT_DIR"
    docker compose "${APP_COMPOSE_ARGS[@]}" stop job-service
  )

  wait_http_down "$JOB_HEALTH_URL" "job-service"
}

start_job_service() {
  log "starting job-service"
  (
    cd "$ROOT_DIR"
    docker compose "${APP_COMPOSE_ARGS[@]}" up -d job-service
  )

  wait_http "$JOB_HEALTH_URL" "job-service"
}

baseline() {
  log "checking healthy baseline"
  wait_http "$DASHBOARD_HEALTH_URL" "dashboard-service"
  wait_http "$JOB_HEALTH_URL" "job-service"
  wait_for_summary_flag false >/dev/null
  log "baseline is healthy"
}

inject_failure() {
  stop_job_service
}

check_degraded() {
  log "checking graceful degradation state"
  wait_http "$DASHBOARD_HEALTH_URL" "dashboard-service"
  local body
  body="$(wait_for_summary_flag true)"
  printf '%s\n' "$body"
}

recover() {
  start_job_service
}

verify_recovered() {
  log "verifying dashboard recovery"
  wait_http "$DASHBOARD_HEALTH_URL" "dashboard-service"
  local body
  body="$(wait_for_summary_flag false)"
  printf '%s\n' "$body"
}

print_usage() {
  cat <<'EOF'
Usage:
  bash ./scripts/dev/demo-graceful-degradation-vps.sh baseline
  bash ./scripts/dev/demo-graceful-degradation-vps.sh inject-failure
  bash ./scripts/dev/demo-graceful-degradation-vps.sh check-degraded
  bash ./scripts/dev/demo-graceful-degradation-vps.sh recover
  bash ./scripts/dev/demo-graceful-degradation-vps.sh verify-recovered
  bash ./scripts/dev/demo-graceful-degradation-vps.sh print-summary
  bash ./scripts/dev/demo-graceful-degradation-vps.sh full

Modes:
  baseline          Verify dashboard summary is healthy before the demo.
  inject-failure    Stop job-service and wait until its health endpoint is down.
  check-degraded    Verify dashboard summary returns degraded=true.
  recover           Start job-service again and wait for health.
  verify-recovered  Verify dashboard summary returns degraded=false again.
  print-summary     Print the current dashboard summary payload.
  full              baseline -> inject-failure -> check-degraded -> recover -> verify-recovered.

Environment:
  ROOT_DIR
  WAIT_TIMEOUT_SECONDS
  CURL_TIMEOUT_SECONDS
  START_DATE
  END_DATE
  JOB_HEALTH_URL
  DASHBOARD_HEALTH_URL
  DASHBOARD_SUMMARY_URL
EOF
}

main() {
  local mode="${1:-full}"

  case "$mode" in
    baseline)
      baseline
      ;;
    inject-failure)
      inject_failure
      ;;
    check-degraded)
      check_degraded
      ;;
    recover)
      recover
      ;;
    verify-recovered)
      verify_recovered
      ;;
    print-summary)
      print_dashboard_summary
      ;;
    full)
      log "step 1/5: healthy baseline"
      baseline
      log "step 2/5: stop job-service"
      inject_failure
      log "step 3/5: dashboard should degrade gracefully"
      check_degraded
      log "step 4/5: recover job-service"
      recover
      log "step 5/5: dashboard should return to healthy state"
      verify_recovered
      ;;
    help|-h|--help)
      print_usage
      ;;
    *)
      echo "Unknown mode: $mode" >&2
      print_usage
      return 1
      ;;
  esac
}

main "$@"
