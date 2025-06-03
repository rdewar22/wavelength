const express = require('express');
const router = express.Router();
const audiosController = require('../../controllers/audiosController');
const ROLES_LIST = require('../../config/roles_list');
const verifyRoles = require('../../middleware/verifyRoles');
const { uploadAudioAWS } = require('../../middleware/uploadAudio');

router.route('/')
    .get(audiosController.getAllAudios)

router.route('/:userId')
    .get(audiosController.getAudiosByUserId)

// New route for audio file uploads
router.route('/:userId')
    .post(
        verifyRoles(ROLES_LIST.User),
        uploadAudioAWS.single('file'),
        async (req, res, next) => {
            try {
                if (!req.file) {
                    return res.status(400).json({ message: 'No audio file provided' });
                }
                // Pass control to the next middleware (saveAudioToMongo)
                next();
            } catch (error) {
                console.error('Audio upload failed:', error);
                res.status(500).json({ message: 'Failed to upload audio file', error: error.message });
            }
        },
        audiosController.saveAudioToMongo
    );    

module.exports = router;