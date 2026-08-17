const crypto = require('crypto');
const { logger, captureError } = require('../utils/observability');

function requestContext(req, res, next) {
  req.requestId = req.get('X-Request-ID') || crypto.randomUUID();
  res.setHeader('X-Request-ID', req.requestId);
  const startedAt = process.hrtime.bigint();
  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1e6;
    logger.info({ requestId: req.requestId, method: req.method, route: req.route?.path || req.path, status: res.statusCode, durationMs: Number(durationMs.toFixed(2)), userId: req.korisnik?.id || req.session?.userId || null }, 'http_request');
  });
  next();
}

function apiNotFound(req, res) {
  if (req.originalUrl?.startsWith('/api/v2/')) return res.status(404).json({error:{code:'NOT_FOUND',message:'API ruta nije pronađena.',requestId:req.requestId}});
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
    logger.error({ err: error, requestId: req.requestId }, 'unexpected_error');
    captureError(error, req);
  }

  if (req.path?.startsWith('/api/v2')) {
    return res.status(status).json({ error: {
      code: error.code || (status === 400 ? 'VALIDATION_ERROR' : status === 404 ? 'NOT_FOUND' : 'INTERNAL_ERROR'),
      message: poruka,
      ...(error.fieldErrors ? { fieldErrors: error.fieldErrors } : {}),
      requestId: req.requestId,
    } });
  }
  res.status(status).json({ greska: poruka, requestId: req.requestId });
}

module.exports = { requestContext, apiNotFound, errorHandler };
