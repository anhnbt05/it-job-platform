#!/usr/bin/env sh

set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname "$0")" && pwd)
SCENARIO_NAME="${1:-smoke}"

export SCENARIO="$SCENARIO_NAME"

cleanup() {
  docker compose -f "$SCRIPT_DIR/docker-compose.yml" down >/dev/null 2>&1 || true
}

trap cleanup EXIT

docker compose -f "$SCRIPT_DIR/docker-compose.yml" up --abort-on-container-exit --exit-code-from k6
