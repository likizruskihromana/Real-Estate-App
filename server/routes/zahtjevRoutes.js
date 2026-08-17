const express = require('express');
const router = express.Router();
const zahtjevController = require('../controllers/zahtjevController');
const { requireAuth } = require('../middleware/auth');

router.post('/:id', requireAuth, zahtjevController.createZahtjev);
router.put('/:id/:zid', requireAuth, zahtjevController.updateZahtjev);

module.exports = router;
