const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const korisnikRoutes = require('./korisnikRoutes');
const nekretninaRoutes = require('./nekretninaRoutes');
const upitRoutes = require('./upitRoutes');
const zahtjevRoutes = require('./zahtjevRoutes');
const ponudaRoutes = require('./ponudaRoutes');
const adminRoutes = require('./adminRoutes');
const sacuvanoRoutes = require('./sacuvanoRoutes');

router.use('/auth', authRoutes);
router.use('/korisnik', korisnikRoutes);
router.use('/nekretnine', nekretninaRoutes);
router.use('/upiti', upitRoutes);
router.use('/zahtjevi', zahtjevRoutes);
router.use('/ponude', ponudaRoutes);
router.use('/admin', adminRoutes);
router.use('/sacuvano', sacuvanoRoutes);

module.exports = router;
