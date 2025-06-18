const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const audioSchema = new Schema({
    title: {
        type: String,
        trim: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
  }, {timestamps: true });

module.exports = mongoose.model('Audio', audioSchema);