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
  {
    ime: 'Petar',
    prezime: 'Petrović',
    username: 'petar',
    password: 'petar123',
    admin: false,
  },
  {
    ime: 'Ana',
    prezime: 'Anić',
    username: 'ana',
    password: 'ana123',
    admin: false,
  },
  {
    ime: 'Ivan',
    prezime: 'Ivić',
    username: 'ivan',
    password: 'ivan123',
    admin: false,
  },
  {
    ime: 'Marija',
    prezime: 'Marić',
    username: 'marija',
    password: 'marija123',
    admin: false,
  },
  {
    ime: 'Nikola',
    prezime: 'Nikolić',
    username: 'nikola',
    password: 'nikola123',
    admin: false,
  },
  {
    ime: 'Sanja',
    prezime: 'Sanić',
    username: 'sanja',
    password: 'sanja123',
    admin: false,
  },
  {
    ime: 'Damir',
    prezime: 'Damić',
    username: 'damir',
    password: 'damir123',
    admin: false,
  }
];

const nekretnine = [
  // Apartments
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
    tip_nekretnine: 'Stan',
    naziv: 'Moderni studio apartman',
    kvadratura: 35,
    cijena: 150000,
    tip_grijanja: 'struja',
    lokacija: 'Centar',
    godina_izgradnje: 2021,
    datum_objave: '2023-12-01',
    opis: 'Novi studio apartman sa open space konceptom.',
  },
  {
    tip_nekretnine: 'Stan',
    naziv: 'Porodični stan Grbavica',
    kvadratura: 85,
    cijena: 195000,
    tip_grijanja: 'centralno',
    lokacija: 'Grbavica',
    godina_izgradnje: 2018,
    datum_objave: '2023-11-20',
    opis: 'Prostran stan sa tri spavaće sobe, pogodan za porodicu.',
  },
  {
    tip_nekretnine: 'Stan',
    naziv: 'Penthouse sa pogledom',
    kvadratura: 120,
    cijena: 450000,
    tip_grijanja: 'podno',
    lokacija: 'Marijin Dvor',
    godina_izgradnje: 2022,
    datum_objave: '2023-10-15',
    opis: 'Ekskluzivni penthouse sa panoramskim pogledom na grad.',
  },

  // Houses
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
    tip_nekretnine: 'Kuća',
    naziv: 'Vikendica na Bjelašnici',
    kvadratura: 80,
    cijena: 180000,
    tip_grijanja: 'drva',
    lokacija: 'Bjelašnica',
    godina_izgradnje: 2010,
    datum_objave: '2023-11-10',
    opis: 'Udobna vikendica sa kaminom, idealna za odmor.',
  },
  {
    tip_nekretnine: 'Kuća',
    naziv: 'Moderna vila Butmir',
    kvadratura: 200,
    cijena: 520000,
    tip_grijanja: 'toplotne pumpe',
    lokacija: 'Butmir',
    godina_izgradnje: 2023,
    datum_objave: '2023-12-05',
    opis: 'Savremena vila sa bazenom i modernom arhitekturom.',
  },
  {
    tip_nekretnine: 'Kuća',
    naziv: 'Kuća sa vrtom Hrasno',
    kvadratura: 110,
    cijena: 275000,
    tip_grijanja: 'plin',
    lokacija: 'Hrasno',
    godina_izgradnje: 2012,
    datum_objave: '2023-10-25',
    opis: 'Uredna kuća sa predivnim vrtom i voćnjakom.',
  },

  // Commercial spaces
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
  {
    tip_nekretnine: 'Poslovni prostor',
    naziv: 'Kancelarijski prostor SCC',
    kvadratura: 45,
    cijena: 120000,
    tip_grijanja: 'centralno',
    lokacija: 'Sarajevo City Center',
    godina_izgradnje: 2018,
    datum_objave: '2023-11-30',
    opis: 'Moderan kancelarijski prostor u prestižnoj lokaciji.',
  },
  {
    tip_nekretnine: 'Poslovni prostor',
    naziv: 'Prodavnica u tržnom centru',
    kvadratura: 60,
    cijena: 185000,
    tip_grijanja: 'centralno',
    lokacija: 'BBI Centar',
    godina_izgradnje: 2015,
    datum_objave: '2023-10-10',
    opis: 'Prodajni prostor u prometnom tržnom centru.',
  },

  // Additional properties
  {
    tip_nekretnine: 'Stan',
    naziv: 'Garsonjera Vogošća',
    kvadratura: 28,
    cijena: 85000,
    tip_grijanja: 'struja',
    lokacija: 'Vogošća',
    godina_izgradnje: 2017,
    datum_objave: '2023-12-12',
    opis: 'Uređena garsonjera, odlična za studente ili mlade parove.',
  },
  {
    tip_nekretnine: 'Kuća',
    naziv: 'Kuća za renoviranje',
    kvadratura: 90,
    cijena: 120000,
    tip_grijanja: 'drva',
    lokacija: 'Kovači',
    godina_izgradnje: 1985,
    datum_objave: '2023-11-05',
    opis: 'Kuća koja zahjeva renoviranje, povoljna cijena.',
  },
  {
    tip_nekretnine: 'Poslovni prostor',
    naziv: 'Skladisni prostor',
    kvadratura: 200,
    cijena: 95000,
    tip_grijanja: 'plin',
    lokacija: 'Ilidža',
    godina_izgradnje: 2000,
    datum_objave: '2023-10-30',
    opis: 'Prostran skladišni prostor sa dobrim prilazom.',
  }
];

