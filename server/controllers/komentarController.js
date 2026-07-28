const { Komentar, Korisnik } = require('../models');

exports.getKomentariZaNekretninu = async (req, res) => {
  try {
    const komentari = await Komentar.findAll({
      where: { NekretninaId: req.params.id },
      include: [
        { 
          model: Korisnik, 
          attributes: ['id', 'korisnickoIme', 'ime', 'prezime'] 
        },
        { 
          model: Komentar, 
          as: 'Odgovori', // <--- OVO JE KLJUČNO DA SE POVUKU PODKOMENTARI
          include: [
            { 
              model: Korisnik, 
              attributes: ['id', 'korisnickoIme', 'ime', 'prezime'] 
            }
          ]
        }
      ],
      order: [['createdAt', 'ASC']]
    });
    res.status(200).json(komentari);
  } catch (error) {
    console.error('Greška pri dohvatanju komentara:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
};

exports.createKomentar = async (req, res) => {
  const { tekst } = req.body;
  try {
    if (!req.session.userId) {
      return res.status(401).json({ greska: 'Neautorizovan pristup. Molimo prijavite se.' });
    }

    const komentar = await Komentar.create({
      tekst,
      NekretninaId: req.params.id,
      KorisnikId: req.session.userId
    });

    const kreiraniKomentar = await Komentar.findByPk(komentar.id, {
      include: [{ model: Korisnik, attributes: ['id', 'korisnickoIme', 'ime', 'prezime'] }]
    });

    res.status(201).json(kreiraniKomentar);
  } catch (error) {
    console.error('Greška pri kreiranju komentara:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
};

exports.createOdgovorNaKomentar = async (req, res) => {
  try {
    const { tekst } = req.body;
    // Sigurno preuzimamo komentar_id bez obzira kako je nazvan u ruti
    const roditeljId = req.params.komentar_id || req.params.id; 
    
    const korisnikId = req.session.userId; 
    if (!korisnikId) {
      return res.status(401).json({ greska: 'Neautorizovan pristup.' });
    }

    const glavniKomentar = await Komentar.findByPk(roditeljId);
    if (!glavniKomentar) {
      return res.status(404).json({ greska: 'Komentar na koji se odgovara ne postoji.' });
    }

    const noviOdgovor = await Komentar.create({
      tekst,
      KorisnikId: korisnikId,
      NekretninaId: glavniKomentar.NekretninaId,
      idVezanogKomentara: roditeljId
    });

    const kreiraniOdgovor = await Komentar.findByPk(noviOdgovor.id, {
      include: [{ model: Korisnik, attributes: ['id', 'korisnickoIme', 'ime', 'prezime'] }]
    });

    res.status(201).json(kreiraniOdgovor);
  } catch (error) {
    console.error('Greška pri kreiranju odgovora:', error);
    res.status(500).json({ greska: error.message });
  }
};