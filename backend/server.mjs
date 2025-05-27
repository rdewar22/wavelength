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
import apiMessagesRoute from './routes/api/messages.js';
import { Server } from 'socket.io';
import { createServer } from 'http';

dotenv.config({ path: '.env' }) //uncomment to use production db and .env

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = process.env.PORT || 3500;
const app = express();

// Create HTTP server
const httpServer = createServer(app);

// Create Socket.IO instance
const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
    },
    pingTimeout: 60000
});

// Socket.IO connection handling
io.on("connection", (socket) => {
    console.log("Connected to socket.io");

    // Setup socket user (usually done after user logs in)
    socket.on("setup", (userData) => {
        socket.join(userData._id); // Create a room for user
        socket.emit("connected");
    });

    // Join chat room
    socket.on("join chat", (room) => {
        socket.join(room);
        console.log("User joined room: " + room);
    });

    // Handle new message
    socket.on("new message", (newMessageReceived) => {
        console.log("Server received new message:", newMessageReceived);
        try {
            const chat = newMessageReceived.chat;

            if (!chat.users) {
                console.log("chat.users not defined");
                return;
            }

            console.log("Broadcasting message to chat users:", chat.users);
            chat.users.forEach((user) => {
                if (user._id === newMessageReceived.sender._id) {
                    console.log("Skipping sender:", user._id);
                    return;
                }
                
                console.log("Emitting message to user:", user._id);
                // Broadcast to all sockets in the room
                io.in(user._id).emit("message received", newMessageReceived);
            });
        } catch (err) {
            console.error("Error handling new message:", err);
        }
    });

    // Handle typing
    socket.on("typing", (room) => socket.in(room).emit("typing"));
    socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

    // Handle disconnect
    socket.on("disconnect", () => {
        console.log("USER DISCONNECTED");
    });
});

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
app.get("/test", (req, res) => {
    res.status(200).send({ message: "Welcome to the WAVELENGTH-REST-API" });
});
app.use('/', rootRoute);
app.use('/register', registerRoute);
app.use('/auth', authRoute);
app.use('/refresh', refreshRoute);
app.use('/posts', apiPostsRoute);
app.use('/logout', logoutRoute);


app.use(verifyJWT);
app.use('/employees', apiEmployeesRoute);
app.use('/users', apiUsersRoute);
app.use('/messages', apiMessagesRoute);

// catch-all 404
app.all('*', (req, res) => {
    res.status(404);
    if (req.accepts('html')) {
        res.sendFile(path.join(__dirname, 'views', '404.html'));
    } else if (req.accepts('json')) {
        res.json({ error: "404 Not Found" });
    } else {
        res.type('txt').send("404 Not Found");
    }

});

app.use(errorHandler);

// Use httpServer instead of app.listen
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));

mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB');
});

// Make io available to other modules
export { io };
export default app;



