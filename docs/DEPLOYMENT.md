# Domus produkcijski VPS

## Prva objava

1. Usmjerite DNS A/AAAA zapis domene na VPS i otvorite portove 80 i 443.
2. Kopirajte `.env.production.example` u `.env` i zamijenite sve vrijednosti. Ne čuvajte `.env` u repozitoriju.
3. Pokrenite `docker compose -f docker-compose.prod.yml up -d --build`.
4. Aplikacijski kontejner izvršava samo forward migracije prije pokretanja. Caddy automatski preuzima i obnavlja TLS certifikat.
5. Provjerite `https://DOMENA/health`, registraciju, sigurnosni email, upload fotografije i detalj oglasa.

MySQL nije izložen internetu. Baza, fotografije i Caddy certifikati nalaze se u imenovanim Docker volumenima.

## Backup

Pokrenite `sh scripts/backup.sh` dnevno iz cron zadatka. Skripta pravi konzistentan SQL dump i arhivu upload volumena te zadržava 14 dana. Kopiju direktorija `backups` sinhronizujte na odvojenu lokaciju.

Primjer cron zapisa: `15 2 * * * cd /opt/domus && sh scripts/backup.sh >> /var/log/domus-backup.log 2>&1`.

## Restore

Prvo napravite snapshot trenutnog VPS-a. Zatim pokrenite `sh scripts/restore.sh backups/domus-DATUM.sql backups/uploads-DATUM.tar.gz`. Skripta zahtijeva eksplicitnu potvrdu, zaustavlja aplikaciju tokom vraćanja fotografija i ponovo je pokreće.

Restore testirati najmanje jednom mjesečno na odvojenom VPS-u ili izolovanom Docker projektu.
