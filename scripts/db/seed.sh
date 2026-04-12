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

SEEDABLE_SERVICES=(
  "identity-service"
  "organization-service"
  "notification-service"
  "job-service"
  "application-service"
)

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
    "$mvn_cmd" -q -DskipTests spring-boot:run
}

seed_service() {
  local svc="$1"

  case "$svc" in
    organization-service)
      run_npm_script "$svc" "migration:run"
      run_npm_script "$svc" "db:seed"
      ;;
    identity-service)
      run_npm_script "$svc" "prisma:deploy"
      run_npm_script "$svc" "db:seed"
      ;;
    notification-service)
      run_npm_script "$svc" "migration:run"
      run_npm_script "$svc" "db:seed"
      ;;
    job-service|application-service)
      run_maven_seed "$svc"
      ;;
    *)
      echo "ERROR: '$svc' is not a seedable service or does not exist" >&2
      exit 1
      ;;
  esac
}

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

