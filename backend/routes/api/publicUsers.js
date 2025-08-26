const usersController = require('../../controllers/usersController');

const express = require('express');
const router = express.Router();

router.route('/')
    .get(usersController.findUser)

router.route('/:username/isProfPicInDb') // Check if profile picture is in database
    .get(usersController.isProfPicInDb);

module.exports = router;