const { DataTypes } = require('sequelize');

const poslovneTabele = ['korisnik', 'nekretnina', 'upit', 'zahtjev', 'ponuda', 'komentar'];

const timestamps = {
  createdAt: { type: DataTypes.DATE, allowNull: false },
  updatedAt: { type: DataTypes.DATE, allowNull: false },
};

const id = () => ({ type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true });

async function up({ queryInterface, transaction }) {
  const postojece = (await queryInterface.showAllTables()).map(String).map((ime) => ime.toLowerCase());
  const postojecePoslovne = poslovneTabele.filter((ime) => postojece.includes(ime));

  const kreirajSessionTabelu = async () => {
    if (postojece.includes('sessions')) return;
    await queryInterface.createTable('sessions', {
      session_id: { type: DataTypes.STRING(128), allowNull: false, primaryKey: true },
      expires: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      data: { type: DataTypes.TEXT('medium'), allowNull: true },
    }, { transaction });
  };

  // Postojeća kompletna instalacija se samo označava kao baseline. Djelimičnu
  // šemu ne pokušavamo nagađati ili automatski popravljati.
  if (postojecePoslovne.length === poslovneTabele.length) {
    await kreirajSessionTabelu();
    return;
  }
  if (postojecePoslovne.length > 0) {
    throw new Error(`Pronađena je djelimična šema (${postojecePoslovne.join(', ')}). Napravite backup i dovršite je ručno.`);
  }

  await queryInterface.createTable('korisnik', {
    id: id(),
    ime: { type: DataTypes.STRING(100), allowNull: false },
    prezime: { type: DataTypes.STRING(100), allowNull: false },
    username: { type: DataTypes.STRING(50), allowNull: false, unique: true },
    password: { type: DataTypes.STRING(255), allowNull: false },
    admin: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    ...timestamps,
  }, { transaction });

  await queryInterface.createTable('nekretnina', {
    id: id(),
    tip_nekretnine: { type: DataTypes.STRING(50), allowNull: false },
    naziv: { type: DataTypes.STRING(255), allowNull: false },
    kvadratura: { type: DataTypes.INTEGER, allowNull: false },
    cijena: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    tip_grijanja: { type: DataTypes.STRING(100), allowNull: true },
    lokacija: { type: DataTypes.STRING(255), allowNull: false },
    godina_izgradnje: { type: DataTypes.INTEGER, allowNull: true },
    datum_objave: { type: DataTypes.DATEONLY, allowNull: false },
    opis: { type: DataTypes.TEXT, allowNull: true },
    kupljeno: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    datumKupovine: { type: DataTypes.DATE, allowNull: true },
    prodajnaCijena: { type: DataTypes.DECIMAL(12, 2), allowNull: true },
    kupacId: { type: DataTypes.INTEGER, allowNull: true, references: { model: 'korisnik', key: 'id' }, onDelete: 'SET NULL' },
    KorisnikId: { type: DataTypes.INTEGER, allowNull: true, references: { model: 'korisnik', key: 'id' }, onDelete: 'SET NULL' },
    ...timestamps,
  }, { transaction });

  await queryInterface.createTable('upit', {
    id: id(),
    tekst: { type: DataTypes.TEXT, allowNull: false },
    odgovor: { type: DataTypes.TEXT, allowNull: true },
    NekretninaId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'nekretnina', key: 'id' }, onDelete: 'CASCADE' },
    KorisnikId: { type: DataTypes.INTEGER, allowNull: true, references: { model: 'korisnik', key: 'id' }, onDelete: 'SET NULL' },
    ...timestamps,
  }, { transaction });

  await queryInterface.createTable('zahtjev', {
    id: id(),
    tekst: { type: DataTypes.TEXT, allowNull: false },
    trazeniDatum: { type: DataTypes.DATE, allowNull: false },
    odobren: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    odgovor: { type: DataTypes.TEXT, allowNull: true },
    NekretninaId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'nekretnina', key: 'id' }, onDelete: 'CASCADE' },
    KorisnikId: { type: DataTypes.INTEGER, allowNull: true, references: { model: 'korisnik', key: 'id' }, onDelete: 'SET NULL' },
    ...timestamps,
  }, { transaction });

  await queryInterface.createTable('ponuda', {
    id: id(),
    tekst: { type: DataTypes.TEXT, allowNull: false },
    cijenaPonude: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    datumPonude: { type: DataTypes.DATE, allowNull: false },
    odbijenaPonuda: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    prihvacenaPonuda: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    idVezanePonude: { type: DataTypes.INTEGER, allowNull: true, references: { model: 'ponuda', key: 'id' }, onDelete: 'SET NULL' },
    NekretninaId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'nekretnina', key: 'id' }, onDelete: 'CASCADE' },
    KorisnikId: { type: DataTypes.INTEGER, allowNull: true, references: { model: 'korisnik', key: 'id' }, onDelete: 'SET NULL' },
    ...timestamps,
  }, { transaction });

  await queryInterface.createTable('komentar', {
    id: id(),
    tekst: { type: DataTypes.TEXT, allowNull: false },
    idVezanogKomentara: { type: DataTypes.INTEGER, allowNull: true, references: { model: 'komentar', key: 'id' }, onDelete: 'SET NULL' },
    NekretninaId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'nekretnina', key: 'id' }, onDelete: 'CASCADE' },
    KorisnikId: { type: DataTypes.INTEGER, allowNull: true, references: { model: 'korisnik', key: 'id' }, onDelete: 'SET NULL' },
    ...timestamps,
  }, { transaction });

  await queryInterface.addIndex('nekretnina', ['kupljeno', 'datum_objave'], { transaction, name: 'nekretnina_status_datum_idx' });
  await queryInterface.addIndex('nekretnina', ['lokacija'], { transaction, name: 'nekretnina_lokacija_idx' });
  await queryInterface.addIndex('upit', ['NekretninaId', 'KorisnikId'], { transaction, name: 'upit_nekretnina_korisnik_idx' });
  await queryInterface.addIndex('ponuda', ['NekretninaId', 'KorisnikId'], { transaction, name: 'ponuda_nekretnina_korisnik_idx' });
  await queryInterface.addIndex('komentar', ['NekretninaId', 'createdAt'], { transaction, name: 'komentar_nekretnina_datum_idx' });
  await kreirajSessionTabelu();
}

async function down({ queryInterface, transaction }) {
  for (const tabela of ['sessions', 'komentar', 'ponuda', 'zahtjev', 'upit', 'nekretnina', 'korisnik']) {
    await queryInterface.dropTable(tabela, { transaction });
  }
}

module.exports = { name: '001-initial-schema', up, down };
