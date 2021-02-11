const bcrypt = require('bcrypt');

module.exports = {
    authenticate
};

const db = require("../models");

const User = db.users;






    async function authenticate({ username, password }) {
        console.log(username + '--:--' + password)
        const user = await User.findOne(
            {
                raw: true,
                where: {
                    username: username,
                    password: password
                }
            })
        return user;
    }
