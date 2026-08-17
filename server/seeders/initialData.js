const bcrypt = require('bcrypt');
const { Korisnik, Nekretnina, Upit, Zahtjev, Ponuda, Komentar } = require('../models');

const korisnici = [
  {
    ime: 'Admin',
    prezime: 'Administrator',
    username: 'admin',
    password: 'admin',
    admin: true,
  },
  {
    ime: 'Super',
    prezime: 'Admin',
    username: 'superadmin',
    password: 'superadmin123',
    admin: true,
  },
  {
    ime: 'Moderator',
    prezime: 'Sistem',
    username: 'moderator',
    password: 'mod123password',
    admin: true,
  },
  {
    ime: 'Obični',
    prezime: 'Korisnik',
    username: 'user',
    password: 'user',
    admin: false,
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
  },
  {
    ime: 'Emina',
    prezime: 'Hadžić',
    username: 'emina',
    password: 'emina123',
    admin: false,
  },
  {
    ime: 'Tarik',
    prezime: 'Kovačević',
    username: 'tarik',
    password: 'tarik123',
    admin: false,
  },
  {
    ime: 'Adnan',
    prezime: 'Delić',
    username: 'adnan',
    password: 'adnan123',
    admin: false,
  },
  {
    ime: 'Lejla',
    prezime: 'Begić',
    username: 'lejla',
    password: 'lejla123',
    admin: false,
  },
  {
    ime: 'Haris',
    prezime: 'Sokolović',
    username: 'haris',
    password: 'haris123',
    admin: false,
  },
  {
    ime: 'Amra',
    prezime: 'Mehmedović',
    username: 'amra',
    password: 'amra123',
    admin: false,
  },
  {
    ime: 'Dino',
    prezime: 'Hodžić',
    username: 'dino',
    password: 'dino123',
    admin: false,
  },
  {
    ime: 'Selma',
    prezime: 'Imamović',
    username: 'selma',
    password: 'selma123',
    admin: false,
  },
  {
    ime: 'Goran',
    prezime: 'Popović',
    username: 'goran',
    password: 'goran123',
    admin: false,
  },
  {
    ime: 'Milica',
    prezime: 'Babić',
    username: 'milica',
    password: 'milica123',
    admin: false,
  },
  {
    ime: 'Filip',
    prezime: 'Knežević',
    username: 'filip',
    password: 'filip123',
    admin: false,
  },
  {
    ime: 'Katarina',
    prezime: 'Kovač',
    username: 'katarina',
    password: 'katarina123',
    admin: false,
  },
  {
    ime: 'Sandra',
    prezime: 'Vuković',
    username: 'sandra',
    password: 'sandra123',
    admin: false,
  },
  {
    ime: 'Vedad',
    prezime: 'Pašić',
    username: 'vedad',
    password: 'vedad123',
    admin: false,
  },
  {
    ime: 'Nevena',
    prezime: 'Stojanović',
    username: 'nevena',
    password: 'nevena123',
    admin: false,
  },
  {
    ime: 'Boris',
    prezime: 'Radić',
    username: 'boris',
    password: 'boris123',
    admin: false,
  },
  {
    ime: 'Nina',
    prezime: 'Galić',
    username: 'nina',
    password: 'nina123',
    admin: false,
  },
  {
    ime: 'Mahir',
    prezime: 'Šabić',
    username: 'mahir',
    password: 'mahir123',
    admin: false,
  }
];

