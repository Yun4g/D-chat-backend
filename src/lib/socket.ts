import { Server, Socket } from "socket.io";
import type { Server as HttpServer } from "http";
import { MessageModel } from "../model/messageSchema.js";

let io: Server | null = null;

export const initialSocket = (server: HttpServer): Server => {
  if (io) return io;

  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket: Socket) => {
    console.log("User connected:", socket.id);

    socket.on("register", (userId: string, callback?: () => void) => {
      socket.join(userId);
      console.log(`User ${userId} registered and joined their personal room`);
      callback?.();
    });

    socket.on("joinRoom", async (roomId, callback) => {
      socket.join(roomId);



      callback?.();
    });

    socket.on("getMessages", async (roomId) => {
      const messages = await MessageModel.find({ roomId }).sort({ timeStamp: 1 });




      const normalized = messages.map(m => ({
        _id: m._id,
        message: m.message,
        senderId: m.sender,
        roomId: m.roomId,
        createdAt: m.timeStamp
      }));
      socket.emit("loadMessages", normalized);
    });



    socket.on("sendMessage", async (data) => {
      console.log("🔥 SERVER RECEIVED MESSAGE", data);

      const { roomId, message, senderId } = data;

      if (!roomId || !message || !senderId) {
        console.error(" Invalid sendMessage payload:", data);
        return;
      }

      try {
        const savedMessage = await MessageModel.create({
          message,
          sender: senderId,
          roomId,
        });

        io?.to(roomId).emit("receiveMessage", {
          _id: savedMessage._id,
          message: savedMessage.message,
          senderId: savedMessage.sender,
          roomId: savedMessage.roomId,
          createdAt: savedMessage.timeStamp,
        });

        console.log(" Message saved & emitted");
      } catch (err) {
        console.error(" Failed to save message:", err);
      }
    });




    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });

  });
  return io;
};

export const getIO = (): Server => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};
