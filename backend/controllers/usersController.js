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

const singleUpload = uploadImageAWS.single('image');

const newProfilePic = async (req, res) => {
    if (!req?.params?.username) return res.status(400).json({ "message": 'Username required' });
    const user = await User.findOne({ username: req.params.username });

    // Wrap singleUpload in a Promise to properly handle async/await
    return new Promise((resolve, reject) => {
        singleUpload(req, res, function (err) {
            if (err) {
                return res.status(422).json({
                    errors: [{
                        title: 'Image Upload Error',
                        detail: err.message
                    }]
                });
            }
            if (!req.file) {
                return res.status(400).json({
                    error: 'No file uploaded'
                });
            }

            user.profilePicUri = req.file.location;
            user.save();

            return res.json({
                imageUrl: req.file.location
            });
        });
    });
};

module.exports = {
    getAllUsers,
    deleteUser,
    getUser,
    newProfilePic
}