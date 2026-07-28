const express = require('express');
const router = express.Router();
const korisnikController = require('../controllers/korisnikController');

router.get('/', korisnikController.getKorisnik);
router.put('/', korisnikController.updateKorisnik);

module.exports = router;