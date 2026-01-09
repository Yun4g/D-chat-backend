import { io } from "socket.io-client";
export const socket = io("http://localhost:5000");
socket.on("connect", () => {
    console.log("Connected to server:", socket.id);
    // Now safe to emit
    socket.emit("sendMessage", {
        roomId: "room1",
        message: "Hello world",
        senderId: "user1"
    });
});
