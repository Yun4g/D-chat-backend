
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
    id: string,
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
        const getReceiver = await UserModel.findById(receiverId);
        if (!getReceiver) {
            return res.status(200).send("User not found")
        }
        const Sender = await UserModel.findById(senderId);
        if (!Sender) {
            return res.status(200).send("User not found")
        }

        const existingRequest = await FriendRequestModel.findOne({
            senderId,
            receiverId,
            status: "pending",
        });



        if (existingRequest) {
            return res.status(400).json({
                message: "Friend request already sent",
            });
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
        console.log('error from send request', error)
        return res.status(500).send("internal server error")
    }

});

route.post('/AcceptRequest', async (req, res) => {
    const { senderId, receiverId, receiverEmail, } = req.body;
    if (!senderId || !receiverId) {
        return res.status(400).send("senderId  and receiverId is required ")
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

        const AcceptLink = `${process.env.FRONTEND_URL}`;
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
        console.log('error from accept request', error)
        return res.status(500).send("internal server error");
    }

});

route.post('/rejectRequest', async (req, res) => {
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
        return res.status(200).json({ message: "Request Rejected Succefully" })
    } catch (error) {
        res.status(500).send("internal server error");
    }

});

route.get('/getfriends/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const incomingPendingRequests = await FriendRequestModel.find({
            receiverId: userId,
            status: "pending",
        }).select("senderId");

        const incomingPendingRequestsSenderId = incomingPendingRequests.map(
            req => req.senderId
        );

        const sentRequests = await FriendRequestModel.find({ senderId: userId });
        const sentRequestMap: Record<string, string> = {};
        sentRequests.forEach(req => {
            sentRequestMap[req.receiverId.toString()] = req.status;
        });

        const getOtherUsers = await UserModel.find({
            _id: {
                $ne: userId,
                $nin: incomingPendingRequestsSenderId
            },
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


//  get all request that is pending where i am the receiver 

const getFriendsId = async (Id: string): Promise<string[]> => {
    const friends = await Freinds.find({
        status: "accepted",
        $or: [{ senderId: Id }, { receiverId: Id }],
    });

    return friends.map(f => f.senderId.toString() === Id ? f.receiverId.toString() : f.senderId.toString()
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

        if (PendingRequest.length == 0) {
            return res.status(200).json({
                status: "success",
                message: "Request successful",
                senderRequest: []
            })
        }

        const SenderId = PendingRequest.map(req => req.senderId)

        //  get sender details and send senderId and
        const getSenderIdDetails = await UserModel.find({
            _id: { $in: SenderId },
        }).select("-password");


        const receiverFriendId = await getFriendsId(userId);


        const payload: PayloadTypes[] = [];

        for (const sender of getSenderIdDetails) {
            const senderFriendId = await getFriendsId(sender._id.toString());
           const senderId = sender._id.toString()
            const mutualFriendsCount = senderFriendId.filter(id =>
                receiverFriendId.includes(id)
            ).length;

            payload.push({
            id: senderId,
            name: sender.userName,
            email: sender.email,
            avatarUrl: sender.avatarUrl,
            mutualFriendsCount
            })
        }

        return res.status(200).json({
            status: "success",
            message: "Request successful",
            senderRequest: payload
        });
    } catch (error) {
        console.log('getRequest', error);
        return res.status(500).send("internal server error");
    }
})


export default route;