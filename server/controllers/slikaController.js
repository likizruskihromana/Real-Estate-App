const fs = require('fs/promises');
const path = require('path');
const { sequelize, Nekretnina, SlikaNekretnine } = require('../models');
const { uploadsDir } = require('../middleware/upload');
const { processImage, removeImageFiles } = require('../utils/imageVariants');

async function nadjiNekretninuSaPristupom(req, res) {
  const nekretnina = await Nekretnina.findByPk(req.params.id);
  if (!nekretnina) {
    res.status(404).json({ greska: 'Nekretnina nije pronađena.' });
    return null;
  }
  if (!req.session.admin && nekretnina.KorisnikId !== req.session.userId) {
    res.status(403).json({ greska: 'Nemate pravo upravljati fotografijama ove nekretnine.' });
    return null;
  }
  return nekretnina;
}

async function ukloniDatoteku(filename) {
  if (!filename) return;
  const punaPutanja = path.resolve(uploadsDir, filename);
  if (!punaPutanja.startsWith(path.resolve(uploadsDir) + path.sep)) return;
  await fs.unlink(punaPutanja).catch((error) => {
    if (error.code !== 'ENOENT') console.error('Brisanje fotografije nije uspjelo:', error);
  });
}

async function provjeriSadrzajDatoteke(filename, prijavljeniMime) {
  const punaPutanja = path.resolve(uploadsDir, filename);
  const handle = await fs.open(punaPutanja, 'r');
  try {
    const buffer = Buffer.alloc(12);
    const { bytesRead } = await handle.read(buffer, 0, buffer.length, 0);
    if (bytesRead >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return prijavljeniMime === 'image/jpeg';
    if (bytesRead >= 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return prijavljeniMime === 'image/png';
    if (bytesRead >= 12 && buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') return prijavljeniMime === 'image/webp';
    return false;
  } finally {
    await handle.close();
  }
}

exports.create = async (req, res) => {
  try {
    const nekretnina = await nadjiNekretninuSaPristupom(req, res);
    if (!nekretnina) {
      if (req.file) await ukloniDatoteku(req.file.filename);
      return;
    }
    if (!req.file) return res.status(400).json({ greska: 'Fotografija je obavezna.' });
    if (!await provjeriSadrzajDatoteke(req.file.filename, req.file.mimetype)) {
      await ukloniDatoteku(req.file.filename);
      return res.status(400).json({ greska: 'Sadržaj datoteke ne odgovara dozvoljenom formatu fotografije.' });
    }

    const brojSlika = await SlikaNekretnine.count({ where: { NekretninaId: nekretnina.id } });
    if (brojSlika >= 8) {
      await ukloniDatoteku(req.file.filename);
      return res.status(400).json({ greska: 'Jedna nekretnina može imati najviše 8 fotografija.' });
    }

    const variants = await processImage(req.file.filename);
    const slika = await sequelize.transaction(async (transaction) => {
      const jePrva = brojSlika === 0;
      return SlikaNekretnine.create({
        url: `/uploads/nekretnine/${req.file.filename}`,
        filename: req.file.filename,
        originalName: path.basename(req.file.originalname).slice(0, 255),
        mimeType: req.file.mimetype,
        velicina: req.file.size,
        ...variants,
        glavna: jePrva,
        redoslijed: brojSlika,
        NekretninaId: nekretnina.id,
      }, { transaction });
    });
    res.status(201).json(slika);
  } catch (error) {
    if (req.file) {
      const stem = path.parse(req.file.filename).name;
      await Promise.all([req.file.filename, `${stem}-thumbnail.webp`, `${stem}-medium.webp`, `${stem}-large.webp`].map(ukloniDatoteku));
    }
    console.error('Upload fotografije nije uspio:', error);
    res.status(500).json({ greska: 'Fotografiju trenutno nije moguće sačuvati.' });
  }
};

exports.setGlavna = async (req, res) => {
  try {
    const nekretnina = await nadjiNekretninuSaPristupom(req, res);
    if (!nekretnina) return;
    const slika = await SlikaNekretnine.findOne({ where: { id: req.params.slikaId, NekretninaId: nekretnina.id } });
    if (!slika) return res.status(404).json({ greska: 'Fotografija nije pronađena.' });
    await sequelize.transaction(async (transaction) => {
      await SlikaNekretnine.update({ glavna: false }, { where: { NekretninaId: nekretnina.id }, transaction });
      slika.glavna = true;
      await slika.save({ transaction });
    });
    res.json(slika);
  } catch (error) {
    console.error('Postavljanje glavne fotografije nije uspjelo:', error);
    res.status(500).json({ greska: 'Glavnu fotografiju trenutno nije moguće postaviti.' });
  }
};

exports.remove = async (req, res) => {
  try {
    const nekretnina = await nadjiNekretninuSaPristupom(req, res);
    if (!nekretnina) return;
    const slika = await SlikaNekretnine.findOne({ where: { id: req.params.slikaId, NekretninaId: nekretnina.id } });
    if (!slika) return res.status(404).json({ greska: 'Fotografija nije pronađena.' });

    const bilaGlavna = slika.glavna;
    await slika.destroy();
    await removeImageFiles(slika);
    if (bilaGlavna) {
      const sljedeca = await SlikaNekretnine.findOne({ where: { NekretninaId: nekretnina.id }, order: [['redoslijed', 'ASC'], ['id', 'ASC']] });
      if (sljedeca) {
        sljedeca.glavna = true;
        await sljedeca.save();
      }
    }
    res.json({ poruka: 'Fotografija je obrisana.' });
  } catch (error) {
    console.error('Brisanje fotografije nije uspjelo:', error);
    res.status(500).json({ greska: 'Fotografiju trenutno nije moguće obrisati.' });
  }
};

exports.ukloniDatoteku = ukloniDatoteku;
