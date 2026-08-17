const slugify = value => String(value || 'oglas').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 150);

async function up({ queryInterface, sequelize, transaction }) {
  const [rows] = await sequelize.query('SELECT id, naziv FROM nekretnina WHERE slug IS NULL OR slug = \'\'', { transaction });
  for (const row of rows) await queryInterface.bulkUpdate('nekretnina', { slug: `${slugify(row.naziv)}-${row.id}` }, { id: row.id }, { transaction });
}

// Slugovi postaju javni stabilni identifikatori i namjerno se ne uklanjaju pri rollbacku.
async function down() {}

module.exports = { name: '006-public-slugs', up, down };
