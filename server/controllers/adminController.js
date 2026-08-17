const { sequelize, Korisnik, Nekretnina, Zahtjev, Ponuda, Komentar } = require('../models');
const komentarController = require('./komentarController');
const validacija = require('../utils/validation');

exports.getDashboard = async (req, res) => {
  try {
    const [brojKorisnika, brojAdmina, brojAktivnih, brojProdanih, brojZahtjevaNaCekanju, brojKomentara] = await Promise.all([
      Korisnik.count(),
      Korisnik.count({ where: { admin: true } }),
      Nekretnina.count({ where: { kupljeno: false } }),
      Nekretnina.count({ where: { kupljeno: true } }),
      Zahtjev.count({ where: { odobren: false } }),
      Komentar.count(),
    ]);

    res.status(200).json({
      brojKorisnika,
      brojAdmina,
      brojAktivnih,
      brojProdanih,
      brojZahtjevaNaCekanju,
      brojKomentara,
    });
  } catch (error) {
    console.error('Error fetching admin dashboard:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
};

exports.getKomentari = komentarController.getSviKomentari;
exports.deleteKomentar = komentarController.deleteKomentar;

exports.getPonude = async (req, res) => {
  try {
    const ponude = await Ponuda.findAll({
      include: [
        { model: Korisnik, attributes: ['id', 'username'] },
        { model: Nekretnina, attributes: ['id', 'naziv', 'kupljeno'] },
      ],
      order: [['id', 'DESC']],
    });
    res.status(200).json(ponude);
  } catch (error) {
    console.error('Error fetching offers for admin:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
};

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
    const admin = validacija.boolean(req.body.admin, 'Admin status');
    const korisnikId = validacija.pozitivanId(req.params.id, 'ID korisnika');
    let korisnik;

    await sequelize.transaction(async (transaction) => {
      korisnik = await Korisnik.findByPk(korisnikId, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (!korisnik) {
        const error = new Error('Korisnik nije pronađen.');
        error.status = 404;
        throw error;
      }

      if (korisnik.admin && admin === false) {
        const administratori = await Korisnik.findAll({
          where: { admin: true },
          attributes: ['id'],
          transaction,
          lock: transaction.LOCK.UPDATE,
        });
        if (administratori.length <= 1) {
          const error = new Error('Ne možete ukloniti poslednjeg administratora.');
          error.status = 400;
          throw error;
        }
      }

      korisnik.admin = admin;
      await korisnik.save({ transaction });
    });

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
    if (error.status) return res.status(error.status).json({ greska: error.message });
    if (error.code === 'VALIDATION_ERROR') return res.status(400).json({ greska: error.message });
    console.error('Error updating admin status:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
};

exports.deleteKorisnik = async (req, res) => {
  try {
    const idZaBrisanje = validacija.pozitivanId(req.params.id, 'ID korisnika');

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
