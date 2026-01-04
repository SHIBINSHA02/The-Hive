import mongoose, { Schema, Document, Model } from "mongoose";

export interface IClientProfile extends Document {
  user: mongoose.Types.ObjectId;
  name?: string;
}

const ClientProfileSchema = new Schema<IClientProfile>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },
    name: String
  },
  { timestamps: true }
);

const ClientProfile: Model<IClientProfile> =
  mongoose.models.ClientProfile ||
  mongoose.model<IClientProfile>("ClientProfile", ClientProfileSchema);

export default ClientProfile;
