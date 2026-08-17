const express = require('express');
const session = require('express-session');
const path = require('path');
const routes = require('./routes');
const config = require('./config/env');
const { csrfProtection } = require('./middleware/csrf');
const { requestContext, apiNotFound, errorHandler } = require('./middleware/errors');
const { installSeoRoutes } = require('./utils/seoRoutes');

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
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://*.tile.openstreetmap.org; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self'");
    next();
  });

  app.use(csrfProtection);
  const clientRoot = path.join(__dirname, '../client');
  const reactDist = path.join(clientRoot, 'dist');
  if (serveStatic) installSeoRoutes(app, reactDist);
  if (serveStatic) app.use(express.static(reactDist));
  // Legacy resursi ostaju dostupni tokom postepene migracije.
  if (serveStatic) app.use(express.static(clientRoot));
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
      'sacuvano.html',
    ];
    const redirects = {
      'nekretnine.html':'/nekretnine','detalji.html':'/nekretnine','prijava.html':'/prijava',
      'registracija.html':'/registracija','profil.html':'/profil','statistika.html':'/admin/analitika',
      'ponude.html':'/ponude','mojiUpiti.html':'/inbox','admin.html':'/admin','arhiva.html':'/nekretnine',
      'sacuvano.html':'/sacuvano','meni.html':'/moji-oglasi','index.html':'/',
    };
    htmlRoutes.forEach((file) => app.get(`/${file}`, (req, res) => res.redirect(302, redirects[file] || '/')));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api/') || req.path.startsWith('/uploads/')) return next();
      res.sendFile(path.join(reactDist, 'index.html'), (error) => error ? next() : undefined);
    });
  }

  app.use(errorHandler);
  return app;
}

module.exports = { createApp };
