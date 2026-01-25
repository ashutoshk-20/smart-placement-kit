"use server";

import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Resume from "@/models/Resume";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash"
})


export async function saveResume(content) {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) throw new Error("Unauthorized");

  await dbConnect();

  const user = await User.findOne({ clerkUserId });

  if (!user) throw new Error("User not found");

  try {
    await Resume.findOneAndUpdate(
      { userId: user._id },
      { content },
      { upsert: true, new: true }
    );

    revalidatePath("/resume");
  } catch (error) {
    console.error("Error saving resume:", error);
    throw new Error("Failed to save resume");
  }
}

export async function getResume() {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) throw new Error("Unauthorized");

  await dbConnect();

  const user = await User.findOne({ clerkUserId });

  if (!user) throw new Error("User not found");

  const resume = await Resume.findOne({ userId: user._id });
  return resume ? JSON.parse(JSON.stringify(resume)) : null;
}

export async function improveWithAI({ current, type }) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) throw new Error("Unauthorized");

  await dbConnect();

  const user = await User.findOne({ clerkUserId });

  if (!user) throw new Error("User not found");

  const prompt = `
    As an expert resume writer, improve the following ${type} description for a ${user.industry} professional.
    Make it more impactful, quantifiable, and aligned with industry standards.
    Current content: "${current}"

    Requirements:
    1. Use action verbs
    2. Include metrics and results where possible
    3. Highlight relevant technical skills
    4. Keep it concise but detailed
    5. Focus on achievements over responsibilities
    6. Use industry-specific keywords
    
    Format the response as a single paragraph without any additional text or explanations.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const improvedContent = response.text().trim();
    return improvedContent;
  } catch (error) {
    console.error("Error improving content:", error);
    throw new Error("Failed to improve content");
  }
}