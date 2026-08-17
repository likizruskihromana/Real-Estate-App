const express = require('express');
const session = require('express-session');
const path = require('path');
const routes = require('./routes');
const config = require('./config/env');
const { csrfProtection } = require('./middleware/csrf');
const { requestContext, apiNotFound, errorHandler } = require('./middleware/errors');

function createApp({ sessionStore, serveStatic = true } = {}) {
  const app = express();
  app.use(requestContext);
  app.use(session({
    ...(sessionStore ? { store: sessionStore } : {}),
    secret: config.session.secret,
    resave: false,
    saveUninitialized: false,
    name: 'nekretnine.sid',
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: config.server.nodeEnv === 'production',
      maxAge: config.session.maxAge,
    },
  }));

  if (config.server.nodeEnv === 'production') app.set('trust proxy', 1);

  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    next();
  });

  app.use(csrfProtection);
  if (serveStatic) app.use(express.static(path.join(__dirname, '../client')));
  if (serveStatic) app.use('/uploads', express.static(path.join(__dirname, '../uploads'), {
    fallthrough: false,
    maxAge: config.server.nodeEnv === 'production' ? '7d' : 0,
  }));
  app.use(express.json({ limit: '100kb' }));
  app.use(express.urlencoded({ extended: true, limit: '100kb' }));
  app.use('/api', routes);
  app.use('/api', apiNotFound);

  if (serveStatic) {
    const htmlRoutes = [
      'nekretnine.html', 'detalji.html', 'meni.html', 'prijava.html', 'registracija.html',
      'profil.html', 'statistika.html', 'ponude.html', 'mojiUpiti.html', 'admin.html',
      'arhiva.html', 'index.html',
    ];
    htmlRoutes.forEach((file) => {
      app.get(`/${file}`, (req, res) => res.sendFile(path.join(__dirname, '../client/html', file)));
    });
    app.get('/', (req, res) => res.redirect('/index.html'));
  }

  app.use(errorHandler);
  return app;
}

module.exports = { createApp };
