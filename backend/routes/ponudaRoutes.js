const express = require('express');
const router = express.Router();
const ponudaController = require('../controllers/ponudaController');

router.post('/:id', ponudaController.createPonuda);

module.exports = router;