import jwt from 'jsonwebtoken';
import { Router } from "express";
import { UserModel } from "../model/UserScehema.js";
import FriendRequestModel from "../model/friendRequestModel.js";
import { sendFreindRequestEmail } from "../utils/sendEmail.js";
import { getIO } from '../lib/socket.js';
import Freinds from '../model/freindSchema.js';
import { v4 as uuidv4 } from "uuid";
import notification from '../model/notification.js';


const route = Router();



route.post('/sendRequest', async (req, res) => {
    const { senderId, receiverId, receiverEmail, } = req.body;
    if (!senderId || !receiverId) {
        return res.status(400).send("senderId  and recieverId is required")
    };
    try {
        const io = getIO();
        const getReceiver = await UserModel.findById(receiverId);
        if (!getReceiver) {
            return res.status(200).send("User not found")
        }
        const Sender = await UserModel.findById(senderId);
        if (!Sender) {
            return res.status(200).send("User not found")
        }

        const NewFriendRequest = await FriendRequestModel.create({
            senderId: senderId,
            receiverId: receiverId,
            status: "pending"
        });
        const FriendRequest = await NewFriendRequest.save();

        const RequestLink = `${process.env.FRONTEND_URL}`;
        const message = `
        <p>you have a request from ${senderId}</p>
          <p>Click the link below to login to D-chat </p>
           <a href="${RequestLink}">${RequestLink}</a>
        `
        await sendFreindRequestEmail(receiverEmail, `Freind Request ${senderId}`, message);


        io.to(receiverId).emit('notification', {
            requestId: FriendRequest._id,
            message: `friend request from ${Sender.userName}`
        });

        await notification.create({
             userId: receiverId,
             message: `friend request from ${Sender.userName}` 
        })

        return res.status(200).json({ message: "Request sent Succefully" })
    } catch (error) {
        res.status(500).send("internal server error")
    }

});

route.post('/AcceptRequest', async (req, res) => {
    const { senderId, receiverId, receiverEmail, } = req.body;
    if (!senderId || !receiverId) {
        return res.status(400).send("senderId  and recieverId")
    };
    try {
        const io = getIO();
        const getReceiver = await UserModel.findById(receiverId);
        if (!getReceiver) {
            return res.status(200).send("User not found")
        }
        const Sender = await UserModel.findById(senderId);
        if (!Sender) {
            return res.status(200).send("User not found")
        }

        const updateFriendReq = await FriendRequestModel.findOneAndUpdate(
            { senderId, receiverId, status: "pending" },
            { status: "accepted" },
            { new: true }
        );

        if (!updateFriendReq) {
            return res.status(404).json({ message: "Friend request not found" });
        }

        const uniqueroomId = uuidv4();

        await Freinds.create({
            senderId: senderId,
            receiverId: receiverId,
            status: "accepted",
            roomId: uniqueroomId,
        });
       
        const AcceptLink =`${process.env.FRONTEND_URL}`;
        const message = `
           <p>you have accepted a request from ${Sender.userName}</p>
            <p>Click the link below to login to D-chat </p>
           <a href="${AcceptLink}">${AcceptLink}</a>
        `
        await sendFreindRequestEmail(receiverEmail, `you succesfully accepted ${Sender.userName}`, message);
        
        io.to(senderId).emit("friendRequestAccepted", { roomId: uniqueroomId });
        io.to(receiverId).emit("friendRequestAccepted", { roomId: uniqueroomId });

        return res.status(200).json({ message: "Request Accepted Succefully" });
    } catch (error) {
        res.status(500).send("internal server error");
    }

});

route.post('/rejectRequest', async (req, res) => {
    const { senderId, receiverId,  } = req.body;
    if (!senderId || !receiverId) {
        return res.status(400).send("senderId  and recieverId")
    };
    try {
        const getReceiver = await UserModel.findById(receiverId);
        if (!getReceiver) {
            return res.status(200).send("User not found")
        }
        const Sender = await UserModel.findById(senderId);
        if (!Sender) {
            return res.status(200).send("User not found")
        }
        const updateFriendReq = await FriendRequestModel.findOneAndUpdate(
            { senderId, receiverId, status: "pending" },
            { status: "rejected" },
            { new: true }
        );
        if (!updateFriendReq) {
            return res.status(404).json({ message: "Friend request not found" });
        }
        return res.status(200).json({ message: "Request Rejected Succefully" })
    } catch (error) {
        res.status(500).send("internal server error");
    }

});

route.get('/getfriends/:userId', async (req, res) => {
  const { userId } = req.params;

  try {

    const sentRequests = await FriendRequestModel.find({ senderId: userId });
    const sentRequestMap: Record<string, string> = {};
    sentRequests.forEach(req => {
      sentRequestMap[req.receiverId.toString()] = req.status; 
    });

    // 2. Get all users except yourself and except users who accepted your request
    const getOtherUsers = await UserModel.find({
      _id: { $ne: userId },
    });

    // 3. Map the friend request status for each user
    const usersWithStatus = getOtherUsers.map(user => {
      return {
        ...user.toObject(),
        requestStatus: sentRequestMap[user._id.toString()] || "none",
      };
    });

    return res.status(200).json({
      status: "success",
      users: usersWithStatus,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send("internal server error");
  }
});


export default route;