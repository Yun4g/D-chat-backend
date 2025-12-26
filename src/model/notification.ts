import mongoose from "mongoose";


interface NotificationType {
    requestId: string,
    message: string
}


const NotificationSchema = new mongoose.Schema<NotificationType>({
    requestId: {type: String, unique: true, required:true},
    message: {type: String, unique: true, required:true}
})


const notification = mongoose.model<NotificationType>("notification", NotificationSchema);

export default notification;

