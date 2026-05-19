#!/usr/bin/env bash
# Usage:
#   ./scripts/db/seed.sh                    # migrate/bootstrap + seed all supported services
#   ./scripts/db/seed.sh identity-service
#   ./scripts/db/seed.sh organization-service
#   ./scripts/db/seed.sh notification-service
#   ./scripts/db/seed.sh job-service
#   ./scripts/db/seed.sh application-service

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
SERVICES_DIR="$ROOT_DIR/services"
ROOT_ENV_FILE="$ROOT_DIR/.env"

SEEDABLE_SERVICES=(
  "identity-service"
  "organization-service"
  "notification-service"
  "job-service"
  "application-service"
)

load_root_env() {
  if [[ -f "$ROOT_ENV_FILE" ]]; then
    set -a
    # shellcheck disable=SC1090
    source "$ROOT_ENV_FILE"
    set +a
  fi
}

load_service_env() {
  local svc="$1"
  local service_env_file="$SERVICES_DIR/$svc/.env"

  if [[ -f "$service_env_file" ]]; then
    set -a
    # shellcheck disable=SC1090
    source "$service_env_file"
    set +a
  fi
}

prepare_identity_env() {
  export PORT="${PORT:-${IDENTITY_SERVICE_PORT:-3001}}"
  export DATABASE_URL="${DATABASE_URL:-postgresql://${IDENTITY_POSTGRES_USER:-postgres}:${IDENTITY_POSTGRES_PASSWORD:-postgres}@localhost:${IDENTITY_POSTGRES_PORT:-5432}/${IDENTITY_POSTGRES_DB:-identity_db}?schema=public}"
  export JWT_SECRET="${JWT_SECRET:-it-job-demo-jwt-secret}"
  export JWT_REFRESH_SECRET="${JWT_REFRESH_SECRET:-it-job-demo-jwt-refresh-secret}"
  export JWT_EXPIRATION_TIME="${JWT_EXPIRATION_TIME:-120s}"
  export JWT_REFRESH_EXPIRATION_TIME="${JWT_REFRESH_EXPIRATION_TIME:-7d}"
  export KAFKA_CLIENT_ID="identity-service"
  export KAFKA_GROUP_ID="identity-service-group"
  export KAFKA_BROKERS="localhost:${KAFKA_EXTERNAL_PORT:-29092}"
  export FRONTEND_LOGIN_URL="${FRONTEND_LOGIN_URL:-http://localhost:3000/login}"
  export IMAGEKIT_PUBLIC_KEY="${IMAGEKIT_PUBLIC_KEY:-public_jR+qP0WbyCh9fHVI8mZXPMQe3qE=}"
  export IMAGEKIT_PRIVATE_KEY="${IMAGEKIT_PRIVATE_KEY:-private_tsBf7rGl8sQCgX2WTxbJtRKFMbk=}"
  export IMAGEKIT_FOLDER="${IMAGEKIT_FOLDER:-/captures}"
  export OBSERVABILITY_LOG_FILE="../../runtime-logs/identity-service.log"
}

prepare_organization_env() {
  export PORT="${PORT:-${ORGANIZATION_SERVICE_PORT:-3002}}"
  export DATABASE_URL="${DATABASE_URL:-mysql://${ORGANIZATION_MYSQL_USER:-organization}:${ORGANIZATION_MYSQL_PASSWORD:-organization}@localhost:${ORGANIZATION_MYSQL_PORT:-3306}/${ORGANIZATION_MYSQL_DB:-organization_db}}"
  export JWT_SECRET="${JWT_SECRET:-it-job-demo-jwt-secret}"
  export JWT_REFRESH_SECRET="${JWT_REFRESH_SECRET:-it-job-demo-jwt-refresh-secret}"
  export JWT_EXPIRATION_TIME="${JWT_EXPIRATION_TIME:-120s}"
  export JWT_REFRESH_EXPIRATION_TIME="${JWT_REFRESH_EXPIRATION_TIME:-7d}"
  export KAFKA_CLIENT_ID="organization-service"
  export KAFKA_GROUP_ID="organization-service-group"
  export KAFKA_BROKERS="localhost:${KAFKA_EXTERNAL_PORT:-29092}"
  export OBSERVABILITY_LOG_FILE="../../runtime-logs/organization-service.log"
}

