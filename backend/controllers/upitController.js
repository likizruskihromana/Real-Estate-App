const { Korisnik, Nekretnina, Upit } = require('../models');

exports.createUpit = async (req, res) => {
  if (!req.session.username) {
    return res.status(401).json({ greska: 'Neautorizovan pristup' });
  }
  const { nekretnina_id, tekst_upita } = req.body;
  try {
    const korisnik = await Korisnik.findOne({ where: { username: req.session.username } });
    if (!korisnik) {
      return res.status(401).json({ greska: 'Korisnik nije pronađen' });
    }
    const nekretnina = await Nekretnina.findByPk(nekretnina_id, {
      include: [{ model: Upit }],
    });
    if (!nekretnina) {
      return res.status(400).json({ greska: `Nekretnina sa id-em ${nekretnina_id} ne postoji` });
    }
    const brojUpitaOdLoggedUser = nekretnina.Upiti.filter(
      (upit) => upit.KorisnikId === korisnik.id
    ).length;
    if (brojUpitaOdLoggedUser >= 3) {
      return res.status(429).json({ greska: 'Previse upita za istu nekretninu.' });
    }

    const upit = await Upit.create({
      tekst: tekst_upita,
      NekretninaId: nekretnina.id,
      KorisnikId: korisnik.id,
    });

    res.status(200).json({ poruka: 'Upit je uspješno dodan', upit });
  } catch (error) {
    console.error('Error processing query:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
};

exports.getMojiUpiti = async (req, res) => {
  if (!req.session.username) {
    return res.status(401).json({ greska: 'Neautorizovan pristup' });
  }
  try {
    const korisnik = await Korisnik.findOne({ where: { username: req.session.username } });
    if (!korisnik) {
      return res.status(401).json({ greska: 'Korisnik nije pronađen' });
    }
    const upiti = await Upit.findAll({
      where: { KorisnikId: korisnik.id },
      include: [{ model: Nekretnina, attributes: ['id'] }],
    });
    if (upiti.length === 0) {
      return res.status(404).json([]);
    }
    const izabraniUpiti = upiti.map((upit) => ({
      id_nekretnine: upit.Nekretnina.id,
      tekst_upita: upit.tekst,
    }));
    res.status(200).json({ izabraniUpiti });
  } catch (error) {
    console.error('Error fetching queries:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
};

exports.getNextUpiti = async (req, res) => {
  const nekretninaId = parseInt(req.params.id);
  const page = parseInt(req.query.page || '1') - 1;

  try {
    const nekretnina = await Nekretnina.findByPk(nekretninaId, {
      include: [{ model: Upit }],
    });

    if (!nekretnina) {
      return res.status(404).json([]);
    }

    const offset = page * 3;
    const upiti = nekretnina.Upiti.slice(offset, offset + 3);

    if (upiti.length === 0) {
      return res.status(404).json([]);
    }

    res.status(200).json(upiti);
  } catch (error) {
    console.error('Error fetching next queries:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
};