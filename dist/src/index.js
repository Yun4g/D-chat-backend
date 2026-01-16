import dotenv from 'dotenv';
dotenv.config();
import cors from 'cors';
import express from 'express';
import authRoute from './routes/authRoute.js';
import chat from './routes/chat.js';
import { connectDB } from './db/db.js';
import cookieParser from "cookie-parser";
import { createServer } from 'http';
import { initialSocket } from './lib/socket.js';
import { globalErrorHandler } from './middleware/GlobalError.js';
import { authMiddleware } from './middleware/authMiddleware.js';
import notification from './routes/notification.js';
import Me from './routes/users.js';
import FriendsRequest from './routes/friendRequestRoute.js';
const server = express();
server.use(express.json());
server.use(cookieParser());
server.use(cors({
    origin: ['http://localhost:5173', 'https://d-chat-one.vercel.app'],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
}));
const httpServer = createServer(server);
initialSocket(httpServer);
await connectDB();
const Port = process.env.PORT || 5000;
server.use(express.urlencoded({ extended: true }));
server.use('/api', authRoute);
server.use('/api', authMiddleware, FriendsRequest);
server.use('/api', authMiddleware, chat);
server.use('/api', authMiddleware, notification);
server.use('/api', authMiddleware, Me);
server.get('/', (req, res) => {
    res.send('Welcome to D-CHAT Backend');
});
server.get("/test", (req, res) => {
    res.send("Latest code is running");
});
server.use(globalErrorHandler);
httpServer.listen(Port, () => {
    console.log(`server running succesfully on port ${Port}`);
});
export default server;
