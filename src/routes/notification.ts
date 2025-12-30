import { Router } from "express";
import Notification from "../model/notification.js";

const route = Router();

route.get("/notification/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const notifications = await Notification.find({ userId });

    if (notifications.length === 0) {
      return res.status(404).json({
        message: "No notifications found",
      });
    }

    return res.status(200).json({
      notifications,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

export default route;
