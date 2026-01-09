import mongoose from "mongoose";
const UserSchema = new mongoose.Schema({
    userName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    avatarUrl: { type: String },
    bio: { type: String },
    createdAt: { type: Date, default: Date.now },
    pendingRequestId: { type: String, },
});
const UserModel = mongoose.model("User", UserSchema);
export { UserModel };
