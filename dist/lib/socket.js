import { Server } from "socket.io";
import { MessageModel } from "../model/messageSchema.js";
let io = null;
export const initialSocket = (server) => {
    if (io)
        return io;
    io = new Server(server, {
        cors: {
            origin: process.env.FRONTEND_URL,
            methods: ["GET", "POST"],
        },
    });
    io.on("connection", (socket) => {
        console.log("User connected:", socket.id);
        socket.on("register", (userId) => {
            socket.join(userId);
            console.log(`User ${userId} joined room ${userId}`);
        });
        socket.on("joinRoom", (roomId) => {
            socket.join(roomId);
            console.log(`User joined room ${roomId}`);
        });
        socket.on("sendMessage", async (data) => {
            const { roomId, message, senderId } = data;
            await MessageModel.create({
                message,
                sender: senderId,
                roomId
            });
            io?.to(roomId).emit("receiveMessage", { message, senderId });
        });
        socket.on("disconnect", () => {
            console.log("User disconnected:", socket.id);
        });
    });
    return io;
};
export const getIO = () => {
    if (!io) {
        throw new Error("Socket.io not initialized");
    }
    return io;
};
