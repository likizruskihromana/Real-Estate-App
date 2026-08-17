# Domus VPS readiness

- Ubuntu LTS sa automatskim sigurnosnim nadogradnjama i korisnikom bez direktnog root logina.
- SSH pristup samo ključem; firewall dozvoljava SSH, 80 i 443.
- DNS A/AAAA pokazuje na VPS, a domena je dostupna prije pokretanja Caddyja.
- Docker Engine i Compose plugin su instalirani; MySQL port nije javno izložen.
- Produkcijski `.env` sadrži jedinstvene database/session tajne, SMTP, Sentry i backup postavke.
- Off-site S3-kompatibilni bucket ima zaseban minimalno privilegovan ključ i lifecycle pravilo.
- Vanjski uptime monitor provjerava `/health` svake minute; interni deploy koristi `/health/ready`.
- Dnevni cron pokreće `scripts/backup.sh`; mjesečni posao radi restore u izolovanom Compose projektu.
- Sentry release token ima samo ovlaštenja potrebna za upload source mapova i nije dostupan runtime kontejneru.
- Docker daemon koristi rotaciju logova, a host upozorava prije 80% popunjenosti diska i pri ponovljenom backup neuspjehu.
- Beta admin odobrava samo 5–10 početnih vlasnika/agencija i provjerava limit aktivnih oglasa prije poziva.
- Prije beta poziva potvrditi TLS, SMTP, CSRF, upload, SSE, Sentry, backup, restore i rollback.
