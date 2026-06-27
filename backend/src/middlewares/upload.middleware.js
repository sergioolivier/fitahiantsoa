const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const uploadDir = path.join(__dirname, '..', '..', process.env.UPLOAD_DIR || 'uploads');

// Cree le dossier d'upload s'il n'existe pas encore
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm'];

function fileFilter(req, file, cb) {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Type de fichier non autorise. Formats acceptes : JPEG, PNG, WEBP, MP4, WEBM.'));
  }
}

const maxSizeMb = parseInt(process.env.MAX_FILE_SIZE_MB, 10) || 5;

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: maxSizeMb * 1024 * 1024 },
});

module.exports = { upload, uploadDir };
