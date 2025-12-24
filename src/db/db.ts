import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";





const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI as string, {
            serverSelectionTimeoutMS: 5000, 
            socketTimeoutMS: 45000,
        });
        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error("MongoDB connection failed:", error);
    }
}



export { connectDB };