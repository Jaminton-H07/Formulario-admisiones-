const express    = require('express');
const router     = express.Router();
const controller = require('../controllers/confirmarController');

router.post('/', controller.confirmarCita);

module.exports = router;
