const { requireAuth } = require('../middleware/auth');
const express = require('express');
const router = express.Router();
const ponudaController = require('../controllers/ponudaController');

router.get('/', ponudaController.getAll);
router.get('/moje', requireAuth, ponudaController.getMojePonude);
router.post('/:id', ponudaController.createPonuda);
router.put('/:id', requireAuth, ponudaController.updatePonuda);
router.put('/:id/prihvati', requireAuth, ponudaController.prihvatiPonudu);

module.exports = router;
