const sharp = require('sharp');

const convertToJpegMiddleware = async (req, res, next) => {
    try {
        if (!req.file) {
            return next(new Error('No file uploaded'));
        }

        // Read the file buffer and process with Sharp
        const imageBuffer = await sharp(req.file.buffer)
            .resize(100,100)
            .jpeg({ quality: 90 }) // Convert to JPEG with quality settings
            .toBuffer();

        // Replace the file buffer with the processed one
        req.file.buffer = imageBuffer;
        req.file.mimetype = 'image/jpeg'

        next();
    } catch (error) {
        next(error);
    }
};

module.exports = convertToJpegMiddleware;