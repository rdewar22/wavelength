const Post = require('../model/Post');

const addNewPost = async (req, res) => {
    const { message, currentUserId, imageTitle, audioTitle } = req.body;
    if (!currentUserId) return res.status(400).json({ 'message': 'User must be logged in' });

    try {
        //create and store the new post
        const result = await Post.create({
            "message": message,
            "author": currentUserId,
            "imageTitle": imageTitle,
            "audioTitle": audioTitle
        });

        res.status(201).json({ 'success': `New post created!` });
    } catch (err) {
        res.status(500).json({ 'message': err.message });
    }
}

const getAllPosts = async (req, res) => {
    const posts = await Post.find().populate("author", "username userId");
    if (!posts) return res.status(204).json({ 'message': 'No posts found' });
    res.json(posts);
}

const getPostsByUserId = async (req, res) => {
    if (!req?.params?.userId) return res.status(400).json({ "message": 'username required' });
    const posts = await Post.find({ author: req.params.userId }).populate("author", "username userId");
    if (!posts) {
        return res.status(404).json({ message: `Username: ${req.params.userId} posts not found` });
    }
    res.json(posts);
}

const addReaction = async (req, res) => {
    if (!req?.params?.id) return res.status(400).json({ message: 'Post ID required' });
    const post = await Post.findOne({ _id: req.params.id }).exec();
    if (!post) {
        return res.status(204).json({ message: `Post ID ${req.params.id} not found` });
    }

    if (!req?.body?.reactions) return res.status(400).json({ message: 'reactions required' });
    const updatedPost = await Post.findByIdAndUpdate(req.params.id, req.body)
    return res.status(200).json({ success: `Reactions updated` });
}

const deletePost = async (req, res) => {
    if (!req?.params?.id) return res.status(400).json({ message: 'Post ID required' });
    const post = await Post.findOne({ _id: req.params.id }).exec();
    if (!post) {
        return res.status(204).json({ message: `Post ID ${req.params.id} not found` });
    }
    const result = await post.deleteOne({ _id: req.params.id });
    res.json({ success: `Post ${req.params.id} deleted` });
}

module.exports = {
    addNewPost,
    getAllPosts,
    getPostsByUserId,
    addReaction,
    deletePost
}