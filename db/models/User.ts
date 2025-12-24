import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema({
  clerkId: { type: String, unique: true },
  email: String,
  name: String,
  role: { type: String, default: "user" },
  lastSeen: Date
},{ timestamps: true });

export default mongoose.models.User || mongoose.model("User", UserSchema);
