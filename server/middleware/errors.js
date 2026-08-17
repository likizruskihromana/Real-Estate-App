const crypto = require('crypto');

function requestContext(req, res, next) {
  req.requestId = req.get('X-Request-ID') || crypto.randomUUID();
  res.setHeader('X-Request-ID', req.requestId);
  next();
}

function apiNotFound(req, res) {
  res.status(404).json({
    greska: 'API ruta nije pronađena.',
    requestId: req.requestId,
  });
}

function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);

  const jeJsonGreska = error instanceof SyntaxError && error.status === 400 && 'body' in error;
  const status = jeJsonGreska ? 400 : (error.status || 500);
  const poruka = status < 500 ? (error.message || 'Zahtjev nije ispravan.') : 'Internal Server Error';

  if (status >= 500) {
    console.error(`[${req.requestId}] Neočekivana greška:`, error);
  }

  res.status(status).json({ greska: poruka, requestId: req.requestId });
}

module.exports = { requestContext, apiNotFound, errorHandler };

