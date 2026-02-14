// db/index.ts
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;
if (!MONGODB_URI) {
    throw new Error("Please define MONGODB_URI in your environment");
}

export async function connectDB() {
    if (mongoose.connection.readyState === 1) return;
    await mongoose.connect(MONGODB_URI, { dbName: "the_hive" });
    console.log("MongoDB connected");
}
