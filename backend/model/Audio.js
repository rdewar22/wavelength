const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const audioSchema = new Schema({
    audioName: {
        type: String,
        trim: true
    },
    audioUrl: {
        type: String,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
  }, {timestamps: true });

module.exports = mongoose.model('Audio', audioSchema);