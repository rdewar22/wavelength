const User = require('../model/User');
const multer = require('multer');
const multerS3 = require('multer-s3');
const { S3Client } = require('@aws-sdk/client-s3');

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



const newProfilePic = async (req, res) => {
    try {
        const { username } = req.params;
        const s3Key = req.s3Key;

        if (!s3Key) {
            return res.status(400).json({ message: 'No S3 key available' });
        }

        // Perform additional logic if needed (e.g., save S3 key to the database)
        res.status(200).json({
            message: 'Profile picture uploaded successfully',
            s3Key,
        });
    } catch (error) {
        res.status(500).json({ message: 'Error updating profile picture', error: error.message });
    }
};



module.exports = {
    getAllUsers,
    deleteUser,
    getUser,
    newProfilePic
}