import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const BACKEND_URL = process.env.CUSTOM_MODEL_ENDPOINT?.replace("/generate", "") || "http://api.thehive.plannow.in:8000";

const MAX_INPUT_TOKENS = 6000;
const MAX_NEW_TOKENS = 4000;

function buildSystemInstruction(role: string): string {
  const roleFocus = role === "Client"
    ? "You are advising the CLIENT (buyer). Focus on financial exposure, restrictions, loss of flexibility, termination risk, and IP limitations."
    : "You are advising the CONTRACTOR (supplier). Focus on liability exposure, IP ownership risk, performance obligations, termination risk, and revenue uncertainty.";

  return `You are a Senior Legal Counsel performing an expert contract review.

${roleFocus}

Return STRICT JSON only.

Tasks:
1. executive_summary
2. important_clauses
3. key_highlights
4. uncertainties_and_risks`;
}

function chunkTextApprox(text: string): string[] {
  const charsPerChunk = MAX_INPUT_TOKENS * 4;
  const chunks: string[] = [];
  for (let i = 0; i < text.length; i += charsPerChunk) {
    chunks.push(text.slice(i, i + charsPerChunk));
  }
  return chunks;
}

export async function POST(req: NextRequest) {
  const { text, role } = await req.json();

  if (!text || !role) {
    return NextResponse.json({ error: "Missing text or role" }, { status: 400 });
  }

  const chunks = chunkTextApprox(text);
  const systemInstr = buildSystemInstruction(role);

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const prompt = `<|begin_of_text|><|start_header_id|>system<|end_header_id|>\n\n${systemInstr}<|eot_id|><|start_header_id|>user<|end_header_id|>\n\n${chunk}<|eot_id|><|start_header_id|>assistant<|end_header_id|>\n\n`;

        const payload = {
          prompt,
          max_new_tokens: MAX_NEW_TOKENS,
          temperature: 0.0,
          top_p: 0.9
        };

        try {
          const response = await fetch(`${BACKEND_URL}/generate_stream`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

          if (!response.ok || !response.body) {
            throw new Error(`Backend error: ${response.statusText}`);
          }

          const reader = response.body.getReader();
          controller.enqueue(encoder.encode(`CHUNK_START:${i + 1}:${chunks.length}\n`));

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            controller.enqueue(value);
          }
          
          controller.enqueue(encoder.encode(`\nCHUNK_END\n`));
        } catch (error) {
          console.error(`Error in chunk ${i + 1}:`, error);
          controller.enqueue(encoder.encode(`ERROR:Failed to process section ${i + 1}\n`));
        }
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
