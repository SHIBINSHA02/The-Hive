import { GoogleGenerativeAI } from "@google/generative-ai";
import Contract from "@/db/models/Contract";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

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
        // 1. Generate embedding
        // -----------------------------

        const embedModel = genAI.getGenerativeModel({
            model: "gemini-embedding-001",
        });

        const embedResult = await embedModel.embedContent(prompt);

        const queryVector = embedResult.embedding.values;

        console.log("Embedding length:", queryVector.length);


        // -----------------------------
        // 2. Vector Search in MongoDB
        // -----------------------------

        const docs = await Contract.aggregate([
            {
                $vectorSearch: {
                    index: "hive_index",
                    path: "embeddings",
                    queryVector: queryVector,
                    numCandidates: 100,
                    limit: 3,
                    filter: contractId
                        ? { contractId: contractId }
                        : {},
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

        console.log("Vector search results:", docs.length);


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

        const chatModel = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
        });

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

        const result = await chatModel.generateContent(finalPrompt);

        const response = result.response.text();

        return response;


    } catch (error: any) {

        console.error("Chat Logic Error:", error);

        return "An error occurred while processing your request.";
    }
};
