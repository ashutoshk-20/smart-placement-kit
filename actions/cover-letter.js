"use server";

import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import CoverLetter from "@/models/CoverLetter";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash"
});

export async function getCoverLetters() {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) throw new Error("Unauthorized");

    await dbConnect();

    const user = await User.findOne({ clerkUserId });
    if (!user) throw new Error("User not found");

    const letters = await CoverLetter.find({ userId: user._id }).sort({ createdAt: -1 });
    return JSON.parse(JSON.stringify(letters));
}

export async function getCoverLetter(id) {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) throw new Error("Unauthorized");

    await dbConnect();

    const user = await User.findOne({ clerkUserId });
    if (!user) throw new Error("User not found");

    const letter = await CoverLetter.findOne({ _id: id, userId: user._id });
    if (!letter) throw new Error("Cover letter not found");

    return JSON.parse(JSON.stringify(letter));
}

export async function deleteCoverLetter(id) {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) throw new Error("Unauthorized");

    await dbConnect();

    const user = await User.findOne({ clerkUserId });
    if (!user) throw new Error("User not found");

    await CoverLetter.findOneAndDelete({ _id: id, userId: user._id });
    return { success: true };
}

export async function generateCoverLetter(data) {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) throw new Error("Unauthorized");

    await dbConnect();

    const user = await User.findOne({ clerkUserId });
    if (!user) throw new Error("User not found");

    const prompt = `
        Write a professional cover letter for the role of ${data.jobTitle} at ${data.companyName}.
        
        Job Description:
        ${data.jobDescription || "Not provided (Write a general but compelling cover letter for the role)"}
        
        Candidate Industry: ${user.industry || "Not specified"}
        Candidate Skills: ${user.skills?.join(", ") || "General transferable skills"}
        Candidate Experience Context: ${user.experience?.toString() || "0"} years
        Candidate Bio: ${user.bio || ""}
        
        Format the cover letter professionally with clear paragraphs. Do not include placeholders like "[Your Name]" or "[Address]" unless unavoidable. Write naturally and confidently, highlighting how the candidate's skills align with the role. Format the output in Markdown.
    `;

    try {
        const result = await model.generateContent(prompt);
        const content = result.response.text();

        const coverLetter = await CoverLetter.create({
            userId: user._id,
            companyName: data.companyName,
            jobTitle: data.jobTitle,
            jobDescription: data.jobDescription,
            content,
            status: "completed"
        });

        return JSON.parse(JSON.stringify(coverLetter));
    } catch (error) {
        console.error("Cover Letter Generation Error:", error);
        throw new Error("Failed to generate cover letter.");
    }
}
