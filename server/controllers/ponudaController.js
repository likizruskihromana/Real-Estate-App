const { Nekretnina, Ponuda } = require('../models');

exports.createPonuda = async (req, res) => {
  const { tekst, ponudaCijene, datumPonude, idVezanePonude, odbijenaPonuda } = req.body;
  try {
    if (!req.session.userId) {
      return res.status(401).json({ greska: 'Neautorizovan pristup. Molimo prijavite se.' });
    }

    const nekretnina = await Nekretnina.findByPk(req.params.id);
    if (!nekretnina) {
      return res.status(404).json({ greska: 'Nekretnina nije pronađena' });
    }

    // Pravilo: Korisnik ne može postaviti ponudu na vlastitu nekretninu
    if (nekretnina.KorisnikId === req.session.userId && !req.session.admin) {
      return res.status(403).json({ greska: 'Ne možete postaviti ponudu na vlastitu nekretninu.' });
    }

    // ... ostatak vaše postojeće logike za vezane ponude ...
    
    const ponuda = await Ponuda.create({
      tekst,
      cijenaPonude: ponudaCijene,
      datumPonude,
      odbijenaPonuda,
      idVezanePonude,
      NekretninaId: nekretnina.id,
      KorisnikId: req.session.userId,
    });
    res.status(201).json(ponuda);
  } catch (error) {
    console.error('Greška prilikom kreiranja ponude:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
};

exports.getAll = async (req, res) => {
  try {
    const ponude = await Ponuda.findAll();
    res.status(200).json(ponude);
  } catch (error) {
    console.error('Error fetching properties:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
};
exports.updatePonuda = async (req, res) => {
  const { odbijenaPonuda } = req.body;
  try {
    if (!req.session.userId) {
      return res.status(401).json({ greska: 'Neautorizovan pristup. Molimo prijavite se.' });
    }

    const ponuda = await Ponuda.findByPk(req.params.id);
    if (!ponuda) {
      return res.status(404).json({ greska: 'Ponuda nije pronađena.' });
    }

    const nekretnina = await Nekretnina.findByPk(ponuda.NekretninaId);
    if (!nekretnina) {
      return res.status(404).json({ greska: 'Nekretnina nije pronađena.' });
    }

    const jeVlasnikNekretnine = nekretnina.KorisnikId === req.session.userId;
    const isAdmin = req.session.admin;

    // Pravilo: Samo vlasnik nekretnine (ili admin) može prihvatiti ili odbiti ponudu
    if (!isAdmin && !jeVlasnikNekretnine) {
      return res.status(403).json({ greska: 'Možete prihvatati ili odbijati ponude samo za nekretnine koje ste vi objavili.' });
    }

    if (odbijenaPonuda !== undefined) {
      ponuda.odbijenaPonuda = odbijenaPonuda;
    }

    await ponuda.save();
    res.status(200).json(ponuda);
  } catch (error) {
    console.error('Greška prilikom ažuriranja ponude:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
};