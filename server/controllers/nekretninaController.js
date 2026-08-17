const { sequelize, Nekretnina, Upit, Zahtjev, Ponuda, Korisnik, Komentar } = require('../models');

const DOZVOLJENI_TIPOVI = ['Stan', 'Kuća', 'Poslovni prostor'];
const pagination = require('../utils/pagination');

function validirajPodatke(body, { zahtijevajSvaPolja }) {
  const greske = [];
  const { tip_nekretnine, naziv, kvadratura, cijena, lokacija, godina_izgradnje } = body;

  if (zahtijevajSvaPolja || tip_nekretnine !== undefined) {
    if (!DOZVOLJENI_TIPOVI.includes(tip_nekretnine)) {
      greske.push(`Tip nekretnine mora biti jedan od: ${DOZVOLJENI_TIPOVI.join(', ')}.`);
    }
  }
  if (zahtijevajSvaPolja || naziv !== undefined) {
    if (!naziv || !naziv.trim()) greske.push('Naziv je obavezan.');
  }
  if (zahtijevajSvaPolja || kvadratura !== undefined) {
    if (!(kvadratura > 0)) greske.push('Kvadratura mora biti veća od 0.');
  }
  if (zahtijevajSvaPolja || cijena !== undefined) {
    if (!(cijena > 0)) greske.push('Cijena mora biti veća od 0.');
  }
  if (zahtijevajSvaPolja || lokacija !== undefined) {
    if (!lokacija || !lokacija.trim()) greske.push('Lokacija je obavezna.');
  }
  if (godina_izgradnje !== undefined && godina_izgradnje !== null && godina_izgradnje !== '') {
    const godina = parseInt(godina_izgradnje);
    const trenutnaGodina = new Date().getFullYear();
    if (isNaN(godina) || godina < 1800 || godina > trenutnaGodina + 1) {
      greske.push('Godina izgradnje nije validna.');
    }
  }

  return greske;
}

