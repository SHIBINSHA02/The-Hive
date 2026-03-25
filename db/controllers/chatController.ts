import { getGeminiEmbedding, geminiChat } from "@/lib/gemini";
import Contract from "@/db/models/Contract";

export const handleChatLogic = async (
    prompt: string,
    userId: string,
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
            return "Hello! I'm your Hive Assistant. Ask me anything about this contract's clauses, deadlines, or payments.";
        }


        // -----------------------------
        // 1. Generate embedding using Gemini
        // -----------------------------

        const queryVector = await getGeminiEmbedding(prompt);

        console.log("Embedding length:", queryVector.length);


        // -----------------------------
        // 2. Fetch contract context
        // -----------------------------

        let docs: any[] = [];

        if (contractId) {
            // Direct fetch when we know the contract — avoids cross-contract leakage
            // since Atlas $vectorSearch filter requires the field to be declared in the index
            const contract = await Contract.findOne({ contractId }).select(
                "contractId contractTitle contractContent summary"
            );
            if (contract) docs = [contract];
        } else {
            // Global vector search (no specific contract)
            docs = await Contract.aggregate([
                {
                    $vectorSearch: {
                        index: "hive_index",
                        path: "embeddings",
                        queryVector: queryVector,
                        numCandidates: 100,
                        limit: 3,
                    },
                },
                {
                    $project: {
                        _id: 0,
                        contractId: 1,
                        contractTitle: 1,
                        contractContent: 1,
                        summary: 1,
                    },
                },
            ]);
        }

        console.log("Contract context results:", docs.length);


        // -----------------------------
        // 3. Handle no results safely
        // -----------------------------

        if (!docs || docs.length === 0) {
            return "I couldn't find relevant information in this contract.";
        }


        // -----------------------------
        // 4. Build contract context
        // -----------------------------

        const contextText = docs
            .map(
                (d) => `
Contract Title: ${d.contractTitle}

Summary:
${d.summary}

Content:
${d.contractContent}
`
            )
            .join("\n--------------------\n");


        // -----------------------------
        // 5. Generate answer with Gemini
        // -----------------------------

        const finalPrompt = `
You are Hive AI, a professional legal contract assistant.

You MUST answer ONLY using the contract context provided below.

If the answer is not found, say:
"I don't have that information in this contract."

--------------------
CONTRACT CONTEXT:
${contextText}
--------------------

USER QUESTION:
${prompt}

ANSWER:
`;

        const response = await geminiChat(prompt, contextText);

        return response;


    } catch (error: any) {

        console.error("Chat Logic Error:", error);

        return "An error occurred while processing your request.";
    }
};
