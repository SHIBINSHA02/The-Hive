import { getGeminiEmbedding, geminiChat } from "@/lib/gemini";
import Contract from "@/db/models/Contract";
import Financial from "@/db/models/Finance";

export const handleChatLogic = async (
    prompt: string,
    accessConditions: Record<string, unknown>[],
    contractId?: string
): Promise<string> => {

    try {

        // -----------------------------
        // 0. Basic greeting handling
        // -----------------------------

        const normalized = prompt.trim().toLowerCase();

        const greetings = [
            "hi",
            "hello",
            "hey",
            "hlo",
            "good morning",
            "good evening"
        ];

        if (greetings.includes(normalized)) {
            return "Hello! I'm your Hive Assistant. Ask me anything about your contracts, deadlines, or payments.";
        }

        // -----------------------------
        // 1. Fetch contract context
        // -----------------------------

        let docs: any[] = [];

        if (contractId) {
            // Direct fetch when we know the contract — avoids cross-contract leakage
            const contract = await Contract.findOne({ 
                contractId, 
                $or: accessConditions 
            }).select("_id contractId contractTitle contractContent summary contractStatus");
            
            if (contract) docs = [contract];
        } else {
            // Global search: Fetch all user contracts but exclude huge contractContent to fit context window
            docs = await Contract.find({
                $or: accessConditions
            }).select("_id contractId contractTitle summary contractStatus keypoints");
        }

        console.log("Contract context results:", docs.length);


        // -----------------------------
        // 2. Handle no results safely
        // -----------------------------

        if (!docs || docs.length === 0) {
            return "I couldn't find any relevant contracts for your account.";
        }


        // -----------------------------
        // 3. Build contract context with Finance Data
        // -----------------------------

        const contextPromises = docs.map(async (d) => {
            const finance = await Financial.findOne({ contract: d._id });
            
            let financeText = "No financial data available.";
            if (finance) {
                const ms = finance.milestones?.length 
                    ? finance.milestones.map((m: any) => `- ${m.title || 'Milestone'}: ${m.amount} (Paid: ${m.isPaid})`).join("\n  ")
                    : "None";
                
                financeText = `
Total Amount: ${finance.totalAmount} ${finance.currency || "INR"}
Paid Amount: ${finance.paidAmount} ${finance.currency || "INR"}
Due Amount: ${finance.dueAmount} ${finance.currency || "INR"}
Payment Status: ${finance.paymentStatus}
Milestones:
  ${ms}
`.trim();
            }

            return `
Contract Title: ${d.contractTitle}
Status: ${d.contractStatus}
Summary: ${d.summary || "No summary available"}
${d.contractContent ? `\nContent:\n${d.contractContent}` : `\nKeypoints:\n${d.keypoints?.join(", ") || "None"}`}

Financial Details:
${financeText}
`;
        });

        const contextTextArray = await Promise.all(contextPromises);
        const contextText = contextTextArray.join("\n--------------------\n");


        // -----------------------------
        // 4. Generate answer with Gemini
        // -----------------------------

        // We explicitly tell Gemini it now has access to ALL contracts if we are in global mode
        const finalPrompt = `
You are Hive AI, a professional legal and financial contract assistant.

You MUST answer ONLY using the contract context provided below.
The context contains one or multiple contracts with their financial details.
Answer the user's question clearly and concisely. 

If the user asks for a total across all contracts, calculate it based on the data below.
If the answer is not found, say: "I don't have that information in your contracts."

--------------------
CONTRACT CONTEXT:
${contextText}
--------------------

USER QUESTION:
${prompt}

ANSWER:
`;

        // We bypass the older `geminiChat` memory limitations and pass the full explicit prompt
        const response = await geminiChat(finalPrompt, "");

        return response;


    } catch (error: any) {

        console.error("Chat Logic Error:", error);

        return "An error occurred while processing your request.";
    }
};
