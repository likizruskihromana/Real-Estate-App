const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Zahtjev', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    tekst: { type: DataTypes.TEXT, allowNull: false },
    trazeniDatum: { type: DataTypes.DATE, allowNull: false },
    odobren: { type: DataTypes.BOOLEAN, defaultValue: false },
  }, {
    freezeTableName: true,
    tableName: 'zahtjev',
  });
};