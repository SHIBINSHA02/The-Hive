// db/models/User.ts
// models/User.ts
// models/User.ts
import { Schema, model, models, Document } from "mongoose";

export interface IUser extends Document {
    name?: string;
    email: string;
    password: string;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
    {
        name: { type: String },
        email: { type: String, required: true, unique: true },
        password: {
            type: String,
            required: true,
            select: false, // don't return password by default
        },
    },
    { timestamps: true }
);

const User = models.User || model<IUser>("User", UserSchema);

export default User;
