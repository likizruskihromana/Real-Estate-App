const express = require('express');
const router = express.Router();
const upitController = require('../controllers/upitController');

router.post('/', upitController.createUpit);
router.get('/moji', upitController.getMojiUpiti);
router.get('/next/:id', upitController.getNextUpiti);

module.exports = router;