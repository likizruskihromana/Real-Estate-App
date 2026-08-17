const { DataTypes } = require('sequelize');

module.exports = (sequelize) => sequelize.define('SlikaNekretnine', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  url: { type: DataTypes.STRING(500), allowNull: false },
  filename: { type: DataTypes.STRING(255), allowNull: false, unique: true },
  originalName: { type: DataTypes.STRING(255), allowNull: false },
  mimeType: { type: DataTypes.STRING(100), allowNull: false },
  velicina: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  glavna: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  redoslijed: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
}, {
  freezeTableName: true,
  tableName: 'slika_nekretnine',
});
