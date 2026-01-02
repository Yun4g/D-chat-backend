import { Router } from "express";
import Notification from "../model/notification.js";
import { UserModel } from "../model/UserScehema.js";

const route = Router();

route.get("/notification/:userId", async (req, res) => {
  const { userId } = req.params;


  try {
    const getUser = await UserModel.findById(userId);

    if (!getUser) {
      return res.status(404).json({ message: 'user not found' });
    }

    const notifications = await Notification.find({ userId });


    return res.status(200).json({
      notifications: notifications || [],
    });

  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

export default route;
