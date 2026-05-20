#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="${ROOT_DIR:-/opt/it-job/it-job-platform}"
SCENARIO="${1:-smoke}"
TEST_ID="${2:-manual-performance}"
PROMETHEUS_URL="${PROMETHEUS_URL:-http://127.0.0.1:9090}"

default_timeout_seconds=120
case "$SCENARIO" in
  smoke)
    default_timeout_seconds=120
    ;;
  spike)
    default_timeout_seconds=180
    ;;
  stress)
    default_timeout_seconds=240
    ;;
esac

TIMEOUT_SECONDS="${3:-$default_timeout_seconds}"

log() {
  printf '>>> [%s] %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$*"
}

query_has_result() {
  local promql="$1"
  local response

  response="$(
    curl -fsSG "${PROMETHEUS_URL}/api/v1/query" \
      --data-urlencode "query=${promql}" \
      2>/dev/null || true
  )"

  grep -q '"result":\[{' <<<"$response"
}

wait_for_query_result() {
  local name="$1"
  local promql="$2"
  local started_at=$SECONDS

  until query_has_result "$promql"; do
    if (( SECONDS - started_at >= TIMEOUT_SECONDS )); then
      log "timed out waiting for ${name} metrics for test_id=${TEST_ID}, scenario=${SCENARIO}"
      return 1
    fi

    sleep 3
  done

  log "${name} metrics are visible for test_id=${TEST_ID}, scenario=${SCENARIO}"
}

cd "$ROOT_DIR"

wait_for_query_result \
  "k6_vus" \
  "max(max_over_time(k6_vus{testid=\"${TEST_ID}\",suite=\"${SCENARIO}\"}[30m]))"

wait_for_query_result \
  "k6_http_req_duration_p95" \
  "max(max_over_time(k6_http_req_duration_p95{testid=\"${TEST_ID}\",suite=\"${SCENARIO}\"}[30m]))"

wait_for_query_result \
  "k6_http_reqs_total" \
  "sum(increase(k6_http_reqs_total{testid=\"${TEST_ID}\",suite=\"${SCENARIO}\"}[30m]))"

wait_for_query_result \
  "k6 request series by service" \
  "count(count by (service) (k6_http_reqs_total{testid=\"${TEST_ID}\",suite=\"${SCENARIO}\"}))"

wait_for_query_result \
  "k6 p95 series by service" \
  "count(count by (service) (k6_http_req_duration_p95{testid=\"${TEST_ID}\",suite=\"${SCENARIO}\"}))"

log "k6 metrics and service-level series are ready in Prometheus"
