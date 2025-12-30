import mongoose, { Schema, Document, Model } from "mongoose";

// 1. Define the interface representing a document in MongoDB
export interface IUser extends Document {
  clerkId: string;
  email?: string;
  name?: string;
  lastSeen?: Date;
}

// 2. Create the Schema corresponding to the document interface
const UserSchema = new Schema<IUser>({
  clerkId: { type: String, required: true, unique: true },
  email: String,
  name: String,
  lastSeen: Date
});

// 3. Export the model with the IUser type
// This tells TypeScript that "User" follows the IUser interface
const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;