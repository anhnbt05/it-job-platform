#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="${ROOT_DIR:-/opt/it-job/it-job-platform}"
KAFKA_CONTAINER="${KAFKA_CONTAINER:-kafka}"
KAFKA_BOOTSTRAP_SERVER="${KAFKA_BOOTSTRAP_SERVER:-localhost:9092}"
DASHBOARD_CONTAINER="${DASHBOARD_CONTAINER:-dashboard-service}"
DASHBOARD_HEALTH_URL="${DASHBOARD_HEALTH_URL:-http://127.0.0.1:8084/api/health}"
SOURCE_TOPIC="${SOURCE_TOPIC:-job-created}"
DLQ_TOPIC="${DLQ_TOPIC:-dashboard.dlq}"
WAIT_TIMEOUT_SECONDS="${WAIT_TIMEOUT_SECONDS:-60}"
CONSUMER_TIMEOUT_MS="${CONSUMER_TIMEOUT_MS:-5000}"
CONSUMER_MAX_MESSAGES="${CONSUMER_MAX_MESSAGES:-1000}"

log() {
  printf '>>> [%s] %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$*"
}

usage() {
  cat <<'EOF'
Usage:
  bash ./scripts/dev/demo-dashboard-dlq-vps.sh run
  bash ./scripts/dev/demo-dashboard-dlq-vps.sh verify
  bash ./scripts/dev/demo-dashboard-dlq-vps.sh consume

Modes:
  run      Send one invalid dashboard read-model event, then verify it reaches dashboard.dlq.
  verify   Check dashboard-service logs and consume dashboard.dlq for the event id.
  consume  Print recent messages from dashboard.dlq.

Environment:
  ROOT_DIR
  KAFKA_CONTAINER
  KAFKA_BOOTSTRAP_SERVER
  DASHBOARD_CONTAINER
  DASHBOARD_HEALTH_URL
  SOURCE_TOPIC
  DLQ_TOPIC
  WAIT_TIMEOUT_SECONDS
  CONSUMER_TIMEOUT_MS
  CONSUMER_MAX_MESSAGES
EOF
}

wait_http() {
  local url="$1"
  local name="$2"
  local deadline=$((SECONDS + WAIT_TIMEOUT_SECONDS))

  until curl -fsS "$url" >/dev/null 2>&1; do
    if (( SECONDS >= deadline )); then
      echo "Timed out waiting for ${name} at ${url}" >&2
      return 1
    fi

    sleep 2
  done

  log "${name} is responding at ${url}"
}

ensure_kafka_ready() {
  local deadline=$((SECONDS + WAIT_TIMEOUT_SECONDS))

  until docker exec "$KAFKA_CONTAINER" kafka-topics --bootstrap-server "$KAFKA_BOOTSTRAP_SERVER" --list >/dev/null 2>&1; do
    if (( SECONDS >= deadline )); then
      echo "Timed out waiting for Kafka broker admin readiness." >&2
      return 1
    fi

    sleep 2
  done

  log "kafka broker is ready"
}

ensure_topic() {
  local topic="$1"

  docker exec "$KAFKA_CONTAINER" kafka-topics \
    --bootstrap-server "$KAFKA_BOOTSTRAP_SERVER" \
    --create \
    --if-not-exists \
    --topic "$topic" \
    --partitions 3 \
    --replication-factor 1 >/dev/null

  log "topic ensured: ${topic}"
}

publish_invalid_event() {
  local event_id="$1"
  local payload

  # Missing jobId is intentional. DashboardReadModelConsumer will retry and then publish to DLQ.
  payload="$(printf '{"eventId":"%s","eventType":"JobCreated","jobTitle":"DLQ Demo - Missing jobId","occurredAt":"%s"}' \
    "$event_id" \
    "$(date -u '+%Y-%m-%dT%H:%M:%S')")"

  printf '%s\n' "$payload" | docker exec -i "$KAFKA_CONTAINER" kafka-console-producer \
    --bootstrap-server "$KAFKA_BOOTSTRAP_SERVER" \
    --topic "$SOURCE_TOPIC" >/dev/null

  log "sent invalid event to ${SOURCE_TOPIC}: ${event_id}"
}

