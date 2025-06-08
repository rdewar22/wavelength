const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    reactions: {
        thumbsUp: { type: Number, default: 0 },
        thumbsDown: { type: Number, default: 0 },  
    },
}, { timestamps: true });

module.exports = mongoose.model('Post', postSchema);
