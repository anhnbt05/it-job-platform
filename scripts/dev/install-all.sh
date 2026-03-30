#!/usr/bin/env bash
# Install npm dependencies for all services
# Usage: ./scripts/dev/install-all.sh

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
SERVICES_DIR="$ROOT_DIR/services"

echo "=== Installing dependencies for all services ==="

for svc_dir in "$SERVICES_DIR"/*/; do
  svc=$(basename "$svc_dir")
  if [[ -f "$svc_dir/package.json" ]]; then
    echo ">>> npm install: $svc"
    cd "$svc_dir"
    npm install
  else
    echo "--- skip (no package.json): $svc"
  fi
done

echo "=== Install done ==="
