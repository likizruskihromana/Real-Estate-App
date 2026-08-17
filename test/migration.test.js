const test = require('node:test');
const assert = require('node:assert/strict');
const migration = require('../server/migrations/001-initial-schema');
const imageMigration = require('../server/migrations/002-property-images');
const savedMigration = require('../server/migrations/003-saved-items');
const domusV2Migration = require('../server/migrations/004-domus-v2');

test('početna migracija odbija djelimično postojeću šemu', async () => {
  const queryInterface = { showAllTables: async () => ['korisnik'] };
  await assert.rejects(
    migration.up({ queryInterface, transaction: {} }),
    /djelimična šema/
  );
});

test('početna migracija kreira sve poslovne tabele pravilnim redoslijedom', async () => {
  const kreirane = [];
  const queryInterface = {
    showAllTables: async () => [],
    createTable: async (ime) => { kreirane.push(ime); },
    addIndex: async () => {},
  };
  await migration.up({ queryInterface, transaction: {} });
  assert.deepEqual(kreirane, ['korisnik', 'nekretnina', 'upit', 'zahtjev', 'ponuda', 'komentar', 'sessions']);
});

test('kompletna postojeća šema se prihvata kao baseline i dobija session tabelu', async () => {
  let createPozvan = false;
  const queryInterface = {
    showAllTables: async () => ['korisnik', 'nekretnina', 'upit', 'zahtjev', 'ponuda', 'komentar'],
    createTable: async () => { createPozvan = true; },
  };
  await migration.up({ queryInterface, transaction: {} });
  assert.equal(createPozvan, true);
});

test('migracija fotografija kreira tabelu i indeks', async () => {
  const pozivi = [];
  const queryInterface = {
    showAllTables: async () => ['nekretnina'],
    createTable: async (ime, kolone) => { pozivi.push(['table', ime, kolone]); },
    addIndex: async (ime, kolone, opcije) => { pozivi.push(['index', ime, kolone, opcije]); },
  };
  await imageMigration.up({ queryInterface, transaction: {} });
  assert.equal(pozivi[0][1], 'slika_nekretnine');
  assert.equal(pozivi[0][2].NekretninaId.references.model, 'nekretnina');
  assert.equal(pozivi[1][3].name, 'slika_nekretnine_prikaz_idx');
});

test('migracija sačuvanih stavki kreira obje tabele i jedinstveni indeks', async () => {
  const pozivi = [];
  const queryInterface = {
    showAllTables: async () => ['korisnik', 'nekretnina'],
    createTable: async (ime) => { pozivi.push(['table', ime]); },
    addIndex: async (ime, kolone, opcije) => { pozivi.push(['index', ime, kolone, opcije]); },
  };
  await savedMigration.up({ queryInterface, transaction: {} });
  assert.deepEqual(pozivi.filter((poziv) => poziv[0] === 'table').map((poziv) => poziv[1]), ['omiljena_nekretnina', 'sacuvana_pretraga']);
  assert.equal(pozivi.find((poziv) => poziv[3]?.name === 'omiljena_korisnik_nekretnina_uq')[3].unique, true);
});

test('Domus v2 migracija proširuje postojeće podatke bez brisanja legacy tabela', async () => {
  const tables = ['korisnik', 'nekretnina', 'upit', 'zahtjev', 'ponuda', 'komentar'];
  const created = [];
  const added = [];
  const queryInterface = {
    showAllTables: async () => tables,
    describeTable: async () => ({}),
    addColumn: async (table, column) => { added.push(`${table}.${column}`); },
    createTable: async (name) => { created.push(name); },
    addIndex: async () => {},
    bulkUpdate: async () => {},
  };
  await domusV2Migration.up({ queryInterface, transaction: {} });
  assert.ok(added.includes('korisnik.systemRole'));
  assert.ok(added.includes('nekretnina.status'));
  assert.ok(created.includes('razgovor'));
  assert.ok(created.includes('activity_event'));
  assert.equal(created.includes('upit'), false);
  assert.equal(created.includes('komentar'), false);
});
