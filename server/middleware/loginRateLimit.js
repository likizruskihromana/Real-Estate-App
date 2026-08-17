const pokusaji = new Map();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_POKUSAJA = 10;

function loginRateLimit(req, res, next) {
  const username = typeof req.body?.username === 'string' ? req.body.username.trim().toLowerCase() : '';
  const kljuc = `${req.ip}:${username}`;
  const sada = Date.now();
  const zapis = pokusaji.get(kljuc);

  if (!zapis || zapis.resetAt <= sada) {
    pokusaji.set(kljuc, { count: 1, resetAt: sada + WINDOW_MS });
    return next();
  }
  if (zapis.count >= MAX_POKUSAJA) {
    res.setHeader('Retry-After', Math.ceil((zapis.resetAt - sada) / 1000));
    if (req.originalUrl?.startsWith('/api/v2/')) return res.status(429).json({error:{code:'RATE_LIMITED',message:'Previše pokušaja prijave. Pokušajte ponovo kasnije.',requestId:req.requestId}});
    return res.status(429).json({ greska: 'Previše pokušaja prijave. Pokušajte ponovo kasnije.' });
  }

  zapis.count += 1;
  next();
}

module.exports = { loginRateLimit };
