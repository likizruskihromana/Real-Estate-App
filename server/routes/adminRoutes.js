const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { requireAdmin } = require('../middleware/auth');

router.use(requireAdmin);

router.get('/dashboard', adminController.getDashboard);

router.get('/korisnici', adminController.getKorisnici);
router.patch('/korisnici/:id/admin', adminController.setAdminStatus);
router.delete('/korisnici/:id', adminController.deleteKorisnik);

router.get('/nekretnine', adminController.getNekretnine);
router.get('/zahtjevi', adminController.getZahtjevi);
router.get('/ponude', adminController.getPonude);

router.get('/komentari', adminController.getKomentari);
router.delete('/komentari/:id', adminController.deleteKomentar);

module.exports = router;
