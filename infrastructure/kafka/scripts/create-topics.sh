#!/bin/bash

echo "Waiting for Kafka..."

cub kafka-ready -b kafka:9092 1 40

echo "Creating topics..."

TOPICS=(
  "branch.find-by-id"
  "branch.find-by-id.reply"
  "branch.created"
  "branch.created.reply"
  "company.find-by-name-and-website"
  "company.find-by-name-and-website.reply"
  "company.created"
  "company.created.reply"
  "branch-snapshot.created"
  "company-snapshot.created"
  "category-snapshot.created"
  "notification.create"
  "company-snapshot.updated"
  "branch-snapshot.updated"
  "category-snapshot.updated"
  "category-snapshot.deleted"
  "email.send"
  "job-created"
  "job-status-changed"
  "job-expired"
  "job-expiring-soon"
  "application-created"
  "application-status-changed"
  "job-closed-by-vacancy"
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
