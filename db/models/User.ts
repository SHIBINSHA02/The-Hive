// db/models/User.ts
import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    resetToken?: string | null;
    resetTokenExpiry?: number | null;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },

        resetToken: { type: String, default: null },
        resetTokenExpiry: { type: Number, default: null },
    },
    { timestamps: true }
);

const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
export default User;
