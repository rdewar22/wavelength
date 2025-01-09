import * as dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import cors from 'cors';
import corsOptions from './config/corsOptions.js';
import { logger } from './middleware/logEvents.js';
import errorHandler from './middleware/errorHandler.js';
import verifyJWT from './middleware/verifyJWT.js';
import cookieParser from 'cookie-parser';
import credentials from './middleware/credentials.js';
import mongoose from 'mongoose';
import connectDB from './config/dbConn.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import rootRoute from './routes/root.js';
import registerRoute from './routes/register.js';
import authRoute from './routes/auth.js';
import refreshRoute from './routes/refresh.js';
import logoutRoute from './routes/logout.js';
import apiEmployeesRoute from './routes/api/employees.js';
import apiUsersRoute from './routes/api/users.js';
import apiPostsRoute from './routes/api/posts.js';

dotenv.config({ path: '.env'}) //uncomment to use production db and .env



const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = process.env.PORT || 3500;
const app = express();

// Connect to MongoDB
connectDB();

// custom middleware logger
app.use(logger);

// Handle options credentials check - before CORS
// and fetch cookies credentials requirement
app.use(credentials);

// Cross Origin Resource Sharing
app.use(cors(corsOptions));

// built-in middleware to handle urlencoded form data
app.use(express.urlencoded({ extended: false }));

// built-in middleware for json
app.use(express.json());

//middleware for cookies
app.use(cookieParser());

//serve static files
app.use('/', express.static(path.join(__dirname, '/public')));

// routes
//Welcome test route
app.get("/test", (req,res) => {
    res.status(200).send({message: "Welcome to the WAVELENGTH-REST-API"});
  }); 
app.use('/', rootRoute);
app.use('/register', registerRoute);
app.use('/auth', authRoute);
app.use('/refresh', refreshRoute);
app.use('/logout', logoutRoute);


app.use(verifyJWT);
app.use('/employees', apiEmployeesRoute);
app.use('/users', apiUsersRoute);
app.use('/posts', apiPostsRoute);



// catch-all 404
app.all('*', (req, res) => {
    res.status(404);
    if (req.accepts('html')) {
        res.sendFile(path.join(__dirname, 'views', '404.html'));
    } else if (req.accepts('json')) {
        res.json({ error: "404 Not Found"});
    } else {
        res.type('txt').send("404 Not Found");
    }
    
});

app.use(errorHandler);
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB');
});

export default app;



