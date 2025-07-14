const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = new Schema({
    title: {
        type: String,
    },
    message: {
        type: String,
    },
    audioTitle: {
        type: String,
    },    
    hasImage: {
        type: Boolean,
        default: false
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
