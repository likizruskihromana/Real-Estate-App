const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Ponuda = sequelize.define('Ponuda', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    tekst: { type: DataTypes.TEXT, allowNull: false },
    cijenaPonude: { type: DataTypes.DECIMAL, allowNull: false },
    datumPonude: { type: DataTypes.DATE, allowNull: false },
    odbijenaPonuda: { type: DataTypes.BOOLEAN, defaultValue: false },
  }, {
    freezeTableName: true,
    tableName: 'ponuda',
  });

  return Ponuda;
};
