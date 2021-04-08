const db = require("../models");
const AWS = require('aws-sdk');
const UUID = require('uuid').v4;
const logger = require("../services/applogs/applogs");
const client = require("../services/metrics/metrics");
AWS.config.update({region: "us-west-2"});

const Book = db.books;
const File = db.files;

module.exports.createBook = async (req, res) => {
    // Validate request
    const startTime = new Date();
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
            logging: (sql, queryTime) => {
                client.timing('SQL_FIND_BOOK', queryTime)
            },
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
        var log = {
            logging: (sql, queryTime) => {
                client.timing('SQL_CREATE_BOOK_TIME', queryTime)
            }
        }
        await Book.create(book, log)
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
                logging: (sql, queryTime) => {
                    client.timing('SQL_FIND_BOOK', queryTime)
                },
                //raw: true,
                where: {
                    isbn: book.isbn,
                },
                include: [
                    {
                        model: db.files
                    }
                ]
            })
            .then(book => {
                const newObj = {
                    id: book.id,
                    title: book.title,
                    author: book.author,
                    isbn: book.isbn,
                    published_date: book.published_date,
                    book_created: book.book_created,
                    user_id: book.user_id,
                    book_images: book.files.map(image => {
                        return Object.assign(
                            {},
                            {
                                file_name: image.file_name,
                                s3_object_name: image.s3_object_name,
                                file_id: image.file_id,
                                created_date: image.created_date,
                                user_id: image.user_id
                            }
                        )
                    })
                }
                return newObj;
            });
        // 201 Created

        res.status(201).send(newBook);
        logger.log({
            level: 'info',
            message: `created a new book, id: ${newBook.id}`
        });
        client.increment('POST_BOOK_API');
        const createBookApiTime = new Date() - startTime;
        client.timing('POST_BOOK_API_time', createBookApiTime)

        // sending SNS message
        const msgId = UUID();
        var params_create = {
            Message: `A Book with id ${newBook.id} was created under user ${req.user.username}. Check at dev.chuhsin.me/mybooks/${newBook.id}`, /* required */
            TopicArn: process.env.TOPIC_CREATE,
            MessageAttributes:{
                "Email":{
                    DataType: "String",
                    StringValue: `${req.user.username}`
                    },
                
                "Operation":{
                    DataType: "String",
                    StringValue: "Create"
                    },
                "MessageId":{
                    DataType: "String",
                    StringValue: `${msgId}`
                    },
                "BookId":{
                    DataType: "String",
                    StringValue: `${newBook.id}`
                    }
                },
          };
        var publishTextPromise = new AWS.SNS({apiVersion: '2010-03-31'}).publish(params_create).promise();
        publishTextPromise.then(
            function(data) {
              console.log(`Message ${params_create.Message} sent to the topic ${params_create.TopicArn}`);
              console.log("MessageID is " + data.MessageId);
            }).catch(
              function(err) {
              console.error(err, err.stack);
            });

    }
}


module.exports.showBook = async (req, res) => {
    const start_time = new Date();

    const id = req.params.id;
    const book = await Book.findOne(
        {
            logging: (sql, queryTime) => {
                client.timing('SQL_FIND_BOOK', queryTime)
            },
            where: {
                id: id
            },
            include: [
                {
                    model: db.files
                }
            ]
        })
        .then(book => {
            if (book === null) {
                return Promise.reject();
            }

            const newObj = {
                id: book.id,
                title: book.title,
                author: book.author,
                isbn: book.isbn,
                published_date: book.published_date,
                book_created: book.book_created,
                user_id: book.user_id,
                book_images: book.files.map(image => {
                    return Object.assign(
                        {},
                        {
                            file_name: image.file_name,
                            s3_object_name: image.s3_object_name,
                            file_id: image.file_id,
                            created_date: image.created_date,
                            user_id: image.user_id
                        }
                    )
                })
            }
            return newObj;
        })
        .catch(err => {
            res.status(400).send({
                message: `Cannot find the book with id: ${id}`
            })
        })

    if (book) {
        res.send(book);
        logger.log({
            level: 'info',
            message: `get a book, id: ${id}`
        });
        client.increment('GET_BOOK_API');
    } else {
        res.status(400).send({
            message: `Cannot find the book with id: ${id}`
        })
    }

    const getBookTime = new Date() - start_time
    client.timing('GET_BOOK_API_time', getBookTime);
}


