const express = require('express');
const router = express.Router();
const messagesController = require('../../controllers/messagesController');
const ROLES_LIST = require('../../config/roles_list');
const verifyRoles = require('../../middleware/verifyRoles');

router.route('/:chatId')
    .delete(messagesController.deleteChat);

router.route('/')
    .post(messagesController.accessChat);

router.route('/:userId')
    .get(messagesController.fetchChatsForUserId);

router.route("/group")
    .post(messagesController.createGroupChat);

router.route("/rename")
    .put(messagesController.renameGroup);

router.route("/groupadd")
    .put(messagesController.addToGroup);

router.route("/groupremove")
    .put(messagesController.removeFromGroup);

router.route("/send")
    .post(messagesController.sendMessage);

router.route("/chat/:chatId")
    .get(messagesController.getMessagesInChat);

module.exports = router