exports.getAll = async (req, res) => {
  try {
    const stranica = pagination.parametri(req.query);
    const opcije = {
      where: { kupljeno: false },
      order: [['datum_objave', 'DESC']],
      ...(stranica.enabled ? { limit: stranica.limit, offset: stranica.offset } : {}),
    };
    if (!stranica.enabled) return res.status(200).json(await Nekretnina.findAll(opcije));
    const { rows, count } = await Nekretnina.findAndCountAll(opcije);
    res.status(200).json(pagination.odgovor(rows, count, stranica));
  } catch (error) {
    console.error('Error fetching properties:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
};

exports.getArhiva = async (req, res) => {
  try {
    const stranica = pagination.parametri(req.query);
    const opcije = {
      where: { kupljeno: true },
      include: [
        { model: Korisnik, attributes: ['id', 'username'] },
        { model: Korisnik, as: 'Kupac', attributes: ['id', 'username'] },
      ],
      order: [['datumKupovine', 'DESC']],
      ...(stranica.enabled ? { limit: stranica.limit, offset: stranica.offset, distinct: true } : {}),
    };
    if (!stranica.enabled) return res.status(200).json(await Nekretnina.findAll(opcije));
    const { rows, count } = await Nekretnina.findAndCountAll(opcije);
    res.status(200).json(pagination.odgovor(rows, count, stranica));
  } catch (error) {
    console.error('Error fetching archive:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
};

exports.getMoje = async (req, res) => {
  try {
    const nekretnine = await Nekretnina.findAll({
      where: { KorisnikId: req.session.userId },
      order: [['id', 'DESC']],
    });
    res.status(200).json(nekretnine);
  } catch (error) {
    console.error('Error fetching own properties:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
};

exports.create = async (req, res) => {
  try {
    const greske = validirajPodatke(req.body, { zahtijevajSvaPolja: true });
    if (greske.length > 0) {
      return res.status(400).json({ greska: greske.join(' ') });
    }

    const { tip_nekretnine, naziv, kvadratura, cijena, tip_grijanja, lokacija, godina_izgradnje, opis } = req.body;

    const nekretnina = await Nekretnina.create({
      tip_nekretnine,
      naziv: naziv.trim(),
      kvadratura,
      cijena,
      tip_grijanja: tip_grijanja || null,
      lokacija: lokacija.trim(),
      godina_izgradnje: godina_izgradnje || null,
      datum_objave: new Date().toISOString().slice(0, 10),
      opis: opis || null,
      KorisnikId: req.session.userId,
    });

    res.status(201).json(nekretnina);
  } catch (error) {
    console.error('Error creating property:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
};

exports.update = async (req, res) => {
  try {
    const nekretnina = await Nekretnina.findByPk(req.params.id);
    if (!nekretnina) {
      return res.status(404).json({ greska: 'Nekretnina nije pronađena.' });
    }

    const jeVlasnik = nekretnina.KorisnikId === req.session.userId;
    if (!req.session.admin && !jeVlasnik) {
      return res.status(403).json({ greska: 'Nemate prava da uređujete ovu nekretninu.' });
    }

    const greske = validirajPodatke(req.body, { zahtijevajSvaPolja: false });
    if (greske.length > 0) {
      return res.status(400).json({ greska: greske.join(' ') });
    }

    const dozvoljenaPolja = ['tip_nekretnine', 'naziv', 'kvadratura', 'cijena', 'tip_grijanja', 'lokacija', 'godina_izgradnje', 'opis'];
    dozvoljenaPolja.forEach((polje) => {
      if (req.body[polje] !== undefined) {
        nekretnina[polje] = typeof req.body[polje] === 'string' ? req.body[polje].trim() : req.body[polje];
      }
    });

    await nekretnina.save();
    res.status(200).json(nekretnina);
  } catch (error) {
    console.error('Error updating property:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
};

exports.remove = async (req, res) => {
  try {
    const nekretnina = await Nekretnina.findByPk(req.params.id);
    if (!nekretnina) {
      return res.status(404).json({ greska: 'Nekretnina nije pronađena.' });
    }

    const jeVlasnik = nekretnina.KorisnikId === req.session.userId;
    if (!req.session.admin && !jeVlasnik) {
      return res.status(403).json({ greska: 'Nemate prava da obrišete ovu nekretninu.' });
    }

    await sequelize.transaction(async (transaction) => {
      // Prvo prekini self-reference, zatim ukloni sve komentare u istoj transakciji.
      await Komentar.update(
        { idVezanogKomentara: null },
        { where: { NekretninaId: nekretnina.id }, transaction }
      );
      await Komentar.destroy({ where: { NekretninaId: nekretnina.id }, transaction });
      await Promise.all([
        Upit.destroy({ where: { NekretninaId: nekretnina.id }, transaction }),
        Zahtjev.destroy({ where: { NekretninaId: nekretnina.id }, transaction }),
        Ponuda.destroy({ where: { NekretninaId: nekretnina.id }, transaction }),
      ]);
      await nekretnina.destroy({ transaction });
    });
    res.status(200).json({ poruka: 'Nekretnina je uspješno obrisana.' });
  } catch (error) {
    console.error('Error deleting property:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
};

exports.getById = async (req, res) => {
  try {
    const nekretnina = await Nekretnina.findByPk(req.params.id, {
      include: [
        { model: Upit, as: 'Upiti', limit: 3, order: [['id', 'DESC']], separate: true },
        { model: Zahtjev, as: 'Zahtjevi' },
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
      include: [
        { model: Upit, as: 'Upiti' },
        { model: Zahtjev, as: 'Zahtjevi' },
        { model: Ponuda, as: 'Ponude' },
      ],
    });
    if (!nekretnina) {
      return res.status(404).json({ greska: 'Nekretnina nije pronađena' });
    }

    const isAdmin = !!req.session.admin;
    const userId = req.session.userId || null;
    const jeVlasnikNekretnine = !!(userId && nekretnina.KorisnikId === userId);

    // Skup id-eva ponuda koje je korisnik napravio ili koje su vezane
    // (direktno ili preko lanca) za neku od korisnikovih ponuda.
    const svePonude = nekretnina.Ponude;
    const dozvoljeniIdPonude = new Set();
    if (!isAdmin && !jeVlasnikNekretnine && userId) {
      svePonude.forEach((p) => {
        if (p.KorisnikId === userId) dozvoljeniIdPonude.add(p.id);
      });
      // Proširi na ponude koje odgovaraju na korisnikove ponude (bilo koje dubine)
      let promijenjeno = true;
      while (promijenjeno) {
        promijenjeno = false;
        svePonude.forEach((p) => {
          if (
            !dozvoljeniIdPonude.has(p.id) &&
            p.idVezanePonude &&
            dozvoljeniIdPonude.has(p.idVezanePonude)
          ) {
            dozvoljeniIdPonude.add(p.id);
            promijenjeno = true;
          }
        });
      }
    }

    // Provjeri da li je bilo koja ponuda u lancu (uzlazno, do korijena) odbijena ili prihvaćena.
    // Ako jeste, na taj lanac se više ne mogu dodavati nove ponude.
    const ponudaById = new Map(svePonude.map((p) => [p.id, p]));
    const lanacZavrsenCache = new Map();
    const jeLanacZavrsen = (ponuda) => {
      if (!ponuda) return false;
      if (lanacZavrsenCache.has(ponuda.id)) return lanacZavrsenCache.get(ponuda.id);
      lanacZavrsenCache.set(ponuda.id, true); // privremeno, za sprječavanje ciklusa
      const roditelj = ponuda.idVezanePonude ? ponudaById.get(ponuda.idVezanePonude) : null;
      const rezultat = !!ponuda.odbijenaPonuda || !!ponuda.prihvacenaPonuda || jeLanacZavrsen(roditelj);
      lanacZavrsenCache.set(ponuda.id, rezultat);
      return rezultat;
    };

    const ponude = svePonude.map((p) => {
      const smijeVidjetiCijenu = isAdmin || jeVlasnikNekretnine || dozvoljeniIdPonude.has(p.id);
      const lanacZavrsen = jeLanacZavrsen(p);
      const bazniPodaci = {
        id: p.id,
        tekst: p.tekst,
        datumPonude: p.datumPonude,
        odbijenaPonuda: p.odbijenaPonuda,
        prihvacenaPonuda: p.prihvacenaPonuda,
        idVezanePonude: p.idVezanePonude,
        KorisnikId: p.KorisnikId,
        mozeOdgovoriti: !lanacZavrsen && (isAdmin || jeVlasnikNekretnine || dozvoljeniIdPonude.has(p.id)),
        mozePrihvatiti: !lanacZavrsen && !p.odbijenaPonuda && (isAdmin || jeVlasnikNekretnine) && !nekretnina.kupljeno,
      };
      if (smijeVidjetiCijenu) {
        bazniPodaci.cijenaPonude = p.cijenaPonude;
      }
      return bazniPodaci;
    });

    res.json({
      jeVlasnik: jeVlasnikNekretnine,
      kupljeno: nekretnina.kupljeno,
      upiti: nekretnina.Upiti,
      zahtjevi: nekretnina.Zahtjevi,
      ponude,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
};
