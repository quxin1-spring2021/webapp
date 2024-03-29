const db = require("../models");
const User = db.users;
const Sequelize = require("sequelize");
const emailValidator = require("email-validator");
const bcrypt = require('bcrypt');
const passwordValidator = require('password-validator');
const schema = new passwordValidator();
const logger = require("../services/applogs/applogs");
const client = require("../services/metrics/metrics");


// Add properties to password validator schema
schema
    .is().min(8)                                    // Minimum length 8
    .is().max(100)                                  // Maximum length 100
    .has().uppercase()                              // Must have uppercase letters
    .has().lowercase()                              // Must have lowercase letters
    .has().digits(2)                                // Must have at least 2 digits
    .has().not().spaces()                           // Should not have spaces
    .is().not().oneOf(['Passw0rd', 'Password123']); // Blacklist these values

// POST user, create a new user
module.exports.createUser = async (req, res) => {
    const start_time = new Date();

    // request validation
    if (!req.body.username) {
        res.status(400).send({
            message: "Content can not be empty!"
        });
        return;
    }
    // form a User object
    const user = {
        username: req.body.username,
        password: req.body.password,
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        passwordHash: ''
    };

    if (!emailValidator.validate(user.username)) {
        res.status(400).send('Username is not a valid email.')
    } else if (!schema.validate(user.password)) {
        res.status(400).send('Your password is too weak.')
    } else {
        let created = false;
        let existed = false;
        // check if the user in request body existed
        await User.findOne(
            {
                logging: (sql, queryTime) => {
                    client.timing('SQL_FIND_IMAGE', queryTime)
                },
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
            // Save the new User into database
            user.passwordHash = bcrypt.hashSync(user.password, 10);
            await User.create(user,{
                logging: (sql, queryTime) => {
                    client.timing('SQL_CREATE_USER', queryTime)
                }
            })
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

        // confirm the new user is created
        if (created) {
            const newUser = await User.findOne(
                {
                    logging: (sql, queryTime) => {
                        client.timing('SQL_FIND_IMAGE', queryTime)
                    },
                    raw: true,
                    where: {
                        username: user.username,
                    }
                });

            const { passwordHash, ...userWithoutPassword } = newUser
            res.status(201).send(userWithoutPassword);
            logger.log({
                level: 'info',
                message: 'A new User is created.'
            });
            // 201 Created, forming metrics and log
            client.increment('POST_USER_API');
            const apiCostTime = new Date() - start_time
            client.timing('POST_USER_API_time', apiCostTime);
        }

    }
}

// PUT user
module.exports.updateUser = async (req, res) => {
    const start_time = new Date();
    let updated = false;

    const { first_name, last_name, password, ...invalidFields } = req.body
    // form updated user body
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
    } else if (!schema.validate(putBody.password)) {
        res.status(400).send('Your password is too weak.')
    } else {
        await User.update(putBody, {
            logging: (sql, queryTime) => {
                client.timing('SQL_UPDATE_USER', queryTime)
            },
            where: {
                username: req.user.username
            }
        })
            .then(num => {
                if (num == 1) {
                    updated = true;
                    return;
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

        // confirm the user is updated
        if (updated) {
            const newUser = await User.findOne(
                {
                    logging: (sql, queryTime) => {
                        client.timing('SQL_FIND_USER', queryTime)
                    },
                    where: {
                        username: req.user.username,
                    }
                });

            res.send({
                newUser
            });
            logger.log({
                level: 'info',
                message: `User(id:${newUser.id}) is updated.`
            });
            client.increment('PUT_USER_API');
            const apiCostTime = new Date() - start_time
            client.timing('PUT_USER_API_time', apiCostTime);
        }

    }
}

// GET user
module.exports.showUser = (req, res) => {
    const start_time = new Date();

    let user = '';
    if (req.user) {
        user = req.user;
        logger.log({
            level: 'info',
            message: `Info of User(id:${user.id}) is queried.`
        });
        client.increment('GET_USER_API');
        const apiCostTime = new Date() - start_time
        client.timing('GET_USER_API_time', apiCostTime);
    }
    res.json(user)
}