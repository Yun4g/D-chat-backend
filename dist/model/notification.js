import mongoose from "mongoose";
const NotificationSchema = new mongoose.Schema({
    requestId: { type: String, unique: true, required: true },
    message: { type: String, unique: true, required: true }
});
const notification = mongoose.model("notification", NotificationSchema);
export default notification;