const nekretnine = [
  // ==================== STANOVI ====================
  {
    tip_nekretnine: 'Stan',
    naziv: 'Useljiv stan Sarajevo',
    kvadratura: 58,
    cijena: 232000,
    tip_grijanja: 'plin',
    lokacija: 'Novo Sarajevo',
    godina_izgradnje: 2019,
    datum_objave: '2024-01-15',
    status: 'aktivno',
    opis: 'Prostran i moderan dvosoban stan u centru Novog Sarajeva sa spremištem i novom ugradbenom kuhinjom.',
  },
  {
    tip_nekretnine: 'Stan',
    naziv: 'Lux stan Stari Grad',
    kvadratura: 75,
    cijena: 280000,
    tip_grijanja: 'centralno',
    lokacija: 'Stari Grad, Sarajevo',
    godina_izgradnje: 2020,
    datum_objave: '2024-02-01',
    status: 'aktivno',
    opis: 'Luksuzno opremljen trosoban stan u srcu Starog Grada sa prelijepim pogledom na Sebilj.',
  },
  {
    tip_nekretnine: 'Stan',
    naziv: 'Moderni studio apartman',
    kvadratura: 35,
    cijena: 150000,
    tip_grijanja: 'struja',
    lokacija: 'Centar, Sarajevo',
    godina_izgradnje: 2021,
    datum_objave: '2024-02-10',
    status: 'aktivno',
    opis: 'Novi studio apartman sa open space konceptom, idealan za kratkoročni ili dugoročni najam.',
  },
  {
    tip_nekretnine: 'Stan',
    naziv: 'Porodični stan Grbavica',
    kvadratura: 85,
    cijena: 195000,
    tip_grijanja: 'centralno',
    lokacija: 'Grbavica, Sarajevo',
    godina_izgradnje: 2018,
    datum_objave: '2023-11-20',
    status: 'prodano',
    opis: 'Prostran stan sa tri spavaće sobe, dva kupatila i velikim balkonom. Blizina škole i vrtića.',
  },
  {
    tip_nekretnine: 'Stan',
    naziv: 'Penthouse sa pogledom',
    kvadratura: 120,
    cijena: 450000,
    tip_grijanja: 'podno',
    lokacija: 'Marijin Dvor, Sarajevo',
    godina_izgradnje: 2022,
    datum_objave: '2024-03-05',
    status: 'aktivno',
    opis: 'Ekskluzivni penthouse sa panoramskim pogledom, privatnom terasom od 40m2 i smart home sistemom.',
  },
  {
    tip_nekretnine: 'Stan',
    naziv: 'Dvosoban stan Otoka',
    kvadratura: 52,
    cijena: 165000,
    tip_grijanja: 'centralno',
    lokacija: 'Otoka, Sarajevo',
    godina_izgradnje: 2016,
    datum_objave: '2024-01-10',
    status: 'aktivno',
    opis: 'Svijetao dvosoban stan u novogradnji blizu gradskog prevoza i shopping centra.',
  },
  {
    tip_nekretnine: 'Stan',
    naziv: 'Renoviran stan Borik',
    kvadratura: 64,
    cijena: 185000,
    tip_grijanja: 'centralno',
    lokacija: 'Borik, Banja Luka',
    godina_izgradnje: 2012,
    datum_objave: '2024-02-18',
    status: 'aktivno',
    opis: 'Kompletno renoviran trosoban stan u mirnom dijelu Borika sa parkingom ispred zgrade.',
  },
  {
    tip_nekretnine: 'Stan',
    naziv: 'Stan u Starom Gradu Mostar',
    kvadratura: 70,
    cijena: 190000,
    tip_grijanja: 'struja',
    lokacija: 'Cernica, Mostar',
    godina_izgradnje: 2017,
    datum_objave: '2023-12-05',
    status: 'prodano',
    opis: 'Atraktivan stan na svega 5 minuta hoda od Starog mosta. Idealan za turistički najam.',
  },
  {
    tip_nekretnine: 'Stan',
    naziv: 'Trosoban stan Slatina',
    kvadratura: 78,
    cijena: 160000,
    tip_grijanja: 'centralno',
    lokacija: 'Slatina, Tuzla',
    godina_izgradnje: 2015,
    datum_objave: '2024-01-22',
    status: 'aktivno',
    opis: 'Funkcionalan stan na odličnoj lokaciji u Tuzli, blizu fakulteta i UKC-a.',
  },
  {
    tip_nekretnine: 'Stan',
    naziv: 'Garsonjera Vogošća',
    kvadratura: 28,
    cijena: 85000,
    tip_grijanja: 'struja',
    lokacija: 'Vogošća',
    godina_izgradnje: 2017,
    datum_objave: '2023-12-12',
    status: 'aktivno',
    opis: 'Uređena garsonjera na prvom spratu, niske režije, odlična investicija.',
  },

  // ==================== KUĆE I VIKENDICE ====================
  {
    tip_nekretnine: 'Kuća',
    naziv: 'Porodična kuća sa dvorištem',
    kvadratura: 150,
    cijena: 350000,
    tip_grijanja: 'plin',
    lokacija: 'Ilidža, Sarajevo',
    godina_izgradnje: 2015,
    datum_objave: '2023-09-20',
    status: 'aktivno',
    opis: 'Prostrana kuća sa velikim ograđenim dvorištem, garažom i ljetnikovcem.',
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
    status: 'prodano',
    opis: 'Udobna planinska vikendica sa kaminom, sauna sobom i direktnim izlazom na stazu.',
  },
  {
    tip_nekretnine: 'Kuća',
    naziv: 'Moderna vila Butmir',
    kvadratura: 200,
    cijena: 520000,
    tip_grijanja: 'toplotne pumpe',
    lokacija: 'Butmir, Sarajevo',
    godina_izgradnje: 2023,
    datum_objave: '2024-02-28',
    status: 'aktivno',
    opis: 'Savremena vila sa vanjskim bazenom, solarnim panelima i visokim nivoom privatnosti.',
  },
  {
    tip_nekretnine: 'Kuća',
    naziv: 'Kuća sa vrtom Hrasno',
    kvadratura: 110,
    cijena: 275000,
    tip_grijanja: 'plin',
    lokacija: 'Hrasno, Sarajevo',
    godina_izgradnje: 2012,
    datum_objave: '2023-10-25',
    status: 'aktivno',
    opis: 'Uredna spratna kuća sa predivnim voćnjakom u mirnom gradskom naselju.',
  },
  {
    tip_nekretnine: 'Kuća',
    naziv: 'Kamena kuća Trebinje',
    kvadratura: 130,
    cijena: 310000,
    tip_grijanja: 'struja',
    lokacija: 'Gradina, Trebinje',
    godina_izgradnje: 2018,
    datum_objave: '2024-01-08',
    status: 'aktivno',
    opis: 'Autentična hercegovačka kamena kuća sa bazenom i maslinjakom.',
  },
  {
    tip_nekretnine: 'Kuća',
    naziv: 'Vikendica pored Une',
    kvadratura: 95,
    cijena: 140000,
    tip_grijanja: 'drva',
    lokacija: 'Lohovo, Bihać',
    godina_izgradnje: 2014,
    datum_objave: '2023-08-14',
    status: 'aktivno',
    opis: 'Prelijepa vikendica sa sopstvenim izlazom na rijeku Unu i uređenim molićem.',
  },
  {
    tip_nekretnine: 'Kuća',
    naziv: 'Kuća za renoviranje Kovači',
    kvadratura: 90,
    cijena: 120000,
    tip_grijanja: 'drva',
    lokacija: 'Kovači, Sarajevo',
    godina_izgradnje: 1985,
    datum_objave: '2023-11-05',
    status: 'arhivirano',
    opis: 'Starogradska kuća koja zahtijeva kompletnu adaptaciju. Odlična lokacija u blizini Baščaršije.',
  },

  // ==================== POSLOVNI PROSTORI ====================
  {
    tip_nekretnine: 'Poslovni prostor',
    naziv: 'Mali poslovni prostor centar',
    kvadratura: 20,
    cijena: 70000,
    tip_grijanja: 'struja',
    lokacija: 'Centar, Sarajevo',
    godina_izgradnje: 2005,
    datum_objave: '2023-08-20',
    status: 'aktivno',
    opis: 'Poslovni prostor u pješačkoj zoni, pogodan za frizerski salon, advokatski ured ili trafiku.',
  },
  {
    tip_nekretnine: 'Poslovni prostor',
    naziv: 'Veliki poslovni prostor',
    kvadratura: 100,
    cijena: 150000,
    tip_grijanja: 'centralno',
    lokacija: 'Novi Grad, Sarajevo',
    godina_izgradnje: 2010,
    datum_objave: '2023-09-10',
    status: 'aktivno',
    opis: 'Prostran otvoren prostor pogodan za IT kancelarije, teretanu ili izložbeni salon.',
  },
  {
    tip_nekretnine: 'Poslovni prostor',
    naziv: 'Kancelarijski prostor SCC',
    kvadratura: 45,
    cijena: 120000,
    tip_grijanja: 'centralno',
    lokacija: 'Marijin Dvor, Sarajevo',
    godina_izgradnje: 2018,
    datum_objave: '2023-11-30',
    status: 'prodano',
    opis: 'Moderan kancelarijski prostor u poslovnom objektu visoke klase sa recepcijom.',
  },
  {
    tip_nekretnine: 'Poslovni prostor',
    naziv: 'Prodavnica u BBI Centru',
    kvadratura: 60,
    cijena: 185000,
    tip_grijanja: 'centralno',
    lokacija: 'Centar, Sarajevo',
    godina_izgradnje: 2015,
    datum_objave: '2023-10-10',
    status: 'aktivno',
    opis: 'Atraktivan prodajni prostor na frekventnom spratu tržnog centra sa staklenim izlogom.',
  },
  {
    tip_nekretnine: 'Poslovni prostor',
    naziv: 'Skladišni prostor Ilidža',
    kvadratura: 200,
    cijena: 95000,
    tip_grijanja: 'plin',
    lokacija: 'Ilidža, Sarajevo',
    godina_izgradnje: 2000,
    datum_objave: '2023-10-30',
    status: 'aktivno',
    opis: 'Prostran skladišni prostor sa visokim stropovima i omogućenim šleperskim prilazom.',
  },
  {
    tip_nekretnine: 'Poslovni prostor',
    naziv: 'Ugostiteljski objekat Babukić',
    kvadratura: 110,
    cijena: 260000,
    tip_grijanja: 'struja',
    lokacija: 'Centar, Zenica',
    godina_izgradnje: 2011,
    datum_objave: '2024-02-14',
    status: 'aktivno',
    opis: 'Kompletno opremljen kafić/restoran sa ljetnom baštom u samom centru Zenice.',
  },

  // ==================== ZEMLJIŠTA I GARAŽE ====================
  {
    tip_nekretnine: 'Zemljište',
    naziv: 'Građevinsko zemljište Rakovica',
    kvadratura: 1200,
    cijena: 65000,
    tip_grijanja: 'nema',
    lokacija: 'Rakovica, Sarajevo',
    godina_izgradnje: 2024,
    datum_objave: '2024-03-01',
    status: 'aktivno',
    opis: 'Ravan plac sa priključcima struje i vode neposredno pored asfaltnog puta.',
  },
  {
    tip_nekretnine: 'Zemljište',
    naziv: 'Atraktivan plac Poljine',
    kvadratura: 2500,
    cijena: 190000,
    tip_grijanja: 'nema',
    lokacija: 'Poljine, Sarajevo',
    godina_izgradnje: 2024,
    datum_objave: '2024-02-20',
    status: 'aktivno',
    opis: 'Ekskluzivno zemljište sa urbanističkom dozvolom za gradnju lux vile.',
  },
  {
    tip_nekretnine: 'Zemljište',
    naziv: 'Plac za vikendicu Jahorina',
    kvadratura: 500,
    cijena: 80000,
    tip_grijanja: 'nema',
    lokacija: 'Jahorina',
    godina_izgradnje: 2024,
    datum_objave: '2023-12-18',
    status: 'prodano',
    opis: 'Zemljište uz samu ski stazu sa očišćenim papirima i građevinskom dozvolom.',
  },
  {
    tip_nekretnine: 'Garaža',
    naziv: 'Garažno mjesto Dobrinja',
    kvadratura: 16,
    cijena: 22000,
    tip_grijanja: 'nema',
    lokacija: 'Dobrinja, Sarajevo',
    godina_izgradnje: 2018,
    datum_objave: '2024-01-25',
    status: 'aktivno',
    opis: 'Zatvoreno garažno mjesto u podzemnoj garaži sa videonadzorom i rolo vratima.',
  },
  {
    tip_nekretnine: 'Garaža',
    naziv: 'Garaža Centar Banja Luka',
    kvadratura: 18,
    cijena: 28000,
    tip_grijanja: 'nema',
    lokacija: 'Centar, Banja Luka',
    godina_izgradnje: 2015,
    datum_objave: '2024-02-05',
    status: 'aktivno',
    opis: 'Zasebna garaža u stambeno-poslovnoj zgradi sa strujom i automatskim vratima.',
  },
  {
    tip_nekretnine: 'Stan',
    naziv: 'Trosoban stan Nova Dretelj',
    kvadratura: 82,
    cijena: 175000,
    tip_grijanja: 'podno',
    lokacija: 'Čapljina',
    godina_izgradnje: 2021,
    datum_objave: '2024-03-10',
    status: 'aktivno',
    opis: 'Nov trosoban stan, moderan dizajn sa dvije velike terase i vlastitim parking mjestom.',
  },
  {
    tip_nekretnine: 'Kuća',
    naziv: 'Imanje sa kućom Blagaj',
    kvadratura: 160,
    cijena: 290000,
    tip_grijanja: 'toplotne pumpe',
    lokacija: 'Blagaj, Mostar',
    godina_izgradnje: 2019,
    datum_objave: '2024-01-30',
    status: 'aktivno',
    opis: 'Prelijepo imanje sa bazenom i sistemom za navodnjavanje, blizu vrela Bune.',
  }
];

