import mongoose from "mongoose";
const NotificationSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    message: { type: String, required: true },
}, { timestamps: true });
const notification = mongoose.model("notification", NotificationSchema);
export default notification;
