
import { Request, Response, Router } from "express";
import { UserModel } from "../model/UserScehema.js";
import FriendRequestModel from "../model/friendRequestModel.js";
import { sendFreindRequestEmail } from "../utils/sendEmail.js";
import { getIO } from '../lib/socket.js';
import Freinds from '../model/freindSchema.js';
import { v4 as uuidv4 } from "uuid";
import notification from '../model/notification.js';


const route = Router();

interface PayloadTypes {
    userId: string,
    name: string,
    email: string,
    avatarUrl?: string,
    mutualFriendsCount: number,
}

route.post('/sendRequest', async (req, res) => {
    const { senderId, receiverId, receiverEmail, } = req.body;
    if (!senderId || !receiverId) {
        return res.status(400).send("senderId  and recieverId is required")
    };
    try {
        const io = getIO();
        if (!io) {
            console.error('error')
        }

        if (senderId == receiverId) {
            return res.status(400).json({ message: "oops You can not send a request to your self" })
        }


        const getReceiver = await UserModel.findById(receiverId);
        if (!getReceiver) {
            return res.status(404).send("User not found")
        }
        const Sender = await UserModel.findById(senderId);
        if (!Sender) {
            return res.status(404).send("User not found")
        }

        const existingRequest = await FriendRequestModel.findOne({
            status: "pending",
            $or: [
                { senderId: senderId, receiverId: receiverId },
                { senderId: receiverId, receiverId: senderId }
            ]
        });


        if (existingRequest) {
            return res.status(400).json({
                message: "Friend request already sent",
            });
        }


        const existingFriend = await Freinds.findOne({
            status: "accepted",
            $or: [
                { senderId: senderId, receiverId: receiverId },
                { senderId: receiverId, receiverId: senderId },
            ]
        });

        if (existingFriend) {
            return res.status(400).json({ message: "Friend already exists" });
        }



        const NewFriendRequest = await FriendRequestModel.create({
            senderId: senderId,
            receiverId: receiverId,
            status: "pending"
        });

        const FriendRequest = await NewFriendRequest.save();

        const RequestLink = `${process.env.FRONTEND_URL}`;
        const message = `
        <p>you have a request from ${Sender.userName}</p>
          <p>Click the link below to login to D-chat </p>
           <a href="${RequestLink}">${RequestLink}</a>
        `
        await sendFreindRequestEmail(receiverEmail, `Freind Request ${Sender.userName}`, message);

        io.to(receiverId).emit('FriendRequest', {
            senderId,
            receiverId,
            status: 'pending'
        })
        io.to(senderId).emit('FriendRequest', {
            senderId,
            receiverId,
            status: 'pending'
        });

        io.to(receiverId).emit('notification', {
            requestId: FriendRequest._id,
            message: `friend request from ${Sender.userName}`
        });

        await notification.create({
            userId: receiverId,
            message: `friend request from ${Sender.userName}`
        });

        return res.status(200).json({ message: "Request sent Succefully" })
    } catch (error) {
        console.log('error from send request', error)
        return res.status(500).send("internal server error")
    }

});

route.post('/AcceptRequest', async (req, res) => {
    const { senderId, receiverId, recieverEmail } = req.body;
    if (!senderId || !receiverId) {
        return res.status(400).send("senderId  and receiverId is required ")
    };
    try {
        const io = getIO();

        const existingFriend = await Freinds.findOne({
            status: "accepted",
            $or: [
                { senderId, receiverId },
                { senderId: receiverId, receiverId: senderId },
            ],
        });

        if (existingFriend) {
            return res.status(400).json({
                message: "You are already friends with this user",
            });
        }


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
        };
        const uniqueroomId = uuidv4();

        await Freinds.create({
            senderId: senderId,
            receiverId: receiverId,
            status: "accepted",
            roomId: uniqueroomId,
        });

        const AcceptLink = `${process.env.FRONTEND_URL}`;
        const message = `
           <p>you have accepted a request from ${Sender.userName}</p>
            <p>Click the link below to login to D-chat </p>
           <a href="${AcceptLink}">${AcceptLink}</a>
        `
        await sendFreindRequestEmail(recieverEmail, `you succesfully accepted ${Sender.userName}`, message);

        io.to(senderId).emit("friendRequestAccepted", { senderId: receiverId, roomId: uniqueroomId });
        io.to(receiverId).emit("friendRequestAccepted", { senderId: senderId, roomId: uniqueroomId });
        io.to(senderId).emit("inviteToRoom", uniqueroomId);

        return res.status(200).json({
            message: "Request Accepted Succefully",
            roomId: uniqueroomId
        });
    } catch (error) {
        console.log('error from accept request', error)
        return res.status(500).send("Internal server error");
    }

});

