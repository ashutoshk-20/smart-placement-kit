"use server";

import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Assessment from "@/models/Assessment";
import { auth } from "@clerk/nextjs/server";

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash"
})


export async function generateQuiz(jobDescription = null) {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) throw new Error("Unauthorized");

    await dbConnect();

    const user = await User.findOne({ clerkUserId }).select("industry skills");

    if (!user) throw new Error("User not found");

    const prompt = `
    Generate 20 technical and aptitude interview questions for a ${user.industry
        } professional${user.skills?.length ? ` with expertise in ${user.skills.join(", ")}` : ""
        }.
    ${jobDescription ? `The questions should be specifically tailored to this job description: ${jobDescription}` : ""}
    
    Each question should be multiple choice with 4 options.
    
    Return the response in this JSON format only, no additional text:
    {
      "questions": [
        {
          "question": "string",
          "options": ["string", "string", "string", "string"],
          "correctAnswer": "string",
          "explanation": "string"
        }
      ]
    }
  `;


    try {
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();
        const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();
        const quiz = JSON.parse(cleanedText);
        console.log(quiz.questions);

        return quiz.questions;
    } catch (error) {
        console.error("Error generating quiz:", error);
        throw new Error("Failed to generate quiz questions");
    }
}

export async function saveQuizResult(questions, answers, score) {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) throw new Error("Unauthorized");

    await dbConnect();

    const user = await User.findOne({ clerkUserId });

    if (!user) throw new Error("User not found");

    const questionResults = questions.map((q, index) => ({
        question: q.question,
        answer: q.correctAnswer,
        userAnswer: answers[index],
        isCorrect: q.correctAnswer === answers[index],
        explanation: q.explanation,
    }));

    const wrongAnswers = questionResults.filter((q) => !q.isCorrect);
    let improvementTip = null;

    if (wrongAnswers.length > 0) {
        const wrongQuestionsText = wrongAnswers
            .map(
                (q) =>
                    `Question: "${q.question}"\nCorrect Answer: "${q.answer}"\nUser Answer: "${q.userAnswer}"`
            )
            .join("\n\n");

        const improvementPrompt = `
            The user got the following ${user.industry} technical interview questions wrong:

            ${wrongQuestionsText}

            Based on these mistakes, provide a concise, specific improvement tip.
            Focus on the knowledge gaps revealed by these wrong answers.
            Keep the response under 2 sentences and make it encouraging.
            Don't explicitly mention the mistakes, instead focus on what to learn/practice.
            `;

        try {
            const tipResult = await model.generateContent(improvementPrompt);

            improvementTip = tipResult.response.text().trim();
            console.log(improvementTip);
        } catch (error) {
            console.error("Error generating improvement tip:", error);
        }
    }

    try {
        const assessment = await Assessment.create({
            userId: user._id,
            quizScore: score,
            questions: questionResults,
            category: "Technical",
            improvementTip,
        })
        return JSON.parse(JSON.stringify(assessment));

    } catch (error) {
        console.error("Error saving quiz result:", error);
        throw new Error("Failed to save quiz result");
    }
}

export async function getAssessment() {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) throw new Error("Unauthorized");

    await dbConnect();

    const user = await User.findOne({ clerkUserId });

    if (!user) throw new Error("User not found");

    try {
        const assessments = await Assessment.find({
            userId: user._id,
        }).sort({ createdAt: 1 });

        return JSON.parse(JSON.stringify(assessments));
    } catch (error) {
        console.error("Error fetching assessments:", error);
        throw new Error("Failed to fetch assessments");
    }
}