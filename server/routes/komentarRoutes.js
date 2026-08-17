const express = require('express');
const router = express.Router();
const komentarController = require('../controllers/komentarController');
const { requireAuth } = require('../middleware/auth');
const { legacyReadOnly } = require('../middleware/legacyReadOnly');

router.use(legacyReadOnly);

router.get('/:id/komentari', komentarController.getKomentariZaNekretninu);
router.post('/:id/komentar', requireAuth, komentarController.createKomentar);
router.post('/:nekretnina_id/komentar/:komentar_id/odgovor', requireAuth, komentarController.createOdgovorNaKomentar);
module.exports = router;
