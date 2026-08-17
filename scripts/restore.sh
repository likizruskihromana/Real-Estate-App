#!/bin/sh
set -eu
if [ "$#" -lt 2 ]; then echo "Upotreba: $0 backup.sql uploads.tar.gz"; exit 1; fi
printf "Restore će prepisati aktivne podatke. Upišite RESTORE za nastavak: "
read answer
[ "$answer" = "RESTORE" ] || exit 1
docker compose -f docker-compose.prod.yml exec -T mysql sh -c 'exec mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE"' < "$1"
docker compose -f docker-compose.prod.yml stop app
docker compose -f docker-compose.prod.yml run --rm --no-deps --user root -v "$(pwd):/restore:ro" app sh -c "find /app/uploads -mindepth 1 -delete && tar -xzf '/restore/$2' -C /app/uploads && chown -R node:node /app/uploads"
docker compose -f docker-compose.prod.yml start app
echo "Restore završen. Provjerite /health i glavne korisničke tokove."
