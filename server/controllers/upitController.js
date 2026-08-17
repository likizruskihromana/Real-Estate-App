const { Korisnik, Nekretnina, Upit } = require('../models');
const validacija = require('../utils/validation');

exports.createUpit = async (req, res) => {
  if (!req.session.username) {
    return res.status(401).json({ greska: 'Neautorizovan pristup' });
  }
  try {
    const nekretnina_id = validacija.pozitivanId(req.body.nekretnina_id, 'ID nekretnine');
    const tekst_upita = validacija.tekst(req.body.tekst_upita, 'Tekst upita');
    const korisnik = await Korisnik.findOne({ where: { username: req.session.username } });
    if (!korisnik) {
      return res.status(401).json({ greska: 'Korisnik nije pronađen' });
    }
    const nekretnina = await Nekretnina.findByPk(nekretnina_id, {
      include: [{ model: Upit, as: 'Upiti' }],
    });
    if (!nekretnina) {
      return res.status(400).json({ greska: `Nekretnina sa id-em ${nekretnina_id} ne postoji` });
    }
    if (nekretnina.kupljeno) {
      return res.status(400).json({ greska: 'Nekretnina je već prodana, upiti više nisu mogući.' });
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
    validacija.odgovoriNaGresku(error, res, 'Error processing query:');
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
      return res.status(404).json({ izabraniUpiti: [] });
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

exports.odgovoriNaUpit = async (req, res) => {
  try {
    const odgovor = validacija.tekst(req.body.odgovor, 'Odgovor');
    if (!req.session.userId) {
      return res.status(401).json({ greska: 'Neautorizovan pristup. Molimo prijavite se.' });
    }
    const upit = await Upit.findByPk(validacija.pozitivanId(req.params.id));
    if (!upit) {
      return res.status(404).json({ greska: 'Upit nije pronađen.' });
    }

    const nekretnina = await Nekretnina.findByPk(upit.NekretninaId);
    const jeVlasnikNekretnine = nekretnina && nekretnina.KorisnikId === req.session.userId;

    if (!req.session.admin && !jeVlasnikNekretnine) {
      return res.status(403).json({ greska: 'Samo vlasnik nekretnine ili admin mogu odgovoriti na upit.' });
    }

    upit.odgovor = odgovor;
    await upit.save();

    res.status(200).json(upit);
  } catch (error) {
    validacija.odgovoriNaGresku(error, res, 'Error answering query:');
  }
};

exports.getNextUpiti = async (req, res) => {
  const nekretninaId = parseInt(req.params.id);
  // page=0 (posljednja 3 upita) je već pokriven rutom GET /nekretnina/:id.
  // page=1 znači "sljedeća 3 upita" nakon te prve grupe, pa offset = page*3.
  const page = parseInt(req.query.page || '1');

  try {
    const nekretnina = await Nekretnina.findByPk(nekretninaId);
    if (!nekretnina) {
      return res.status(404).json([]);
    }

    const offset = page * 3;
    const upiti = await Upit.findAll({
      where: { NekretninaId: nekretninaId },
      order: [['id', 'DESC']],
      offset,
      limit: 3,
    });

    if (upiti.length === 0) {
      return res.status(404).json([]);
    }

    res.status(200).json(upiti);
  } catch (error) {
    console.error('Error fetching next queries:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
};
