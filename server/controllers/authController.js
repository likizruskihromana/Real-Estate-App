const { Korisnik } = require('../models');
const bcrypt = require('bcrypt');
const config = require('../config/env');

exports.register = async (req, res) => {
  const { ime, prezime, username, password } = req.body;

  try {
    if (!ime || !ime.trim() || !prezime || !prezime.trim() || !username || !username.trim() || !password) {
      return res.status(400).json({ greska: 'Sva polja su obavezna.' });
    }

    const cistUsername = username.trim();
    if (cistUsername.length < 3 || /\s/.test(cistUsername)) {
      return res.status(400).json({ greska: 'Korisničko ime mora imati bar 3 karaktera i ne smije sadržavati razmake.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ greska: 'Lozinka mora imati bar 6 karaktera.' });
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

    // Automatska prijava nakon uspješne registracije
    req.session.username = korisnik.username;
    req.session.userId = korisnik.id;
    req.session.admin = korisnik.admin;
    req.session.loginAttempts = 0;

    res.status(201).json({ poruka: 'Uspješna registracija' });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ greska: 'To korisničko ime je već zauzeto.' });
    }
    console.error('Register error:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
};

exports.login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const korisnik = await Korisnik.findOne({ where: { username } });
    if (!korisnik) {
      return res.status(401).json({ greska: 'Neispravni kredencijali.' });
    }
    const isPasswordValid = await bcrypt.compare(password, korisnik.password);

    if (!isPasswordValid) {
      if (!req.session.loginAttempts) {
        req.session.loginAttempts = 0;
      }
      req.session.loginAttempts += 1;

      if (req.session.loginAttempts >= 3) {
        req.session.blockedUntil = Date.now() + 60000;
        return res.status(429).json({ greska: 'Previse neuspjesnih pokusaja. Pokusajte ponovo za 1 minutu.' });
      }

      return res.status(401).json({ greska: 'Neispravni kredencijali.' });
    }

    if (req.session.blockedUntil && Date.now() < req.session.blockedUntil) {
      return res.status(429).json({ greska: 'Previse neuspjesnih pokusaja. Pokusajte ponovo za 1 minutu.' });
    }

    req.session.username = korisnik.username;
    req.session.userId = korisnik.id;
    req.session.admin = korisnik.admin;
    req.session.loginAttempts = 0;

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
    res.status(200).json({ poruka: 'Uspješno ste se odjavili' });
  });
};