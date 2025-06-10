const express = require('express');
const postsController = require('../../controllers/postsController');

const router = express.Router();

router.route('/')
    .get(postsController.getAllPosts)

router.route('/:userId')
    .get(postsController.getPostsByUserId)

module.exports = router;