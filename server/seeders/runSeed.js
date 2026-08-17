const { sequelize, Korisnik } = require('../models');
const { seedDatabase } = require('./initialData');

async function run() {
  try {
    await sequelize.authenticate();
    const brojKorisnika = await Korisnik.count();
    if (brojKorisnika > 0) {
      throw new Error('Baza već sadrži podatke. Seeder je zaustavljen da bi se spriječili duplikati.');
    }
    await seedDatabase();
  } finally {
    await sequelize.close();
  }
}

run().catch((error) => {
  console.error('Seed nije izvršen:', error.message);
  process.exitCode = 1;
});
