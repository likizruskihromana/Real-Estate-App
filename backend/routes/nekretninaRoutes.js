const express = require('express');
const router = express.Router();
const nekretninaController = require('../controllers/nekretninaController');

router.get('/', nekretninaController.getAll);
router.get('/top5', nekretninaController.getTop5);
router.get('/:id', nekretninaController.getById);
router.get('/:id/interesovanja', nekretninaController.getInteresovanja);

module.exports = router;