const { Nekretnina, Zahtjev } = require('../models');

exports.createZahtjev = async (req, res) => {
  const { tekst, trazeniDatum } = req.body;
  try {
    if (!trazeniDatum || isNaN(Date.parse(trazeniDatum)) || new Date(trazeniDatum) < new Date()) {
      return res.status(400).json({ greska: 'Datum pregleda nije validan. Molimo unesite budući datum.' });
    }
    const nekretnina = await Nekretnina.findByPk(req.params.id);
    if (!nekretnina) {
      return res.status(404).json({ greska: 'Nekretnina nije pronađena.' });
    }
    if (!req.session.userId) {
      return res.status(401).json({ greska: 'Neautorizovan pristup. Molimo prijavite se.' });
    }
    const zahtjev = await Zahtjev.create({
      tekst,
      trazeniDatum,
      NekretninaId: nekretnina.id,
      KorisnikId: req.session.userId,
    });
    res.status(201).json(zahtjev);
  } catch (error) {
    console.error('Greška prilikom kreiranja zahtjeva:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
};

exports.updateZahtjev = async (req, res) => {
  const { odobren, odgovor, addToTekst } = req.body;
  try {
    if (!req.session.userId) {
      return res.status(401).json({ greska: 'Neautorizovan pristup. Molimo prijavite se.' });
    }

    const zahtjev = await Zahtjev.findByPk(req.params.zid);
    if (!zahtjev) {
      return res.status(404).json({ greska: 'Zahtjev nije pronađen.' });
    }

    const nekretnina = await Nekretnina.findByPk(zahtjev.NekretninaId);
    const jeVlasnikNekretnine = nekretnina && nekretnina.KorisnikId === req.session.userId;

    if (!req.session.admin && !jeVlasnikNekretnine) {
      return res.status(403).json({ greska: 'Samo vlasnik nekretnine ili admin mogu odgovoriti na zahtjev.' });
    }

    if (odobren !== undefined) zahtjev.odobren = odobren;
    if (odgovor !== undefined) zahtjev.odgovor = odgovor;
    // Zadržano radi kompatibilnosti sa starijim pozivima
    if (!odobren && addToTekst) {
      zahtjev.odgovor = addToTekst;
    }

    await zahtjev.save();
    res.status(200).json(zahtjev);
  } catch (error) {
    console.error(error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
};