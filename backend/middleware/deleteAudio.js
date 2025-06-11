const { S3Client, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const dotenv = require('dotenv');

dotenv.config({ path: '../.env' });

const s3 = new S3Client({
    region: 'us-east-2',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    },
});

const BUCKET_NAME = 'robby-wavelength-test';

const deleteAudioAWS = async (req, res, next) => {
    const { key } = req.body;
    if (!key) {
        return res.status(400).json({ message: 'No S3 key provided for deletion' });
    }
    const params = {
        Bucket: BUCKET_NAME,
        Key: key,
    };
    try {
        await s3.send(new DeleteObjectCommand(params));
        next();
    } catch (error) {
        console.error('Error deleting audio from S3:', error);
        res.status(500).json({ message: 'Failed to delete audio file from S3', error: error.message });
    }
};

module.exports = { deleteAudioAWS };
