const { DataTypes } = require('sequelize');

async function up({ queryInterface, transaction }) {
  const tabele = (await queryInterface.showAllTables()).map(String).map((ime) => ime.toLowerCase());
  if (tabele.includes('slika_nekretnine')) return;

  await queryInterface.createTable('slika_nekretnine', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    url: { type: DataTypes.STRING(500), allowNull: false },
    filename: { type: DataTypes.STRING(255), allowNull: false, unique: true },
    originalName: { type: DataTypes.STRING(255), allowNull: false },
    mimeType: { type: DataTypes.STRING(100), allowNull: false },
    velicina: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    glavna: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    redoslijed: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
    NekretninaId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'nekretnina', key: 'id' },
      onDelete: 'CASCADE',
    },
    createdAt: { type: DataTypes.DATE, allowNull: false },
    updatedAt: { type: DataTypes.DATE, allowNull: false },
  }, { transaction });

  await queryInterface.addIndex('slika_nekretnine', ['NekretninaId', 'glavna', 'redoslijed'], {
    transaction,
    name: 'slika_nekretnine_prikaz_idx',
  });
}

async function down({ queryInterface, transaction }) {
  await queryInterface.dropTable('slika_nekretnine', { transaction });
}

module.exports = { name: '002-property-images', up, down };
