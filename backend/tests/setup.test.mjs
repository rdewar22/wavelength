import * as dotenv from 'dotenv';
import User from '../model/User.js';
import mongoose from 'mongoose';


before(async () => {
    try {
        
    } catch (err) {
        console.error(err);
        throw err;  // Re-throw the error to fail the test
    }
});

after(async () => {
    try {
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
    } catch (err) {
        console.error(err);
        throw err;  // Re-throw the error to fail the test
    }
});