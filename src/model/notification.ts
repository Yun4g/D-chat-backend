import mongoose from "mongoose";


interface NotificationType {
    userId: string,
    message: string
    timestamps: Date
}


const NotificationSchema = new mongoose.Schema<NotificationType>( {
    userId: { type: String, required: true },
    message: { type: String, required: true },
  },
  { timestamps: true }
)


const notification = mongoose.model<NotificationType>("notification", NotificationSchema);

export default notification;

