import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response, NextFunction } from 'express';
import authRoute from './routes/authRoute.js';
import { connectDB } from './db/db.js';

const server = express();

server.use(express.json());
const Port = process.env.PORT  || 5000;


server.use(express.urlencoded({ extended: true }));


server.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    next();
});

connectDB().then(() => {
server.use('/api', authRoute);
server.get('/', (req, res) => {
     res.send('Welcome to D-CHAT Backend')
})
}).catch(err => {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
});

server.listen(Port, () => {
    console.log(`server running succesfully on port ${Port}`)
})
export default server;



