const pino = require('pino');
const Sentry = require('@sentry/node');
const config = require('../config/env');

const logger = pino({
  level: config.observability.logLevel,
  redact: {
    paths: [
      'req.headers.cookie', 'req.headers.authorization', 'req.headers.x-csrf-token',
      'password', '*.password', '*.tekst', '*.poruka', '*.punaAdresa', '*.latTacno', '*.lngTacno',
      'smtp.password', 'session',
    ],
    censor: '[REDACTED]',
  },
});

if (config.observability.sentryDsn) {
  Sentry.init({
    dsn: config.observability.sentryDsn,
    environment: config.server.nodeEnv,
    release: config.observability.release || undefined,
    tracesSampleRate: config.observability.tracesSampleRate,
    sendDefaultPii: false,
    beforeSend(event) {
      if (event.request) {
        delete event.request.cookies;
        delete event.request.data;
        if (event.request.headers) {
          delete event.request.headers.Cookie;
          delete event.request.headers.cookie;
          delete event.request.headers.Authorization;
          delete event.request.headers.authorization;
        }
      }
      return event;
    },
  });
}

function captureError(error, req) {
  if (!config.observability.sentryDsn) return;
  Sentry.withScope(scope => {
    if (req?.requestId) scope.setTag('requestId', req.requestId);
    if (req?.korisnik?.id) scope.setUser({ id: String(req.korisnik.id) });
    Sentry.captureException(error);
  });
}

module.exports = { logger, captureError };
