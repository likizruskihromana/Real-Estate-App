#!/bin/sh
set -eu
mkdir -p backups
stamp="$(date -u +%Y%m%dT%H%M%SZ)"
sql="backups/domus-$stamp.sql"
uploads="backups/uploads-$stamp.tar.gz"
config="backups/config-$stamp.tar.gz"
manifest="backups/manifest-$stamp.sha256"
docker compose -f docker-compose.prod.yml exec -T mysql sh -c 'exec mysqldump -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" --single-transaction --triggers --routines "$MYSQL_DATABASE"' > "$sql"
docker compose -f docker-compose.prod.yml run --rm --no-deps --user root -v "$(pwd)/backups:/backup" app tar -czf "/backup/uploads-$stamp.tar.gz" -C /app/uploads .
tar -czf "$config" docker-compose.prod.yml Caddyfile docs/DEPLOYMENT.md docs/VPS-CHECKLIST.md
(cd backups && sha256sum "$(basename "$sql")" "$(basename "$uploads")" "$(basename "$config")") > "$manifest"
find backups -type f -mtime +14 -delete
if [ -n "${RESTIC_REPOSITORY:-}" ]; then
  command -v restic >/dev/null 2>&1 || { echo "RESTIC_REPOSITORY je postavljen, ali restic nije instaliran."; exit 1; }
  restic backup "$sql" "$uploads" "$config" "$manifest" --tag domus-daily
  restic forget --keep-daily 30 --prune
fi
echo "Backup završen: $stamp"
