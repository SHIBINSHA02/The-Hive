import { NextResponse } from "next/server";
import { handleChatLogic } from "@/db/controllers/chatController";

export async function POST(req: Request) {
    try {
        const { prompt, userId, contractId } = await req.json();

        if (!prompt) {
            return NextResponse.json({ error: "No prompt provided" }, { status: 400 });
        }

        // Call the controller
        const answer = await handleChatLogic(prompt, userId, contractId);

        return NextResponse.json({ text: answer });
    } catch (error: any) {
        console.error("Chat Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}