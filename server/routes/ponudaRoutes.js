const { requireAuth } = require('../middleware/auth');
const express = require('express');
const router = express.Router();
const ponudaController = require('../controllers/ponudaController');
const { legacyReadOnly } = require('../middleware/legacyReadOnly');

router.use(legacyReadOnly);

router.get('/moje', requireAuth, ponudaController.getMojePonude);
router.post('/:id', requireAuth, ponudaController.createPonuda);
router.put('/:id', requireAuth, ponudaController.updatePonuda);
router.put('/:id/prihvati', requireAuth, ponudaController.prihvatiPonudu);

module.exports = router;
