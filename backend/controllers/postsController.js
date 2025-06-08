const Post = require('../model/Post');

const addNewPost = async (req, res) => {
    const { title, content, currentUserId } = req.body;
    if (!currentUserId) return res.status(400).json({ 'message': 'User must be logged in' });
    if (!title || !content) return res.status(400).json({ 'message': 'Title and content are required.' });

    try {
        //create and store the new post
        const result = await Post.create({
            "title": title,
            "content": content,
            "author": currentUserId,
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

module.exports = {
    addNewPost,
    getAllPosts,
    getPostsByUserId,
    addReaction
}