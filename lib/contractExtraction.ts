// lib/contractExtraction.ts
"use server";

// Polyfill for browser globals that pdf-parse v2.4.5 depends on
if (typeof global.DOMMatrix === "undefined") {
  (global as any).DOMMatrix = class DOMMatrix {
    a = 1; b = 0; c = 0; d = 1; e = 0; f = 0;
  };
}
if (typeof global.ImageData === "undefined") {
  (global as any).ImageData = class ImageData {
    width: number;
    height: number;
    data: Uint8ClampedArray;
    constructor(width: number, height: number) {
      this.width = width;
      this.height = height;
      this.data = new Uint8ClampedArray(width * height * 4);
    }
  } as any;
}
if (typeof global.Path2D === "undefined") {
  (global as any).Path2D = class Path2D {};
}

const pdf = require("pdf-parse");

/**
 * Extracts text from a PDF Buffer.
 * This runs on the server because pdf-parse is a Node.js library.
 */
export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    const data = await pdf(buffer);
    return data.text;
  } catch (error) {
    console.error("PDF Extraction Error:", error);
    throw new Error("Failed to extract text from PDF");
  }
}

/**
 * Server action to handle file processing.
 */
export async function processContractFile(formData: FormData) {
  const file = formData.get("file") as File;
  if (!file) {
    throw new Error("No file provided");
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  if (file.type === "application/pdf") {
    return await extractTextFromPDF(buffer);
  } else if (file.type === "text/plain") {
    return buffer.toString("utf-8");
  } else {
    throw new Error("Unsupported file type");
  }
}
