const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const chatSchema = new Schema({
    chatName: {
        type: String,
        required: true,
        trim: true
    },
    isGroupChat: {
        type: Boolean,
        default: false,
        required: true
    },
    users: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    latestMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message",
    },
  }, {timestamps: true });

module.exports = mongoose.model('Chat', chatSchema);
