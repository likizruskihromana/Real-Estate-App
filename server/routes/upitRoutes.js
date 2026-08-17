const express = require('express');
const router = express.Router();
const upitController = require('../controllers/upitController');
const { requireAuth } = require('../middleware/auth');

router.post('/', requireAuth, upitController.createUpit);
router.get('/moji', requireAuth, upitController.getMojiUpiti);
router.get('/next/:id', upitController.getNextUpiti);
router.put('/:id', requireAuth, upitController.odgovoriNaUpit);

module.exports = router;
