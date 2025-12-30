import mongoose, { Schema } from "mongoose";
const ConversationSchema = new Schema({
    participantId: [{ type: String, require: true }],
    lastMessage: { type: String, require: true },
    updatedAt: { type: Date, default: Date.now },
});
const ConversationModel = mongoose.model('Conversationt', ConversationSchema);
export default ConversationModel;
