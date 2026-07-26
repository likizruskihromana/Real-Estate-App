const express = require('express');
const router = express.Router();
const ponudaController = require('../controllers/ponudaController');

router.post('/:id', ponudaController.createPonuda);
router.get('/', ponudaController.getAll);
module.exports = router;