prepare_notification_env() {
  export PORT="${PORT:-${NOTIFICATION_SERVICE_PORT:-3003}}"
  export DATABASE_URL="${DATABASE_URL:-postgresql://${NOTIFICATION_POSTGRES_USER:-postgres}:${NOTIFICATION_POSTGRES_PASSWORD:-postgres}@localhost:${NOTIFICATION_POSTGRES_PORT:-5434}/${NOTIFICATION_POSTGRES_DB:-notification_db}}"
  export JWT_SECRET="${JWT_SECRET:-it-job-demo-jwt-secret}"
  export JWT_REFRESH_SECRET="${JWT_REFRESH_SECRET:-it-job-demo-jwt-refresh-secret}"
  export JWT_EXPIRATION_TIME="${JWT_EXPIRATION_TIME:-120s}"
  export JWT_REFRESH_EXPIRATION_TIME="${JWT_REFRESH_EXPIRATION_TIME:-7d}"
  export KAFKA_CLIENT_ID="notification-service"
  export KAFKA_GROUP_ID="notification-service-group"
  export KAFKA_BROKERS="localhost:${KAFKA_EXTERNAL_PORT:-29092}"
  export MAIL_HOST="${MAIL_HOST:-localhost}"
  export MAIL_PORT="${MAIL_PORT:-1025}"
  export MAIL_SECURE="${MAIL_SECURE:-false}"
  export MAIL_USER="${MAIL_USER:-}"
  export MAIL_PASS="${MAIL_PASS:-}"
  export MAIL_FROM="${MAIL_FROM:-no-reply@itjob.local}"
  export FRONTEND_LOGIN_URL="${FRONTEND_LOGIN_URL:-http://localhost:3000/login}"
  export OBSERVABILITY_LOG_FILE="../../runtime-logs/notification-service.log"
}

prepare_job_env() {
  export DB_HOST="${DB_HOST:-localhost}"
  export DB_PORT="${DB_PORT:-${JOB_POSTGRES_PORT:-5433}}"
  export DB_USERNAME="${DB_USERNAME:-${JOB_POSTGRES_USER:-postgres}}"
  export DB_PASSWORD="${DB_PASSWORD:-${JOB_POSTGRES_PASSWORD:-postgres}}"
  export KAFKA_BOOTSTRAP_SERVERS="localhost:${KAFKA_EXTERNAL_PORT:-29092}"
  export APPLICATION_SERVICE_URL="http://localhost:${APPLICATION_SERVICE_PORT:-8083}/api"
  export OBSERVABILITY_LOG_FILE="../../runtime-logs/job-service.log"
}

prepare_application_env() {
  export MONGO_HOST="${MONGO_HOST:-localhost}"
  export MONGO_PORT="${MONGO_PORT:-${APPLICATION_MONGO_PORT:-27018}}"
  export KAFKA_BOOTSTRAP_SERVERS="localhost:${KAFKA_EXTERNAL_PORT:-29092}"
  export JOB_SERVICE_URL="http://localhost:${JOB_SERVICE_PORT:-8082}/api"
  export OBSERVABILITY_LOG_FILE="../../runtime-logs/application-service.log"
}

run_npm_script() {
  local svc="$1"
  local cmd="$2"
  echo ">>> [$svc] npm run $cmd"
  cd "$SERVICES_DIR/$svc"
  npm run "$cmd"
}

run_maven_seed() {
  local svc="$1"
  local mvn_cmd="mvn"

  if [[ -x "$SERVICES_DIR/$svc/mvnw" ]]; then
    mvn_cmd="./mvnw"
  elif ! command -v mvn >/dev/null 2>&1; then
    echo "ERROR: Maven is required to seed '$svc'. Install Maven or add a Maven wrapper to the service." >&2
    exit 1
  fi

  echo ">>> [$svc] seed via Spring Boot runner"
  cd "$SERVICES_DIR/$svc"
  SPRING_APPLICATION_JSON='{"app":{"seed":true},"spring":{"main":{"web-application-type":"none"},"kafka":{"listener":{"auto-startup":false}},"task":{"scheduling":{"enabled":false}}}}' \
    "$mvn_cmd" -q -DskipTests clean spring-boot:run
}

seed_service() {
  local svc="$1"

  unset PORT DATABASE_URL DB_HOST DB_PORT DB_USERNAME DB_PASSWORD MONGO_HOST MONGO_PORT APPLICATION_SERVICE_URL JOB_SERVICE_URL
  load_service_env "$svc"

  case "$svc" in
    organization-service)
      prepare_organization_env
      run_npm_script "$svc" "migration:run"
      run_npm_script "$svc" "db:seed"
      ;;
    identity-service)
      prepare_identity_env
      run_npm_script "$svc" "prisma:generate"
      run_npm_script "$svc" "prisma:deploy"
      run_npm_script "$svc" "db:seed"
      ;;
    notification-service)
      prepare_notification_env
      run_npm_script "$svc" "migration:run"
      run_npm_script "$svc" "db:seed"
      ;;
    job-service)
      prepare_job_env
      run_maven_seed "$svc"
      ;;
    application-service)
      prepare_application_env
      run_maven_seed "$svc"
      ;;
    *)
      echo "ERROR: '$svc' is not a seedable service or does not exist" >&2
      exit 1
      ;;
  esac
}

load_root_env

if command -v docker >/dev/null 2>&1; then
  bash "$ROOT_DIR/scripts/dev/normalize-db-passwords.sh"
fi

if [[ $# -eq 1 ]]; then
  seed_service "$1"
else
  echo "=== Running migrate + seed for supported services ==="
  seed_service "organization-service"
  seed_service "identity-service"
  seed_service "notification-service"
  seed_service "job-service"
  seed_service "application-service"
  echo "=== Seed done ==="
fi