const upiti = [
  // --- Stanovi (Sarajevo, Banja Luka, Mostar, Tuzla, Vogošća) ---
  { tekst: 'Da li je stan useljiv odmah po potpisivanju ugovora?', korisnik_username: 'marko', nekretnina_index: 0 },
  { tekst: 'Koliko je parking udaljen od glavnog ulaza u zgradu?', korisnik_username: 'jelena', nekretnina_index: 0 },
  { tekst: 'Kakva je zvučna izolacija i čuje li se gradska buka sa ulice?', korisnik_username: 'ana', nekretnina_index: 0 },
  { tekst: 'Da li je cijena fiksna ili postoji opcija za pregovore?', korisnik_username: 'adnan', nekretnina_index: 1 },
  { tekst: 'Je li papirologija 1/1 i ima li stan tereta u gruntovnici?', korisnik_username: 'lejla', nekretnina_index: 1 },
  { tekst: 'Kada je moguć prvi slobodan pregled ovog studija?', korisnik_username: 'haris', nekretnina_index: 2 },
  { tekst: 'Da li je garsonjera pogodna za iznajmljivanje na dan?', korisnik_username: 'amra', nekretnina_index: 2 },
  { tekst: 'Ima li stan odvojeno mjerilo za vodu i struju?', korisnik_username: 'dino', nekretnina_index: 3 },
  { tekst: 'Može li se penthouse pogledati tokom vikenda?', korisnik_username: 'selma', nekretnina_index: 4 },
  { tekst: 'Koliki su prosječni zimski troškovi podnog grijanja?', korisnik_username: 'goran', nekretnina_index: 4 },
  { tekst: 'Ima li zgrada lift i radi li redovno?', korisnik_username: 'milica', nekretnina_index: 5 },
  { tekst: 'Da li je stan u Boriku uknjižen?', korisnik_username: 'filip', nekretnina_index: 6 },
  { tekst: 'Je li stan u Mostaru opremljen klimom u svim prostorijama?', korisnik_username: 'katarina', nekretnina_index: 7 },
  { tekst: 'Koliko je stan na Slatini udaljen od Medicinskog fakulteta?', korisnik_username: 'sandra', nekretnina_index: 8 },
  { tekst: 'Da li su u garsonjeri u Vogošći zamijenjene instalacije?', korisnik_username: 'vedad', nekretnina_index: 9 },

  // --- Kuće i Vikendice (Ilidža, Bjelašnica, Butmir, Trebinje, Bihać) ---
  { tekst: 'Ima li kuća na Ilidži građevinsku i upotrebnu dozvolu?', korisnik_username: 'nevena', nekretnina_index: 10 },
  { tekst: 'Kakav je prilazni put zimi na Bjelašnici, čisti li se redovno?', korisnik_username: 'boris', nekretnina_index: 11 },
  { tekst: 'Koja je vrsta toplotne pumpe ugrađena u vilu u Butmiru?', korisnik_username: 'nina', nekretnina_index: 12 },
  { tekst: 'Da li kuća u Hrasnom ima kanalizacionu mrežu ili septičku jamu?', korisnik_username: 'mahir', nekretnina_index: 13 },
  { tekst: 'Postoji li sistem za navodnjavanje u bašti u Trebinju?', korisnik_username: 'tarik', nekretnina_index: 14 },
  { tekst: 'Plavi li Una tokom proljeća blizu ove vikendice?', korisnik_username: 'emina', nekretnina_index: 15 },
  { tekst: 'Da li je kuća na Kovačima za kompletno rušenje ili adaptaciju?', korisnik_username: 'ivan', nekretnina_index: 16 },

  // --- Poslovni prostori ---
  { tekst: 'Da li je u ovom prostoru dozvoljena ugostiteljska djelatnost?', korisnik_username: 'petar', nekretnina_index: 17 },
  { tekst: 'Imate li odobrenje za isticanje reklame na fasadi zgrade?', korisnik_username: 'sanja', nekretnina_index: 18 },
  { tekst: 'Koji je napon struje doveden u skladišni prostor na Ilidži?', korisnik_username: 'damir', nekretnina_index: 21 },
  { tekst: 'Koliko stolova staje u ljetnu baštu prostora u Zenici?', korisnik_username: 'nikola', nekretnina_index: 22 },

  // --- Zemljišta i Garaže ---
  { tekst: 'Ima li plac u Rakovici priključak za struju neposredno uz parcelu?', korisnik_username: 'marija', nekretnina_index: 23 },
  { tekst: 'Da li je zemljište na Poljinama u obuhvatu novog regulacionog plana?', korisnik_username: 'adnan', nekretnina_index: 24 },
  { tekst: 'Koje su dimenzije ulaznih vrata podzemne garaže na Dobrinji?', korisnik_username: 'haris', nekretnina_index: 26 },
  { tekst: 'Da li je garaža u Banja Luci pod video nadzorom 24/7?', korisnik_username: 'lejla', nekretnina_index: 27 }
];

