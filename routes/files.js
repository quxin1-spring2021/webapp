const express = require('express');
const router = express.Router();
const basicAuth = require('../middleware/basic-auth');
const files = require('../controllers/files');

// basic authentication needed
router.post('/', basicAuth, files.addImage);

// basic authentication needed
router.delete('/:image_id', basicAuth, files.deleteImage);

module.exports = router;