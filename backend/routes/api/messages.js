const express = require('express');
const router = express.Router();
const messagesController = require('../../controllers/messagesController');
const ROLES_LIST = require('../../config/roles_list');
const verifyRoles = require('../../middleware/verifyRoles');

router.route('/')
    .post(messagesController.sendMessage)

router.route('/:username')
    .get(messagesController.getMessagesForUserName)

module.exports = router