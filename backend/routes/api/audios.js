const express = require('express');
const router = express.Router();
const audiosController = require('../../controllers/audiosController');
const ROLES_LIST = require('../../config/roles_list');
const verifyRoles = require('../../middleware/verifyRoles');
const { uploadAudioAWS } = require('../../middleware/uploadAudio');
const { deleteAudioAWS } = require('../../middleware/deleteAudio');
const Audio = require('../../model/Audio');

// New route for audio file uploads
// router.route('/:userId')
//     .post(
//         verifyRoles(ROLES_LIST.User),
//         uploadAudioAWS.single('file'),
//         async (req, res, next) => {
//             try {
//                 if (!req.file) {
//                     return res.status(400).json({ message: 'No audio file provided' });
//                 }
//                 // Pass control to the next middleware (saveAudioToMongo)
//                 next();
//             } catch (error) {
//                 console.error('Audio upload failed:', error);
//                 res.status(500).json({ message: 'Failed to upload audio file', error: error.message });
//             }
//         },
//         audiosController.saveAudioToMongo
//     );
    
router.route('/:audioId')
    .delete(
        verifyRoles(ROLES_LIST.User),
        async (req, res, next) => {
            try {
                const { audioId } = req.params;
                
                // Get the audio record to get the S3 key
                const audio = await Audio.findById(audioId);
                if (!audio) {
                    return res.status(404).json({ message: 'Audio not found' });
                }
                
                // Extract the S3 key from the audioUrl or use a stored key field
                // Assuming the audioUrl is something like: https://bucket.s3.region.amazonaws.com/key
                const key = 'audio-files/' + audio._doc.title.replaceAll('/', '-') + '.webm'; // Get everything after the domain
                
                // Add the key to req.body so deleteAudioAWS can access it
                req.body.key =  key;
                req.audioToDelete = audio; // Pass the audio record for later deletion
                
                next();
            } catch (error) {
                console.error('Error preparing audio deletion:', error);
                res.status(500).json({ message: 'Failed to prepare audio deletion', error: error.message });
            }
        },
        deleteAudioAWS,
        audiosController.deleteAudioFromMongo
    );

module.exports = router;