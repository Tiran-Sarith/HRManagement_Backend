const express = require('express');
const signupController = require('../Controllers/Signup');
const router = express.Router();

router.post("/register", signupController.createUser);

module.exports = router;