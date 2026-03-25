import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import User from "@/db/models/User";
import ClientProfile from "@/db/models/ClientProfile";
import ContractProfile from "@/db/models/ContractProfile";
import { handleChatLogic } from "@/db/controllers/chatController";

export async function POST(req: Request) {
    try {
        await connectDB();
        
        const { userId: clerkId } = await auth();
        if (!clerkId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        
        const clerkUser = await currentUser();
        
        const { prompt, contractId } = await req.json();

        if (!prompt) {
            return NextResponse.json({ error: "No prompt provided" }, { status: 400 });
        }

        const user = await User.findOne({ clerkId });
        const clientProfile = user ? await ClientProfile.findOne({ user: user._id }) : null;
        const contractorProfile = user ? await ContractProfile.findOne({ user: user._id }) : null;
        
        const userEmails: string[] = user?.email ? [user.email.toLowerCase().trim()] : [];
        if (clerkUser) {
            const clerkEmails = clerkUser.emailAddresses.map(e => e.emailAddress.toLowerCase().trim());
            const allEmails = Array.from(new Set([...userEmails, ...clerkEmails]));
            userEmails.splice(0, userEmails.length, ...allEmails);
        }
        
        // Build the precise access conditions
        const accessConditions: Record<string, unknown>[] = [
           { ownerId: clerkId },
           { partyB_ClerkId: clerkId }
        ];
        
        if (userEmails.length > 0) {
           accessConditions.push({ partyB_Email: { $in: userEmails } });
        }
        
        if (clientProfile) accessConditions.push({ client: clientProfile._id });
        if (contractorProfile) accessConditions.push({ contractor: contractorProfile._id });

        const answer = await handleChatLogic(prompt, accessConditions, contractId);

        return NextResponse.json({ text: answer });
    } catch (error: any) {
        console.error("Chat Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}