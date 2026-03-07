#!/bin/bash

echo "Waiting for Kafka..."

cub kafka-ready -b kafka:9092 1 40

echo "Creating topics..."

kafka-topics \
  --bootstrap-server kafka:9092 \
  --create \
  --if-not-exists \
  --topic user-created \
  --replication-factor 1 \
  --partitions 3

kafka-topics \
  --bootstrap-server kafka:9092 \
  --create \
  --if-not-exists \
  --topic job-created \
  --replication-factor 1 \
  --partitions 3

echo "Topics created!"