const zahtjevi = [
  // --- Stanovi ---
  { 
    tekst: 'Želim pregled stana u subotu ujutro u 10:00h', 
    trazeniDatum: '2026-08-15', 
    odobren: true,
    korisnik_username: 'marko',
    nekretnina_index: 0
  },
  { 
    tekst: 'Molim vas termin za razgledanje lux stana nakon radnog vremena', 
    trazeniDatum: '2026-08-12', 
    odobren: false,
    korisnik_username: 'lejla',
    nekretnina_index: 1
  },
  { 
    tekst: 'Zainteresovan sam za pregled studija tokom radne sedmice', 
    trazeniDatum: '2026-08-18', 
    odobren: true,
    korisnik_username: 'haris',
    nekretnina_index: 2
  },
  { 
    tekst: 'Hitno trebam pregled stana radi selidbe početkom mjeseca', 
    trazeniDatum: '2026-08-05', 
    odobren: false,
    korisnik_username: 'nikola',
    nekretnina_index: 3
  },
  { 
    tekst: 'Pregled penthouse-a sa arhitektom u petak popodne', 
    trazeniDatum: '2026-08-21', 
    odobren: true,
    korisnik_username: 'selma',
    nekretnina_index: 4
  },
  { 
    tekst: 'Mogućnost razgledanja stana na Otoci u nedjelju?', 
    trazeniDatum: '2026-08-23', 
    odobren: false,
    korisnik_username: 'milica',
    nekretnina_index: 5
  },
  { 
    tekst: 'Zahtjev za pregled stana u Boriku (Banja Luka)', 
    trazeniDatum: '2026-08-14', 
    odobren: true,
    korisnik_username: 'filip',
    nekretnina_index: 6
  },
  { 
    tekst: 'Želio bih pogledati stan na Slatini u Tuzli', 
    trazeniDatum: '2026-08-19', 
    odobren: false,
    korisnik_username: 'sandra',
    nekretnina_index: 8
  },
  { 
    tekst: 'Pregled garsonjere u Vogošći u četvrtak iza 17h', 
    trazeniDatum: '2026-08-20', 
    odobren: true,
    korisnik_username: 'vedad',
    nekretnina_index: 9
  },

  // --- Kuće i Vikendice ---
  { 
    tekst: 'Molim vas pregled kuće na Ilidži sa porodicom za vikend', 
    trazeniDatum: '2026-08-16', 
    odobren: true,
    korisnik_username: 'nevena',
    nekretnina_index: 10
  },
  { 
    tekst: 'Zahtjev za razgledanje vikendice na Bjelašnici', 
    trazeniDatum: '2026-08-08', 
    odobren: false,
    korisnik_username: 'boris',
    nekretnina_index: 11
  },
  { 
    tekst: 'Pregled moderne vile u Butmiru sa procjeniteljem', 
    trazeniDatum: '2026-08-25', 
    odobren: true,
    korisnik_username: 'nina',
    nekretnina_index: 12
  },
  { 
    tekst: 'Termin za obilazak kuće u Hrasnom', 
    trazeniDatum: '2026-08-17', 
    odobren: false,
    korisnik_username: 'mahir',
    nekretnina_index: 13
  },
  { 
    tekst: 'Razgledanje kamene kuće u Trebinju tokom vikenda', 
    trazeniDatum: '2026-08-22', 
    odobren: true,
    korisnik_username: 'tarik',
    nekretnina_index: 14
  },
  { 
    tekst: 'Pregled vikendice na Uni u Bihaću', 
    trazeniDatum: '2026-08-28', 
    odobren: false,
    korisnik_username: 'emina',
    nekretnina_index: 15
  },

  // --- Poslovni prostori ---
  { 
    tekst: 'Pregled poslovnog prostora u Centru radi zakupa', 
    trazeniDatum: '2026-08-11', 
    odobren: true,
    korisnik_username: 'petar',
    nekretnina_index: 17
  },
  { 
    tekst: 'Obilazak velikog poslovnog prostora u Novom Gradu', 
    trazeniDatum: '2026-08-13', 
    odobren: false,
    korisnik_username: 'sanja',
    nekretnina_index: 18
  },
  { 
    tekst: 'Pregled lokala u BBI Centru prije podne', 
    trazeniDatum: '2026-08-24', 
    odobren: true,
    korisnik_username: 'adnan',
    nekretnina_index: 20
  },
  { 
    tekst: 'Zahtjev za obilazak skladišnog prostora na Ilidži sa šefom logistike', 
    trazeniDatum: '2026-08-26', 
    odobren: true,
    korisnik_username: 'damir',
    nekretnina_index: 21
  },
  { 
    tekst: 'Razgledanje ugostiteljskog objekta u Zenici', 
    trazeniDatum: '2026-08-15', 
    odobren: false,
    korisnik_username: 'dino',
    nekretnina_index: 22
  },

  // --- Zemljišta i Garaže ---
  { 
    tekst: 'Pregled parcele u Rakovici sa geodetom', 
    trazeniDatum: '2026-08-27', 
    odobren: true,
    korisnik_username: 'marija',
    nekretnina_index: 23
  },
  { 
    tekst: 'Obilazak zemljišta na Poljinama radi gradnje', 
    trazeniDatum: '2026-08-29', 
    odobren: false,
    korisnik_username: 'goran',
    nekretnina_index: 24
  },
  { 
    tekst: 'Pregled garažnog mjesta na Dobrinji i provera rolo vrata', 
    trazeniDatum: '2026-08-10', 
    odobren: true,
    korisnik_username: 'amra',
    nekretnina_index: 26
  }
];

