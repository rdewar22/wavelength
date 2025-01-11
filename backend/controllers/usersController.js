const User = require('../model/User');
const uploadImageAWS = require('../aws/upload.js')
const multer = require('multer')

const getAllUsers = async (req, res) => {
    const users = await User.find();
    if (!users) return res.status(204).json({ 'message': 'No users found' });
    res.json(users);
}

const deleteUser = async (req, res) => {
    if (!req?.body?.id) return res.status(400).json({ "message": 'User ID required' });
    const user = await User.findOne({ _id: req.body.id }).exec();
    if (!user) {
        return res.status(204).json({ 'message': `User ID ${req.body.id} not found` });
    }
    const result = await user.deleteOne({ _id: req.body.id });
    res.json(result);
}

const getUser = async (req, res) => {
    if (!req?.params?.id) return res.status(400).json({ "message": 'User ID required' });
    const user = await User.findOne({ _id: req.params.id }).exec();
    if (!user) {
        return res.status(204).json({ 'message': `User ID ${req.params.id} not found` });
    }
    res.json(user);
}

const singleUpload = uploadImageAWS.single('file');

const newProfilePic = async (req, res) => {
    try {
        if (!req?.params?.username) {
            return res.status(400).json({ message: 'Username required' });
        }

        // Find the user
        const user = await User.findOne({ username: req.params.username });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Process the image upload using Multer
        await new Promise((resolve, reject) => {
            singleUpload(req, res, function (err) {
                if (err) {
                    return reject({
                        status: 422,
                        message: 'Image Upload Error',
                        detail: err.message,
                    });
                }
                if (!req.body) {
                    return reject({
                        status: 400,
                        message: 'No file uploaded',
                    });
                }
                resolve();
            });
        });

        if (!req?.body) {
            return res.status(400).json({ message: 'Image file required' });
        }

        // Update user's profile picture
        // user.profilePicUri = req.file.location; // Assuming `req.file.location` has the S3 URL
        // await user.save();

        // Respond with the image URL
        return res.json({ imageUrl: req.file});
    } catch (error) {
        // Centralized error handling
        const status = error.status || 500;
        const message = error.message || 'Internal Server Error';
        const detail = error.detail || null;

        return res.status(status).json({
            error: { message, detail },
        });
    }
};


module.exports = {
    getAllUsers,
    deleteUser,
    getUser,
    newProfilePic
}