module.exports.showAllBook = async (req, res) => {
    const start_time = new Date();

    const books = await Book.findAll({
        logging: (sql, queryTime) => {
            client.timing('SQL_FIND_ALL_BOOKs', queryTime)
        },
        include: [
            {
                model: db.files
            }
        ]
    })
        .then(books => {
            const resObj = books.map(book => {
                return Object.assign(
                    {},
                    {
                        id: book.id,
                        title: book.title,
                        author: book.author,
                        isbn: book.isbn,
                        published_date: book.published_date,
                        book_created: book.book_created,
                        user_id: book.user_id,
                        book_images: book.files.map(image => {
                            return Object.assign(
                                {},
                                {
                                    file_name: image.file_name,
                                    s3_object_name: image.s3_object_name,
                                    file_id: image.file_id,
                                    created_date: image.created_date,
                                    user_id: image.user_id
                                }
                            )
                        })
                    }
                )

            })

            return resObj;
        })
    if (books) {
        logger.log({
            level: 'info',
            message: 'get all books request'
        });
        res.send(books);
        client.increment('GET_BOOKS_API');
    }
    const getBookTime = new Date() - start_time
    client.timing('GET_BOOKS_API_time', getBookTime);
}


module.exports.deleteBook = async (req, res) => {
    const id = req.params.id;
    const start_time = new Date();


    let book = await Book.findOne(
        {
            logging: (sql, queryTime) => {
                client.timing('SQL_FIND_BOOK', queryTime)
            },
            where: {
                id: id,
            }
        })

    if (!book) {
        res.status(404).send({
            message: `Cannot find the book with id: ${id}`
        })
        return;
    }


    if (book.user_id !== req.user.id) {
        res.status(401).send({
            message: `Unauthorized Action.`
        })
        return;
    }

    await File.destroy(
        {
            logging: (sql, queryTime) => {
                client.timing('SQL_DELETE_IMAGE', queryTime)
            },
            where: {
                book_id: id,
            }
        }
    )

    await Book.destroy(
        {
            logging: (sql, queryTime) => {
                client.timing('SQL_DELETE_BOOK', queryTime)
            },
            where: {
                id: id,
            }
        }
    )

    book = await Book.findOne(
        {
            logging: (sql, queryTime) => {
                client.timing('SQL_FIND_BOOK', queryTime)
            },
            where: {
                id: id,
            }
        })

    if (!book) {
        logger.log({
            level: 'info',
            message: 'A Book is Deleted'
        });
        res.status(204).send({
            message: `Deleted.`
        });
        client.increment('DELETE_BOOK_API');
        const deleteBookTime = new Date() - start_time
        client.timing('DELETE_BOOK_API_time', deleteBookTime);
        const msgId = UUID();
        var params_delete = {
            Message: `A Book with id ${id} was deleted under user ${req.user.username}.`, /* required */
            TopicArn: process.env.TOPIC_DELETE,
            MessageAttributes:{
                "Email":{
                    DataType: "String",
                    StringValue: `${req.user.username}`
                    },
                "Operation":{
                    DataType: "String",
                    StringValue:"Delete"
                    },
                "MessageId":{
                    DataType: "String",
                    StringValue: `${msgId}`
                    },
                "BookId":{
                    DataType: "String",
                    StringValue: `${id}`
                    }
                },
        };
        var publishTextPromise = new AWS.SNS({apiVersion: '2010-03-31'}).publish(params_delete).promise();
        publishTextPromise.then(
            function(data) {
              console.log(`Message ${params_delete.Message} sent to the topic ${params_delete.TopicArn}`);
              console.log("MessageID is " + data.MessageId);
            }).catch(
              function(err) {
              console.error(err, err.stack);
            });
    }
    return;

}