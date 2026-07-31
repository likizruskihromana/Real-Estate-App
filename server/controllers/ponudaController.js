const { Nekretnina, Ponuda, Korisnik } = require('../models');

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

exports.getMojePonude = async (req, res) => {
  try {
    const ponude = await Ponuda.findAll({
      where: { KorisnikId: req.session.userId },
      include: [{ model: Nekretnina, attributes: ['id', 'naziv', 'kupljeno'] }],
      order: [['id', 'DESC']],
    });
    res.status(200).json(ponude);
  } catch (error) {
    console.error('Error fetching own offers:', error);
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

// Prihvatanje ponude: nekretnina postaje "kupljena", sve ostale aktivne ponude
// na istu nekretninu se automatski odbijaju, a dalje komentarisanje/upiti/
// zahtjevi/ponude se zatvaraju (provjerava se u ostalim kontrolerima).
exports.prihvatiPonudu = async (req, res) => {
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
    if (!req.session.admin && !jeVlasnikNekretnine) {
      return res.status(403).json({ greska: 'Samo vlasnik nekretnine ili admin mogu prihvatiti ponudu.' });
    }

    if (nekretnina.kupljeno) {
      return res.status(400).json({ greska: 'Nekretnina je već prodana.' });
    }
    if (ponuda.odbijenaPonuda) {
      return res.status(400).json({ greska: 'Ne možete prihvatiti odbijenu ponudu.' });
    }

    ponuda.prihvacenaPonuda = true;
    await ponuda.save();

    // Sve ostale (ne-odbijene) ponude na ovu nekretninu se automatski odbijaju
    await Ponuda.update(
      { odbijenaPonuda: true },
      { where: { NekretninaId: nekretnina.id, id: { [require('sequelize').Op.ne]: ponuda.id } } }
    );

    nekretnina.kupljeno = true;
    nekretnina.datumKupovine = new Date();
    nekretnina.prodajnaCijena = ponuda.cijenaPonude;
    nekretnina.kupacId = ponuda.KorisnikId;
    await nekretnina.save();

    res.status(200).json({ poruka: 'Ponuda je prihvaćena, nekretnina je označena kao prodana.', nekretnina, ponuda });
  } catch (error) {
    console.error('Greška prilikom prihvatanja ponude:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
};
