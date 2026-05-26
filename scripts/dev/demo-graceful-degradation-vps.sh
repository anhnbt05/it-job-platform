#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="${ROOT_DIR:-/opt/it-job/it-job-platform}"
WAIT_TIMEOUT_SECONDS="${WAIT_TIMEOUT_SECONDS:-120}"
CURL_TIMEOUT_SECONDS="${CURL_TIMEOUT_SECONDS:-8}"

JOB_HEALTH_URL="${JOB_HEALTH_URL:-http://127.0.0.1:8082/api/health}"
JOB_LIST_URL="${JOB_LIST_URL:-http://127.0.0.1:8082/api/jobs}"
JOB_SNAPSHOT_STATUS_URL="${JOB_SNAPSHOT_STATUS_URL:-http://127.0.0.1:8082/api/jobs/internal/snapshot-status}"
ORGANIZATION_HEALTH_URL="${ORGANIZATION_HEALTH_URL:-http://127.0.0.1:3002/health}"
KONG_ORGANIZATION_HEALTH_URL="${KONG_ORGANIZATION_HEALTH_URL:-http://127.0.0.1:8000/organization/health}"
DEMO_USER_ID="${DEMO_USER_ID:-55555555-5555-5555-5555-555555555555}"
DEMO_ROLE="${DEMO_ROLE:-candidate}"
PRINT_FULL_JOB_RESPONSE="${PRINT_FULL_JOB_RESPONSE:-0}"

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

fetch_jobs() {
  curl -fsS --max-time "$CURL_TIMEOUT_SECONDS" \
    -H "X-User-Id: $DEMO_USER_ID" \
    -H "X-User-Role: $DEMO_ROLE" \
    "$JOB_LIST_URL"
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

print_snapshot_status() {
  log "job-service local snapshot status"
  fetch_url "$JOB_SNAPSHOT_STATUS_URL"
  printf '\n'
}

assert_job_browsing_works() {
  local body
  body="$(fetch_jobs)"

  if ! grep -q '"success":true' <<<"$body"; then
    echo "Job browsing did not return success=true." >&2
    printf '%s\n' "$body" >&2
    return 1
  fi

  if ! grep -q '"categories":\[' <<<"$body"; then
    echo "Job browsing response does not include category snapshot data." >&2
    printf '%s\n' "$body" >&2
    return 1
  fi

  log "job browsing still works and returns category data"
  if [[ "$PRINT_FULL_JOB_RESPONSE" == "1" ]]; then
    printf '%s\n' "$body"
  else
    printf '%s...\n' "${body:0:1200}"
  fi
}

baseline() {
  log "checking healthy baseline"
  wait_http "$JOB_HEALTH_URL" "job-service"
  wait_http "$ORGANIZATION_HEALTH_URL" "organization-service"
  print_snapshot_status
  assert_job_browsing_works >/dev/null
  log "baseline is healthy"
}

inject_failure() {
  log "stopping organization-service"
  (
    cd "$ROOT_DIR"
    docker compose "${APP_COMPOSE_ARGS[@]}" stop organization-service
  )

  wait_http_down "$ORGANIZATION_HEALTH_URL" "organization-service"
}

check_degraded() {
  log "checking graceful degradation state"
  wait_http "$JOB_HEALTH_URL" "job-service"

  if fetch_url "$ORGANIZATION_HEALTH_URL" >/dev/null 2>&1; then
    echo "organization-service is still responding; failure was not injected." >&2
    return 1
  fi

  print_snapshot_status
  assert_job_browsing_works
  log "graceful degradation verified: organization-service is down, but job browsing is served from local snapshots"
}

recover() {
  log "starting organization-service"
  (
    cd "$ROOT_DIR"
    docker compose "${APP_COMPOSE_ARGS[@]}" up -d organization-service
  )

  wait_http "$ORGANIZATION_HEALTH_URL" "organization-service"
  wait_http "$KONG_ORGANIZATION_HEALTH_URL" "kong-organization"
}

verify_recovered() {
  log "verifying recovered state"
  wait_http "$ORGANIZATION_HEALTH_URL" "organization-service"
  wait_http "$JOB_HEALTH_URL" "job-service"
  assert_job_browsing_works >/dev/null
  log "system recovered"
}

print_usage() {
  cat <<'EOF'
Usage:
  bash ./scripts/dev/demo-graceful-degradation-vps.sh baseline
  bash ./scripts/dev/demo-graceful-degradation-vps.sh inject-failure
  bash ./scripts/dev/demo-graceful-degradation-vps.sh check-degraded
  bash ./scripts/dev/demo-graceful-degradation-vps.sh recover
  bash ./scripts/dev/demo-graceful-degradation-vps.sh verify-recovered
  bash ./scripts/dev/demo-graceful-degradation-vps.sh print-snapshot-status
  bash ./scripts/dev/demo-graceful-degradation-vps.sh print-jobs
  bash ./scripts/dev/demo-graceful-degradation-vps.sh full

Scenario:
  Organization Service is stopped, but Job Service still serves job browsing
  from its own job database and local category snapshots.

Modes:
  baseline               Verify job-service, organization-service, snapshots, and job browsing.
  inject-failure         Stop organization-service and wait until it is down.
  check-degraded         Verify job browsing still works while organization-service is down.
  recover                Start organization-service again and wait for health.
  verify-recovered       Verify organization-service and job browsing after recovery.
  print-snapshot-status  Print local snapshot status from job-service.
  print-jobs             Print current job browsing response.
  full                   baseline -> inject-failure -> check-degraded -> recover -> verify-recovered.

Environment:
  ROOT_DIR
  WAIT_TIMEOUT_SECONDS
  CURL_TIMEOUT_SECONDS
  JOB_HEALTH_URL
  JOB_LIST_URL
  JOB_SNAPSHOT_STATUS_URL
  ORGANIZATION_HEALTH_URL
  KONG_ORGANIZATION_HEALTH_URL
  DEMO_USER_ID
  DEMO_ROLE
  PRINT_FULL_JOB_RESPONSE
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
    print-snapshot-status)
      print_snapshot_status
      ;;
    print-jobs)
      assert_job_browsing_works
      ;;
    full)
      log "step 1/5: healthy baseline"
      baseline
      log "step 2/5: stop organization-service"
      inject_failure
      log "step 3/5: job browsing should degrade gracefully"
      check_degraded
      log "step 4/5: recover organization-service"
      recover
      log "step 5/5: verify recovered state"
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
