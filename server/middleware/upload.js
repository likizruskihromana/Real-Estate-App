const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const uploadsDir = path.join(__dirname, '../../uploads/nekretnine');
fs.mkdirSync(uploadsDir, { recursive: true });

const ekstenzije = new Map([
  ['image/jpeg', '.jpg'],
  ['image/png', '.png'],
  ['image/webp', '.webp'],
]);

const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (_req, file, callback) => {
    callback(null, `${crypto.randomUUID()}${ekstenzije.get(file.mimetype) || ''}`);
  },
});

const uploadSlike = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 1, fields: 4, parts: 6 },
  fileFilter: (_req, file, callback) => {
    if (!ekstenzije.has(file.mimetype)) {
      const error = new Error('Dozvoljene su samo JPG, PNG i WebP fotografije.');
      error.status = 400;
      return callback(error);
    }
    callback(null, true);
  },
});

function uploadJedneSlike(req, res, next) {
  uploadSlike.single('slika')(req, res, (error) => {
    if (!error) return next();
    error.status = 400;
    next(error);
  });
}

module.exports = { uploadSlike, uploadJedneSlike, uploadsDir };
