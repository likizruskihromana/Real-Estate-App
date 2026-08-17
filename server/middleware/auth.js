// Zajednički middleware za provjeru autentifikacije i admin prava,
// da se ista logika ne ponavlja u svakom kontroleru posebno.

const { Korisnik } = require('../models');

async function requireAuth(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ greska: 'Neautorizovan pristup. Molimo prijavite se.' });
  }
  try {
    const korisnik = await Korisnik.findByPk(req.session.userId);
    const aktivnaSuspenzija = korisnik?.suspendedAt && (!korisnik.suspendedUntil || new Date(korisnik.suspendedUntil) > new Date());
    if (!korisnik || korisnik.deletedAt || aktivnaSuspenzija) {
      return req.session.destroy(() => res.status(403).json({ greska: aktivnaSuspenzija ? 'Nalog je suspendovan.' : 'Nalog nije aktivan.' }));
    }
    req.korisnik = korisnik;
    next();
  } catch (error) { next(error); }
}

function requireRoles(...roles) {
  return async (req, res, next) => {
    // Brza provjera zadržava kompatibilnost sa starim sesijama i izbjegava DB upit za očito zabranjen poziv.
    if (req.session?.userId && req.session.admin === false && !req.session.systemRole && !roles.includes('USER')) {
      return res.status(403).json({ greska: 'Nemate ovlaštenje za ovu akciju.' });
    }
    return requireAuth(req, res, () => {
      const role = req.korisnik.systemRole || (req.korisnik.admin ? 'SUPER_ADMIN' : 'USER');
      if (!roles.includes(role)) return res.status(403).json({ greska: 'Nemate ovlaštenje za ovu akciju.' });
      next();
    });
  };
}

const requireAdmin = requireRoles('ANALYST', 'MODERATOR', 'SUPER_ADMIN');

module.exports = { requireAuth, requireAdmin, requireRoles };
