"use server";

import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Interview from "@/models/Interview";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export async function saveMockInterviewResult({ roomName, behavioralMetrics, transcript }) {
    console.log(`Processing interview feedback for room: ${roomName}`);

    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) throw new Error("Unauthorized");

    await dbConnect();
    const user = await User.findOne({ clerkUserId });
    if (!user) throw new Error("User not found");

    if (!transcript || transcript.length === 0) {
        console.warn("No transcript provided for feedback generation");
        throw new Error("Cannot generate feedback for an empty session");
    }

    // Generate feedback using Gemini based on the transcript
    const transcriptText = transcript
        .map((entry) => `${entry.role.toUpperCase()}: ${entry.content}`)
        .join("\n");

    const prompt = `
    Analyze this mock interview transcript. Return ONLY a JSON object with:
    {"overallScore": number, "tone": "short string", "contentFeedback": "short assessment", "improvementTips": ["tip1", "tip2", "tip3"]}
    
    Transcript:
    ${transcriptText}`;

    console.log("Requesting AI analysis from Gemini...");
    try {
        const result = await model.generateContent(prompt);
        console.log("Received AI response");

        const responseText = result.response.text();
        const cleanedText = responseText.replace(/```(?:json)?\n?/g, "").trim();

        let feedback;
        try {
            feedback = JSON.parse(cleanedText);
        } catch (e) {
            console.error("JSON Parse Error. Cleaned text:", cleanedText);
            throw new Error("AI returned invalid JSON");
        }

        console.log("Saving to MongoDB...");
        const interview = await Interview.create({
            userId: user._id,
            roomName,
            transcript: transcript.map(t => ({
                role: t.role,
                content: t.content,
                timestamp: t.timestamp ? new Date(t.timestamp) : new Date()
            })),
            feedback,
            behavioralMetrics: {
                eyeContact: behavioralMetrics?.eyeContact || 0,
                posture: behavioralMetrics?.posture || 0,
                confidence: behavioralMetrics?.confidence || 0,
            },
            status: "completed",
        });

        console.log("Database write successful. ID:", interview._id);
        return JSON.parse(JSON.stringify(interview));
    } catch (error) {
        console.error("Critical error in saveMockInterviewResult:", error);
        throw error;
    }
}

export async function getMockInterviews() {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) throw new Error("Unauthorized");

    await dbConnect();
    const user = await User.findOne({ clerkUserId });
    if (!user) return [];

    try {
        const interviews = await Interview.find({ userId: user._id })
            .sort({ createdAt: -1 });
        return JSON.parse(JSON.stringify(interviews));
    } catch (error) {
        console.error("Error fetching interviews:", error);
        return [];
    }
}
