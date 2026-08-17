const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const { sequelize } = require('./models');
const config = require('./config/env');
const { createApp } = require('./app');

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
const app = createApp({ sessionStore });

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
