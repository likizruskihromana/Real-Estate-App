const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Upit', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    tekst: { type: DataTypes.TEXT, allowNull: false },
    odgovor: { type: DataTypes.TEXT, allowNull: true },
  }, {
    freezeTableName: true,
    tableName: 'upit',
  });
};