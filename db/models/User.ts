import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  clerkId: { type: String, required: true, unique: true },
  email: String,
  name: String,
  lastSeen: Date
});

export default mongoose.models.User || mongoose.model("User", UserSchema);
