const { Nekretnina, SlikaNekretnine, OmiljenaNekretnina, SacuvanaPretraga } = require('../models');
const validacija = require('../utils/validation');

const DOZVOLJENI_TIPOVI = new Set(['Stan', 'Kuća', 'Poslovni prostor']);
const DOZVOLJENA_SORTIRANJA = new Set(['najnovije', 'cijena-asc', 'cijena-desc', 'kvadratura-desc']);

exports.getAll = async (req, res) => {
  try {
    const [zapisi, pretrage] = await Promise.all([
      OmiljenaNekretnina.findAll({
        where: { KorisnikId: req.session.userId },
        include: [{
          model: Nekretnina,
          include: [{
            model: SlikaNekretnine,
            as: 'Slike',
            separate: true,
            order: [['glavna', 'DESC'], ['redoslijed', 'ASC'], ['id', 'ASC']],
          }],
        }],
        order: [['createdAt', 'DESC']],
      }),
      SacuvanaPretraga.findAll({ where: { KorisnikId: req.session.userId }, order: [['createdAt', 'DESC']] }),
    ]);
    res.json({
      omiljene: zapisi.map((zapis) => zapis.Nekretnina).filter(Boolean),
      pretrage,
    });
  } catch (error) {
    console.error('Učitavanje sačuvanih stavki nije uspjelo:', error);
    res.status(500).json({ greska: 'Sačuvane stavke trenutno nisu dostupne.' });
  }
};

exports.addOmiljena = async (req, res) => {
  try {
    const id = validacija.pozitivanId(req.params.id, 'ID nekretnine');
    const nekretnina = await Nekretnina.findByPk(id);
    if (!nekretnina) return res.status(404).json({ greska: 'Nekretnina nije pronađena.' });
    const [zapis, kreiran] = await OmiljenaNekretnina.findOrCreate({
      where: { KorisnikId: req.session.userId, NekretninaId: id },
      defaults: { KorisnikId: req.session.userId, NekretninaId: id },
    });
    res.status(kreiran ? 201 : 200).json(zapis);
  } catch (error) {
    validacija.odgovoriNaGresku(error, res, 'Dodavanje omiljene nekretnine nije uspjelo:');
  }
};

exports.removeOmiljena = async (req, res) => {
  try {
    const id = validacija.pozitivanId(req.params.id, 'ID nekretnine');
    await OmiljenaNekretnina.destroy({ where: { KorisnikId: req.session.userId, NekretninaId: id } });
    res.json({ poruka: 'Nekretnina je uklonjena iz omiljenih.' });
  } catch (error) {
    validacija.odgovoriNaGresku(error, res, 'Uklanjanje omiljene nekretnine nije uspjelo:');
  }
};

exports.createPretraga = async (req, res) => {
  try {
    const broj = await SacuvanaPretraga.count({ where: { KorisnikId: req.session.userId } });
    if (broj >= 10) return res.status(400).json({ greska: 'Možete sačuvati najviše 10 pretraga.' });
    const naziv = validacija.tekst(req.body.naziv, 'Naziv pretrage', { max: 100 });
    const lokacija = req.body.lokacija ? validacija.tekst(req.body.lokacija, 'Lokacija', { max: 255 }) : null;
    const tip = req.body.tip || null;
    if (tip && !DOZVOLJENI_TIPOVI.has(tip)) return res.status(400).json({ greska: 'Tip nekretnine nije validan.' });
    const maxCijena = req.body.maxCijena ? validacija.pozitivanBroj(req.body.maxCijena, 'Maksimalna cijena') : null;
    const sortiranje = DOZVOLJENA_SORTIRANJA.has(req.body.sortiranje) ? req.body.sortiranje : 'najnovije';
    const pretraga = await SacuvanaPretraga.create({ naziv, lokacija, tip, maxCijena, sortiranje, KorisnikId: req.session.userId });
    res.status(201).json(pretraga);
  } catch (error) {
    validacija.odgovoriNaGresku(error, res, 'Čuvanje pretrage nije uspjelo:');
  }
};

exports.removePretraga = async (req, res) => {
  try {
    const id = validacija.pozitivanId(req.params.id, 'ID pretrage');
    const obrisano = await SacuvanaPretraga.destroy({ where: { id, KorisnikId: req.session.userId } });
    if (!obrisano) return res.status(404).json({ greska: 'Sačuvana pretraga nije pronađena.' });
    res.json({ poruka: 'Sačuvana pretraga je obrisana.' });
  } catch (error) {
    validacija.odgovoriNaGresku(error, res, 'Brisanje sačuvane pretrage nije uspjelo:');
  }
};
