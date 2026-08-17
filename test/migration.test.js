const test = require('node:test');
const assert = require('node:assert/strict');
const migration = require('../server/migrations/001-initial-schema');

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
