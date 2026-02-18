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
      // User doesn't exist - return empty array instead of error
      return NextResponse.json([], { status: 200 });
    }

    const clientProfile = await ClientProfile.findOne({ user: user._id });
    const contractorProfile = await ContractProfile.findOne({ user: user._id });
    const clientProfileId = clientProfile?._id?.toString();
    const contractorProfileId = contractorProfile?._id?.toString();

    const conditions: Record<string, unknown>[] = [];

    if (clientProfile) conditions.push({ client: clientProfile._id });
    if (contractorProfile) conditions.push({ contractor: contractorProfile._id });

    // If user has no profiles, return empty array (they need to run seed script)
    if (!conditions.length) {
      return NextResponse.json([], { status: 200 });
    }

    const contracts = await Contract.find({ $or: conditions })
      .populate("client")
      .populate("contractor")
      .sort({ createdAt: -1 })
      .lean();

    // Transform contracts to match the frontend Contract interface
    const formattedContracts = contracts.map((contract: any) => {
      const clientId =
        contract?.client?._id?.toString?.() ??
        contract?.client?.toString?.() ??
        (contract?.client ? String(contract.client) : "");
      const contractorId =
        contract?.contractor?._id?.toString?.() ??
        contract?.contractor?.toString?.() ??
        (contract?.contractor ? String(contract.contractor) : "");

      const viewerRole: "client" | "contractor" | undefined =
        clientProfileId && clientId && clientId === clientProfileId
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
        viewerRole,
        counterpartyName,
      };
    });

    return NextResponse.json(formattedContracts);
  } catch (err: unknown) {
    console.error("GET Contracts Error", err);
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("Error details:", errorMessage);
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