const ponude = [
  // --- Stanovi ---
  {
    tekst: 'Plaćanje u gotovini u roku od 7 dana.',
    cijenaPonude: 220000,
    datumPonude: '2026-07-02',
    status: 'odbijena',
    korisnik_username: 'marko',
    nekretnina_index: 0
  },
  {
    tekst: 'Kredit već odobren od strane banke.',
    cijenaPonude: 228000,
    datumPonude: '2026-07-05',
    status: 'prihvaćena',
    korisnik_username: 'jelena',
    nekretnina_index: 0
  },
  {
    tekst: 'Spremna isplata odmah po preuzimanju papira.',
    cijenaPonude: 265000,
    datumPonude: '2026-07-10',
    status: 'na čekanju',
    korisnik_username: 'adnan',
    nekretnina_index: 1
  },
  {
    tekst: 'Ponuda važi do kraja mjeseca.',
    cijenaPonude: 140000,
    datumPonude: '2026-07-12',
    status: 'na čekanju',
    korisnik_username: 'haris',
    nekretnina_index: 2
  },
  {
    tekst: 'Dogovoreno preuzimanje namještaja uz doplatu.',
    cijenaPonude: 190000,
    datumPonude: '2026-06-28',
    status: 'prihvaćena',
    korisnik_username: 'nikola',
    nekretnina_index: 3
  },
  {
    tekst: 'Ponuda ispod očekivane cijene vlasnika.',
    cijenaPonude: 410000,
    datumPonude: '2026-07-15',
    status: 'odbijena',
    korisnik_username: 'selma',
    nekretnina_index: 4
  },
  {
    tekst: 'Mogućnost uplate avansa od 20%.',
    cijenaPonude: 435000,
    datumPonude: '2026-07-18',
    status: 'na čekanju',
    korisnik_username: 'goran',
    nekretnina_index: 4
  },
  {
    tekst: 'Kreditna sredstva.',
    cijenaPonude: 158000,
    datumPonude: '2026-07-20',
    status: 'na čekanju',
    korisnik_username: 'milica',
    nekretnina_index: 5
  },
  {
    tekst: 'Čeka se potvrdni odgovor suvlasnika.',
    cijenaPonude: 180000,
    datumPonude: '2026-07-22',
    status: 'na čekanju',
    korisnik_username: 'filip',
    nekretnina_index: 6
  },
  {
    tekst: 'Isplata iz vlastitih sredstava.',
    cijenaPonude: 185000,
    datumPonude: '2026-06-15',
    status: 'prihvaćena',
    korisnik_username: 'katarina',
    nekretnina_index: 7
  },
  {
    tekst: 'Odbijeno zbog prevelikog odstupanja od tražene cijene.',
    cijenaPonude: 150000,
    datumPonude: '2026-07-01',
    status: 'odbijena',
    korisnik_username: 'sandra',
    nekretnina_index: 8
  },

  // --- Kuće i Vikendice ---
  {
    tekst: 'Zainteresovani za zamjenu uz doplatu ili čisto kupoprodaju.',
    cijenaPonude: 330000,
    datumPonude: '2026-07-14',
    status: 'na čekanju',
    korisnik_username: 'nevena',
    nekretnina_index: 10
  },
  {
    tekst: 'Ugovor već potpisan.',
    cijenaPonude: 175000,
    datumPonude: '2026-06-02',
    status: 'prihvaćena',
    korisnik_username: 'boris',
    nekretnina_index: 11
  },
  {
    tekst: 'Ekskluzivna ponuda, gotovinsko plaćanje.',
    cijenaPonude: 500000,
    datumPonude: '2026-07-25',
    status: 'na čekanju',
    korisnik_username: 'nina',
    nekretnina_index: 12
  },
  {
    tekst: 'Čeka se provjera tereta u zemljišnim knjigama.',
    cijenaPonude: 295000,
    datumPonude: '2026-07-19',
    status: 'na čekanju',
    korisnik_username: 'tarik',
    nekretnina_index: 14
  },
  {
    tekst: 'Vlasnik traži fiksno 140.000 KM.',
    cijenaPonude: 130000,
    datumPonude: '2026-07-08',
    status: 'odbijena',
    korisnik_username: 'emina',
    nekretnina_index: 15
  },

  // --- Poslovni prostori ---
  {
    tekst: 'Predloženo obročno plaćanje u 3 tranše.',
    cijenaPonude: 65000,
    datumPonude: '2026-07-11',
    status: 'na čekanju',
    korisnik_username: 'petar',
    nekretnina_index: 17
  },
  {
    tekst: 'Ponuda za dugoročni zakup ili otkup.',
    cijenaPonude: 140000,
    datumPonude: '2026-07-16',
    status: 'na čekanju',
    korisnik_username: 'sanja',
    nekretnina_index: 18
  },
  {
    tekst: 'Poslovni prostor kupljen za lanac prodavnica.',
    cijenaPonude: 180000,
    datumPonude: '2026-06-20',
    status: 'prihvaćena',
    korisnik_username: 'adnan',
    nekretnina_index: 20
  },
  {
    tekst: 'Spreman predugovor.',
    cijenaPonude: 90000,
    datumPonude: '2026-07-21',
    status: 'na čekanju',
    korisnik_username: 'damir',
    nekretnina_index: 21
  },

  // --- Zemljišta i Garaže ---
  {
    tekst: 'Uključeni troškovi prepisa u cijenu.',
    cijenaPonude: 60000,
    datumPonude: '2026-07-23',
    status: 'na čekanju',
    korisnik_username: 'marija',
    nekretnina_index: 23
  },
  {
    tekst: 'Vlasnik ne pristaje na cijenu ispod 190.000 KM.',
    cijenaPonude: 175000,
    datumPonude: '2026-07-04',
    status: 'odbijena',
    korisnik_username: 'goran',
    nekretnina_index: 24
  },
  {
    tekst: 'Plaćanje odmah.',
    cijenaPonude: 20000,
    datumPonude: '2026-07-27',
    status: 'na čekanju',
    korisnik_username: 'amra',
    nekretnina_index: 26
  },
  {
    tekst: 'Garaža kupljena zajedno sa stanom.',
    cijenaPonude: 26000,
    datumPonude: '2026-07-09',
    status: 'prihvaćena',
    korisnik_username: 'lejla',
    nekretnina_index: 27
  },
  {
    tekst: 'Čeka se odobrenje stambenog kredita.',
    cijenaPonude: 170000,
    datumPonude: '2026-07-29',
    status: 'na čekanju',
    korisnik_username: 'dino',
    nekretnina_index: 28
  }
];

