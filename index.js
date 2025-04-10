const express = require('express');
const session = require("express-session");
const path = require('path');
const fs = require('fs').promises; // Using asynchronus API for file read and write
const bcrypt = require('bcrypt');
const { count } = require('console');
const { sequelize, Korisnik, Nekretnina, Upit, Zahtjev, Ponuda } = require('./sequelize'); // Uvoz modela

const app = express();
const PORT = 3000;

app.use(session({
  secret: 'tajna sifra',
  resave: true,
  saveUninitialized: true
}));

app.use(express.static(__dirname + '/public'));

// Enable JSON parsing without body-parser
const korisnici = [
  {
    id: 1,
    ime: 'Neko',
    prezime: 'Nekic',
    username: 'username1',
    password: '$2b$10$OFykzLMWv.wpDk2dXT5C8ObIgy8tlZYbm0ZPN0VTe8I/jXosIX1EG',
    admin: true,
  },
  {
    id: 2,
    ime: 'Neko2',
    prezime: 'Nekic2',
    username: 'username2',
    password: '$2b$10$eN2a0Ii0mkjvpSUU.6.S4uASuULIlAspWFc2LkJTmIYPZszB8oyXC',
    admin: false,
  },
];
const nekretnine = [
  {
    id: 1,
    tip_nekretnine: 'Stan',
    naziv: 'Useljiv stan Sarajevo',
    kvadratura: 58,
    cijena: 232000,
    tip_grijanja: 'plin',
    lokacija: 'Novo Sarajevo',
    godina_izgradnje: 2019,
    datum_objave: '2023-10-01',
    opis: 'Sociis natoque penatibus.',
  },
  {
    id: 2,
    tip_nekretnine: 'Poslovni prostor',
    naziv: 'Mali poslovni prostor',
    kvadratura: 20,
    cijena: 70000,
    tip_grijanja: 'struja',
    lokacija: 'Centar',
    godina_izgradnje: 2005,
    datum_objave: '2023-08-20',
    opis: 'Magnis dis parturient montes.',
  },
];
const upiti = [
  { tekst: 'Nullam eu pede mollis pretium.', korisnik_id: 1, nekretnina_id: 1 },
  { tekst: 'Phasellus viverra nulla.', korisnik_id: 2, nekretnina_id: 1 },
  { tekst: 'Integer tincidunt.', korisnik_id: 2, nekretnina_id: 2 },
];
const zahtjevi = [
  { tekst: 'Želim pregled stana', trazeniDatum: '2025-01-28', odobren: false, nekretnina_id: 1 },
];
const ponude = [
  { tekst: 'Prva ponuda', cijenaPonude: 210000, datumPonude: '2025-01-25', odbijenaPonuda: false, korisnik_id: 1, nekretnina_id: 1 },
];
async function postaviBazu() {
  // Dodaj korisnike
  await Korisnik.bulkCreate(korisnici);
  console.log('Korisnici su uspješno dodani!');

  // Dodaj nekretnine
  await Nekretnina.bulkCreate(nekretnine);
  console.log('Nekretnine su uspješno dodane!');

  // Dodaj upite
  for (const upit of upiti) {
    const korisnik = await Korisnik.findByPk(upit.korisnik_id);
    const nekretnina = await Nekretnina.findByPk(upit.nekretnina_id);

    if (!korisnik || !nekretnina) {
      console.warn(
        `Upit preskočen: korisnik ID ${upit.korisnik_id} ili nekretnina ID ${upit.nekretnina_id} ne postoji.`
      );
      continue;
    }

    await Upit.create(upit);
  }
  console.log('Upiti su uspješno dodani!');

  // Dodaj zahtjeve
  for (const zahtjev of zahtjevi) {
    const nekretnina = await Nekretnina.findByPk(zahtjev.nekretnina_id);

    if (!nekretnina) {
      console.warn(`Zahtjev preskočen: nekretnina ID ${zahtjev.nekretnina_id} ne postoji.`);
      continue;
    }

    await Zahtjev.create(zahtjev);
  }
  console.log('Zahtjevi su uspješno dodani!');

  // Dodaj ponude
  for (const ponuda of ponude) {
    const korisnik = await Korisnik.findByPk(ponuda.korisnik_id);
    const nekretnina = await Nekretnina.findByPk(ponuda.nekretnina_id);

    if (!korisnik || !nekretnina) {
      console.warn(
        `Ponuda preskočena: korisnik ID ${ponuda.korisnik_id} ili nekretnina ID ${ponuda.nekretnina_id} ne postoji.`
      );
      continue;
    }

    await Ponuda.create(ponuda);
  }
  console.log('Ponude su uspješno dodane!');
}
const initializeDatabase = async () => {
  try {
    await sequelize.sync({ force: true }); // force: true za resetovanje baze
    //postaviBazu()
    console.log('Konekcija na bazu uspješna!');
  } catch (err) {
    console.error('Greška pri inicijalizaciji baze: ', err);
  }
};
initializeDatabase();
app.use(express.json());

