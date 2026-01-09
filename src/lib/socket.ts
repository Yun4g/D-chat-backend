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
    const messages = await MessageModel.find({ roomId }).sort({ createdAt: 1 });
      socket.emit("loadMessages", messages);

    });



    socket.on("sendMessage", async (data) => {
      const { roomId, message, senderId } = data;
        console.log("Message sent:", data); 
      try {
          io?.to(roomId).emit("receiveMessage", { message, senderId, roomId });
        const savedMessage = await MessageModel.create({ message, sender: senderId, roomId });
        console.log("Message saved:", savedMessage);

      } catch (err) {
        console.error("Failed to save message:", err);
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
