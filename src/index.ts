import dotenv from 'dotenv';
dotenv.config();
import cors from 'cors';
import express, { Request, Response, NextFunction } from 'express';
import authRoute from './routes/authRoute.js';
import chat from './routes/chat.js';
import FriendsRequest from  './routes/friendRequestRoute.js'
import { connectDB } from './db/db.js';
import cookieParser from "cookie-parser";
import { createServer } from 'http';
import { initialSocket } from './lib/socket.js';
import { globalErrorHandler } from './middleware/GlobalError.js';
import { authMiddleware } from './middleware/authMiddleware.js';
const server = express();

await connectDB();
server.use(express.json());

//  server for socket.io
const httpServer = createServer(server);
initialSocket(httpServer)


// middlewares
server.use(cors({
  origin: ['http://localhost:5173', 'https://d-chat-frontend.vercel.app'],
  credentials: true,
}));
server.use(cookieParser())
const Port = process.env.PORT  || 5000;
server.use(express.urlencoded({ extended: true }));


// routes

server.use('/api', authRoute);
server.use('/api', authMiddleware, FriendsRequest )
server.use('/api',  authMiddleware,  chat);
server.get('/', (req, res) => {
     res.send('Welcome to D-CHAT Backend')
});

// global error handler
server.use(globalErrorHandler);

httpServer.listen(Port, () => {
    console.log(`server running succesfully on port ${Port}`)
})
export default server;



