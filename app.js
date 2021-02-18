const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const basicAuth = require("./controllers/basic-auth")
const Sequelize = require("sequelize");
const emailValidator = require("email-validator");
const bcrypt = require('bcrypt');
const passwordValidator = require('password-validator');
const schema = new passwordValidator();

const app = express();


// Add properties to password validator schema
schema
.is().min(8)                                    // Minimum length 8
.is().max(100)                                  // Maximum length 100
.has().uppercase()                              // Must have uppercase letters
.has().lowercase()                              // Must have lowercase letters
.has().digits(2)                                // Must have at least 2 digits
.has().not().spaces()                           // Should not have spaces
.is().not().oneOf(['Passw0rd', 'Password123']); // Blacklist these values



var corsOptions = {
    origin: "http://localhost:8081"
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//app.use(basicAuth);

const db = require("./models");

const User = db.users;
const Book = db.books;


db.sequelize.sync({ force: true }).then(() => {
    console.log("Drop and re-sync db.");
});

app.get("/", (req, res) => {
    res.json({ message: "Welcome to web application." });
});

app.get('/v1/user/self', basicAuth, authenticate);

function authenticate(req, res) {
    let user = '';
    if (req.user) {
        user = req.user;
    }
    res.json(user)
}


app.put('/v1/user/self', basicAuth, (req, res) => {
    const { first_name, last_name, password, ...invalidFields } = req.body
    const putBody = {
        first_name: first_name,
        last_name: last_name,
        password: password,
        account_updated: Sequelize.literal('CURRENT_TIMESTAMP'),
        passwordHash: ''
    }

    putBody.passwordHash = bcrypt.hashSync(putBody.password, 10);

    if (Object.keys(invalidFields).length !== 0) {
        res.status(400).send('You should not update fileds other than password, first_name, last_name');
    } else if(!schema.validate(putBody.password)){
        res.status(400).send('Your password is too weak.')
    } else {
        User.update(putBody, {
            where: {
                username: req.user.username
            }
        })
            .then(num => {
                if (num == 1) {
                    const user = req.user;
                    res.send({
                        user
                    });
                } else {
                    res.send({
                        message: `Cannot update User with username=${req.user.username}. Maybe Username was not found or req.body is empty!`
                    });
                }
            })
            .catch(err => {
                res.status(500).send({
                    message: "Error updating User with username=" + req.user.username
                });
            });
    }

})

app.post('/v1/user', async (req, res) => {
    // Validate request
    if (!req.body.username) {
        res.status(400).send({
            message: "Content can not be empty!"
        });
        return;
    }
    // Create a User
    const user = {
        username: req.body.username,
        password: req.body.password,
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        passwordHash: ''
    };

    if (!emailValidator.validate(user.username)) {
        res.status(400).send('Username is not a valid email.')
    } else if(!schema.validate(user.password)){
        res.status(400).send('Your password is too weak.')
    } else {
        let created = false;
        let existed = false;
        await User.findOne(
            {
                where: {
                    username: user.username,
                }
            })
            .then(num => {
                if (num && num.length !== 0) {
                    existed = true;
                    res.status(400).send({
                        message: "This email address is already a username, please try other email."
                    });
                }
            })
        if (!existed) {

            // Save User in the database
            user.passwordHash = bcrypt.hashSync(user.password, 10);
            await User.create(user)
                .then(data => {
                    created = true;
                })
                .catch(err => {
                    res.status(500).send({
                        message:
                            err.message || "Some error occurred while creating the User."
                    });
                });
        }

        if (created) {
            const newUser = await User.findOne(
                {
                    raw: true,
                    where: {
                        username: user.username,
                    }
                });

            const { passwordHash, ...userWithoutPassword } = newUser
            // 201 Created
            res.status(201).send(userWithoutPassword);
        }

    }
}
)


app.post('/books', basicAuth, async(req,res) => {
        // Validate request
        // if (!req.user.username) {
        //     res.status(400).send({
        //         message: "Content can not be empty!"
        //     });
        //     return;
        // }
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

    
})

app.get('/books', async(req,res) => {
    const books = await Book.findAll();
    if(books) {
        res.send(books);
    }

})

app.get('/books/:id', async (req,res) => {
    const id = req.params.id;
    const book = await Book.findOne(
        {
            where: {
                id: id,
            }
        })
    if(book) {
        res.send(book);
    } else {
        res.status(400).send({
            message: `Cannot find the book with id: ${id}`
        })
    }
})

app.delete('/books/:id', basicAuth, async (req,res) => {
    const id = req.params.id;

    let book = await Book.findOne(
        {
            where: {
                id: id,
            }
        })

    if(!book) {
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

    if(!book) {
        res.status(204).send({
            message: `Deleted.`
        });
    } 

    
})

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => console.log(`listening on http://localhost:${PORT}`));