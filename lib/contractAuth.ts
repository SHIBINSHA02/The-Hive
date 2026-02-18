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

  const conditions: Record<string, unknown>[] = [];
  if (clientProfile) conditions.push({ client: clientProfile._id });
  if (contractorProfile) conditions.push({ contractor: contractorProfile._id });
  if (!conditions.length) return null;

  const filter = { _id: contractId, $or: conditions };
  type ContractLean = { client: { _id: { toString: () => string } }; contractor: { _id: { toString: () => string } } };
  const contract = await (
    Contract as { findOne: (q: object) => { populate: (p: string) => { populate: (p: string) => { lean: () => Promise<ContractLean | null> } } } }
  ).findOne(filter).populate("client").populate("contractor").lean();

  if (!contract) return null;

  const isClient =
    clientProfile &&
    contract.client._id?.toString() === clientProfile._id.toString();
  const role = isClient ? ("client" as const) : ("contractor" as const);
  const senderProfileId = isClient
    ? contract.client._id.toString()
    : contract.contractor._id.toString();

  return {
    contract,
    role,
    senderProfileId,
    clientProfileId: contract.client._id.toString(),
    contractorProfileId: contract.contractor._id.toString(),
  };
}
