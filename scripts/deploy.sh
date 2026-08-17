#!/bin/sh
set -eu
release="${1:-$(date -u +%Y%m%dT%H%M%SZ)}"
export APP_RELEASE="$release"
current="$(docker compose -f docker-compose.prod.yml images -q app 2>/dev/null | head -n 1 || true)"
[ -z "$current" ] || docker tag "$current" domus-app:rollback
sh scripts/backup.sh
docker compose -f docker-compose.prod.yml build app
docker compose -f docker-compose.prod.yml run --rm app npm run migrate
docker compose -f docker-compose.prod.yml up -d --no-deps app
attempt=0
until docker compose -f docker-compose.prod.yml exec -T app node -e "require('http').get('http://localhost:3000/health/ready',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"; do
  attempt=$((attempt+1)); [ "$attempt" -lt 12 ] || { echo "Deploy nije prošao readiness. Pokrenite scripts/rollback.sh."; exit 1; }; sleep 5
done
docker compose -f docker-compose.prod.yml up -d caddy
echo "Deploy $release je aktivan."
