import mongoose from "mongoose";


interface MessageType {
    message: string;
    sender: string;
    roomId: string;
    timeStamp: Date;
}



const MessageSchema = new mongoose.Schema<MessageType>({
      message : { type: String, required: true },
      sender :  { type: String, required: true },
      roomId :  { type: String, required: true },
      timeStamp: { type: Date, default: Date.now },
});


const MessageModel = mongoose.model<MessageType>("message", MessageSchema);


export {MessageModel};