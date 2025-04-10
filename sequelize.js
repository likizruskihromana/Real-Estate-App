const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize('wt24', 'root', 'password', {
  host: '127.0.0.1',
  dialect: 'mysql',
  port: 3306,
  logging: false,
});


// Define models
const Korisnik = sequelize.define('Korisnik', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  ime: { type: DataTypes.STRING, allowNull: false },
  prezime: { type: DataTypes.STRING, allowNull: false },
  username: { type: DataTypes.STRING, unique: true, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false },
  admin: { type: DataTypes.BOOLEAN, defaultValue: false },
}, {
  freezeTableName: true, // Sprečava automatsko dodavanje "s" na kraju imena tabele
  tableName: 'korisnik',  // Dodajte ovo da se osigura da tabela nosi pravilno ime
});

const Nekretnina = sequelize.define('Nekretnina', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  tip_nekretnine: { type: DataTypes.STRING, allowNull: false },
  naziv: { type: DataTypes.STRING, allowNull: false },
  kvadratura: { type: DataTypes.INTEGER, allowNull: false },
  cijena: { type: DataTypes.DECIMAL, allowNull: false },
  tip_grijanja: { type: DataTypes.STRING, allowNull: true },
  lokacija: { type: DataTypes.STRING, allowNull: false },
  godina_izgradnje: { type: DataTypes.INTEGER, allowNull: true },
  datum_objave: { type: DataTypes.DATEONLY, allowNull: false },
  opis: { type: DataTypes.TEXT, allowNull: true },
}, {
  freezeTableName: true, // Sprečava automatsko dodavanje "s" na kraju imena tabele
  tableName: 'nekretnina',  // Dodajte ovo da se osigura da tabela nosi pravilno ime
});

const Upit = sequelize.define('Upit', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  tekst: { type: DataTypes.TEXT, allowNull: false },
}, {
  freezeTableName: true, // Sprečava automatsko dodavanje "s" na kraju imena tabele
  tableName: 'upit',  // Dodajte ovo da se osigura da tabela nosi pravilno ime
});

const Zahtjev = sequelize.define('Zahtjev', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  tekst: { type: DataTypes.TEXT, allowNull: false },
  trazeniDatum: { type: DataTypes.DATE, allowNull: false },
  odobren: { type: DataTypes.BOOLEAN, defaultValue: false },
} ,{
  freezeTableName: true, // Sprečava automatsko dodavanje "s" na kraju imena tabele
  tableName: 'zahtjev',  // Dodajte ovo da se osigura da tabela nosi pravilno ime
});

const Ponuda = sequelize.define('Ponuda', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  tekst: { type: DataTypes.TEXT, allowNull: false },
  cijenaPonude: { type: DataTypes.DECIMAL, allowNull: false },
  datumPonude: { type: DataTypes.DATE, allowNull: false },
  odbijenaPonuda: { type: DataTypes.BOOLEAN, defaultValue: false },
},{
  freezeTableName: true, // Sprečava automatsko dodavanje "s" na kraju imena tabele
  tableName: 'ponuda',  // Dodajte ovo da se osigura da tabela nosi pravilno ime
});

//VEZE
Korisnik.hasMany(Nekretnina);
Nekretnina.belongsTo(Korisnik);

Nekretnina.hasMany(Upit);
Upit.belongsTo(Nekretnina);

Nekretnina.hasMany(Zahtjev);
Zahtjev.belongsTo(Nekretnina);

Nekretnina.hasMany(Ponuda);
Ponuda.belongsTo(Nekretnina);

Korisnik.hasMany(Ponuda);
Ponuda.belongsTo(Korisnik);

Ponuda.hasMany(Ponuda, { as: 'VezanePonude', foreignKey: 'idVezanePonude' });
Ponuda.belongsTo(Ponuda, { as: 'RootPonuda', foreignKey: 'idVezanePonude' });

module.exports = {
  sequelize,
  Korisnik,
  Nekretnina,
  Upit,
  Zahtjev,
  Ponuda,
};
