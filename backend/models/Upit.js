const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Upit', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    tekst: { type: DataTypes.TEXT, allowNull: false },
  }, {
    freezeTableName: true,
    tableName: 'upit',
  });
};