const upiti = [
  { tekst: 'Da li je stan useljiv odmah?', korisnik_username: 'marko', nekretnina_index: 0 },
  { tekst: 'Koliko je parking udaljeno?', korisnik_username: 'jelena', nekretnina_index: 0 },
  { tekst: 'Da li je cijena fiksna?', korisnik_username: 'marko', nekretnina_index: 1 },
  { tekst: 'Kada je moguć pregled?', korisnik_username: 'jelena', nekretnina_index: 2 },
  { tekst: 'Da li su režije uključene?', korisnik_username: 'marko', nekretnina_index: 3 },
  { tekst: 'Ima li stan parking mjesto?', korisnik_username: 'petar', nekretnina_index: 0 },
  { tekst: 'Kakva je infrastruktura u okolini?', korisnik_username: 'ana', nekretnina_index: 6 },
  { tekst: 'Da li je kuća opremljena namještajem?', korisnik_username: 'ivan', nekretnina_index: 5 },
  { tekst: 'Koliko je udaljeno od škole?', korisnik_username: 'marija', nekretnina_index: 3 },
  { tekst: 'Ima li lift u zgradi?', korisnik_username: 'nikola', nekretnina_index: 4 },
  { tekst: 'Kakvo je stanje instalacija?', korisnik_username: 'sanja', nekretnina_index: 7 },
  { tekst: 'Da li je moguća hipoteka?', korisnik_username: 'damir', nekretnina_index: 1 },
  { tekst: 'Koliki su doprinosi za održavanje?', korisnik_username: 'jelena', nekretnina_index: 4 },
  { tekst: 'Ima li klima uređaj?', korisnik_username: 'marko', nekretnina_index: 2 },
  { tekst: 'Kakva je buka u zgradi?', korisnik_username: 'ana', nekretnina_index: 0 }
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
  { 
    tekst: 'Pregled poslovnog prostora u utorak', 
    trazeniDatum: '2025-10-22', 
    odobren: false,
    korisnik_username: 'petar',
    nekretnina_index: 10
  },
  { 
    tekst: 'Želio bih vidjeti vikendicu u petak', 
    trazeniDatum: '2025-10-25', 
    odobren: true,
    korisnik_username: 'ivan',
    nekretnina_index: 6
  },
  { 
    tekst: 'Pregled garsonjere u četvrtak popodne', 
    trazeniDatum: '2025-10-24', 
    odobren: false,
    korisnik_username: 'ana',
    nekretnina_index: 13
  },
  { 
    tekst: 'Mogućnost pregleda u nedjelju?', 
    trazeniDatum: '2025-10-27', 
    odobren: true,
    korisnik_username: 'marija',
    nekretnina_index: 8
  },
  { 
    tekst: 'Hitno trebam pregled stana', 
    trazeniDatum: '2025-10-19', 
    odobren: false,
    korisnik_username: 'nikola',
    nekretnina_index: 3
  },
  { 
    tekst: 'Pregled skladišnog prostora', 
    trazeniDatum: '2025-10-26', 
    odobren: true,
    korisnik_username: 'damir',
    nekretnina_index: 15
  }
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
  { 
    tekst: 'Ponuda za vikendicu', 
    cijenaPonude: 165000, 
    datumPonude: '2025-10-17', 
    odbijenaPonuda: true,
    korisnik_username: 'petar',
    nekretnina_index: 6
  },
  { 
    tekst: 'Finalna ponuda za poslovni prostor', 
    cijenaPonude: 110000, 
    datumPonude: '2025-10-18', 
    odbijenaPonuda: false,
    korisnik_username: 'ana',
    nekretnina_index: 10
  },
  { 
    tekst: 'Ponuda ispod tražene cijene', 
    cijenaPonude: 400000, 
    datumPonude: '2025-10-19', 
    odbijenaPonuda: false,
    korisnik_username: 'ivan',
    nekretnina_index: 7
  },
  { 
    tekst: 'Ponuda sa mogućnošću dogovora', 
    cijenaPonude: 75000, 
    datumPonude: '2025-10-20', 
    odbijenaPonuda: true,
    korisnik_username: 'marija',
    nekretnina_index: 13
  },
  { 
    tekst: 'Ozbiljna kupčeva ponuda', 
    cijenaPonude: 250000, 
    datumPonude: '2025-10-21', 
    odbijenaPonuda: false,
    korisnik_username: 'nikola',
    nekretnina_index: 5
  },
  { 
    tekst: 'Ponuda za skladišni prostor', 
    cijenaPonude: 90000, 
    datumPonude: '2025-10-22', 
    odbijenaPonuda: false,
    korisnik_username: 'sanja',
    nekretnina_index: 15
  },
  { 
    tekst: 'Ponuda sa brzom gotovinom', 
    cijenaPonude: 170000, 
    datumPonude: '2025-10-23', 
    odbijenaPonuda: true,
    korisnik_username: 'damir',
    nekretnina_index: 8
  }
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