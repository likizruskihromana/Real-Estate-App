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
  const { odobren, addToTekst } = req.body;
  try {
    if (!req.session.admin) {
      return res.status(403).json({ greska: 'Samo admin može odobriti zahtjev.' });
    }

    const zahtjev = await Zahtjev.findByPk(req.params.zid);

    if (!zahtjev) {
      return res.status(404).json({ greska: 'Zahtjev nije pronađen.' });
    }

    zahtjev.odobren = odobren;
    if (!odobren && addToTekst) {
      zahtjev.tekst += ` ODGOVOR ADMINA: ${addToTekst}`;
    }

    await zahtjev.save();
    res.status(200).json(zahtjev);
  } catch (error) {
    console.error(error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
};