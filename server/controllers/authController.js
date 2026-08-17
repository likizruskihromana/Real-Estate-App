const { Korisnik } = require('../models');
const bcrypt = require('bcrypt');
const config = require('../config/env');
const validacija = require('../utils/validation');

function regenerateSession(req) {
  return new Promise((resolve, reject) => {
    req.session.regenerate((error) => (error ? reject(error) : resolve()));
  });
}

function postaviKorisnikaUSesiju(req, korisnik) {
  req.session.username = korisnik.username;
  req.session.userId = korisnik.id;
  req.session.admin = korisnik.admin;
}

exports.register = async (req, res) => {
  const { ime, prezime, username, password } = req.body;

  try {
    if (
      typeof ime !== 'string' || !ime.trim() ||
      typeof prezime !== 'string' || !prezime.trim() ||
      typeof username !== 'string' || !username.trim() ||
      typeof password !== 'string' || !password
    ) {
      return res.status(400).json({ greska: 'Sva polja su obavezna.' });
    }

    const cistUsername = username.trim();
    if (cistUsername.length < 3 || cistUsername.length > 50 || /\s/.test(cistUsername)) {
      return res.status(400).json({ greska: 'Korisničko ime mora imati 3–50 karaktera i ne smije sadržavati razmake.' });
    }

    if (password.length < 6 || password.length > 128) {
      return res.status(400).json({ greska: 'Lozinka mora imati između 6 i 128 karaktera.' });
    }

    const postojeci = await Korisnik.findOne({ where: { username: cistUsername } });
    if (postojeci) {
      return res.status(409).json({ greska: 'To korisničko ime je već zauzeto.' });
    }

    const hashedPassword = await bcrypt.hash(password, config.bcrypt.rounds);

    // admin se namjerno ne prima iz req.body - svaki novi nalog je običan korisnik
    const korisnik = await Korisnik.create({
      ime: ime.trim(),
      prezime: prezime.trim(),
      username: cistUsername,
      password: hashedPassword,
      admin: false,
    });

    // Novi ID sesije sprječava session-fixation i kod automatske prijave.
    await regenerateSession(req);
    postaviKorisnikaUSesiju(req, korisnik);

    res.status(201).json({ poruka: 'Uspješna registracija' });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ greska: 'To korisničko ime je već zauzeto.' });
    }
    validacija.odgovoriNaGresku(error, res, 'Register error:');
  }
};

exports.login = async (req, res) => {
  const { username, password } = req.body;
  try {
    if (
      typeof username !== 'string' || typeof password !== 'string' ||
      !username.trim() || !password || username.length > 50 || password.length > 128
    ) {
      return res.status(400).json({ greska: 'Korisničko ime i lozinka su obavezni.' });
    }
    const korisnik = await Korisnik.findOne({ where: { username: username.trim() } });
    if (!korisnik) {
      return res.status(401).json({ greska: 'Neispravni kredencijali.' });
    }
    const isPasswordValid = await bcrypt.compare(password, korisnik.password);

    if (!isPasswordValid) {
      return res.status(401).json({ greska: 'Neispravni kredencijali.' });
    }

    await regenerateSession(req);
    postaviKorisnikaUSesiju(req, korisnik);
    res.status(200).json({ poruka: 'Uspješna prijava' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
};

exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ greska: 'Internal Server Error' });
    }
    res.clearCookie('nekretnine.sid');
    res.status(200).json({ poruka: 'Uspješno ste se odjavili' });
  });
};
