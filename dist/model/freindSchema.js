import mongoose from "mongoose";
const FriendsSchema = new mongoose.Schema({
    sender: { type: String, required: true },
    receiver: { type: String, required: true },
    status: { type: String, enum: ["pending", "accepted", "rejected"], },
    roomId: { type: String, },
    createdAt: { type: Date, default: Date.now },
});
const Freinds = mongoose.model("friends", FriendsSchema);
export default Freinds;
// const friends = await Friends.find({
//     status: "accepted",
//     $or: [
//         { sender: userId },
//         { receiver: userId }
//     ]
// });
