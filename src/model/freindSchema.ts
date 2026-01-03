import mongoose from "mongoose";



interface FriendsType {
    senderId: string;
    userId: string;
    status: 'accepted' | 'pending' | 'rejected';
    roomId: string
    createdAt: Date;
}


const FriendsSchema = new mongoose.Schema<FriendsType>({
    senderId: { type: String, required: true },
    userId: { type: String, required: true },
    status: { type: String, enum: ["pending", "accepted", "rejected"], },
    roomId: { type: String, },
    createdAt: { type: Date, default: Date.now },
});



const Freinds = mongoose.model<FriendsType>("friends", FriendsSchema);

export default Freinds;

// const friends = await Friends.find({
//     status: "accepted",
//     $or: [
//         { sender: userId },
//         { receiver: userId }
//     ]
// });

