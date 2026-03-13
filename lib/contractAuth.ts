import { connectDB } from "@/lib/db";
import mongoose from "mongoose";
import { currentUser } from "@clerk/nextjs/server";
import User from "@/db/models/User";
import Contract from "@/db/models/Contract";
import ClientProfile from "@/db/models/ClientProfile";
import ContractProfile from "@/db/models/ContractProfile";

export type ContractWithPopulated = Awaited<ReturnType<typeof getContractAndRole>>;

export async function getContractAndRole(contractId: string, clerkId: string) {
  await connectDB();

  const user = await User.findOne({ clerkId });
  
  // Collect all potential emails for this user
  let userEmails: string[] = user?.email ? [user.email.toLowerCase().trim()] : [];
  
  const clerkUser = await currentUser();
  if (clerkUser) {
    const clerkEmails = clerkUser.emailAddresses.map(e => e.emailAddress.toLowerCase().trim());
    // Use a Set to unique-ify and spread back to array
    userEmails = Array.from(new Set([...userEmails, ...clerkEmails]));
  }

  const userEmail = userEmails[0] || null; // For backward compatibility in logs if needed

  const clientProfile = user ? await ClientProfile.findOne({ user: user._id }) : null;
  const contractorProfile = user ? await ContractProfile.findOne({ user: user._id }) : null;

  // 1. Add ownerId and Party B fields to the search conditions
  const conditions: Record<string, unknown>[] = [
    { ownerId: clerkId },
    { partyB_ClerkId: clerkId }
  ];
  
  if (userEmails.length > 0) {
    conditions.push({ partyB_Email: { $in: userEmails } });
  }

  if (clientProfile) conditions.push({ client: clientProfile._id });
  if (contractorProfile) conditions.push({ contractor: contractorProfile._id });

  // Use $or to check against _id (if valid ObjectId) or the string contractId
  const idCondition = mongoose.Types.ObjectId.isValid(contractId) 
    ? { $or: [{ _id: contractId }, { contractId: contractId }] }
    : { contractId: contractId };

  const filter = { ...idCondition, $or: conditions };
  // FIX: Use $and to prevent $or collision
  const finalFilter = { $and: [idCondition, { $or: conditions }] };

  console.log("DEBUG: getContractAndRole filters:", { 
    contractId, 
    clerkId, 
    userEmails, 
    finalFilter: JSON.stringify(finalFilter) 
  });

  // 2. Update type to handle nulls from dummy IDs and the new ownerId
  type ContractLean = {
    _id: mongoose.Types.ObjectId;
    ownerId?: string;
    partyB_Email?: string;
    partyB_ClerkId?: string;
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
  ).findOne(finalFilter).populate("client").populate("contractor").lean();

  console.log("DEBUG: contract found:", !!contract);

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
  
  const isPartyB = 
    (contract.partyB_ClerkId && contract.partyB_ClerkId === clerkId) || 
    (contract.partyB_Email && userEmails.includes(contract.partyB_Email.toLowerCase().trim()));

  console.log("DEBUG: role calculation:", { isClient, isContractor, isOwner, isPartyB });

  // 4. Assign the correct role and sender ID
  let role: "client" | "contractor" | "owner" | "partyB";
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
  } else if (isPartyB) {
    role = "partyB";
    senderProfileId = clerkId; // Fallback for invited guest
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