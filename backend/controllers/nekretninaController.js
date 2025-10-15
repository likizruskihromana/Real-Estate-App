const { Nekretnina, Upit, Zahtjev, Ponuda } = require('../models');

exports.getAll = async (req, res) => {
  try {
    const nekretnine = await Nekretnina.findAll();
    res.status(200).json(nekretnine);
  } catch (error) {
    console.error('Error fetching properties:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
};

exports.getById = async (req, res) => {
  try {
    const nekretnina = await Nekretnina.findByPk(req.params.id, {
      include: [
        { model: Upit, limit: 3, order: [['id', 'DESC']] },
        { model: Zahtjev },
        { model: Ponuda },
      ],
    });

    if (!nekretnina) {
      return res.status(404).json({ greska: 'Nekretnina nije pronađena' });
    }

    res.status(200).json(nekretnina);
  } catch (error) {
    console.error('Error fetching property details:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
};

exports.getTop5 = async (req, res) => {
  const lokacija = req.query.lokacija;

  try {
    const nekretnine = await Nekretnina.findAll({
      where: { lokacija },
      order: [['datum_objave', 'DESC']],
      limit: 5,
    });

    res.status(200).json(nekretnine);
  } catch (error) {
    console.error('Error fetching top 5 properties:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
};

exports.getInteresovanja = async (req, res) => {
  try {
    const nekretnina = await Nekretnina.findByPk(req.params.id, {
      include: [Upit, Zahtjev, Ponuda],
    });
    if (!nekretnina) {
      return res.status(404).json({ greska: 'Nekretnina nije pronađena' });
    }
    let interesovanja = {
      upiti: nekretnina.Upiti,
      zahtjevi: nekretnina.Zahtjevi,
      ponude: nekretnina.Ponude,
    };
    if (!req.session.username || !req.session.admin) {
      interesovanja.ponude = interesovanja.ponude.map((p) => ({
        tekst: p.tekst,
        odbijenaPonuda: p.odbijenaPonuda,
      }));
    }
    res.json(interesovanja);
  } catch (error) {
    console.error(error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
};