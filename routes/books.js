const express = require('express');
const router = express.Router();
const books = require('../controllers/books');
const files = require('../controllers/files');
const basicAuth = require("../middleware/basic-auth")

router.route('/')
    .get(books.showAllBook) // GET /books/
    .post(basicAuth, books.createBook) // POST /books/

router.route('/:id')
    .get(books.showBook) // GET /books/:id
    .delete(basicAuth, books.deleteBook) // DELETE /books/:id

router.post('/:id/image', basicAuth, files.addImage) // POST /books/:id/image/
 
router.delete('/:id/image/:image_id', basicAuth, files.deleteImage) // DELETE /books/:id/image/:image_id

module.exports = router;