const multer = require('multer');
const multerS3 = require('multer-s3');
const { S3Client } = require('@aws-sdk/client-s3');
const sharp = require('sharp');
const dotenv = require('dotenv');

dotenv.config({ path: '.env' })


// Configure S3 client with credentials from shared credentials file
const s3 = new S3Client({
    region: 'us-east-2', // Add your AWS region here (e.g., 'us-east-1')
    credentials: {
        // If using shared credentials file:
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    },
    // endpoint: `https://s3.us-east-2.amazonaws.com`
});

console.log('AWS Credentials Check:', {
    hasAccessKey: !!process.env.AWS_ACCESS_KEY_ID,
    hasSecretKey: !!process.env.AWS_SECRET_ACCESS_KEY,
    hasAccessToken: !!process.env.ACCESS_TOKEN_SECRET,
    hasRefreshToken: !!process.env.REFRESH_TOKEN_SECRET
});

// Define multer configuration for handling single file uploads
const uploadImage = multer({
    storage: multer.memoryStorage(), // Use memory storage to access the buffer in middleware
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    },
});

const uploadImageAWS = multer({
    storage: multerS3({
        s3: s3,
        bucket: 'robby-wavelength-test',
        metadata: function (req, file, cb) {
            cb(null, { fieldName: 'TESTING_METADATA' });
        },
        key: function (req, file, cb) {
            // Add file extension to the key
            const fileExtension = file.originalname.split('.').pop();
            const userName = req?.params?.username

            const folderPath = 'profile-pictures';

            cb(null, `${folderPath}/${userName}_profPic.jpeg`);
        },
        contentType: multerS3.AUTO_CONTENT_TYPE, // Add this to automatically set the correct content type
        acl: "public-read",
    }),
    // Add file filter to ensure only images are uploaded
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});






module.exports = {
    uploadImage,
    uploadImageAWS,
    s3
};