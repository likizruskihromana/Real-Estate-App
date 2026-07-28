const express = require('express');
const router = express.Router();
const zahtjevController = require('../controllers/zahtjevController');

router.post('/:id', zahtjevController.createZahtjev);
router.put('/:id/:zid', zahtjevController.updateZahtjev);

module.exports = router;