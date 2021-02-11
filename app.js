const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const basicAuth = require("./controllers/basic-auth")
const app = express();
const userService = require('./controllers/service');
const Sequelize = require("sequelize");
const emailValidator = require("email-validator");

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
    res.json({ message: "Welcome to enoch application." });
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
    }
    console.log(invalidFields)
    console.log(putBody)
    if (Object.keys(invalidFields).length !== 0) {
        res.status(400).send();
    } else {
        User.update(putBody, {
            where: {
                username: req.user.username
            }
        })
            .then(num => {
                console.log("num")
                console.log(num)
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
                    message: "Error updating Tutorial with id=" + req.user.username
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
        lastname: req.body.lastname
    };

    if (!emailValidator.validate(user.username)) {
        res.status(400).send('not email address')
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
                console.log("num")
                //console.log(num)
                if (num && num.length !== 0) {
                    existed = true;
                    res.status(400).send({
                        message: "User exsited."
                    });
                } 
            })
        if(!existed) {
            await User.create(user)
            .then(data => {
                console.log(data.dataValues)
                created = true;
                //res.send(userWithoutPassword);
            })
            .catch(err => {
                res.status(500).send({
                    message:
                        err.message || "Some error occurred while creating the User."
                });
            });
        }

        await console.log(created)

        if (created) {
            const newUser = await User.findOne(
                {
                    raw: true,
                    where: {
                        username: user.username,
                        password: user.password
                    }
                });

            const { password, ...userWithoutPassword } = newUser
            res.send(userWithoutPassword);
        }

    }


    // Save User in the database

}
)


const PORT = process.env.PORT || 8080;


app.listen(PORT, () => console.log(`listening on http://localhost:${PORT}`));
