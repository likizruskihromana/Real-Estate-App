const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Korisnik', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    ime: { type: DataTypes.STRING, allowNull: false },
    prezime: { type: DataTypes.STRING, allowNull: false },
    username: { type: DataTypes.STRING, unique: true, allowNull: false },
    password: { type: DataTypes.STRING, allowNull: false },
    admin: { type: DataTypes.BOOLEAN, defaultValue: false },
  }, {
    freezeTableName: true,
    tableName: 'korisnik',
  });
};