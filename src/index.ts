import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createServer } from "http";

import authRoute from "./routes/authRoute.js";
import chat from "./routes/chat.js";
import FriendsRequest from "./routes/friendRequestRoute.js";
import notification from "./routes/notification.js";

import { connectDB } from "./db/db.js";
import { initialSocket } from "./lib/socket.js";
import { globalErrorHandler } from "./middleware/GlobalError.js";
import { authMiddleware } from "./middleware/authMiddleware.js";

const app = express();
const PORT = process.env.PORT || 5000;


app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://d-chat-frontend.vercel.app",
    ],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


app.use("/api", authRoute);
app.use("/api", authMiddleware, FriendsRequest);
app.use("/api", authMiddleware, chat);
app.use("/api", authMiddleware, notification);

app.get("/", (_req, res) => {
  res.send("Welcome to D-CHAT Backend");
});


app.use(globalErrorHandler);


const httpServer = createServer(app);
initialSocket(httpServer);

await connectDB();

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

export default app;
