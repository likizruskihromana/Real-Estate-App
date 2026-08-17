const crypto = require('crypto');

const COOKIE_NAME = 'nekretnine.csrf';
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

function procitajCookie(cookieHeader, name) {
  if (!cookieHeader) return null;
  for (const dio of cookieHeader.split(';')) {
    const [kljuc, ...vrijednost] = dio.trim().split('=');
    if (kljuc === name) return decodeURIComponent(vrijednost.join('='));
  }
  return null;
}

function sigurnoJednako(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);
  return aBuffer.length === bBuffer.length && crypto.timingSafeEqual(aBuffer, bBuffer);
}

function csrfProtection(req, res, next) {
  let cookieToken = procitajCookie(req.headers.cookie, COOKIE_NAME);

  if (!cookieToken) {
    cookieToken = crypto.randomBytes(32).toString('hex');
    res.cookie(COOKIE_NAME, cookieToken, {
      httpOnly: false,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });
  }

  if (SAFE_METHODS.has(req.method)) return next();

  const headerToken = req.get('X-CSRF-Token');
  if (!sigurnoJednako(cookieToken, headerToken)) {
    if (req.originalUrl?.startsWith('/api/v2/')) return res.status(403).json({error:{code:'CSRF_INVALID',message:'Nevažeći CSRF token.',requestId:req.requestId}});
    return res.status(403).json({ greska: 'Nevažeći CSRF token.' });
  }
  next();
}

module.exports = { csrfProtection, procitajCookie };
