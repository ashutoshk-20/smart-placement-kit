"use server";

const pdfParse = require("pdf-parse/lib/pdf-parse.js");

export async function parseFileText(formData) {
    const file = formData.get("file");
    if (!file) throw new Error("No file uploaded");

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (file.type === "application/pdf") {
        try {
            const pdfData = await pdfParse(buffer);
            return pdfData.text;
        } catch (error) {
            console.error("PDF Parse error:", error);
            throw new Error("Failed to parse PDF file.");
        }
    } else if (file.type === "text/plain" || file.name.endsWith(".txt")) {
        return buffer.toString("utf-8");
    } else {
        throw new Error("Unsupported file format. Please upload PDF or TXT.");
    }
}
