const bcrypt = require('bcrypt');
const { Korisnik, Nekretnina, Upit, Zahtjev, Ponuda } = require('../models');

const korisnici = [
  {
    ime: 'Admin',
    prezime: 'User',
    username: 'admin',
    password: 'admin123',
    admin: true,
  },
  {
    ime: 'Marko',
    prezime: 'Marković',
    username: 'marko',
    password: 'marko123',
    admin: false,
  },
  {
    ime: 'Jelena',
    prezime: 'Jovanović',
    username: 'jelena',
    password: 'jelena123',
    admin: false,
  },
];

const nekretnine = [
  {
    tip_nekretnine: 'Stan',
    naziv: 'Useljiv stan Sarajevo',
    kvadratura: 58,
    cijena: 232000,
    tip_grijanja: 'plin',
    lokacija: 'Novo Sarajevo',
    godina_izgradnje: 2019,
    datum_objave: '2023-10-01',
    opis: 'Prostran i moderan stan u centru Novog Sarajeva.',
  },
  {
    tip_nekretnine: 'Stan',
    naziv: 'Lux stan Stari Grad',
    kvadratura: 75,
    cijena: 280000,
    tip_grijanja: 'centralno',
    lokacija: 'Stari Grad',
    godina_izgradnje: 2020,
    datum_objave: '2023-11-15',
    opis: 'Luksuzno opremljen stan u srcu Starog Grada.',
  },
  {
    tip_nekretnine: 'Kuća',
    naziv: 'Porodična kuća sa dvorištem',
    kvadratura: 150,
    cijena: 350000,
    tip_grijanja: 'plin',
    lokacija: 'Ilidža',
    godina_izgradnje: 2015,
    datum_objave: '2023-09-20',
    opis: 'Prostrana kuća sa velikim dvorištem, idealna za porodicu.',
  },
  {
    tip_nekretnine: 'Poslovni prostor',
    naziv: 'Mali poslovni prostor centar',
    kvadratura: 20,
    cijena: 70000,
    tip_grijanja: 'struja',
    lokacija: 'Centar',
    godina_izgradnje: 2005,
    datum_objave: '2023-08-20',
    opis: 'Poslovni prostor u centru grada, odličan za malu radnju.',
  },
  {
    tip_nekretnine: 'Poslovni prostor',
    naziv: 'Veliki poslovni prostor',
    kvadratura: 100,
    cijena: 150000,
    tip_grijanja: 'centralno',
    lokacija: 'Novi Grad',
    godina_izgradnje: 2010,
    datum_objave: '2023-09-10',
    opis: 'Prostran poslovni prostor pogodan za različite djelatnosti.',
  },
];

const upiti = [
  { tekst: 'Da li je stan useljiv odmah?', korisnik_username: 'marko', nekretnina_index: 0 },
  { tekst: 'Koliko je parking udaljeno?', korisnik_username: 'jelena', nekretnina_index: 0 },
  { tekst: 'Da li je cijena fiksna?', korisnik_username: 'marko', nekretnina_index: 1 },
  { tekst: 'Kada je moguć pregled?', korisnik_username: 'jelena', nekretnina_index: 2 },
  { tekst: 'Da li su režije uključene?', korisnik_username: 'marko', nekretnina_index: 3 },
];

const zahtjevi = [
  { 
    tekst: 'Želim pregled stana u subotu', 
    trazeniDatum: '2025-10-20', 
    odobren: false,
    korisnik_username: 'marko',
    nekretnina_index: 0
  },
  { 
    tekst: 'Molim vas pregled kuće sutra', 
    trazeniDatum: '2025-10-18', 
    odobren: true,
    korisnik_username: 'jelena',
    nekretnina_index: 2
  },
];

const ponude = [
  { 
    tekst: 'Prva ponuda za stan', 
    cijenaPonude: 220000, 
    datumPonude: '2025-10-15', 
    odbijenaPonuda: false,
    korisnik_username: 'marko',
    nekretnina_index: 0
  },
  { 
    tekst: 'Zainteresovan sam za kupovinu', 
    cijenaPonude: 140000, 
    datumPonude: '2025-10-16', 
    odbijenaPonuda: false,
    korisnik_username: 'jelena',
    nekretnina_index: 3
  },
];

async function seedDatabase() {
  try {
    console.log('🌱 Pokretanje seedera...');

    // Hash passworda i dodaj korisnike
    const hashedKorisnici = await Promise.all(
      korisnici.map(async (k) => {
        const hashedPassword = await bcrypt.hash(k.password, 10);
        return { ...k, password: hashedPassword };
      })
    );

    await Korisnik.bulkCreate(hashedKorisnici);
    console.log('✅ Korisnici dodani');

    // Dodaj nekretnine
    const sviKorisnici = await Korisnik.findAll();
    const nekretnineSaPodacima = nekretnine.map((n, index) => ({
      ...n,
      KorisnikId: sviKorisnici[index % sviKorisnici.length].id,
    }));

    await Nekretnina.bulkCreate(nekretnineSaPodacima);
    console.log('✅ Nekretnine dodane');

    // Dodaj upite
    const sveNekretnine = await Nekretnina.findAll();
    for (const upit of upiti) {
      const korisnik = sviKorisnici.find(k => k.username === upit.korisnik_username);
      const nekretnina = sveNekretnine[upit.nekretnina_index];

      if (korisnik && nekretnina) {
        await Upit.create({
          tekst: upit.tekst,
          KorisnikId: korisnik.id,
          NekretninaId: nekretnina.id,
        });
      }
    }
    console.log('✅ Upiti dodani');

    // Dodaj zahtjeve
    for (const zahtjev of zahtjevi) {
      const korisnik = sviKorisnici.find(k => k.username === zahtjev.korisnik_username);
      const nekretnina = sveNekretnine[zahtjev.nekretnina_index];

      if (korisnik && nekretnina) {
        await Zahtjev.create({
          tekst: zahtjev.tekst,
          trazeniDatum: zahtjev.trazeniDatum,
          odobren: zahtjev.odobren,
          KorisnikId: korisnik.id,
          NekretninaId: nekretnina.id,
        });
      }
    }
    console.log('✅ Zahtjevi dodani');

    // Dodaj ponude
    for (const ponuda of ponude) {
      const korisnik = sviKorisnici.find(k => k.username === ponuda.korisnik_username);
      const nekretnina = sveNekretnine[ponuda.nekretnina_index];

      if (korisnik && nekretnina) {
        await Ponuda.create({
          tekst: ponuda.tekst,
          cijenaPonude: ponuda.cijenaPonude,
          datumPonude: ponuda.datumPonude,
          odbijenaPonuda: ponuda.odbijenaPonuda,
          KorisnikId: korisnik.id,
          NekretninaId: nekretnina.id,
        });
      }
    }
    console.log('✅ Ponude dodane');

    console.log('🎉 Seeder uspješno završen!');
  } catch (error) {
    console.error('❌ Greška pri seedovanju:', error);
    throw error;
  }
}

module.exports = { seedDatabase };