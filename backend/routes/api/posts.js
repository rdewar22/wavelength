const express = require('express');
const router = express.Router();
const postsController = require('../../controllers/postsController');
const ROLES_LIST = require('../../config/roles_list');
const verifyRoles = require('../../middleware/verifyRoles');
const { uploadAudioAWS } = require('../../middleware/uploadAudio');

router.route('/')
    .get(postsController.getAllPosts)
    .post(verifyRoles(ROLES_LIST.User),
        uploadAudioAWS.single('file'),
        async (req, res, next) => {
            try {
                // File is optional, so we don't need to check for it
                // The middleware will handle the file upload if present
                next();
            } catch (error) {
                console.error('Audio upload failed:', error);
                res.status(500).json({ message: 'Failed to upload audio file', error: error.message });
            }
        },
        postsController.addNewPost)


router.route('/:id')
    .patch(verifyRoles(ROLES_LIST.User), postsController.addReaction)
    .delete(verifyRoles(ROLES_LIST.User), postsController.deletePost)


module.exports = router;