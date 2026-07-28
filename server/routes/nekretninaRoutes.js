const express = require('express');
const router = express.Router();
const nekretninaController = require('../controllers/nekretninaController');
const { requireAuth } = require('../middleware/auth');
const { Komentar, Korisnik } = require('../models'); // <-- Uvezeni modeli za komentare

router.get('/', nekretninaController.getAll);
router.get('/top5', nekretninaController.getTop5);
router.get('/moje', requireAuth, nekretninaController.getMoje);
router.post('/', requireAuth, nekretninaController.create);
router.get('/:id', nekretninaController.getById);
router.put('/:id', requireAuth, nekretninaController.update);
router.delete('/:id', requireAuth, nekretninaController.remove);
router.get('/:id/interesovanja', nekretninaController.getInteresovanja);

// === NOVE RUTE ZA KOMENTARE ===

// 1. Dohvat komentara za nekretninu
router.get('/:id/komentari', async (req, res) => {
    try {
        const komentari = await Komentar.findAll({
            where: { NekretninaId: req.params.id, idVezanogKomentara: null },
            include: [
                { model: Korisnik, attributes: ['id', 'ime', 'prezime', 'username'] },
                {
                    model: Komentar,
                    as: 'Odgovori',
                    include: [{ model: Korisnik, attributes: ['id', 'ime', 'prezime', 'username'] }]
                }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.json(komentari);
    } catch (e) {
        res.status(500).json({ greska: e.message });
    }
});

// 2. Dodavanje novog komentara
router.post('/:id/komentar', requireAuth, async (req, res) => {
    try {
        const noviKomentar = await Komentar.create({
            tekst: req.body.tekst,
            NekretninaId: req.params.id,
            KorisnikId: req.session.userId
        });
        res.status(201).json(noviKomentar);
    } catch (e) {
        res.status(500).json({ greska: e.message });
    }
});

// 3. Odgovor na postojeći komentar
router.post('/:id/komentar/:komentarId/odgovor', requireAuth, async (req, res) => {
    try {
        const odgovor = await Komentar.create({
            tekst: req.body.tekst,
            NekretninaId: req.params.id,
            KorisnikId: req.session.userId,
            idVezanogKomentara: req.params.komentarId
        });
        res.status(201).json(odgovor);
    } catch (e) {
        res.status(500).json({ greska: e.message });
    }
});

module.exports = router;