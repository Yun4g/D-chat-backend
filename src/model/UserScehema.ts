import mongoose from "mongoose";



interface IUser {
    userName: string;
    email: string;
    password: string;
    avatarUrl?: string;
    createdAt?: Date;
    bio?: string;
    pendingRequestId?: string | number;

}


const UserSchema = new mongoose.Schema<IUser>({
    userName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    avatarUrl: { type: String },
    bio:  { type: String },
    createdAt: { type: Date, default: Date.now },
    pendingRequestId: { type: String,  },
});


const UserModel = mongoose.model<IUser>("User", UserSchema);

export { UserModel };