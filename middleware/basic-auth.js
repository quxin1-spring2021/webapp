const userService = require('./service');

module.exports = basicAuth;

// basic authorization middleware
async function basicAuth(req, res, next) {

    // check for basic auth header
    if (!req.headers.authorization || req.headers.authorization.indexOf('Basic ') === -1) {
        return res.status(401).json({ message: 'Missing Authorization Header' });
    }
    // verify auth credentials
    const base64Credentials =  req.headers.authorization.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [username, password] = credentials.split(':');

    const user = await userService.authenticate({ username, password });
    if (!user) {
        return res.status(401).json({ message: 'Invalid Authentication Credentials' });
    }
    (async() => {
        // if authentication passed, update the user in request with the user without password
        const { passwordHash, ...userWithoutPassword } = user;
        req.user = userWithoutPassword;
    })()

    next();
}