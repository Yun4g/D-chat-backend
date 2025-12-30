import mongoose from "mongoose";
const MessageSchema = new mongoose.Schema({
    message: { type: String, required: true },
    sender: { type: String, required: true },
    roomId: { type: String, required: true },
    timeStamp: { type: Date, default: Date.now },
});
const MessageModel = mongoose.model("message", MessageSchema);
export { MessageModel };
