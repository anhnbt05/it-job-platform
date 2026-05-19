#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TOPICS_FILE="${TOPICS_FILE:-${SCRIPT_DIR}/../topics.txt}"

echo "Waiting for Kafka..."

cub kafka-ready -b kafka:9092 1 40

echo "Creating topics..."

while IFS= read -r topic || [[ -n "$topic" ]]; do
  [[ -z "$topic" ]] && continue
  kafka-topics \
    --bootstrap-server kafka:9092 \
    --create \
    --if-not-exists \
    --topic "$topic" \
    --replication-factor 1 \
    --partitions 3
done < "$TOPICS_FILE"

echo "Topics created!"
