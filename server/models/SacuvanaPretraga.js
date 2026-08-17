const { DataTypes } = require('sequelize');

module.exports = (sequelize) => sequelize.define('SacuvanaPretraga', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  naziv: { type: DataTypes.STRING(100), allowNull: false },
  lokacija: { type: DataTypes.STRING(255), allowNull: true },
  tip: { type: DataTypes.STRING(50), allowNull: true },
  maxCijena: { type: DataTypes.DECIMAL(12, 2), allowNull: true },
  sortiranje: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'najnovije' },
}, {
  freezeTableName: true,
  tableName: 'sacuvana_pretraga',
});
