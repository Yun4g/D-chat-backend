import mongoose, { Schema } from "mongoose";



interface FriendsType {
  senderId : string | number;
  userId : string | number;
  status: "pending" | "accepted" | "rejected",
  createdAt: Date
}




const FriendRequestSchema = new Schema<FriendsType>({
   senderId : {type: String, required: true},
   userId : {type: String, required: true},
   status:  {type: String, required: true},
   createdAt: { type: Date, default: Date.now },
});


const FriendRequestModel =  mongoose.model<FriendsType>('FreindRequest', FriendRequestSchema);


export default FriendRequestModel;

