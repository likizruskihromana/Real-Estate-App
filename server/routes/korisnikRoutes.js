const express = require('express');
const router = express.Router();
const korisnikController = require('../controllers/korisnikController');
const { requireAuth } = require('../middleware/auth');

router.get('/', requireAuth, korisnikController.getKorisnik);
router.put('/', requireAuth, korisnikController.updateKorisnik);

module.exports = router;
