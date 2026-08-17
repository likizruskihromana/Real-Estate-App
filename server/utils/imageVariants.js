const fs = require('fs/promises');
const path = require('path');
const sharp = require('sharp');
const { uploadsDir } = require('../middleware/upload');

const sizes = { thumbnail: 480, medium: 960, large: 1600 };
const safePath = (filename) => {
  const resolved = path.resolve(uploadsDir, filename);
  if (!resolved.startsWith(path.resolve(uploadsDir) + path.sep)) throw new Error('Putanja fotografije nije sigurna.');
  return resolved;
};

async function processImage(filename) {
  const source = safePath(filename), stem = path.parse(filename).name, created = [];
  try {
    const metadata = await sharp(source, { failOn: 'error', limitInputPixels: 40_000_000, sequentialRead: true }).metadata();
    if (!['jpeg', 'png', 'webp'].includes(metadata.format)) throw Object.assign(new Error('Sadržaj fotografije nije podržan.'), { status: 400 });
    const urls = {};
    for (const [name, width] of Object.entries(sizes)) {
      const outputName = `${stem}-${name}.webp`, output = safePath(outputName);
      await sharp(source, { failOn: 'error', limitInputPixels: 40_000_000, sequentialRead: true }).rotate().resize({ width, withoutEnlargement: true }).webp({ quality: name === 'large' ? 84 : 80 }).toFile(output);
      created.push(output); urls[`${name}Url`] = `/uploads/nekretnine/${outputName}`;
    }
    return { ...urls, sirina: metadata.width || null, visina: metadata.height || null };
  } catch (error) {
    await Promise.all(created.map(file => fs.unlink(file).catch(() => {})));
    throw error;
  }
}

async function removeImageFiles(image) {
  const urls = [image.url, image.thumbnailUrl, image.mediumUrl, image.largeUrl].filter(Boolean);
  await Promise.all(urls.map(url => fs.unlink(safePath(path.basename(url))).catch(error => { if (error.code !== 'ENOENT') throw error; })));
}

module.exports = { processImage, removeImageFiles };
