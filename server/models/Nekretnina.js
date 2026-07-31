const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Nekretnina', {
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
    kupljeno: { type: DataTypes.BOOLEAN, defaultValue: false },
    datumKupovine: { type: DataTypes.DATE, allowNull: true },
    prodajnaCijena: { type: DataTypes.DECIMAL, allowNull: true },
    kupacId: { type: DataTypes.INTEGER, allowNull: true },
  }, {
    freezeTableName: true,
    tableName: 'nekretnina',
  });
};