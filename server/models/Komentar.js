const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Komentar = sequelize.define('Komentar', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    tekst: { type: DataTypes.TEXT, allowNull: false },
    idVezanogKomentara: { 
      type: DataTypes.INTEGER, 
      allowNull: true,
      references: {
        model: 'komentar',
        key: 'id'
      }
    }
  }, {
    freezeTableName: true,
    tableName: 'komentar',
  });

  return Komentar;
};