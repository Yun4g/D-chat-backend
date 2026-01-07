import mongoose from "mongoose";



interface FriendsType {
    senderId: string;
   receiverId: string;
    status: 'accepted' | 'pending' | 'rejected';
    roomId: string
    createdAt: Date;
}


const FriendsSchema = new mongoose.Schema<FriendsType>({
    senderId: { type: String, required: true },
    receiverId: { type: String, required: true },
    status: { type: String, enum: ["pending", "accepted", "rejected"], },
    roomId: { type: String, },
    createdAt: { type: Date, default: Date.now },
});



const Freinds = mongoose.model<FriendsType>("friends", FriendsSchema);

export default Freinds;
