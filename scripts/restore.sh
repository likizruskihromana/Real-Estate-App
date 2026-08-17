#!/bin/sh
set -eu
if [ "$#" -lt 2 ]; then echo "Upotreba: $0 backup.sql uploads.tar.gz [manifest.sha256]"; exit 1; fi
[ -f "$1" ] && [ -f "$2" ] || { echo "Backup datoteke ne postoje."; exit 1; }
if [ -n "${3:-}" ]; then (cd "$(dirname "$3")" && sha256sum -c "$(basename "$3")"); fi
printf "Restore će prepisati aktivne podatke. Upišite RESTORE za nastavak: "
read answer
[ "$answer" = "RESTORE" ] || exit 1
docker compose -f docker-compose.prod.yml exec -T mysql sh -c 'exec mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE"' < "$1"
docker compose -f docker-compose.prod.yml stop app
docker compose -f docker-compose.prod.yml run --rm --no-deps --user root -v "$(pwd):/restore:ro" app sh -c "find /app/uploads -mindepth 1 -delete && tar -xzf '/restore/$2' -C /app/uploads && chown -R node:node /app/uploads"
docker compose -f docker-compose.prod.yml start app
docker compose -f docker-compose.prod.yml exec -T app node -e "require('http').get('http://localhost:3000/health/ready',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"
echo "Restore završen i readiness provjera je uspješna."
