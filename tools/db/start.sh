cd "$(dirname "$0")"

docker-compose -p kitchen-manager up -d --remove-orphans
