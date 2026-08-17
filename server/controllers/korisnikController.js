const { Korisnik } = require('../models');
const bcrypt = require('bcrypt');
const config = require('../config/env');
const validacija = require('../utils/validation');

exports.getKorisnik = async (req, res) => {
  if (!req.session.username) {
    return res.status(401).json({ greska: 'Neautorizovan pristup' });
  }
  try {
    const korisnik = await Korisnik.findByPk(req.session.userId, {
      attributes: ['id', 'ime', 'prezime', 'username', 'admin'],
    });
    if (!korisnik) {
      return res.status(404).json({ greska: 'Korisnik nije pronađen' });
    }
    res.status(200).json(korisnik);
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
};

exports.updateKorisnik = async (req, res) => {
  if (!req.session.username) {
    return res.status(401).json({ greska: 'Neautorizovan pristup' });
  }

  const { ime, prezime, username, password } = req.body;

  try {
    const korisnik = await Korisnik.findOne({ where: { username: req.session.username } });

    if (!korisnik) {
      return res.status(401).json({ greska: 'Korisnik nije pronađen' });
    }

    if (ime !== undefined) korisnik.ime = validacija.tekst(ime, 'Ime', { max: 100 });
    if (prezime !== undefined) korisnik.prezime = validacija.tekst(prezime, 'Prezime', { max: 100 });
    if (username !== undefined) {
      const cistUsername = validacija.tekst(username, 'Korisničko ime', { min: 3, max: 50 });
      if (/\s/.test(cistUsername)) {
        return res.status(400).json({ greska: 'Korisničko ime ne smije sadržavati razmake.' });
      }
      korisnik.username = cistUsername;
    }
    if (password) {
      const cistaLozinka = validacija.tekst(password, 'Lozinka', { min: 6, max: 128 });
      korisnik.password = await bcrypt.hash(cistaLozinka, config.bcrypt.rounds);
    }

    await korisnik.save();
    req.session.username = korisnik.username;
    res.status(200).json({ poruka: 'Podaci su uspješno ažurirani' });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ greska: 'To korisničko ime je već zauzeto.' });
    }
    validacija.odgovoriNaGresku(error, res, 'Error updating user data:');
  }
};
