# 🏠 Aplikacija za Nekretnine

Full-stack web aplikacija za upravljanje nekretninama.

## 🚀 Pokretanje

### Lokalno (bez Dockera)
```bash
# Instaliraj dependencies
npm install

# Pokreni server
npm start

# Development mod sa auto-restartom
npm run dev

# React razvojni server (API se prosljeđuje na port 3000)
npm run client:dev

# Produkcijski React build
npm run build

# Kreiraj ili ažuriraj šemu kontrolisanim migracijama
npm run migrate

# Ako MySQL radi kroz Docker i DB_HOST je "mysql"
npm run migrate:docker

# Poništi posljednju migraciju (destruktivno; prvo napraviti backup)
npm run migrate:undo
```

Server pri pokretanju ne kreira niti resetuje poslovnu šemu baze. Za novu bazu
prvo pokrenite `npm run migrate`, a zatim po želji `npm run seed`. Seeder će se
zaustaviti ako podaci već postoje.

Naziv hosta `mysql` postoji samo unutar Compose mreže. Za komandu pokrenutu iz
lokalnog PowerShella koristite `DB_HOST=localhost`; kada je baza u Dockeru,
najjednostavnije je koristiti `npm run migrate:docker`.

### Sa Dockerom
```bash
# Build i pokreni
docker-compose up --build

# U pozadini
docker-compose up -d

# Zaustavi
docker-compose down

# Zaustavi i obriši volumes
docker-compose down -v
```

## 📦 Tech Stack

- **Backend**: Node.js, Express, Sequelize
- **Database**: MySQL
- **Frontend**: React, TypeScript, Vite, React Router, TanStack Query
- **DevOps**: Docker, Docker Compose

Za lokalni razvoj potreban je Node.js 22 ili noviji podržani LTS runtime.

## 📁 Struktura Projekta

```
├── client/     # React frontend; legacy HTML ostaje privremeno radi rollbacka
├── server/     # Backend (Express, Sequelize, MySQL)
└── uploads/    # Trajne fotografije nekretnina (sadržaj se ne commit u Git)
```

## 🔐 Default Credentials

- **Admin (samo razvojni seed)**: username: `admin`, password: `admin`
- **User (samo razvojni seed)**: username: `user`, password: `user`

## 📝 Environment Variables

Kopiraj `.env.example` u `.env` i podesi varijable.

`.env` se ne smije commitovati. U produkciji obavezno postavite dugačak,
nasumičan `SESSION_SECRET` i zasebnog MySQL korisnika bez root privilegija.

Sesije se čuvaju u MySQL tabeli `sessions`. Razvojni režim je može kreirati
automatski; produkcijska baza treba sadržavati tu tabelu prije pokretanja.

## 🛠️ API Endpoints

React aplikacija koristi standardizirani `/api/v2` odgovor oblika `{ data, meta? }`.
Legacy API ostaje dostupan tokom prijelaznog perioda.

- `POST /api/auth/login` - Prijava
- `POST /api/auth/logout` - Odjava
- `GET /api/nekretnine` - Sve nekretnine
- `GET /api/nekretnine/:id` - Detalji nekretnine
- `POST /api/nekretnine/:id/slike` - Upload fotografije (vlasnik/admin)
- `PATCH /api/nekretnine/:id/slike/:slikaId/glavna` - Postavi glavnu fotografiju
- `DELETE /api/nekretnine/:id/slike/:slikaId` - Obriši fotografiju
- `GET /api/sacuvano` - Omiljene nekretnine i sačuvane pretrage
- `POST|DELETE /api/sacuvano/omiljene/:id` - Dodaj ili ukloni omiljenu nekretninu
- `POST /api/sacuvano/pretrage` - Sačuvaj aktivne filtere pretrage
- `DELETE /api/sacuvano/pretrage/:id` - Obriši sačuvanu pretragu
- `POST /api/upiti` - Dodaj upit
- `GET /api/upiti/moji` - Moji upiti
- `GET /api/v2/auth/session` - Trenutni korisnik i sistemska uloga
- `POST /api/v2/auth/register|login` - Registracija ili prijava usernameom/emailom
- `GET|POST /api/v2/razgovori` - Privatni inbox vezan za oglas
- `GET|POST|PATCH /api/v2/termini` - Strukturirani termini pregleda
- `GET|POST|PATCH /api/v2/pregovaracke-ponude` - Neobavezujuće ponude
- `GET|POST /api/v2/organizacije` - Agencije i zahtjev za verifikaciju
- `GET /api/v2/obavijesti/stream` - Server-Sent Events kanal obavijesti
- `GET /api/v2/admin/dashboard|analitika` - Admin KPI i funnel

Liste podržavaju opt-in paginaciju pomoću `?page=1&limit=20` (maksimalni limit
je 100). Paginiran odgovor ima `items` i `pagination`; bez parametara se zadržava
stari format odgovora radi kompatibilnosti.

Fotografije su ograničene na JPG, PNG i WebP, maksimalno 5 MB po datoteci i
8 fotografija po nekretnini. Docker Compose mapira lokalni `uploads/` direktorij
u kontejner kako bi fotografije preživjele ponovno kreiranje aplikacije.

## ✅ Provjere

```bash
npm test
npm run test:client
npx tsc -p client/tsconfig.json --noEmit
npm run build
npm run test:unit
npm run test:integration
npm audit --omit=dev
```

Prije migracije `004-domus-v2` preporučuje se SQL backup. Lokalni backup treba
držati u `.dist/backups/`; taj direktorij je isključen iz Gita.

## 📄 License

MIT
