import mongoose from "mongoose";
const FriendsSchema = new mongoose.Schema({
    senderId: { type: String, required: true },
    receiverId: { type: String, required: true },
    status: { type: String, enum: ["pending", "accepted", "rejected"], },
    roomId: { type: String, },
    createdAt: { type: Date, default: Date.now },
});
const Freinds = mongoose.model("friends", FriendsSchema);
export default Freinds;
