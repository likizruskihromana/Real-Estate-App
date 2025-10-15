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
    logging: config.server.nodeEnv === 'development' ? console.log : false,
  }
);

const Korisnik = require('./Korisnik')(sequelize);
const Nekretnina = require('./Nekretnina')(sequelize);
const Upit = require('./Upit')(sequelize);
const Zahtjev = require('./Zahtjev')(sequelize);
const Ponuda = require('./Ponuda')(sequelize);

// Veze
Korisnik.hasMany(Nekretnina);
Nekretnina.belongsTo(Korisnik);

Nekretnina.hasMany(Upit);
Upit.belongsTo(Nekretnina);

Korisnik.hasMany(Upit);
Upit.belongsTo(Korisnik);

Nekretnina.hasMany(Zahtjev);
Zahtjev.belongsTo(Nekretnina);

Korisnik.hasMany(Zahtjev);
Zahtjev.belongsTo(Korisnik);

Nekretnina.hasMany(Ponuda);
Ponuda.belongsTo(Nekretnina);

Korisnik.hasMany(Ponuda);
Ponuda.belongsTo(Korisnik);

Ponuda.hasMany(Ponuda, { as: 'VezanePonude', foreignKey: 'idVezanePonude' });
Ponuda.belongsTo(Ponuda, { as: 'RootPonuda', foreignKey: 'idVezanePonude' });

module.exports = { sequelize, Korisnik, Nekretnina, Upit, Zahtjev, Ponuda };