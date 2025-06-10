const express = require('express');
const audiosController = require('../../controllers/audiosController');

const router = express.Router();

router.route('/')
    .get(audiosController.getAllAudios)

router.route('/:userId')
    .get(audiosController.getAudiosByUserId)

module.exports = router;