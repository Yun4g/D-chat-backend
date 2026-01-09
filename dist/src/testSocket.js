// testSocket.js
import { io } from "socket.io-client";
// Connect to your backend socket.io server
const socket = io("http://localhost:3000"); // replace with your server URL/port
// Listen for notifications
socket.on("connect", () => {
    console.log("Connected with id:", socket.id);
    // Join a room (simulate a user)
    socket.emit("register", "user123");
    // Listen for friend request notifications
    socket.on("notification", (data) => {
        console.log("Notification received:", data);
    });
    // Optional: test sending a message
    socket.emit("sendMessage", {
        roomId: "room123",
        message: "Hello from test client",
        senderId: "user123",
    });
});
socket.on("receiveMessage", (data) => {
    console.log("Message received:", data);
});
socket.on("disconnect", () => {
    console.log("Disconnected from server");
});
