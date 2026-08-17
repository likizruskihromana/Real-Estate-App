const express = require('express');
const controller = require('../controllers/sacuvanoController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);
router.get('/', controller.getAll);
router.post('/omiljene/:id', controller.addOmiljena);
router.delete('/omiljene/:id', controller.removeOmiljena);
router.post('/pretrage', controller.createPretraga);
router.delete('/pretrage/:id', controller.removePretraga);

module.exports = router;
