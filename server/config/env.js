require('dotenv').config();

const nodeEnv = process.env.NODE_ENV || 'development';
const sessionSecret = process.env.SESSION_SECRET || 'default_secret_change_me';
const publicBaseUrl = process.env.PUBLIC_BASE_URL || process.env.APP_URL || 'http://localhost:3000';

if (nodeEnv === 'production' && sessionSecret === 'default_secret_change_me') {
  throw new Error('SESSION_SECRET mora biti postavljen na sigurnu vrijednost u produkciji.');
}
if (nodeEnv === 'production' && (!process.env.DB_PASSWORD || !process.env.PUBLIC_BASE_URL || !process.env.SMTP_HOST || !process.env.SMTP_FROM)) {
  throw new Error('DB_PASSWORD, PUBLIC_BASE_URL, SMTP_HOST i SMTP_FROM moraju biti postavljeni u produkciji.');
}

module.exports = {
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    name: process.env.DB_NAME || 'wt24',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'password',
  },
  server: {
    port: process.env.PORT || 3000,
    nodeEnv,
  },
  session: {
    secret: sessionSecret,
    maxAge: parseInt(process.env.SESSION_MAX_AGE) || 86400000,
  },
  bcrypt: {
    rounds: parseInt(process.env.BCRYPT_ROUNDS) || 10,
  },
  appUrl: publicBaseUrl,
  publicBaseUrl,
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER || '',
    password: process.env.SMTP_PASSWORD || '',
    from: process.env.SMTP_FROM || 'Domus <no-reply@domus.local>',
  },
};
