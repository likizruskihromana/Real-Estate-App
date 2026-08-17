const { DataTypes } = require('sequelize');

module.exports = (sequelize) => sequelize.define('OmiljenaNekretnina', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
}, {
  freezeTableName: true,
  tableName: 'omiljena_nekretnina',
});
