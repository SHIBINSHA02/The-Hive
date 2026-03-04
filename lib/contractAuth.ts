// lib/contractAuth.ts - shared auth for contract-scoped routes
import { connectDB } from "@/lib/db";
import User from "@/db/models/User";
import Contract from "@/db/models/Contract";
import ClientProfile from "@/db/models/ClientProfile";
import ContractProfile from "@/db/models/ContractProfile";

export type ContractWithPopulated = Awaited<ReturnType<typeof getContractAndRole>>;

export async function getContractAndRole(contractId: string, clerkId: string) {
  await connectDB();

  const user = await User.findOne({ clerkId });
  if (!user) return null;

  const clientProfile = await ClientProfile.findOne({ user: user._id });
  const contractorProfile = await ContractProfile.findOne({ user: user._id });

  // 1. Add ownerId to the search conditions
  const conditions: Record<string, unknown>[] = [{ ownerId: clerkId }];
  
  if (clientProfile) conditions.push({ client: clientProfile._id });
  if (contractorProfile) conditions.push({ contractor: contractorProfile._id });

  const filter = { _id: contractId, $or: conditions };

  // 2. Update type to handle nulls from dummy IDs and the new ownerId
  type ContractLean = {
    ownerId?: string;
    client?: { _id: { toString: () => string } } | null;
    contractor?: { _id: { toString: () => string } } | null;
  };

  const contract = await (
    Contract as unknown as {
      findOne: (q: object) => {
        populate: (p: string) => {
          populate: (p: string) => {
            lean: () => Promise<ContractLean | null>;
          };
        };
      };
    }
  ).findOne(filter).populate("client").populate("contractor").lean();

  if (!contract) return null;

  // 3. Safely check roles using optional chaining (?.)
  const isClient =
    clientProfile &&
    contract.client &&
    contract.client._id?.toString() === clientProfile._id.toString();

  const isContractor =
    contractorProfile &&
    contract.contractor &&
    contract.contractor._id?.toString() === contractorProfile._id.toString();

  const isOwner = contract.ownerId === clerkId;

  // 4. Assign the correct role and sender ID
  let role: "client" | "contractor" | "owner";
  let senderProfileId = "";

  if (isClient) {
    role = "client";
    senderProfileId = contract.client?._id.toString() || "";
  } else if (isContractor) {
    role = "contractor";
    senderProfileId = contract.contractor?._id.toString() || "";
  } else if (isOwner) {
    role = "owner";
    senderProfileId = clerkId; // Fallback to clerkId for drafts
  } else {
    return null;
  }

  return {
    contract,
    role,
    senderProfileId,
    clientProfileId: contract.client?._id?.toString() || "",
    contractorProfileId: contract.contractor?._id?.toString() || "",
  };
}