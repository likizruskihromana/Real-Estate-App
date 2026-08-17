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
```

Server pri pokretanju ne kreira niti resetuje bazu. Za praznu razvojnu bazu
pokrenite `npm run seed` eksplicitno; naredba će se zaustaviti ako podaci već postoje.

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
└── server/     # Backend (Express, Sequelize, MySQL)
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
- `POST /api/upiti` - Dodaj upit
- `GET /api/upiti/moji` - Moji upiti

## 📄 License

MIT
