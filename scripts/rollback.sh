#!/bin/sh
set -eu
docker image inspect domus-app:rollback >/dev/null 2>&1 || { echo "Rollback image ne postoji."; exit 1; }
APP_IMAGE=domus-app:rollback docker compose -f docker-compose.prod.yml up -d --no-deps app
echo "Prethodna aplikacijska verzija je vraćena. Migracije nisu poništene."
