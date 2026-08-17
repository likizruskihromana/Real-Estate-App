function legacyReadOnly(req, res, next) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  return res.status(410).json({ error: {
    code: 'LEGACY_READ_ONLY',
    message: 'Ovaj modul je arhiviran i dostupan je samo za čitanje. Koristite novi Domus komunikacijski modul.',
    requestId: req.requestId,
  } });
}
module.exports = { legacyReadOnly };
