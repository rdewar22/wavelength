const mongoose = require('mongoose');

const connectDB = async () => {
    const dbUri = process.env.NODE_ENV === 'test' ? process.env.TEST_DATABASE_URI : process.env.DATABASE_URI;

    try {
        await mongoose.connect(dbUri);
    } catch (err) {
        console.error(err);
    }
}

const connectS3Db = async () => {
    try {
        
    } catch (err) {
        console.error(err);
    }
}

module.exports = connectDB;
