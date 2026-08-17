require('dotenv').config();

const nodeEnv = process.env.NODE_ENV || 'development';
const sessionSecret = process.env.SESSION_SECRET || 'default_secret_change_me';

if (nodeEnv === 'production' && sessionSecret === 'default_secret_change_me') {
  throw new Error('SESSION_SECRET mora biti postavljen na sigurnu vrijednost u produkciji.');
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
};
