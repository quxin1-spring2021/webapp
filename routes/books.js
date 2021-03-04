const express = require('express');
const router = express.Router();
const books = require('../controllers/books');
const files = require('../controllers/files');
const basicAuth = require("../middleware/basic-auth")

router.route('/')
    .get(books.showAllBook)
    .post(basicAuth, books.createBook)

router.route('/:id')
    .get(books.showBook)
    .delete(basicAuth, books.deleteBook)

router.post('/:id/image', basicAuth, files.addImage)

router.delete('/:id/image/:image_id', basicAuth, files.deleteImage)

module.exports = router;