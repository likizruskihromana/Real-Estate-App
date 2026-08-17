const { DataTypes } = require('sequelize');

async function up({ queryInterface, transaction }) {
  const tabele = (await queryInterface.showAllTables()).map(String).map((ime) => ime.toLowerCase());
  if (!tabele.includes('omiljena_nekretnina')) {
    await queryInterface.createTable('omiljena_nekretnina', {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      KorisnikId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'korisnik', key: 'id' }, onDelete: 'CASCADE' },
      NekretninaId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'nekretnina', key: 'id' }, onDelete: 'CASCADE' },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
    }, { transaction });
    await queryInterface.addIndex('omiljena_nekretnina', ['KorisnikId', 'NekretninaId'], {
      transaction, unique: true, name: 'omiljena_korisnik_nekretnina_uq',
    });
  }

  if (!tabele.includes('sacuvana_pretraga')) {
    await queryInterface.createTable('sacuvana_pretraga', {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      naziv: { type: DataTypes.STRING(100), allowNull: false },
      lokacija: { type: DataTypes.STRING(255), allowNull: true },
      tip: { type: DataTypes.STRING(50), allowNull: true },
      maxCijena: { type: DataTypes.DECIMAL(12, 2), allowNull: true },
      sortiranje: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'najnovije' },
      KorisnikId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'korisnik', key: 'id' }, onDelete: 'CASCADE' },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
    }, { transaction });
    await queryInterface.addIndex('sacuvana_pretraga', ['KorisnikId', 'createdAt'], {
      transaction, name: 'sacuvana_pretraga_korisnik_datum_idx',
    });
  }
}

async function down({ queryInterface, transaction }) {
  await queryInterface.dropTable('sacuvana_pretraga', { transaction });
  await queryInterface.dropTable('omiljena_nekretnina', { transaction });
}

module.exports = { name: '003-saved-items', up, down };
