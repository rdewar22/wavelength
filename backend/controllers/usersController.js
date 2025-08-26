const User = require('../model/User');

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

const findUser = async (req, res) => {
    const input  = req.query.searchString;
    if (input.length === 0) {
        return res.json();
    }
    const regex = new RegExp(input, 'i') // i for case insensitive
    const users = await User.find({ username: regex });
    if (!users) {
        return res.json({ 'message': `no matching users found` });
    }
    res.json(users);
}

const isProfPicInDb = async (req, res) => {
    const username = req?.params?.username;
    if (!username) return res.status(400).json({ "message": 'User name required' });
    const user = await User.findOne({ username: username});
    if (!user) return res.status(404).json({ "message": 'User not found' });
    res.json(user.isProfPicInDb);
}

const newProfilePic = async (req, res) => {
    const username = req?.params?.username;
    if (!username) return res.status(400).json({ "message": 'User name required' });
    const user = await User.findOne({ username: username});
    if (!user) return res.status(404).json({ "message": 'User not found' });
    user.isProfPicInDb = true;
    await user.save();
    
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
    newProfilePic,
    findUser,
    isProfPicInDb
}