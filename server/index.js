const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const { sequelize } = require('./models');
const config = require('./config/env');
const { createApp } = require('./app');
const { logger } = require('./utils/observability');
const { startJobs } = require('./utils/jobs');

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
    logger.info('database_connected');
  } catch (err) {
    logger.fatal({ err }, 'database_initialization_failed');
    process.exit(1);
  }
};

initializeDatabase().then(() => {
  const server = app.listen(PORT, () => logger.info({ port: PORT, environment: config.server.nodeEnv }, 'server_started'));
  const stopJobs=startJobs();
  let shuttingDown = false;
  const shutdown = signal => {
    if (shuttingDown) return;
    shuttingDown = true;
    logger.info({ signal }, 'graceful_shutdown_started');
    stopJobs();
    server.close(async error => {
      if (error) logger.error({ err: error }, 'http_shutdown_failed');
      await sequelize.close().catch(err => logger.error({ err }, 'database_shutdown_failed'));
      process.exit(error ? 1 : 0);
    });
    setTimeout(() => process.exit(1), 15000).unref();
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
});