const komentari = [
  // --- Stanovi ---
  {
    tekst: 'Lokacija je odlična, mirno naselje i sve je blizu. Stan uživo izgleda još bolje nego na slikama!',
    ocjena: 5,
    datum: '2026-07-10',
    korisnik_username: 'marko',
    nekretnina_index: 0
  },
  {
    tekst: 'Dobar stan i kvalitetna gradnja, ali je malo teže pronaći slobodno parking mjesto popodne.',
    ocjena: 4,
    datum: '2026-07-12',
    korisnik_username: 'jelena',
    nekretnina_index: 0
  },
  {
    tekst: 'Prelijep stan u centru, zgrada ima odličnu izolaciju i bazično nema ulične buke.',
    ocjena: 5,
    datum: '2026-07-15',
    korisnik_username: 'adnan',
    nekretnina_index: 1
  },
  {
    tekst: 'Odlična investicija za najam na dan. Prostor je maksimalno iskorišten.',
    ocjena: 5,
    datum: '2026-07-01',
    korisnik_username: 'haris',
    nekretnina_index: 2
  },
  {
    tekst: 'Pogled sa terase penthouse-a ostavlja bez daha. Definitivno opravdava cijenu.',
    ocjena: 5,
    datum: '2026-07-20',
    korisnik_username: 'selma',
    nekretnina_index: 4
  },
  {
    tekst: 'Stan je u redu, ali su režije zimi nešto više od očekivanog.',
    ocjena: 3,
    datum: '2026-06-25',
    korisnik_username: 'milica',
    nekretnina_index: 5
  },
  {
    tekst: 'Kompletno renoviran stan, bez dodatnih ulaganja. Sve pohvale za vlasnika na iskrenosti.',
    ocjena: 5,
    datum: '2026-07-08',
    korisnik_username: 'filip',
    nekretnina_index: 6
  },
  {
    tekst: 'Super lokacija u Tuzli, blizu fakulteta. Idealan stan za studente.',
    ocjena: 4,
    datum: '2026-07-18',
    korisnik_username: 'sandra',
    nekretnina_index: 8
  },

  // --- Kuće i Vikendice ---
  {
    tekst: 'Dvorište je ogromno i prelijepo uređeno. Kuća je izuzetno prostrana i funkcionalna.',
    ocjena: 5,
    datum: '2026-06-30',
    korisnik_username: 'nevena',
    nekretnina_index: 10
  },
  {
    tekst: 'Pravi mali raj na planini. Kamin u dnevnom boravku pravi nevjerovatnu atmosferu.',
    ocjena: 5,
    datum: '2026-05-14',
    korisnik_username: 'boris',
    nekretnina_index: 11
  },
  {
    tekst: 'Vila je vrhunski opremljena, toplotne pumpe rade besprijekorno. Sve preporuke!',
    ocjena: 5,
    datum: '2026-07-22',
    korisnik_username: 'nina',
    nekretnina_index: 12
  },
  {
    tekst: 'Mirna lokacija u Trebinju, blizu grada a pruža potpunu privatnost. Bazen je čist i održavan.',
    ocjena: 5,
    datum: '2026-07-05',
    korisnik_username: 'tarik',
    nekretnina_index: 14
  },
  {
    tekst: 'Pristup rijeci Uni je fantastičan, idealno mjesto za odmor vikendom.',
    ocjena: 4,
    datum: '2026-07-19',
    korisnik_username: 'emina',
    nekretnina_index: 15
  },

  // --- Poslovni prostori ---
  {
    tekst: 'Prostor je na odličnoj pješačkoj zoni sa velikim protokom ljudi. Idealan za lokal.',
    ocjena: 5,
    datum: '2026-06-18',
    korisnik_username: 'petar',
    nekretnina_index: 17
  },
  {
    tekst: 'Skladište ima odličan prilaz za kamione, manipulativni prostor je dovoljno velik.',
    ocjena: 4,
    datum: '2026-07-11',
    korisnik_username: 'damir',
    nekretnina_index: 21
  },
  {
    tekst: 'Ljetna bašta ugostiteljskog objekta je puna tokom cijelog dana, odličan potencijal.',
    ocjena: 5,
    datum: '2026-07-16',
    korisnik_username: 'nikola',
    nekretnina_index: 22
  },

  // --- Zemljišta i Garaže ---
  {
    tekst: 'Plac je potpuno ravan i spreman za gradnju. Priključci su zaista bili na samoj parceli.',
    ocjena: 5,
    datum: '2026-07-25',
    korisnik_username: 'marija',
    nekretnina_index: 23
  },
  {
    tekst: 'Pristupni put do parcele na Poljinama je malo uzak, ali je pogled na grad nevjerovatan.',
    ocjena: 4,
    datum: '2026-07-03',
    korisnik_username: 'goran',
    nekretnina_index: 24
  },
  {
    tekst: 'Garaža je suha, sigurna i lako se ulazi sa većim automobilom.',
    ocjena: 5,
    datum: '2026-07-28',
    korisnik_username: 'amra',
    nekretnina_index: 26
  }
];

