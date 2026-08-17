const { DataTypes } = require('sequelize');
const { sequelize } = require('../models');
const initialSchema = require('./001-initial-schema');

const migrations = [initialSchema];

async function osigurajMetaTabelu(queryInterface) {
  const tabele = (await queryInterface.showAllTables()).map(String).map((ime) => ime.toLowerCase());
  if (tabele.includes('sequelizemeta')) return;
  await queryInterface.createTable('SequelizeMeta', {
    name: { type: DataTypes.STRING(255), allowNull: false, primaryKey: true },
  });
}

async function migrate() {
  const queryInterface = sequelize.getQueryInterface();
  await sequelize.authenticate();
  await osigurajMetaTabelu(queryInterface);

  const [redovi] = await sequelize.query('SELECT name FROM SequelizeMeta');
  const izvrsene = new Set(redovi.map((red) => red.name));

  for (const migration of migrations) {
    if (izvrsene.has(migration.name)) continue;
    await sequelize.transaction(async (transaction) => {
      await migration.up({ queryInterface, sequelize, transaction });
      await queryInterface.bulkInsert('SequelizeMeta', [{ name: migration.name }], { transaction });
    });
    console.log(`✅ Migracija izvršena: ${migration.name}`);
  }
}

async function undo() {
  const queryInterface = sequelize.getQueryInterface();
  await sequelize.authenticate();
  await osigurajMetaTabelu(queryInterface);
  const [redovi] = await sequelize.query('SELECT name FROM SequelizeMeta ORDER BY name DESC LIMIT 1');
  if (!redovi.length) return console.log('Nema migracija za poništavanje.');

  const migration = migrations.find((stavka) => stavka.name === redovi[0].name);
  if (!migration) throw new Error(`Kod migracije ${redovi[0].name} nije dostupan.`);
  await sequelize.transaction(async (transaction) => {
    await migration.down({ queryInterface, sequelize, transaction });
    await queryInterface.bulkDelete('SequelizeMeta', { name: migration.name }, { transaction });
  });
  console.log(`↩️ Migracija poništena: ${migration.name}`);
}

const akcija = process.argv[2] === '--undo' ? undo : migrate;
akcija()
  .catch((error) => {
    console.error('Migracija nije uspjela:', error);
    process.exitCode = 1;
  })
  .finally(() => sequelize.close());
