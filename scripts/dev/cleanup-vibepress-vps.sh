#!/usr/bin/env bash
set -euo pipefail

log() {
  printf '>>> [%s] %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$*"
}

log "before cleanup"
docker ps -a --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}' | (grep -E '^NAMES|vibepress' || true)
docker system df || true

log "remove vibepress containers"
container_ids="$(docker ps -aq --filter name=vibepress || true)"
if [[ -n "$container_ids" ]]; then
  docker rm -f $container_ids
else
  echo "No vibepress containers found"
fi

log "remove vibepress images"
image_ids="$(docker images --format '{{.Repository}} {{.ID}}' | awk '$1 ~ /^vibepress/ {print $2}' | sort -u)"
if [[ -n "$image_ids" ]]; then
  docker rmi -f $image_ids || true
else
  echo "No vibepress images found"
fi

log "remove vibepress networks"
network_names="$(docker network ls --format '{{.Name}}' | awk '/^vibepress/ {print $1}')"
if [[ -n "$network_names" ]]; then
  echo "$network_names" | xargs -r docker network rm || true
else
  echo "No vibepress networks found"
fi

log "remove vibepress volumes"
volume_names="$(docker volume ls --format '{{.Name}}' | awk '/^vibepress/ {print $1}')"
if [[ -n "$volume_names" ]]; then
  echo "$volume_names" | xargs -r docker volume rm -f || true
else
  echo "No vibepress volumes found"
fi

log "after cleanup"
docker ps -a --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}' | (grep -E '^NAMES|it-job|vibepress' || true)
docker system df || true
df -h /
