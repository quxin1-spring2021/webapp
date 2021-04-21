const bcrypt = require('bcrypt');

module.exports = {authenticate};

const db = require("../models");
const User = db.users;

// authenticate current user in request
async function authenticate({ username, password }) {

    const user = await User.findOne(
        {
            raw: true,
            where: {
                username: username,
            }
        })
    if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
        // authentication failed
        return false;
    } else {
        // authentication successful
        return user;
    }
}
