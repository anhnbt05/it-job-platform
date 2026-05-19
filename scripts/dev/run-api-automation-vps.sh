#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="${ROOT_DIR:-/opt/it-job/it-job-platform}"
PREPARE_DEMO_DATA="${PREPARE_DEMO_DATA:-false}"
API_AUTOMATION_DEMO_EMAIL="${API_AUTOMATION_CANDIDATE_EMAIL:-candidate@example.com}"
API_AUTOMATION_DEMO_PASSWORD="${API_AUTOMATION_CANDIDATE_PASSWORD:-candidate123}"

log() {
  printf '>>> [%s] %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$*"
}

extract_access_token() {
  node -e "let body=''; process.stdin.on('data', chunk => body += chunk); process.stdin.on('end', () => { try { const parsed = JSON.parse(body); if (typeof parsed.accessToken === 'string' && parsed.accessToken.length > 0) { process.stdout.write(parsed.accessToken); return; } } catch {} process.exit(1); });"
}

prepare_demo_data() {
  if [[ "$PREPARE_DEMO_DATA" != "true" ]]; then
    log "skip demo data bootstrap"
    return
  fi

  log "preparing demo schema and seed data for API automation"
  bash "$ROOT_DIR/scripts/db/seed.sh"
}

cd "$ROOT_DIR"
prepare_demo_data
bash "$ROOT_DIR/scripts/dev/wait-app-stack-vps.sh" --skip-frontend

log "waiting for authenticated identity flow"
auth_attempt=1
while (( auth_attempt <= 30 )); do
  sign_in_response="$(curl -sS -X POST "http://127.0.0.1:${KONG_PROXY_PORT:-8000}/identity/auth/sign-in" \
    -H "Content-Type: application/json" \
    -H "Accept: application/json" \
    --data "{\"email\":\"${API_AUTOMATION_DEMO_EMAIL}\",\"password\":\"${API_AUTOMATION_DEMO_PASSWORD}\"}")"

  access_token="$(printf '%s' "$sign_in_response" | extract_access_token || true)"

  if [[ -n "$access_token" ]] && curl -fsS "http://127.0.0.1:${KONG_PROXY_PORT:-8000}/identity/users/me" \
    -H "Accept: application/json" \
    -H "Authorization: Bearer ${access_token}" >/dev/null 2>&1; then
    log "authenticated identity flow is ready"
    break
  fi

  if (( auth_attempt == 30 )); then
    log "timed out waiting for authenticated identity flow"
    exit 1
  fi

  sleep 2
  auth_attempt=$((auth_attempt + 1))
done

log "running API automation tests"
node --test ./tests/api/*.test.mjs
