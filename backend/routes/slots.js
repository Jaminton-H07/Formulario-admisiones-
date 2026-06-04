const express    = require('express');
const router     = express.Router();
const controller = require('../controllers/slotsController');

router.get('/:fecha', controller.obtenerSlots);

module.exports = router;
