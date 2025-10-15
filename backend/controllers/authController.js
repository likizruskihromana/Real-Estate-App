const { Korisnik } = require('../models');
const bcrypt = require('bcrypt');

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