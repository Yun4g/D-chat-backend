import mongoose, { Schema } from "mongoose";
const FriendRequestSchema = new Schema({
    senderId: { type: String, required: true },
    receiverId: { type: String, required: true },
    status: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});
const FriendRequestModel = mongoose.model('FreindRequest', FriendRequestSchema);
export default FriendRequestModel;
