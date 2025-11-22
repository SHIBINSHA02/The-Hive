// services/gemini.ts

'use server';

import { GoogleGenAI } from "@google/genai";

export const generateHiveMindResponse = async (prompt: string): Promise<string> => {
    // Ensure API key is available
    if (!process.env.API_KEY) {
        console.error("Gemini API Key is missing.");
        return "Gemini API Key is missing. Please configure the environment.";
    }

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction: "You are 'Hive Mind', an intelligent AI project assistant for a collaboration platform called 'The Hive'. You are helpful, concise, and professional. You help users generate project descriptions, summarize tasks, and brainstorm ideas. Use a warm, productive tone.",
            }
        });

        return response.text || "I couldn't generate a response at this time.";
    } catch (error) {
        console.error("Gemini API Error:", error);
        return "The Hive Mind is currently unreachable. Please try again later.";
    }
};
