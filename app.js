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

app.use(basicAuth);

const db = require("./models");

const User = db.users;


db.sequelize.sync({ force: true }).then(() => {
    console.log("Drop and re-sync db.");
});

app.get("/", (req, res) => {
    res.json({ message: "Welcome to web application." });
});

app.get('/v1/user/self', authenticate);

function authenticate(req, res, next) {
    let user = '';
    if (req.user) {
        user = req.user;
    }
    res.json(user)
}


app.put('/v1/user/self', (req, res) => {
    const { firstname, lastname, password, ...invalidFields } = req.body
    const putBody = {
        firstname: firstname,
        lastname: lastname,
        password: password,
        account_updated: Sequelize.literal('CURRENT_TIMESTAMP'),
        passwordHash: ''
    }

    putBody.passwordHash = bcrypt.hashSync(putBody.password, 10);

    if (Object.keys(invalidFields).length !== 0) {
        res.status(400).send('You should not update fileds other than password, firstname, lastname');
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
                    res.send({
                        message: "User was updated successfully."
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
        firstname: req.body.firstname,
        lastname: req.body.lastname,
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

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => console.log(`listening on http://localhost:${PORT}`));