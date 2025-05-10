const express = require('express');
const router = express.Router();
const usersController = require('../../controllers/usersController');
const ROLES_LIST = require('../../config/roles_list');
const verifyRoles = require('../../middleware/verifyRoles');
const convertToJpegMiddleware = require('../../middleware/convertToJpeg');
const { uploadImage, s3 } = require('../../middleware/uploadImage');
const { PutObjectCommand } = require('@aws-sdk/client-s3');


router.route('/')
    .get(usersController.findUser)
    //.get(verifyRoles(ROLES_LIST.Admin), usersController.getAllUsers)
    .delete(verifyRoles(ROLES_LIST.Admin), usersController.deleteUser);

    router.route('/:username')
    .get(verifyRoles(ROLES_LIST.User), usersController.getUser)
    .put(
        verifyRoles(ROLES_LIST.User), // Role verification middleware
        uploadImage.single('file'), // Handle file upload to memory
        convertToJpegMiddleware, // Convert the image to JPEG
        async (req, res, next) => {
            const fileExtension = 'jpeg';
            const folderPath = 'profile-pictures';

            const s3Key = `${folderPath}/${req.params.username}_profPic.${fileExtension}`;
                const params = {
                    Bucket: 'robby-wavelength-test',
                    Key: s3Key,
                    Body: req.file.buffer,
                    ContentType: 'image/jpeg',
                }
            try {
                if (!req.file) {
                    return next(new Error('No file available for upload.'));
                }                
                
                const command = new PutObjectCommand(params);
                const response = await s3.send(command);

                req.s3Key = s3Key; // Pass the S3 key to the next middleware/controller

                next();
            } catch (error) {
                console.error('Upload failed:', error);
                next(error);
            }
        },
        usersController.newProfilePic // Final controller to handle response
    );


module.exports = router;