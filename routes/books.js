const express = require('express');
const router = express.Router();
const books = require('../controllers/books');
const basicAuth = require("../middleware/basic-auth")

router.route('/')
    .get(books.showAllBook)
    .post(basicAuth, books.createBook)

router.route('/:id')
    .get(books.showBook)
    .delete(basicAuth, books.deleteBook)

module.exports = router;