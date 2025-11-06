import mongoose from "mongoose";





const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGOURL as string, {
            serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
            socketTimeoutMS: 45000, // Close sockets after 45s
        });
        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error("MongoDB connection failed:", error);
        if (process.env.NODE_ENV === 'production') {
            process.exit(1);
        }
    }
}


export { connectDB };