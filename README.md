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

## 🔐 Default Credentials

- **Admin**: username: `admin`, password: `admin123`
- **User**: username: `marko`, password: `marko123`

## 📝 Environment Variables

Kopiraj `.env.example` u `.env` i podesi varijable.

## 🛠️ API Endpoints

- `POST /api/auth/login` - Prijava
- `POST /api/auth/logout` - Odjava
- `GET /api/nekretnine` - Sve nekretnine
- `GET /api/nekretnine/:id` - Detalji nekretnine
- `POST /api/upiti` - Dodaj upit
- `GET /api/upiti/moji` - Moji upiti

## 📄 License

MIT
