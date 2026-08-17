const { DataTypes } = require('sequelize');

module.exports = (sequelize) => sequelize.define('PodudaranjeSacuvanePretrage', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
}, {
  freezeTableName: true,
  tableName: 'podudaranje_sacuvane_pretrage',
  updatedAt: false,
  indexes: [{ unique: true, fields: ['SacuvanaPretragaId', 'NekretninaId'], name: 'podudaranje_pretraga_oglas_uq' }],
});
