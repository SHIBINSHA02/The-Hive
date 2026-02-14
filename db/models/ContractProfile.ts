// db/models/ContractProfile.ts
import mongoose, { Schema, Document, Model } from "mongoose";

export interface IContractProfile extends Document {
  user: mongoose.Types.ObjectId;
  name?: string;
}

const ContractProfileSchema = new Schema<IContractProfile>(
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

const ContractProfile: Model<IContractProfile> =
  mongoose.models.ContractProfile ||
  mongoose.model<IContractProfile>("ContractProfile", ContractProfileSchema);

export default ContractProfile;
