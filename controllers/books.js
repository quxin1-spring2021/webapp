const db = require("../models");
const Book = db.books;

module.exports.createBook = async (req, res) => {
    // Validate request

    // Create a Book
    const book = {
        title: req.body.title,
        author: req.body.author,
        isbn: req.body.isbn,
        published_date: req.body.published_date,
        user_id: req.user.id,
    };

    let created = false;
    let existed = false;

    // check if this book is created
    await Book.findOne(
        {
            where: {
                isbn: book.isbn,
            }
        })
        .then(num => {
            if (num && num.length !== 0) {
                existed = true;
                res.status(400).send({
                    message: "This book has been created."
                });
            }
        })
    if (!existed) {
        // Save Book in the database
        await Book.create(book)
            .then(data => {
                created = true;
            })
            .catch(err => {
                res.status(400).send({
                    message:
                        err.message || "Some error occurred while creating the Book."
                });
            });
    }

    if (created) {
        const newBook = await Book.findOne(
            {
                raw: true,
                where: {
                    isbn: book.isbn,
                }
            });
        // 201 Created
        res.status(201).send(newBook);
    }
}

module.exports.showAllBook = async (req, res) => {
    const books = await Book.findAll();
    if (books) {
        res.send(books);
    }

}

module.exports.showBook = async (req, res) => {
    const id = req.params.id;
    const book = await Book.findOne(
        {
            where: {
                id: id,
            }
        })
    if (book) {
        res.send(book);
    } else {
        res.status(400).send({
            message: `Cannot find the book with id: ${id}`
        })
    }
}


module.exports.deleteBook = async (req, res) => {
    const id = req.params.id;

    let book = await Book.findOne(
        {
            where: {
                id: id,
            }
        })

    if (!book) {
        res.status(404).send({
            message: `Cannot find the book with id: ${id}`
        })
    }

    await Book.destroy(
        {
            where: {
                id: id,
            }
        }
    )

    book = await Book.findOne(
        {
            where: {
                id: id,
            }
        })

    if (!book) {
        res.status(204).send({
            message: `Deleted.`
        });
    }

}