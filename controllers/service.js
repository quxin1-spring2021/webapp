module.exports = {
    authenticate
};

const db = require("../models");

const User = db.users;


async function authenticate({ username, password }) {
    console.log(username + '--:--' + password)
    const user  = await User.findOne(
        {
            raw: true,
            where: {
                username: username,
                password: password
            }
        })
        // .then(user => {
        //     const { password, ...userWithoutPassword } = user;
        //     console.log('services')
        //     console.log(userWithoutPassword)
        //     user;
        //     //return userWithoutPassword;
        //     //return user;
        // })
    return user;
}
