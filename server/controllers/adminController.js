const { Korisnik, Nekretnina, Zahtjev } = require('../models');

exports.getKorisnici = async (req, res) => {
  try {
    const korisnici = await Korisnik.findAll({
      attributes: ['id', 'ime', 'prezime', 'username', 'admin'],
      order: [['id', 'ASC']],
    });
    res.status(200).json(korisnici);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
};

exports.setAdminStatus = async (req, res) => {
  try {
    const { admin } = req.body;
    const korisnik = await Korisnik.findByPk(req.params.id);

    if (!korisnik) {
      return res.status(404).json({ greska: 'Korisnik nije pronađen.' });
    }

    // Zaštita: ne dozvoli da se ukloni poslednji preostali admin
    if (korisnik.admin && admin === false) {
      const brojAdmina = await Korisnik.count({ where: { admin: true } });
      if (brojAdmina <= 1) {
        return res.status(400).json({ greska: 'Ne možete ukloniti poslednjeg administratora.' });
      }
    }

    korisnik.admin = !!admin;
    await korisnik.save();

    // Ako admin mijenja status samom sebi, sesija se mora odmah osvježiti
    // da ne bi ostao sa admin privilegijama u trenutnoj sesiji nakon samodegradacije.
    if (korisnik.id === req.session.userId) {
      req.session.admin = korisnik.admin;
    }

    res.status(200).json({
      id: korisnik.id,
      ime: korisnik.ime,
      prezime: korisnik.prezime,
      username: korisnik.username,
      admin: korisnik.admin,
    });
  } catch (error) {
    console.error('Error updating admin status:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
};

exports.deleteKorisnik = async (req, res) => {
  try {
    const idZaBrisanje = parseInt(req.params.id);

    if (idZaBrisanje === req.session.userId) {
      return res.status(400).json({ greska: 'Ne možete obrisati sopstveni nalog iz admin panela.' });
    }

    const korisnik = await Korisnik.findByPk(idZaBrisanje);
    if (!korisnik) {
      return res.status(404).json({ greska: 'Korisnik nije pronađen.' });
    }

    if (korisnik.admin) {
      const brojAdmina = await Korisnik.count({ where: { admin: true } });
      if (brojAdmina <= 1) {
        return res.status(400).json({ greska: 'Ne možete obrisati poslednjeg administratora.' });
      }
    }

    await korisnik.destroy();
    res.status(200).json({ poruka: 'Korisnik je uspješno obrisan.' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
};

exports.getNekretnine = async (req, res) => {
  try {
    const nekretnine = await Nekretnina.findAll({
      include: [{ model: Korisnik, attributes: ['id', 'username'] }],
      order: [['id', 'DESC']],
    });
    res.status(200).json(nekretnine);
  } catch (error) {
    console.error('Error fetching properties for admin:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
};

exports.getZahtjevi = async (req, res) => {
  try {
    const zahtjevi = await Zahtjev.findAll({
      include: [
        { model: Korisnik, attributes: ['id', 'username'] },
        { model: Nekretnina, attributes: ['id', 'naziv'] },
      ],
      order: [['id', 'DESC']],
    });
    res.status(200).json(zahtjevi);
  } catch (error) {
    console.error('Error fetching requests for admin:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
};
