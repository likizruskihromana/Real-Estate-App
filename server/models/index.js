const { Sequelize } = require('sequelize');
const config = require('../config/env');

const sequelize = new Sequelize(
  config.database.name,
  config.database.user,
  config.database.password,
  {
    host: config.database.host,
    dialect: 'mysql',
    port: config.database.port,
    logging: false,
  }
);

const Korisnik = require('./Korisnik')(sequelize);
const Nekretnina = require('./Nekretnina')(sequelize);
const Upit = require('./Upit')(sequelize);
const Zahtjev = require('./Zahtjev')(sequelize);
const Ponuda = require('./Ponuda')(sequelize);
const Komentar = require('./Komentar')(sequelize); // <-- DODANO

// Veze
Korisnik.hasMany(Nekretnina);
Nekretnina.belongsTo(Korisnik);

Nekretnina.hasMany(Upit, { as: 'Upiti' });
Upit.belongsTo(Nekretnina);
Korisnik.hasMany(Upit, { as: 'Upiti' });
Upit.belongsTo(Korisnik);

Nekretnina.hasMany(Zahtjev, { as: 'Zahtjevi' });
Zahtjev.belongsTo(Nekretnina);
Korisnik.hasMany(Zahtjev, { as: 'Zahtjevi' });
Zahtjev.belongsTo(Korisnik);

Nekretnina.hasMany(Ponuda, { as: 'Ponude' });
Ponuda.belongsTo(Nekretnina);
Korisnik.hasMany(Ponuda, { as: 'Ponude' });
Ponuda.belongsTo(Korisnik);
Ponuda.hasMany(Ponuda, { as: 'VezanePonude', foreignKey: 'idVezanePonude' });
Ponuda.belongsTo(Ponuda, { as: 'RootPonuda', foreignKey: 'idVezanePonude' });

// --- NOVE VEZE ZA KOMENTARE ---
Nekretnina.hasMany(Komentar, { as: 'Komentari' });
Komentar.belongsTo(Nekretnina);

Korisnik.hasMany(Komentar, { as: 'Komentari' });
Komentar.belongsTo(Korisnik);

Komentar.hasMany(Komentar, { as: 'Odgovori', foreignKey: 'idVezanogKomentara' });
Komentar.belongsTo(Komentar, { as: 'GlavniKomentar', foreignKey: 'idVezanogKomentara' });

Nekretnina.prototype.getInteresovanja = async function () {
  const [upiti, zahtjevi, ponude] = await Promise.all([
    this.getUpiti(),
    this.getZahtjevi(),
    this.getPonude(),
  ]);
  return [...upiti, ...zahtjevi, ...ponude];
};

module.exports = { sequelize, Korisnik, Nekretnina, Upit, Zahtjev, Ponuda, Komentar };