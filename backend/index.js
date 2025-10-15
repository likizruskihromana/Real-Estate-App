const express = require('express');
const session = require('express-session');
const path = require('path');
const { sequelize } = require('./models');
const routes = require('./routes');
const config = require('./config/env');
const { seedDatabase } = require('./seeders/initialData');

const app = express();
const PORT = config.server.port;

// Session middleware
app.use(session({
  secret: config.session.secret,
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false,
    maxAge: config.session.maxAge
  }
}));

// Static files
app.use(express.static(path.join(__dirname, '../public')));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api', routes);

// HTML Routes
const htmlRoutes = [
  'nekretnine.html', 'detalji.html', 'meni.html', 'prijava.html',
  'profil.html', 'statistika.html', 'vijesti.html', 'mojiUpiti.html'
];

htmlRoutes.forEach(file => {
  app.get(`/${file}`, (req, res) => {
    res.sendFile(path.join(__dirname, '../public/html', file));
  });
});

// Root route
app.get('/', (req, res) => {
  res.redirect('/nekretnine.html');
});

// Inicijalizacija baze i seedovanje
const initializeDatabase = async () => {
  try {
    await sequelize.sync({ force: true }); // PAŽNJA: force:true briše sve podatke!
    console.log('✅ Konekcija na bazu uspješna!');
    
    // Seeduj početne podatke
    await seedDatabase();
    
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