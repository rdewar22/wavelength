const express = require('express');
const router = express.Router();
const postsController = require('../../controllers/postsController');
const ROLES_LIST = require('../../config/roles_list');
const verifyRoles = require('../../middleware/verifyRoles');

router.route('/')
    .get(postsController.getAllPosts)
    .post(verifyRoles(ROLES_LIST.User), postsController.addNewPost)
    // .put(verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor), employeesController.updateEmployee)
    // .delete(verifyRoles(ROLES_LIST.Admin), employeesController.deleteEmployee);

router.route('/:userId')
    .get(postsController.getPostsByUserId)    

router.route('/:id')
    .patch(verifyRoles(ROLES_LIST.User), postsController.addReaction)


module.exports = router;