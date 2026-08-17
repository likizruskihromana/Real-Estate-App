const { Op } = require('sequelize');
const { sequelize, Nekretnina, Ponuda, Korisnik } = require('../models');
const validacija = require('../utils/validation');
const pagination = require('../utils/pagination');

exports.createPonuda = async (req, res) => {
  try {
    const tekst = validacija.tekst(req.body.tekst, 'Tekst ponude');
    const ponudaCijene = validacija.pozitivanBroj(req.body.ponudaCijene, 'Cijena ponude');
    const datumPonude = req.body.datumPonude;
    const idVezanePonude = req.body.idVezanePonude
      ? validacija.pozitivanId(req.body.idVezanePonude, 'ID vezane ponude')
      : null;
    const odbijenaPonuda = req.body.odbijenaPonuda === undefined
      ? false
      : validacija.boolean(req.body.odbijenaPonuda, 'Odbijena ponuda');
    if (!datumPonude || Number.isNaN(Date.parse(datumPonude))) {
      return res.status(400).json({ greska: 'Datum ponude nije validan.' });
    }
    if (!req.session.userId) {
      return res.status(401).json({ greska: 'Neautorizovan pristup. Molimo prijavite se.' });
    }

    const nekretnina = await Nekretnina.findByPk(req.params.id);
    if (!nekretnina) {
      return res.status(404).json({ greska: 'Nekretnina nije pronađena' });
    }

    if (nekretnina.kupljeno) {
      return res.status(400).json({ greska: 'Nekretnina je već prodana, nove ponude nisu moguće.' });
    }

    // Pravilo: Korisnik ne može postaviti ponudu na vlastitu nekretninu
    if (nekretnina.KorisnikId === req.session.userId && !req.session.admin) {
      return res.status(403).json({ greska: 'Ne možete postaviti ponudu na vlastitu nekretninu.' });
    }

    if (idVezanePonude) {
      const vezanaPonuda = await Ponuda.findByPk(idVezanePonude);
      if (!vezanaPonuda) {
        return res.status(400).json({ greska: 'Vezana ponuda nije pronađena' });
      }
      if (vezanaPonuda.NekretninaId !== nekretnina.id) {
        return res.status(400).json({ greska: 'Vezana ponuda ne pripada ovoj nekretnini.' });
      }

      const isAdmin = req.session.admin;
      const jeVlasnikNekretnine = nekretnina.KorisnikId === req.session.userId;

      // Učitaj sve ponude za nekretninu da bismo mogli hodati kroz cijeli lanac
      const svePonude = await Ponuda.findAll({ where: { NekretninaId: nekretnina.id } });
      const ponudaById = new Map(svePonude.map((p) => [p.id, p]));

      // Provjeri da li je bilo koja ponuda u lancu (uzlazno) odbijena ili prihvaćena
      let cur = vezanaPonuda;
      let lanacZavrsen = false;
      let korisnikUcestvuje = false;
      const posjeceni = new Set();
      while (cur && !posjeceni.has(cur.id)) {
        posjeceni.add(cur.id);
        if (cur.odbijenaPonuda || cur.prihvacenaPonuda) lanacZavrsen = true;
        if (cur.KorisnikId === req.session.userId) korisnikUcestvuje = true;
        cur = cur.idVezanePonude ? ponudaById.get(cur.idVezanePonude) : null;
      }

      if (lanacZavrsen) {
        return res.status(400).json({ greska: 'Na ovaj lanac ponuda se više ne mogu dodavati nove ponude.' });
      }
      // Vlasnik nekretnine (kao "prodavac") uvijek smije odgovoriti na ponudu
      // vezanu za svoju nekretninu, čak i ako do sad nije bio dio tog lanca.
      if (!isAdmin && !jeVlasnikNekretnine && !korisnikUcestvuje) {
        return res.status(403).json({ greska: 'Nemate prava za dodavanje ponude na ovu vezanu ponudu' });
      }
    }

    const ponuda = await Ponuda.create({
      tekst,
      cijenaPonude: ponudaCijene,
      datumPonude,
      odbijenaPonuda: !!odbijenaPonuda,
      idVezanePonude,
      NekretninaId: nekretnina.id,
      KorisnikId: req.session.userId,
    });
    res.status(201).json(ponuda);
  } catch (error) {
    validacija.odgovoriNaGresku(error, res, 'Greška prilikom kreiranja ponude:');
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

exports.getMojePonude = async (req, res) => {
  try {
    const stranica = pagination.parametri(req.query);
    const opcije = {
      where: { KorisnikId: req.session.userId },
      include: [{ model: Nekretnina, attributes: ['id', 'naziv', 'kupljeno'] }],
      order: [['id', 'DESC']],
      ...(stranica.enabled ? { limit: stranica.limit, offset: stranica.offset, distinct: true } : {}),
    };
    if (!stranica.enabled) return res.status(200).json(await Ponuda.findAll(opcije));
    const { rows, count } = await Ponuda.findAndCountAll(opcije);
    res.status(200).json(pagination.odgovor(rows, count, stranica));
  } catch (error) {
    console.error('Error fetching own offers:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
};

exports.updatePonuda = async (req, res) => {
  try {
    const odbijenaPonuda = validacija.boolean(req.body.odbijenaPonuda, 'Odbijena ponuda');
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

    ponuda.odbijenaPonuda = odbijenaPonuda;

    await ponuda.save();
    res.status(200).json(ponuda);
  } catch (error) {
    validacija.odgovoriNaGresku(error, res, 'Greška prilikom ažuriranja ponude:');
  }
};

// Prihvatanje ponude: nekretnina postaje "kupljena", sve ostale aktivne ponude
// na istu nekretninu se automatski odbijaju, a dalje komentarisanje/upiti/
// zahtjevi/ponude se zatvaraju (provjerava se u ostalim kontrolerima).
exports.prihvatiPonudu = async (req, res) => {
  let rezultat;
  try {
    if (!req.session.userId) {
      return res.status(401).json({ greska: 'Neautorizovan pristup. Molimo prijavite se.' });
    }

    await sequelize.transaction(async (transaction) => {
      const ponuda = await Ponuda.findByPk(req.params.id, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (!ponuda) {
        const error = new Error('Ponuda nije pronađena.');
        error.status = 404;
        throw error;
      }

      const nekretnina = await Nekretnina.findByPk(ponuda.NekretninaId, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (!nekretnina) {
        const error = new Error('Nekretnina nije pronađena.');
        error.status = 404;
        throw error;
      }

      const jeVlasnikNekretnine = nekretnina.KorisnikId === req.session.userId;
      if (!req.session.admin && !jeVlasnikNekretnine) {
        const error = new Error('Samo vlasnik nekretnine ili admin mogu prihvatiti ponudu.');
        error.status = 403;
        throw error;
      }
      if (nekretnina.kupljeno) {
        const error = new Error('Nekretnina je već prodana.');
        error.status = 400;
        throw error;
      }
      if (ponuda.odbijenaPonuda) {
        const error = new Error('Ne možete prihvatiti odbijenu ponudu.');
        error.status = 400;
        throw error;
      }

      ponuda.prihvacenaPonuda = true;
      await ponuda.save({ transaction });
      await Ponuda.update(
        { odbijenaPonuda: true },
        { transaction, where: { NekretninaId: nekretnina.id, id: { [Op.ne]: ponuda.id } } }
      );

      nekretnina.kupljeno = true;
      nekretnina.datumKupovine = new Date();
      nekretnina.prodajnaCijena = ponuda.cijenaPonude;
      nekretnina.kupacId = ponuda.KorisnikId;
      await nekretnina.save({ transaction });
      rezultat = { nekretnina, ponuda };
    });

    res.status(200).json({
      poruka: 'Ponuda je prihvaćena, nekretnina je označena kao prodana.',
      ...rezultat,
    });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ greska: error.message });
    }
    console.error('Greška prilikom prihvatanja ponude:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
};
