// db/models/ContractProfile.ts
import mongoose, { Schema, Document, Model } from "mongoose";

export interface IContractProfile extends Document {
  userId: string;
  profileId: string;
  name?: string;
}

const ContractProfileSchema = new Schema<IContractProfile>(
  {
    userId: { type: String, required: true, unique: true },
    profileId: { type: String, required: true, unique: true },
    name: String
  },
  { timestamps: true }
);

const ContractProfile: Model<IContractProfile> =
  mongoose.models.ContractProfile ||
  mongoose.model<IContractProfile>("ContractProfile", ContractProfileSchema);

export default ContractProfile;