async function seedDatabase() {
  try {
    console.log('🌱 Pokretanje proširenog seedera...');

    // 1. Hashiranje lozinki i kreiranje korisnika
    const hashedKorisnici = await Promise.all(
      korisnici.map(async (k) => {
        const hashedPassword = await bcrypt.hash(k.password, 10);
        return { ...k, password: hashedPassword };
      })
    );

    await Korisnik.bulkCreate(hashedKorisnici);
    console.log('✅ Korisnici uspješno dodani');

    // 2. Dodavanje nekretnina sa vlasnicima (KorisnikId)
    const sviKorisnici = await Korisnik.findAll();
    const nekretnineSaPodacima = nekretnine.map((n, index) => ({
      ...n,
      KorisnikId: sviKorisnici[index % sviKorisnici.length].id,
    }));

    await Nekretnina.bulkCreate(nekretnineSaPodacima);
    console.log('✅ Nekretnine uspješno dodane');

    const sveNekretnine = await Nekretnina.findAll();

    // 3. Dodavanje upita
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
    console.log('✅ Upiti uspješno dodani');

    // 4. Dodavanje zahtjeva za pregled
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
    console.log('✅ Zahtjevi uspješno dodani');

    // 5. Dodavanje ponuda
    for (const ponuda of ponude) {
      const korisnik = sviKorisnici.find(k => k.username === ponuda.korisnik_username);
      const nekretnina = sveNekretnine[ponuda.nekretnina_index];

      if (korisnik && nekretnina) {
        await Ponuda.create({
          tekst: ponuda.tekst,
          cijenaPonude: ponuda.cijenaPonude,
          datumPonude: ponuda.datumPonude,
          odbijenaPonuda: ponuda.odbijenaPonuda,
          prihvacenaPonuda: ponuda.prihvacenaPonuda ?? false,
          KorisnikId: korisnik.id,
          NekretninaId: nekretnina.id,
        });
      }
    }
    console.log('✅ Ponude uspješno dodane');

    // Helper funkcija za rekurzivno kreiranje ugniježđenih odgovora na komentare
    async function kreirajKomentarSaOdgovorima(kData, nekretninaId, parentId = null) {
      const korisnik = sviKorisnici.find(k => k.username === kData.korisnik_username);
      if (!korisnik) return;

      const kreiraniKomentar = await Komentar.create({
        tekst: kData.tekst,
        KorisnikId: korisnik.id,
        NekretninaId: nekretninaId,
        idVezanogKomentara: parentId
      });

      if (kData.odgovori && kData.odgovori.length > 0) {
        for (const odg of kData.odgovori) {
          await kreirajKomentarSaOdgovorima(odg, nekretninaId, kreiraniKomentar.id);
        }
      }
    }

    // 6. Dodavanje rekurzivnih komentara
    for (const kPodatak of komentari) {
      const nekretnina = sveNekretnine[kPodatak.nekretnina_index];
      if (nekretnina) {
        await kreirajKomentarSaOdgovorima(kPodatak, nekretnina.id);
      }
    }
    console.log('✅ Komentari (sa pod-odgovorima) uspješno dodani');

    console.log('🎉 Seeder uspješno završen!');
  } catch (error) {
    console.error('❌ Greška pri seedovanju baze:', error);
    throw error;
  }
}

module.exports = { seedDatabase };
