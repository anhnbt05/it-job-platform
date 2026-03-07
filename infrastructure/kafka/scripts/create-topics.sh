#!/bin/bash

echo "Waiting for Kafka..."

cub kafka-ready -b kafka:9092 1 40

echo "Creating topics..."

TOPICS=(
  "branch.find-by-id"
  "branch.created"
  "company.find-by-name-and-website"
  "company.created"
  "branch-snapshot.created"
  "company-snapshot.created"
)

for topic in "${TOPICS[@]}"
do
  kafka-topics \
    --bootstrap-server kafka:9092 \
    --create \
    --if-not-exists \
    --topic "$topic" \
    --replication-factor 1 \
    --partitions 3
done

echo "Topics created!"