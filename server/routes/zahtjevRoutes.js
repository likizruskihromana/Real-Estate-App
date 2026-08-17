const express = require('express');
const router = express.Router();
const zahtjevController = require('../controllers/zahtjevController');
const { requireAuth } = require('../middleware/auth');
const { legacyReadOnly } = require('../middleware/legacyReadOnly');

router.use(legacyReadOnly);

router.post('/:id', requireAuth, zahtjevController.createZahtjev);
router.put('/:id/:zid', requireAuth, zahtjevController.updateZahtjev);

module.exports = router;
