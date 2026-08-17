const { Komentar, Korisnik, Nekretnina } = require('../models');
const validacija = require('../utils/validation');

const KORISNIK_ATRIBUTI = ['id', 'ime', 'prezime', 'username'];

// VAŽNO: vraćamo RAVNU listu SVIH komentara za nekretninu (bez obzira na dubinu
// ugnježdenja). Frontend (detalji.js) sam slaže stablo na osnovu idVezanogKomentara,
// pa ugnježdavanje na serveru ovdje ne samo da je nepotrebno nego i pravi problem:
// Sequelize include može ugnijezditi samo fiksan broj nivoa, a odgovor na odgovor
// (nivo 2+) se onda nikad ne bi vratio klijentu.
exports.getKomentariZaNekretninu = async (req, res) => {
  try {
    const komentari = await Komentar.findAll({
      where: { NekretninaId: req.params.id },
      include: [{ model: Korisnik, attributes: KORISNIK_ATRIBUTI }],
      order: [['createdAt', 'ASC']],
    });
    res.status(200).json(komentari);
  } catch (error) {
    console.error('Greška pri dohvatanju komentara:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
};

exports.createKomentar = async (req, res) => {
  try {
    const tekst = validacija.tekst(req.body.tekst, 'Komentar');
    if (!req.session.userId) {
      return res.status(401).json({ greska: 'Neautorizovan pristup. Molimo prijavite se.' });
    }

    const nekretnina = await Nekretnina.findByPk(req.params.id);
    if (!nekretnina) {
      return res.status(404).json({ greska: 'Nekretnina nije pronađena.' });
    }
    if (nekretnina.kupljeno) {
      return res.status(400).json({ greska: 'Nekretnina je već prodana, komentarisanje više nije moguće.' });
    }

    const komentar = await Komentar.create({
      tekst,
      NekretninaId: req.params.id,
      KorisnikId: req.session.userId,
    });

    const kreiraniKomentar = await Komentar.findByPk(komentar.id, {
      include: [{ model: Korisnik, attributes: KORISNIK_ATRIBUTI }],
    });

    res.status(201).json(kreiraniKomentar);
  } catch (error) {
    validacija.odgovoriNaGresku(error, res, 'Greška pri kreiranju komentara:');
  }
};

exports.createOdgovor = async (req, res) => {
  try {
    const tekst = validacija.tekst(req.body.tekst, 'Odgovor');
    if (!req.session.userId) {
      return res.status(401).json({ greska: 'Neautorizovan pristup. Molimo prijavite se.' });
    }

    const nekretnina = await Nekretnina.findByPk(req.params.id);
    if (!nekretnina) {
      return res.status(404).json({ greska: 'Nekretnina nije pronađena.' });
    }
    if (nekretnina.kupljeno) {
      return res.status(400).json({ greska: 'Nekretnina je već prodana, komentarisanje više nije moguće.' });
    }

    const roditeljKomentar = await Komentar.findByPk(req.params.komentarId);
    if (!roditeljKomentar) {
      return res.status(404).json({ greska: 'Komentar na koji se odgovara ne postoji.' });
    }
    if (String(roditeljKomentar.NekretninaId) !== String(req.params.id)) {
      return res.status(400).json({ greska: 'Komentar ne pripada navedenoj nekretnini.' });
    }

    const odgovor = await Komentar.create({
      tekst,
      NekretninaId: req.params.id,
      KorisnikId: req.session.userId,
      idVezanogKomentara: roditeljKomentar.id,
    });

    const kreiraniOdgovor = await Komentar.findByPk(odgovor.id, {
      include: [{ model: Korisnik, attributes: KORISNIK_ATRIBUTI }],
    });

    res.status(201).json(kreiraniOdgovor);
  } catch (error) {
    validacija.odgovoriNaGresku(error, res, 'Greška pri kreiranju odgovora:');
  }
};

// Admin briše komentar (i sve njegove odgovore, rekurzivno, da ne ostanu osiročeni)
exports.deleteKomentar = async (req, res) => {
  try {
    const komentar = await Komentar.findByPk(req.params.id);
    if (!komentar) {
      return res.status(404).json({ greska: 'Komentar nije pronađen.' });
    }

    await obrisiKomentarSaOdgovorima(komentar.id);

    res.status(200).json({ poruka: 'Komentar je uspješno obrisan.' });
  } catch (error) {
    console.error('Greška pri brisanju komentara:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
};

async function obrisiKomentarSaOdgovorima(id) {
  const djeca = await Komentar.findAll({ where: { idVezanogKomentara: id } });
  for (const dijete of djeca) {
    await obrisiKomentarSaOdgovorima(dijete.id);
  }
  await Komentar.destroy({ where: { id } });
}

exports.getSviKomentari = async (req, res) => {
  try {
    const komentari = await Komentar.findAll({
      include: [
        { model: Korisnik, attributes: KORISNIK_ATRIBUTI },
        { model: Nekretnina, attributes: ['id', 'naziv'] },
      ],
      order: [['createdAt', 'DESC']],
    });
    res.status(200).json(komentari);
  } catch (error) {
    console.error('Greška pri dohvatanju svih komentara:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
};
