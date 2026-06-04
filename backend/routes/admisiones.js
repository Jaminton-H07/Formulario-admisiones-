const express    = require('express');
const router     = express.Router();
const controller = require('../controllers/admisionesController');

router.post('/', controller.crearSolicitud);

module.exports = router;
