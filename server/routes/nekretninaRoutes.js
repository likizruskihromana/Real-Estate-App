const express = require('express');
const router = express.Router();
const nekretninaController = require('../controllers/nekretninaController');
const komentarController = require('../controllers/komentarController');
const { requireAuth } = require('../middleware/auth');

router.get('/', nekretninaController.getAll);
router.get('/top5', nekretninaController.getTop5);
router.get('/arhiva', nekretninaController.getArhiva);
router.get('/moje', requireAuth, nekretninaController.getMoje);
router.post('/', requireAuth, nekretninaController.create);
router.get('/:id', nekretninaController.getById);
router.put('/:id', requireAuth, nekretninaController.update);
router.delete('/:id', requireAuth, nekretninaController.remove);
router.get('/:id/interesovanja', nekretninaController.getInteresovanja);

// Komentari
router.get('/:id/komentari', komentarController.getKomentariZaNekretninu);
router.post('/:id/komentar', requireAuth, komentarController.createKomentar);
router.post('/:id/komentar/:komentarId/odgovor', requireAuth, komentarController.createOdgovor);

module.exports = router;
