const usersController = require('../../controllers/usersController');

const express = require('express');
const router = express.Router();

router.route('/')
    .get(usersController.findUser)

module.exports = router;