import { Router } from "express";
import Freinds from "../model/freindSchema.js";
import { UserModel } from "../model/UserScehema.js";
import { MessageModel } from "../model/messageSchema.js";





const route = Router();



route.get('/friendsList/:userId', async (req, res) => {
    const { userId } = req.params;
     if (!userId) {
        return res.status(400).send("userId is required");
    }

    try {
         const friends = await Freinds.find({
        status: "accepted",
        $or: [
            { senderId: userId },
            { receiverId: userId }
        ]
    });
      if (friends.length === 0) {
        return res.status(200).json({ message: "No friends found", friends: [] });
      }

      const friendsid = friends.map(friend => friend.senderId === userId ? friend.receiverId : friend.senderId);
     const getFriends = await UserModel.find({ _id: { $in: friendsid } });


      res.status(200).json({ 
         friends: getFriends,
         message: "Friends retrieved successfully",
       });


    } catch (error) {
        console.error(error);
        res.status(500).send("Internal server error");
    }




});

route.get('/chatHistroy/:roomId', async (req, res) => {
    const { roomId } = req.params;
     if (!roomId) {
        return res.status(400).send("roomId is required");
    }   
    try {
        const messages = await MessageModel.find({ roomId }).sort({ timeStamp: 1 });
        res.status(200).json({ 
            messages,
         message: "Chat history retrieved successfully",
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal server error");
    }
});

export default route;