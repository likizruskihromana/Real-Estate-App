const { sequelize, SlikaNekretnine } = require('../models');
const { processImage } = require('../utils/imageVariants');

async function run() {
  await sequelize.authenticate();
  const images = await SlikaNekretnine.findAll();
  let processed = 0, skipped = 0, failed = 0;
  for (const image of images) {
    if (image.thumbnailUrl && image.mediumUrl && image.largeUrl) { skipped++; continue; }
    try { await image.update(await processImage(image.filename)); processed++; }
    catch (error) { failed++; console.error(`Fotografija ${image.id} nije obrađena: ${error.message}`); }
  }
  console.log(`Backfill završen: ${processed} obrađeno, ${skipped} preskočeno, ${failed} neuspješno.`);
}

run().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => sequelize.close());
