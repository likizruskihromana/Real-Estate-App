#!/bin/sh
set -eu
mkdir -p backups
stamp="$(date -u +%Y%m%dT%H%M%SZ)"
docker compose -f docker-compose.prod.yml exec -T mysql sh -c 'exec mysqldump -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" --single-transaction --triggers "$MYSQL_DATABASE"' > "backups/domus-$stamp.sql"
docker compose -f docker-compose.prod.yml run --rm --no-deps --user root -v "$(pwd)/backups:/backup" app tar -czf "/backup/uploads-$stamp.tar.gz" -C /app/uploads .
find backups -type f -mtime +14 -delete
echo "Backup završen: $stamp"
