const express = require('express');
const router = express.Router();
const users = require('../controllers/users');
const basicAuth = require("../middleware/basic-auth")

router.route('/self')
    .get(basicAuth, users.showUser)
    .put(basicAuth, users.updateUser)

router.post('/', users.createUser)

module.exports = router;