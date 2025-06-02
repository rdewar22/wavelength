const express = require('express');
const router = express.Router();
const audiosController = require('../../controllers/audiosController');
const ROLES_LIST = require('../../config/roles_list');
const verifyRoles = require('../../middleware/verifyRoles');
const { uploadAudioAWS } = require('../../middleware/uploadAudio');

router.route('/:userId')
    .get(audiosController.getAudiosByUserId)

// New route for audio file uploads
router.route('/:userId')
    .post(
        verifyRoles(ROLES_LIST.User),
        uploadAudioAWS.single('file'),
        async (req, res) => {
            try {
                if (!req.file) {
                    return res.status(400).json({ message: 'No audio file provided' });
                }

                // Return the URL of the uploaded file
                const fileUrl = req.file.location; // S3 URL of the uploaded file
                const key = req.file.key; // S3 key of the uploaded file

                res.status(200).json({
                    message: 'Audio file uploaded successfully',
                    fileUrl,
                    key
                });
            } catch (error) {
                console.error('Audio upload failed:', error);
                res.status(500).json({ message: 'Failed to upload audio file', error: error.message });
            }
        }
    );    

module.exports = router;