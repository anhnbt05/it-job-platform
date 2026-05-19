#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="${ROOT_DIR:-/opt/it-job/it-job-platform}"
ROOT_ENV_FILE="$ROOT_DIR/.env"

cd "$ROOT_DIR"

if [[ -f "$ROOT_ENV_FILE" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "$ROOT_ENV_FILE"
  set +a
fi

mkdir -p \
  services/identity-service \
  services/notification-service \
  services/organization-service \
  services/job-service \
  services/application-service \
  services/dashboard-service

cat > services/identity-service/.env <<EOF
PORT=${IDENTITY_SERVICE_PORT:-3001}
DATABASE_URL=postgresql://${IDENTITY_POSTGRES_USER:-postgres}:${IDENTITY_POSTGRES_PASSWORD:-postgres}@localhost:${IDENTITY_POSTGRES_PORT:-5432}/${IDENTITY_POSTGRES_DB:-identity_db}?schema=public
JWT_SECRET=${JWT_SECRET:-it-job-demo-jwt-secret}
JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET:-it-job-demo-jwt-refresh-secret}
JWT_EXPIRATION_TIME=${JWT_EXPIRATION_TIME:-120s}
JWT_REFRESH_EXPIRATION_TIME=${JWT_REFRESH_EXPIRATION_TIME:-7d}
IMAGEKIT_PUBLIC_KEY=${IMAGEKIT_PUBLIC_KEY:-public_jR+qP0WbyCh9fHVI8mZXPMQe3qE=}
IMAGEKIT_PRIVATE_KEY=${IMAGEKIT_PRIVATE_KEY:-private_tsBf7rGl8sQCgX2WTxbJtRKFMbk=}
IMAGEKIT_FOLDER=${IMAGEKIT_FOLDER:-/captures}
IMAGEKIT_URL_ENDPOINT=${IMAGEKIT_URL_ENDPOINT:-}
KAFKA_CLIENT_ID=identity-service
KAFKA_GROUP_ID=identity-service-group
KAFKA_BROKERS=localhost:${KAFKA_EXTERNAL_PORT:-29092}
FRONTEND_LOGIN_URL=${FRONTEND_LOGIN_URL:-http://localhost:3000/login}
OBSERVABILITY_LOG_FILE=../../runtime-logs/identity-service.log
EOF

cat > services/notification-service/.env <<EOF
PORT=${NOTIFICATION_SERVICE_PORT:-3003}
DATABASE_URL=postgresql://${NOTIFICATION_POSTGRES_USER:-postgres}:${NOTIFICATION_POSTGRES_PASSWORD:-postgres}@localhost:${NOTIFICATION_POSTGRES_PORT:-5434}/${NOTIFICATION_POSTGRES_DB:-notification_db}
GRAPHILE_WORKER_DATABASE_URL=${NOTIFICATION_GRAPHILE_WORKER_DATABASE_URL:-postgresql://${NOTIFICATION_POSTGRES_USER:-postgres}:${NOTIFICATION_POSTGRES_PASSWORD:-postgres}@localhost:${NOTIFICATION_POSTGRES_PORT:-5434}/${NOTIFICATION_POSTGRES_DB:-notification_db}}
GRAPHILE_WORKER_SCHEMA=${NOTIFICATION_GRAPHILE_WORKER_SCHEMA:-graphile_worker}
DB_POOL_MAX=${NOTIFICATION_DB_POOL_MAX:-10}
DB_POOL_IDLE_TIMEOUT_MS=${NOTIFICATION_DB_POOL_IDLE_TIMEOUT_MS:-30000}
DB_POOL_CONNECTION_TIMEOUT_MS=${NOTIFICATION_DB_POOL_CONNECTION_TIMEOUT_MS:-5000}
KAFKA_CLIENT_ID=notification-service
KAFKA_GROUP_ID=notification-service-group
KAFKA_BROKERS=localhost:${KAFKA_EXTERNAL_PORT:-29092}
MAIL_HOST=${MAIL_HOST:-localhost}
MAIL_PORT=${MAIL_PORT:-1025}
MAIL_SECURE=${MAIL_SECURE:-false}
MAIL_USER=${MAIL_USER:-}
MAIL_PASS=${MAIL_PASS:-}
MAIL_FROM=${MAIL_FROM:-no-reply@itjob.local}
JWT_SECRET=${JWT_SECRET:-it-job-demo-jwt-secret}
JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET:-it-job-demo-jwt-refresh-secret}
JWT_EXPIRATION_TIME=${JWT_EXPIRATION_TIME:-120s}
JWT_REFRESH_EXPIRATION_TIME=${JWT_REFRESH_EXPIRATION_TIME:-7d}
FRONTEND_LOGIN_URL=${FRONTEND_LOGIN_URL:-http://localhost:3000/login}
OBSERVABILITY_LOG_FILE=../../runtime-logs/notification-service.log
EOF

cat > services/organization-service/.env <<EOF
PORT=${ORGANIZATION_SERVICE_PORT:-3002}
DATABASE_URL=mysql://${ORGANIZATION_MYSQL_USER:-organization}:${ORGANIZATION_MYSQL_PASSWORD:-organization}@localhost:${ORGANIZATION_MYSQL_PORT:-3306}/${ORGANIZATION_MYSQL_DB:-organization_db}
KAFKA_CLIENT_ID=organization-service
KAFKA_GROUP_ID=organization-service-group
KAFKA_BROKERS=localhost:${KAFKA_EXTERNAL_PORT:-29092}
JWT_SECRET=${JWT_SECRET:-it-job-demo-jwt-secret}
JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET:-it-job-demo-jwt-refresh-secret}
JWT_EXPIRATION_TIME=${JWT_EXPIRATION_TIME:-120s}
JWT_REFRESH_EXPIRATION_TIME=${JWT_REFRESH_EXPIRATION_TIME:-7d}
OBSERVABILITY_LOG_FILE=../../runtime-logs/organization-service.log
EOF

cat > services/job-service/.env <<EOF
DB_HOST=localhost
DB_PORT=${JOB_POSTGRES_PORT:-5433}
DB_USERNAME=${JOB_POSTGRES_USER:-postgres}
DB_PASSWORD=${JOB_POSTGRES_PASSWORD:-postgres}
KAFKA_BOOTSTRAP_SERVERS=localhost:${KAFKA_EXTERNAL_PORT:-29092}
OBSERVABILITY_LOG_FILE=../../runtime-logs/job-service.log
APPLICATION_SERVICE_URL=http://localhost:8083/api
ORGANIZATION_SERVICE_URL=http://localhost:3002
EOF

cat > services/application-service/.env <<EOF
MONGO_HOST=localhost
MONGO_PORT=${APPLICATION_MONGO_PORT:-27018}
KAFKA_BOOTSTRAP_SERVERS=localhost:${KAFKA_EXTERNAL_PORT:-29092}
OBSERVABILITY_LOG_FILE=../../runtime-logs/application-service.log
JOB_SERVICE_URL=http://localhost:8082/api
EOF

cat > services/dashboard-service/.env <<EOF
OBSERVABILITY_LOG_FILE=../../runtime-logs/dashboard-service.log
JOB_SERVICE_URL=http://localhost:8082/api
APPLICATION_SERVICE_URL=http://localhost:8083/api
EOF

printf 'synced service .env files from root .env\n'
