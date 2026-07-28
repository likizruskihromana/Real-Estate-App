const { requireAuth } = require('../middleware/auth'); // Prilagodite putanju po potrebi
const express = require('express');
const router = express.Router();
const ponudaController = require('../controllers/ponudaController');

router.post('/:id', ponudaController.createPonuda);
router.get('/', ponudaController.getAll);
router.put('/:id', requireAuth, ponudaController.updatePonuda);
module.exports = router;