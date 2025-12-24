import mongoose, { Schema } from "mongoose";



interface ConversationType {
   participantId : string[];
   lastMessage : string;
   updatedAt: Date;
}




const ConversationSchema = new Schema<ConversationType>({
   participantId  : [{type: String, require: true}],
   lastMessage : {type: String, require: true},
   updatedAt: { type: Date, default: Date.now },
});


const ConversationModel =  mongoose.model<ConversationType>('Conversationt', ConversationSchema);


export default ConversationModel;