/* ---------------- SERVING HTML -------------------- */
async function serveHTMLFile(req, res, fileName) {
  const htmlPath = path.join(__dirname, 'public/html', fileName);
  try {
    const content = await fs.readFile(htmlPath, 'utf-8');
    res.send(content);
  } catch (error) {
    console.error('Error serving HTML file:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
}
// Array of HTML files and their routes
const routes = [
  { route: '/nekretnine.html', file: 'nekretnine.html' },
  { route: '/detalji.html', file: 'detalji.html' },
  { route: '/meni.html', file: 'meni.html' },
  { route: '/prijava.html', file: 'prijava.html' },
  { route: '/profil.html', file: 'profil.html' },
  { route: '/statistika.html',file:'statistika.html'},
  { route: '/vijesti.html',file:'vijesti.html'},
  { route: '/mojiUpiti.html',file:'mojiUpiti.html'},
  // Practical for adding more .html files as the project grows
];
// Loop through the array so HTML can be served
routes.forEach(({ route, file }) => {
  app.get(route, async (req, res) => {
    await serveHTMLFile(req, res, file);
  });
});
/* ----------- SERVING OTHER ROUTES --------------- */
// Async function for reading json data from data folder 
async function readJsonFile(filename) {
  const filePath = path.join(__dirname, 'data', `${filename}.json`);
  try {
    const rawdata = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(rawdata);
  } catch (error) {
    throw error;
  }
}
// Async function for reading json data from data folder (nije reading nego sav)
async function saveJsonFile(filename, data) {
  const filePath = path.join(__dirname, 'data', `${filename}.json`);
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    throw error;
  }
}
// Helper function to check admin privileges
const isAdmin = (req) => req.session.admin;
/*
Checks if the user exists and if the password is correct based on korisnici.json data. 
If the data is correct, the username is saved in the session and a success message is sent.
*/
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const korisnik = await Korisnik.findOne({ where: { username } });
    if (!korisnik) {
      return res.status(401).json({ greska: 'Neispravni kredencijali.' });
    }

    if (!(password === korisnik.password)) {
      if (!req.session.loginAttempts) {
        req.session.loginAttempts = 0;
      }
      req.session.loginAttempts += 1;

      if (req.session.loginAttempts >= 3) {
        req.session.blockedUntil = Date.now() + 60000; // Block for 1 minute
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
    req.session.loginAttempts = 0; // Reset login attempts

    res.status(200).json({ poruka: 'Uspješna prijava' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
});
app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ greska: 'Internal Server Error' });
    }
    res.status(200).json({ poruka: 'Uspješno ste se odjavili' });
  });
});
app.get('/korisnik', async (req, res) => {
  if (!req.session.username) {
    return res.status(401).json({ greska: 'Neautorizovan pristup' });
  }
  try {
    const korisnik = await Korisnik.findByPk(req.session.userId, {
      attributes: ['id', 'ime', 'prezime', 'username', 'admin'],
    });
    if (!korisnik) {
      return res.status(404).json({ greska: 'Korisnik nije pronađen' });
    }
    res.status(200).json(korisnik);
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
});
app.post('/upit', async (req, res) => {
  if (!req.session.username) {
    return res.status(401).json({ greska: 'Neautorizovan pristup' });
  }
  const { nekretnina_id, tekst_upita } = req.body;
  try {
    const korisnik = await Korisnik.findOne({ where: { username: req.session.username } });
    if (!korisnik) {
      return res.status(401).json({ greska: 'Korisnik nije pronađen' });
    }
    const nekretnina = await Nekretnina.findByPk(nekretnina_id, {
      include: [{ model: Upit }],
    });
    if (!nekretnina) {
      return res.status(400).json({ greska: `Nekretnina sa id-em ${nekretnina_id} ne postoji` });
    }
    const brojUpitaOdLoggedUser = nekretnina.Upiti.filter(
      (upit) => upit.KorisnikId === korisnik.id 
    ).length;
    if (brojUpitaOdLoggedUser >= 3) {
      return res.status(429).json({ greska: 'Previse upita za istu nekretninu.' });
    }

    const upit = await Upit.create({
      tekst: tekst_upita,
      NekretninaId: nekretnina.id,
      KorisnikId: korisnik.id,
    });

    res.status(200).json({ poruka: 'Upit je uspješno dodan', upit });
  } catch (error) {
    console.error('Error processing query:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
});
app.get('/upiti/moji', async (req, res) => {
  if (!req.session.username) {
    return res.status(401).json({ greska: 'Neautorizovan pristup' });
  }
  try {
    const korisnik = await Korisnik.findOne({ where: { username: req.session.username } });
    if (!korisnik) {
      return res.status(401).json({ greska: 'Korisnik nije pronađen' });
    }
    const upiti = await Upit.findAll({
      where: { KorisnikId: korisnik.id }, // ???
      include: [{ model: Nekretnina, attributes: ['id'] }],
    });
    if (upiti.length === 0) {
      return res.status(404).json([]);
    }
    const izabraniUpiti = upiti.map((upit) => ({
      id_nekretnine: upit.Nekretnina.id,
      tekst_upita: upit.tekst,
    }));
    res.status(200).json({ izabraniUpiti });
  } catch (error) {
    console.error('Error fetching queries:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
});
app.put('/korisnik', async (req, res) => {
  if (!req.session.username) {
    return res.status(401).json({ greska: 'Neautorizovan pristup' });
  }

  const { ime, prezime, username, password } = req.body;

  try {
    const korisnik = await Korisnik.findOne({ where: { username: req.session.username } });

    if (!korisnik) {
      return res.status(401).json({ greska: 'Korisnik nije pronađen' });
    }

    if (ime) korisnik.ime = ime;
    if (prezime) korisnik.prezime = prezime;
    if (username) korisnik.username = username;
    if (password) {
      korisnik.password = await bcrypt.hash(password, 10);
    }

    await korisnik.save();
    res.status(200).json({ poruka: 'Podaci su uspješno ažurirani' });
  } catch (error) {
    console.error('Error updating user data:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
});
app.get('/nekretnine', async (req, res) => {
  try {
    const nekretnine = await Nekretnina.findAll();
    res.status(200).json(nekretnine);
  } catch (error) {
    console.error('Error fetching properties:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
});
app.get('/nekretnina/:id', async (req, res) => {
  try {
    // Učitaj nekretninu sa povezanim upitima, zahtjevima i ponudama
    const nekretnina = await Nekretnina.findByPk(req.params.id, {
      include: [
        { model: Upit, limit: 3, order: [['id', 'DESC']] }, 
        { model: Zahtjev },
        { model: Ponuda },
      ],
    });

    // Proveriti da li nekretnina postoji
    if (!nekretnina) {
      return res.status(404).json({ greska: 'Nekretnina nije pronađena' });
    }

    // Nekretnina je sada povezana sa najnovijim (poslednjim) upitima
    // Vraćamo samo poslednja tri upita
    if (nekretnina.dataValues.Upits && nekretnina.dataValues.Upits.length > 0) {
      nekretnina.upiti = nekretnina.dataValues.Upits; 
    } else {
      nekretnina.upiti = []; // Ako nema upita, setuj na prazan niz
    }
    console.log(nekretnina.dataValues.Upits[0].dataValues)
    console.log(nekretnina.dataValues.Upits[1])
    console.log(nekretnina.dataValues.Upits[2])
    console.log(nekretnina.dataValues.Upits.dataValues)
    res.status(200).json(nekretnina); // Vratiti detalje nekretnine
  } catch (error) {
    console.error('Error fetching property details:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
});
app.get('/next/upiti/nekretnina/:id', async (req, res) => {
  const nekretninaId = parseInt(req.params.id);
  const page = parseInt(req.query.page || '1') - 1;

  try {
    const nekretnina = await Nekretnina.findByPk(nekretninaId, {
      include: [{ model: Upit }],
    });

    if (!nekretnina) {
      return res.status(404).json([]);
    }

    const offset = page * 3;
    const upiti = nekretnina.Upiti.slice(offset, offset + 3);

    if (upiti.length === 0) {
      return res.status(404).json([]);
    }

    res.status(200).json(upiti);
  } catch (error) {
    console.error('Error fetching next queries:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
});
app.get('/nekretnine/top5', async (req, res) => {
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
});

//Spirala 4
app.get('/nekretnina/:id/interesovanja', async (req, res) => {
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
});
app.post('/nekretnina/:id/ponuda', async (req, res) => {
  const { tekst, ponudaCijene, datumPonude, idVezanePonude, odbijenaPonuda } = req.body;
  try {
    const nekretnina = await Nekretnina.findByPk(req.params.id);
    if (!nekretnina) {
      return res.status(404).json({ greska: 'Nekretnina nije pronađena' });
    }
    if (!req.session.userId) {
      return res.status(401).json({ greska: 'Neautorizovan pristup' });
    }
    if (idVezanePonude) {
      const vezanaPonuda = await Ponuda.findByPk(idVezanePonude);
      if (!vezanaPonuda) {
        return res.status(400).json({ greska: 'Vezana ponuda nije pronađena' });
      }
      if (vezanaPonuda.odbijenaPonuda) {
        return res.status(400).json({ greska: 'Nove ponude se ne mogu dodavati na odbijene ponude' });
      }
      const isAdmin = req.session.admin;
      const isOwner = vezanaPonuda.KorisnikId === req.session.userId;
      if (!isAdmin && !isOwner) {
        return res.status(403).json({ greska: 'Nemate prava za dodavanje ponude na ovu vezanu ponudu' });
      }
    }
    const ponuda = await Ponuda.create({
      tekst,
      cijenaPonude: ponudaCijene,
      datumPonude,
      odbijenaPonuda,
      idVezanePonude,
      NekretninaId: nekretnina.id,
      KorisnikId: req.session.userId,
    });
    res.status(201).json(ponuda);
  } catch (error) {
    console.error('Greška prilikom kreiranja ponude:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
});
app.post('/nekretnina/:id/zahtjev', async (req, res) => {
  const { tekst, trazeniDatum } = req.body;
  try {
    // Provjera validnosti datuma
    if (!trazeniDatum || isNaN(Date.parse(trazeniDatum)) || new Date(trazeniDatum) < new Date()) {
      return res.status(400).json({ greska: 'Datum pregleda nije validan. Molimo unesite budući datum.' });
    }
    // Provjera da li nekretnina postoji
    const nekretnina = await Nekretnina.findByPk(req.params.id);
    if (!nekretnina) {
      return res.status(404).json({ greska: 'Nekretnina nije pronađena.' });
    }
    // Provjera da li je korisnik prijavljen
    if (!req.session.userId) {
      return res.status(401).json({ greska: 'Neautorizovan pristup. Molimo prijavite se.' });
    }
    // Kreiranje zahtjeva
    const zahtjev = await Zahtjev.create({
      tekst,
      trazeniDatum,
      NekretninaId: nekretnina.id,
      KorisnikId: req.session.userId,
    });
    res.status(201).json(zahtjev);
  } catch (error) {
    console.error('Greška prilikom kreiranja zahtjeva:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
});
app.put('/nekretnina/:id/zahtjev/:zid', async (req, res) => {
  const { odobren, addToTekst } = req.body;
  try {
    if (!req.session.admin) {
      return res.status(403).json({ greska: 'Samo admin može odobriti zahtjev.' });
    }

    const zahtjev = await Zahtjev.findByPk(req.params.zid);

    if (!zahtjev) {
      return res.status(404).json({ greska: 'Zahtjev nije pronađen.' });
    }

    zahtjev.odobren = odobren;
    if (!odobren && addToTekst) {
      zahtjev.tekst += ` ODGOVOR ADMINA: ${addToTekst}`;
    }

    await zahtjev.save();
    res.status(200).json(zahtjev);
  } catch (error) {
    console.error(error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
