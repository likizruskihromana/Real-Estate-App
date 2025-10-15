const { Korisnik } = require('../models');
const bcrypt = require('bcrypt');

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

    if (ime) korisnik.ime = ime;
    if (prezime) korisnik.prezime = prezime;
    if (username) korisnik.username = username;
    if (password) {
      korisnik.password = await bcrypt.hash(password, 10);
    }

    await korisnik.save();
    res.status(200).json({ poruka: 'Podaci su uspješno ažurirani' });
  } catch (error) {
    console.error('Error updating user data:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
};