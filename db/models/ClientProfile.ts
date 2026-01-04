// db/models/ClientProfile.ts
// db/models/ClientProfile.ts
import mongoose, { Schema, Document, Model } from "mongoose";

export interface IClientProfile extends Document {
  userId: string;
  profileId: string;
  name?: string;
}

const ClientProfileSchema = new Schema<IClientProfile>(
  {
    userId: { type: String, required: true, unique: true },
    profileId: { type: String, required: true, unique: true },
    name: String
  },
  { timestamps: true }
);

const ClientProfile: Model<IClientProfile> =
  mongoose.models.ClientProfile ||
  mongoose.model<IClientProfile>("ClientProfile", ClientProfileSchema);

export default ClientProfile;