wait_for_dlq_log() {
  local deadline=$((SECONDS + WAIT_TIMEOUT_SECONDS))

  until docker logs --since 5m "$DASHBOARD_CONTAINER" 2>&1 | grep -F "Published dashboard read model event from topic ${SOURCE_TOPIC} to DLQ" >/dev/null; do
    if (( SECONDS >= deadline )); then
      echo "Timed out waiting for dashboard-service DLQ publish log." >&2
      docker logs --since 5m "$DASHBOARD_CONTAINER" 2>&1 | grep -E "DLQ|Failed to process dashboard read model event" >&2 || true
      return 1
    fi

    sleep 2
  done

  log "dashboard-service logged DLQ publish"
}

find_dlq_event() {
  local event_id="$1"

  docker exec "$KAFKA_CONTAINER" kafka-console-consumer \
    --bootstrap-server "$KAFKA_BOOTSTRAP_SERVER" \
    --topic "$DLQ_TOPIC" \
    --from-beginning \
    --timeout-ms "$CONSUMER_TIMEOUT_MS" \
    --max-messages "$CONSUMER_MAX_MESSAGES" 2>/dev/null \
    | grep -F "$event_id" \
    | tail -n 1 || true
}

wait_for_dlq_event() {
  local event_id="$1"
  local deadline=$((SECONDS + WAIT_TIMEOUT_SECONDS))
  local match=""

  until [[ -n "$match" ]]; do
    match="$(find_dlq_event "$event_id")"

    if [[ -n "$match" ]]; then
      break
    fi

    if (( SECONDS >= deadline )); then
      echo "Timed out waiting for event ${event_id} in ${DLQ_TOPIC}." >&2
      return 1
    fi

    sleep 2
  done

  log "found event in ${DLQ_TOPIC}:"
  printf '%s\n' "$match"
}

consume_dlq() {
  docker exec "$KAFKA_CONTAINER" kafka-console-consumer \
    --bootstrap-server "$KAFKA_BOOTSTRAP_SERVER" \
    --topic "$DLQ_TOPIC" \
    --from-beginning \
    --timeout-ms "$CONSUMER_TIMEOUT_MS" \
    --max-messages "$CONSUMER_MAX_MESSAGES" 2>/dev/null || true
}

run_demo() {
  local event_id="${EVENT_ID:-demo-dashboard-dlq-$(date +%Y%m%d%H%M%S)}"

  cd "$ROOT_DIR"
  wait_http "$DASHBOARD_HEALTH_URL" "dashboard-service"
  ensure_kafka_ready
  ensure_topic "$SOURCE_TOPIC"
  ensure_topic "$DLQ_TOPIC"
  publish_invalid_event "$event_id"
  wait_for_dlq_event "$event_id"
  wait_for_dlq_log || true

  log "DLQ demo completed"
}

verify_demo() {
  local event_id="${EVENT_ID:-}"

  if [[ -z "$event_id" ]]; then
    echo "EVENT_ID is required for verify mode." >&2
    echo "Example: EVENT_ID=demo-dashboard-dlq-20260526220000 bash ./scripts/dev/demo-dashboard-dlq-vps.sh verify" >&2
    return 2
  fi

  wait_for_dlq_event "$event_id"
  wait_for_dlq_log || true
}

main() {
  local mode="${1:-run}"

  case "$mode" in
    run)
      run_demo
      ;;
    verify)
      verify_demo
      ;;
    consume)
      consume_dlq
      ;;
    help|-h|--help)
      usage
      ;;
    *)
      echo "Unknown mode: $mode" >&2
      usage >&2
      return 2
      ;;
  esac
}

main "$@"
