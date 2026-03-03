// app/api/contracts/route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { connectDB } from "@/lib/db";
import User from "@/db/models/User";
import Contract from "@/db/models/Contract";
import ClientProfile from "@/db/models/ClientProfile";
import ContractProfile from "@/db/models/ContractProfile";

export async function GET() {
  try {
    await connectDB();

    const { userId: clerkId } = await auth();
    if (!clerkId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await User.findOne({ clerkId });
    if (!user) {
      return NextResponse.json([], { status: 200 });
    }

    const clientProfile = await ClientProfile.findOne({ user: user._id });
    const contractorProfile = await ContractProfile.findOne({ user: user._id });
    const clientProfileId = clientProfile?._id?.toString();
    const contractorProfileId = contractorProfile?._id?.toString();

    // ---------- FIX IS HERE ----------
    const conditions: Record<string, unknown>[] = [];

    // 1. Fetch contracts you own (drafts)
    conditions.push({ ownerId: clerkId }); 

    // 2. Fetch contracts tied to your profiles (if they exist)
    if (clientProfile) conditions.push({ client: clientProfile._id });
    if (contractorProfile) conditions.push({ contractor: contractorProfile._id });
    // ----------------------------------

    const contracts = await Contract.find({ $or: conditions })
      .populate("client")
      .populate("contractor")
      .sort({ createdAt: -1 })
      .lean();

    const formattedContracts = contracts.map((contract: any) => {
      const clientId =
        contract?.client?._id?.toString?.() ??
        contract?.client?.toString?.() ??
        (contract?.client ? String(contract.client) : "");
      const contractorId =
        contract?.contractor?._id?.toString?.() ??
        contract?.contractor?.toString?.() ??
        (contract?.contractor ? String(contract.contractor) : "");

      // If you are the owner, you are viewing your own draft.
      // Otherwise, we check if you are the client or contractor.
      const viewerRole =
        contract.ownerId === clerkId
          ? "owner"
          : clientProfileId && clientId && clientId === clientProfileId
            ? "client"
            : contractorProfileId && contractorId && contractorId === contractorProfileId
              ? "contractor"
              : undefined;

      const clientName: string | undefined = contract?.client?.name;
      const contractorName: string | undefined = contract?.contractor?.name;
      const counterpartyName =
        viewerRole === "client"
          ? contractorName
          : viewerRole === "contractor"
            ? clientName
            : undefined;

      return {
        _id: contract._id.toString(),
        contractId: contract.contractId,
        contractTitle: contract.contractTitle,
        companyName: contract.companyName,
        companyLogoUrl: contract.companyLogoUrl,
        bgImageUrl: contract.bgImageUrl,
        description: contract.description,
        summary: contract.summary,
        startDate: contract.startDate
          ? new Date(contract.startDate).toISOString()
          : new Date().toISOString(),
        deadline: contract.deadline
          ? new Date(contract.deadline).toISOString()
          : new Date().toISOString(),
        progress: contract.progress || 0,
        contractStatus: contract.contractStatus || "pending",
        clauses: contract.clauses || [],
        keypoints: contract.keypoints || [],
        contractContent: contract.contractContent || "",
        clientName,
        contractorName,
        viewerRole, // Will now output "owner", "client", or "contractor"
        counterpartyName,
      };
    });

    return NextResponse.json(formattedContracts);
  } catch (err: unknown) {
    console.error("GET Contracts Error", err);
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { 
        error: "Failed to fetch contracts",
        details: errorMessage
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();

    const { userId: clerkId } = await auth();
    if (!clerkId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await User.findOne({ clerkId });
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    const clientProfile = await ClientProfile.findOne({ user: user._id });
    if (!clientProfile)
      return NextResponse.json(
        { error: "Client profile not found" },
        { status: 404 }
      );

    const body = await req.json();

    const contract = await Contract.create({
      ...body,
      client: clientProfile._id
    });

    return NextResponse.json(contract, { status: 201 });
  } catch (err: unknown) {
    console.error("POST Contract Error", err);
    return NextResponse.json(
      { error: "Failed to create contract" },
      { status: 500 }
    );
  }
}
