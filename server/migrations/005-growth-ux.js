const { DataTypes } = require('sequelize');

async function addColumns(queryInterface, table, columns, transaction) {
  const current = await queryInterface.describeTable(table);
  for (const [name, definition] of Object.entries(columns)) {
    if (!current[name]) await queryInterface.addColumn(table, name, definition, { transaction });
  }
}

async function up({ queryInterface, transaction }) {
  await addColumns(queryInterface, 'sacuvana_pretraga', {
    kriteriji: { type: DataTypes.JSON, allowNull: true },
    fingerprint: { type: DataTypes.STRING(64), allowNull: true },
    alertsEnabled: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  }, transaction);
  await addColumns(queryInterface, 'slika_nekretnine', {
    thumbnailUrl: { type: DataTypes.STRING(500), allowNull: true },
    mediumUrl: { type: DataTypes.STRING(500), allowNull: true },
    largeUrl: { type: DataTypes.STRING(500), allowNull: true },
    sirina: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
    visina: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
  }, transaction);
  const tables = new Set((await queryInterface.showAllTables()).map(String).map(x => x.toLowerCase()));
  if (!tables.has('podudaranje_sacuvane_pretrage')) {
    await queryInterface.createTable('podudaranje_sacuvane_pretrage', {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      SacuvanaPretragaId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'sacuvana_pretraga', key: 'id' }, onDelete: 'CASCADE' },
      NekretninaId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'nekretnina', key: 'id' }, onDelete: 'CASCADE' },
      createdAt: { type: DataTypes.DATE, allowNull: false },
    }, { transaction });
    await queryInterface.addIndex('podudaranje_sacuvane_pretrage', ['SacuvanaPretragaId', 'NekretninaId'], { unique: true, name: 'podudaranje_pretraga_oglas_uq', transaction });
  }
}

async function down({ queryInterface, transaction }) {
  const tables = new Set((await queryInterface.showAllTables()).map(String).map(x => x.toLowerCase()));
  if (tables.has('podudaranje_sacuvane_pretrage')) await queryInterface.dropTable('podudaranje_sacuvane_pretrage', { transaction });
  for (const [table, columns] of Object.entries({
    sacuvana_pretraga: ['kriteriji', 'fingerprint', 'alertsEnabled'],
    slika_nekretnine: ['thumbnailUrl', 'mediumUrl', 'largeUrl', 'sirina', 'visina'],
  })) {
    const current = await queryInterface.describeTable(table);
    for (const column of columns) if (current[column]) await queryInterface.removeColumn(table, column, { transaction });
  }
}

module.exports = { name: '005-growth-ux', up, down };
