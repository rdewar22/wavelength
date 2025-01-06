const Post = require('../model/Post');

const addNewPost = async (req, res) => {
    const { title, content } = req.body;
    if (!title || !content) return res.status(400).json({ 'message': 'Title and content are required.'});

    try {
        //create and store the new post
        const result = await Post.create({ 
            "title": title,
            "content": content 
        });

        console.log(result);
       
        res.status(201).json({ 'success': `New post created!`});
    } catch (err) {
        res.status(500).json({ 'message': err.message });
    }
}

const getAllPosts = async (req, res) => {
    const posts = await Post.find();
    if (!posts) return res.status(204).json({ 'message': 'No posts found' });
    res.json(posts);
}

module.exports = { 
    addNewPost,
    getAllPosts 
}