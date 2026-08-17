# Domus produkcijski VPS

## Prva objava

1. Usmjerite DNS A/AAAA zapis domene na VPS i otvorite portove 80 i 443.
2. Kopirajte `.env.production.example` u `.env` i zamijenite sve vrijednosti. Ne čuvajte `.env` u repozitoriju.
3. Prvu objavu pokrenite sa `sh scripts/deploy.sh domus-2.2.0`; naredne objave koriste novi nepromjenjivi release tag.
4. Aplikacijski kontejner izvršava samo forward migracije prije pokretanja. Caddy automatski preuzima i obnavlja TLS certifikat.
5. Provjerite `https://DOMENA/health`, registraciju, sigurnosni email, upload fotografije i detalj oglasa.

MySQL nije izložen internetu. Baza, fotografije i Caddy certifikati nalaze se u imenovanim Docker volumenima.

## Backup

Pokrenite `sh scripts/backup.sh` dnevno iz cron zadatka. Skripta pravi konzistentan SQL dump, arhivu upload volumena, kopiju netajne produkcijske konfiguracije i manifest sa SHA-256 provjerama. `.env` i tajne se namjerno ne arhiviraju. Lokalno zadržava 14 kopija. Kada su postavljeni `RESTIC_REPOSITORY`, `RESTIC_PASSWORD` i S3 pristupni podaci, istu kopiju šifrirano šalje na off-site storage i primjenjuje retention od 30 dnevnih kopija.

Primjer cron zapisa: `15 2 * * * cd /opt/domus && sh scripts/backup.sh >> /var/log/domus-backup.log 2>&1`.

## Restore

Prvo napravite snapshot trenutnog VPS-a. Zatim pokrenite `sh scripts/restore.sh backups/domus-DATUM.sql backups/uploads-DATUM.tar.gz`. Skripta zahtijeva eksplicitnu potvrdu, zaustavlja aplikaciju tokom vraćanja fotografija i ponovo je pokreće.

Restore testirati najmanje jednom mjesečno na odvojenom VPS-u ili izolovanom Docker projektu.

## Deploy i rollback

`scripts/deploy.sh` redom pravi backup, gradi image, izvršava forward migracije, mijenja aplikacijski kontejner i čeka `/health/ready`. Prethodni image ostaje označen kao `domus-app:rollback`.

Ako readiness ili smoke provjera ne prođe, pokrenite `sh scripts/rollback.sh`. Rollback vraća prethodnu aplikaciju, ali ne poništava migracije; zbog toga svaka migracija mora ostati kompatibilna s prethodnim izdanjem najmanje jedan release period.

## Monitoring

- Vanjski uptime servis provjerava `/health` svakih 60 sekundi i šalje email za pad i oporavak.
- Sentry DSN radi u runtimeu. Build varijable `SENTRY_AUTH_TOKEN`, `SENTRY_ORG` i `SENTRY_PROJECT` privatno šalju source mapove; plugin ih nakon slanja briše iz javnog builda.
- Docker JSON logovi imaju rotaciju. Host mora imati zasebna upozorenja za disk, memoriju i neuspješan dnevni backup.
- PostHog se uključuje tek nakon korisničkog consent izbora; session recording je isključen.

## Mjesečna restore proba

U izolovanom Compose projektu vratite posljednji manifest, pokrenite `/health/ready`, uporedite broj korisnika/oglasa i checksum uzorka fotografija te potvrdite prijavu testnog naloga. Rezultat i vrijeme probe evidentirajte izvan produkcijskog servera.
