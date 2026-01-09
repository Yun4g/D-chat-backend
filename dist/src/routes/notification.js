import { Router } from "express";
import Notification from "../model/notification.js";
import { UserModel } from "../model/UserScehema.js";
const route = Router();
route.get("/notification/:userId", async (req, res) => {
    const { userId } = req.params;
    console.log(" HIT NOTIFICATION ROUTE for userId:", userId);
    try {
        const getUser = await UserModel.findById(userId);
        if (!getUser) {
            res.status(400).json({ message: "user with the given Id Does not exist" });
        }
        const notifications = await Notification.find({ userId });
        return res.status(200).json({
            notifications: notifications || [],
        });
    }
    catch (error) {
        console.error("Notification route error:", error);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
});
export default route;