route.post('/rejectRequest', async (req, res) => {
    const io = getIO()
    const { senderId, receiverId, } = req.body;
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

        io.to(senderId).emit('FriendRequest', {
            receiverId,
            status: 'rejected'
        });


        return res.status(200).json({ message: "Request Rejected Succefully" })
    } catch (error) {
        res.status(500).send("internal server error");
    }

});

route.get('/getfriends/:userId', async (req: Request, res: Response) => {
    const { userId } = req.params;

    try {
  
        const incomingPendingRequests = await FriendRequestModel.find({
            receiverId: userId,
            status: "pending",
        }).select("senderId");
 

        const incomingPendingRequestsSenderId = incomingPendingRequests.map(req => req.senderId);

        const sentPendingRequests = await FriendRequestModel.find({
            senderId: userId,
            status: "pending"
        }).select("receiverId");

        const sentPendingRequestReceiverIds = sentPendingRequests.map(req => req.receiverId);

        const friends = await Freinds.find({
            status: "accepted",
            $or: [
                { senderId: userId },
                { receiverId: userId },
            ],
        }).select("senderId receiverId");

        const friendIds = friends.map(f => f.senderId.toString() === userId ? f.receiverId : f.senderId);

        const excludedUserIds = [
            ...incomingPendingRequestsSenderId,
            ...sentPendingRequestReceiverIds,
            ...friendIds,
        ];

        const getOtherUsers = await UserModel.find({
            _id: {
                $ne: userId,
                $nin: excludedUserIds,
            },
        });


        const sentRequestMap: Record<string, string> = {};

        sentPendingRequests.forEach(req => {
            sentRequestMap[req.receiverId.toString()] = req.status;
        });


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
        console.error('getfriends error:', error);
        return res.status(500).send("internal server error");
    }
});


//  get all request that is pending where i am the receiver 

const getFriendsId = async (ids: string | string[]): Promise<string[]> => {
    const idArray = Array.isArray(ids) ? ids : [ids];

    const friends = await Freinds.find({
        status: "accepted",
        $or: [
            { senderId: { $in: idArray } },
            { receiverId: { $in: idArray } },
        ],
    }).lean();

    return friends.map(f =>
        idArray.includes(f.senderId.toString())
            ? f.receiverId.toString()
            : f.senderId.toString()
    );
};

route.get('/getRequest/:userId', async (req: Request, res: Response) => {
    const { userId } = req.params;

    try {
        const FindUser = await UserModel.findById(userId);
        if (!FindUser) {
            return res.status(404).json({ message: "User not found" });
        }

        const PendingRequest = await FriendRequestModel.find({
            receiverId: userId,
            status: "pending",
        }).select("senderId");

        if (PendingRequest.length === 0) {
            return res.status(200).json({
                status: "success",
                message: "Request successful",
                senderRequest: []
            });
        }

        const PendingRequestIds = PendingRequest.map(req => req.senderId.toString());

        // Get all pending senders
        const pendingUsers = await UserModel.find({
            _id: { $in: PendingRequestIds }
        }).select("-password");

        // Get user friends once
        const userFriends = await getFriendsId(userId);
        const userFriendSet = new Set(userFriends);


        
        const payload: PayloadTypes[] = [];

        // Compute mutual friends per sender
        for (const sender of pendingUsers) {
            const senderFriends = await getFriendsId(sender._id.toString());

            const mutualFriendsCount = senderFriends.filter(id =>
                userFriendSet.has(id)
            ).length;

            payload.push({
                userId: sender._id.toString(),
                name: sender.userName,
                email: sender.email,
                avatarUrl: sender.avatarUrl,
                mutualFriendsCount
            });
        }

        return res.status(200).json({
            status: "success",
            message: "Request successful",
            senderRequest: payload
        });

    } catch (error) {
        console.log('getRequest error', error);
        return res.status(500).send("Internal server error");
    }
});




export default route;