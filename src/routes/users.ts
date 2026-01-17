import { Router, Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import { UserModel } from "../model/UserSchema.js";

const route = Router();

route.get("/me", async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await UserModel
      .findById(userId)
      .select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error("ME endpoint error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default route;
