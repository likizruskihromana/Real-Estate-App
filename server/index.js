const express = require('express');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const path = require('path');
const { sequelize } = require('./models');
const routes = require('./routes');
const config = require('./config/env');
const { csrfProtection } = require('./middleware/csrf');

const app = express();
const PORT = config.server.port;
const sessionStore = new MySQLStore({
  host: config.database.host,
  port: config.database.port,
  user: config.database.user,
  password: config.database.password,
  database: config.database.name,
  createDatabaseTable: config.server.nodeEnv !== 'production',
  clearExpired: true,
  checkExpirationInterval: 15 * 60 * 1000,
});

// Session middleware
app.use(session({
  store: sessionStore,
  secret: config.session.secret,
  resave: false,
  saveUninitialized: false,
  name: 'nekretnine.sid',
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: config.server.nodeEnv === 'production',
    maxAge: config.session.maxAge
  }
}));

if (config.server.nodeEnv === 'production') {
  app.set('trust proxy', 1);
}

// Osnovni sigurnosni headeri bez dodatne runtime zavisnosti.
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});

app.use(csrfProtection);

// Static files
app.use(express.static(path.join(__dirname, '../client')));

// Body parser
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

// API Routes
app.use('/api', routes);

// HTML Routes
const htmlRoutes = [
  'nekretnine.html', 'detalji.html', 'meni.html', 'prijava.html', 'registracija.html',
  'profil.html', 'statistika.html', 'ponude.html', 'mojiUpiti.html', 'admin.html',
  'arhiva.html', 'index.html'
];

htmlRoutes.forEach(file => {
  app.get(`/${file}`, (req, res) => {
    res.sendFile(path.join(__dirname, '../client/html', file));
  });
});

// Root route
app.get('/', (req, res) => {
  res.redirect('/index.html');
});

// Pokretanje aplikacije nikada ne smije mijenjati šemu ili brisati podatke.
const initializeDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Konekcija na bazu uspješna!');
  } catch (err) {
    console.error('❌ Greška pri inicijalizaciji baze:', err);
    process.exit(1);
  }
};

initializeDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server pokrenut na http://localhost:${PORT}`);
    console.log(`📊 Environment: ${config.server.nodeEnv}`);
  });
});
