const express = require('express');
const router = express.Router();
const users = require('../controllers/users');
const basicAuth = require("../middleware/basic-auth")

router.route('/self')
    .get(basicAuth, users.showUser) // GET /v1/user/self
    .put(basicAuth, users.updateUser) // PUT /v1/user/self

router.post('/', users.createUser) // POST /v1/user

module.exports = router;