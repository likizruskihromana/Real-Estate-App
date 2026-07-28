// Zajednički middleware za provjeru autentifikacije i admin prava,
// da se ista logika ne ponavlja u svakom kontroleru posebno.

function requireAuth(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ greska: 'Neautorizovan pristup. Molimo prijavite se.' });
  }
  next();
}

function requireAdmin(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ greska: 'Neautorizovan pristup. Molimo prijavite se.' });
  }
  if (!req.session.admin) {
    return res.status(403).json({ greska: 'Samo administrator ima pristup ovoj akciji.' });
  }
  next();
}

module.exports = { requireAuth, requireAdmin };
