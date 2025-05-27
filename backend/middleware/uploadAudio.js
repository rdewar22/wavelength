const multer = require('multer');
const multerS3 = require('multer-s3');
const { S3Client } = require('@aws-sdk/client-s3');
const dotenv = require('dotenv');

dotenv.config({ path: '.env' })

// Configure S3 client with credentials from shared credentials file
const s3 = new S3Client({
    region: 'us-east-2',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    },
});

// Define multer configuration for handling single audio file uploads
const uploadAudio = multer({
    storage: multer.memoryStorage(), // Use memory storage to access the buffer in middleware
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit for audio files
    fileFilter: (req, file, cb) => {
        // Accept common audio formats
        if (file.mimetype.startsWith('audio/')) {
            cb(null, true);
        } else {
            cb(new Error('Only audio files are allowed!'), false);
        }
    },
});

const uploadAudioAWS = multer({
    storage: multerS3({
        s3: s3,
        bucket: 'robby-wavelength-test',
        metadata: function (req, file, cb) {
            cb(null, { fieldName: 'AUDIO_FILE' });
        },
        key: function (req, file, cb) {
            // Add file extension to the key
            const fileExtension = file.originalname.split('.').pop();
            const timestamp = Date.now();
            const chatId = req?.params?.chatId || 'general';

            const folderPath = 'audio-messages';
            
            // Format: audio-messages/chatId/timestamp_originalname.extension
            cb(null, `${folderPath}/${chatId}/${timestamp}_${file.originalname}`);
        },
        contentType: multerS3.AUTO_CONTENT_TYPE,
        acl: "public-read",
    }),
    fileFilter: (req, file, cb) => {
        // Accept common audio formats (mp3, wav, ogg, m4a)
        const allowedMimeTypes = [
            'audio/mpeg',
            'audio/wav',
            'audio/ogg',
            'audio/mp4',
            'audio/x-m4a'
        ];
        
        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid audio format. Allowed formats: MP3, WAV, OGG, M4A'), false);
        }
    },
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit for audio files
    }
});

module.exports = {
    uploadAudio,
    uploadAudioAWS,
    s3
}; 