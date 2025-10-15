const { Nekretnina, Ponuda } = require('../models');

exports.createPonuda = async (req, res) => {
  const { tekst, ponudaCijene, datumPonude, idVezanePonude, odbijenaPonuda } = req.body;
  try {
    const nekretnina = await Nekretnina.findByPk(req.params.id);
    if (!nekretnina) {
      return res.status(404).json({ greska: 'Nekretnina nije pronađena' });
    }
    if (!req.session.userId) {
      return res.status(401).json({ greska: 'Neautorizovan pristup' });
    }
    if (idVezanePonude) {
      const vezanaPonuda = await Ponuda.findByPk(idVezanePonude);
      if (!vezanaPonuda) {
        return res.status(400).json({ greska: 'Vezana ponuda nije pronađena' });
      }
      if (vezanaPonuda.odbijenaPonuda) {
        return res.status(400).json({ greska: 'Nove ponude se ne mogu dodavati na odbijene ponude' });
      }
      const isAdmin = req.session.admin;
      const isOwner = vezanaPonuda.KorisnikId === req.session.userId;
      if (!isAdmin && !isOwner) {
        return res.status(403).json({ greska: 'Nemate prava za dodavanje ponude na ovu vezanu ponudu' });
      }
    }
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