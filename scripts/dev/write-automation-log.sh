#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="${ROOT_DIR:-/opt/it-job/it-job-platform}"
RUNTIME_LOG_DIR="${RUNTIME_LOG_DIR:-$ROOT_DIR/runtime-logs}"
LOG_FILE="${AUTOMATION_LOG_FILE:-$RUNTIME_LOG_DIR/automation-tests.log}"

json_escape() {
  local value="${1:-}"
  value="${value//\\/\\\\}"
  value="${value//\"/\\\"}"
  value="${value//$'\n'/ }"
  value="${value//$'\r'/ }"
  value="${value//$'\t'/ }"
  printf '%s' "$value"
}

mkdir -p "$RUNTIME_LOG_DIR"

timestamp="$(date -u '+%Y-%m-%dT%H:%M:%SZ')"
status="${AUTOMATION_STATUS:-unknown}"
level="info"

if [[ "$status" != "passed" ]]; then
  level="error"
fi

printf '{"timestamp":"%s","service":"automation-tests","level":"%s","event":"automation_test_result","suite":"%s","kind":"%s","source":"%s","status":"%s","duration_ms":%s,"run_id":"%s","run_url":"%s","repository":"%s","workflow":"%s","scenario":"%s","test_id":"%s","summary":"%s"}\n' \
  "$timestamp" \
  "$level" \
  "$(json_escape "${AUTOMATION_SUITE:-unknown}")" \
  "$(json_escape "${AUTOMATION_KIND:-unknown}")" \
  "$(json_escape "${AUTOMATION_SOURCE:-manual}")" \
  "$(json_escape "$status")" \
  "$(json_escape "${AUTOMATION_DURATION_MS:-0}")" \
  "$(json_escape "${AUTOMATION_RUN_ID:-}")" \
  "$(json_escape "${AUTOMATION_RUN_URL:-}")" \
  "$(json_escape "${AUTOMATION_REPOSITORY:-}")" \
  "$(json_escape "${AUTOMATION_WORKFLOW:-}")" \
  "$(json_escape "${AUTOMATION_SCENARIO:-}")" \
  "$(json_escape "${AUTOMATION_TEST_ID:-}")" \
  "$(json_escape "${AUTOMATION_SUMMARY:-}")" \
  >> "$LOG_FILE"
