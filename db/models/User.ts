import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  clerkId: string;
  email: string;
  name: string;
  role: string;
  lastSeen: Date;
}

const UserSchema = new Schema<IUser>({
  clerkId: { type: String, unique: true },
  email: String,
  name: String,
  role: { type: String, default: "user" },
  lastSeen: Date,
},{ timestamps:true });

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
