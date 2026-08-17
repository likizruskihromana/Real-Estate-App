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
- **Frontend**: Vanilla JavaScript, HTML, CSS
- **DevOps**: Docker, Docker Compose

Za lokalni razvoj potreban je Node.js 22 ili noviji podržani LTS runtime.

## 📁 Struktura Projekta

```
├── client/     # Frontend (HTML, CSS, JS)
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

Liste podržavaju opt-in paginaciju pomoću `?page=1&limit=20` (maksimalni limit
je 100). Paginiran odgovor ima `items` i `pagination`; bez parametara se zadržava
stari format odgovora radi kompatibilnosti.

Fotografije su ograničene na JPG, PNG i WebP, maksimalno 5 MB po datoteci i
8 fotografija po nekretnini. Docker Compose mapira lokalni `uploads/` direktorij
u kontejner kako bi fotografije preživjele ponovno kreiranje aplikacije.

## ✅ Provjere

```bash
npm test
npm run test:unit
npm run test:integration
npm audit --omit=dev
```

## 📄 License

MIT
