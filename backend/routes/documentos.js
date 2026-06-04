const express    = require('express');
const router     = express.Router();
const multer     = require('multer');
const path       = require('path');
const controller = require('../controllers/documentosController');

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, path.join(__dirname, '../uploads')),
  filename:    (_req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e6);
    const ext    = path.extname(file.originalname);
    cb(null, unique + ext);
  },
});

const fileFilter = (_req, file, cb) => {
  const allowed = ['.pdf','.jpg','.jpeg','.png'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) cb(null, true);
  else cb(new Error('Formato no permitido. Use PDF, JPG o PNG.'));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

router.post('/', upload.single('archivo'), controller.subirDocumento);

module.exports = router;
