import * as dotenv from 'dotenv';
import User from '../model/User.js';


before(async () => {
    try {
        await User.deleteMany({});
    } catch (err) {
        console.error(err);
        throw err;  // Re-throw the error to fail the test
    }
});

after(async () => {
    try {

    } catch (err) {
        console.error(err);
        throw err;  // Re-throw the error to fail the test
    }
});