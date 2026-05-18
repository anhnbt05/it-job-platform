#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="${ROOT_DIR:-/opt/it-job/it-job-platform}"
BASELINE_TEST_ID="${BASELINE_TEST_ID:-demo-ok-001}"
FAIL_TEST_ID="${FAIL_TEST_ID:-demo-fail-001}"
RECOVER_TEST_ID="${RECOVER_TEST_ID:-demo-recover-001}"
FAIL_FAST="${FAIL_FAST:-true}"

APP_COMPOSE_ARGS=(
  -f "$ROOT_DIR/docker-compose.yml"
  -f "$ROOT_DIR/docker-compose.app.yml"
)

log() {
  printf '>>> [%s] %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$*"
}

wait_http() {
  local url="$1"
  local name="$2"
  local timeout_seconds="${3:-120}"
  local deadline
  deadline=$((SECONDS + timeout_seconds))

  until curl -fsS "$url" >/dev/null 2>&1; do
    if (( SECONDS >= deadline )); then
      echo "Timed out waiting for ${name} at ${url}" >&2
      return 1
    fi

    sleep 3
  done

  log "${name} is responding at ${url}"
}

run_smoke() {
  local test_id="$1"
  local prepare_demo_data="${2:-false}"

  (
    cd "$ROOT_DIR"
    PREPARE_DEMO_DATA="$prepare_demo_data" \
    FAIL_FAST="$FAIL_FAST" \
    bash ./scripts/dev/run-smoke-vps.sh smoke "$test_id"
  )
}

run_expected_failure_smoke() {
  local test_id="$1"
  local prepare_demo_data="${2:-false}"

  set +e
  run_smoke "$test_id" "$prepare_demo_data"
  local exit_code=$?
  set -e

  if [[ $exit_code -eq 0 ]]; then
    echo "Expected smoke failure for test_id=${test_id}, but it passed." >&2
    return 1
  fi

  log "smoke failed as expected for test_id=${test_id} (exit_code=${exit_code})"
}

stop_organization_service() {
  log "stopping organization-service"
  (
    cd "$ROOT_DIR"
    docker compose "${APP_COMPOSE_ARGS[@]}" stop organization-service
  )
}

start_organization_service() {
  log "starting organization-service"
  (
    cd "$ROOT_DIR"
    docker compose "${APP_COMPOSE_ARGS[@]}" start organization-service
  )

  wait_http "http://127.0.0.1:3002/health" "organization-service"
  wait_http "http://127.0.0.1:8000/organization/health" "kong-organization"
}

print_usage() {
  cat <<'EOF'
Usage:
  bash ./scripts/dev/demo-failure-vps.sh baseline
  bash ./scripts/dev/demo-failure-vps.sh inject-failure
  bash ./scripts/dev/demo-failure-vps.sh run-fail
  bash ./scripts/dev/demo-failure-vps.sh recover
  bash ./scripts/dev/demo-failure-vps.sh rerun
  bash ./scripts/dev/demo-failure-vps.sh full

Modes:
  baseline        Run a passing smoke test with demo data bootstrap.
  inject-failure  Stop organization-service.
  run-fail        Run smoke and expect it to fail.
  recover         Start organization-service and wait for health.
  rerun           Run a passing smoke test after recovery.
  full            baseline -> inject-failure -> run-fail -> recover -> rerun.

Environment:
  ROOT_DIR
  BASELINE_TEST_ID
  FAIL_TEST_ID
  RECOVER_TEST_ID
  FAIL_FAST
EOF
}

main() {
  local mode="${1:-full}"

  case "$mode" in
    baseline)
      log "running baseline smoke test"
      run_smoke "$BASELINE_TEST_ID" true
      ;;
    inject-failure)
      stop_organization_service
      ;;
    run-fail)
      log "running smoke test that should fail"
      run_expected_failure_smoke "$FAIL_TEST_ID" false
      ;;
    recover)
      start_organization_service
      ;;
    rerun)
      log "running recovery smoke test"
      run_smoke "$RECOVER_TEST_ID" false
      ;;
    full)
      log "step 1/5: baseline smoke"
      run_smoke "$BASELINE_TEST_ID" true
      log "step 2/5: inject failure"
      stop_organization_service
      log "step 3/5: smoke should fail"
      run_expected_failure_smoke "$FAIL_TEST_ID" false
      log "step 4/5: recover service"
      start_organization_service
      log "step 5/5: smoke should pass again"
      run_smoke "$RECOVER_TEST_ID" false
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
