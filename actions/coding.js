"use server";

import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import CodingAssessment from "@/models/CodingAssessment";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash"
});

export async function generateCodingChallenges(difficulty) {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) throw new Error("Unauthorized");

    await dbConnect();

    const prompt = `
    Generate 2 Data Structures and Algorithms (DSA) coding challenges for a software engineering candidate.
    The difficulty level MUST be exclusively: ${difficulty}.
    The questions should test problem-solving and algorithmic thinking like LeetCode problems.

    Return the response in this exact JSON format only, no additional text:
    {
      "challenges": [
        {
          "id": "1",
          "title": "string (short title of the challenge)",
          "description": "string (detailed problem description in markdown, clear and understandable)",
          "difficulty": "${difficulty}",
          "inputFormat": "string (description of input)",
          "outputFormat": "string (description of output)",
          "constraints": ["string", "string"],
          "hints": ["string", "string"],
          "starterCode": {
            "javascript": "string (function signature)",
            "python": "string (function signature)",
            "java": "string (class and function signature)",
            "cpp": "string (class and function signature)"
          },
          "testCases": [
            {
              "input": "string",
              "expectedOutput": "string",
              "explanation": "string (optional explanation)"
            },
            {
              "input": "string",
              "expectedOutput": "string",
              "explanation": "string"
            },
            {
              "input": "string",
              "expectedOutput": "string"
            }
          ]
        },
        // generate exactly 2 objects like this
      ]
    }
    `;

    try {
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        const cleanedText = responseText.replace(/```(?:json)?\n?/g, "").trim();
        const data = JSON.parse(cleanedText);
        
        return data.challenges;
    } catch (error) {
        console.error("Error generating coding challenges:", error);
        throw new Error("Failed to generate coding challenges");
    }
}

export async function runCodeTest(challenge, code, language) {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) throw new Error("Unauthorized");

    if (!code || code.trim() === "") return { error: "No code provided." };

    const prompt = `
    You are an expert code evaluator. 
    A user has written the following ${language} code for this challenge:
    Title: ${challenge.title}
    Description: ${challenge.description}
    Code:
    \`\`\`${language}
    ${code}
    \`\`\`

    Evaluate the code against the following test cases:
    ${JSON.stringify(challenge.testCases)}

    Return the evaluation results in this exact JSON format only:
    {
      "results": [
        {
          "passed": boolean,
          "input": "string",
          "expectedOutput": "string",
          "actualOutput": "string (what the code actually returned or threw)",
          "error": "string or null (runtime/syntax error if any)"
        }
      ]
    }
    `;

    try {
        const result = await model.generateContent(prompt);
        const cleanedText = result.response.text().replace(/```(?:json)?\n?/g, "").trim();
        const data = JSON.parse(cleanedText);
        return data.results;
    } catch (error) {
        console.error("Test execution failed:", error);
        throw new Error("Failed to run tests");
    }
}

export async function submitCodingAssessment(challenges, userCodes, difficulty) {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) throw new Error("Unauthorized");

    await dbConnect();
    const user = await User.findOne({ clerkUserId });
    if (!user) throw new Error("User not found");

    const prompt = `
    You are an expert technical interviewer evaluating a candidate's DSA assessment.
    The assessment consists of ${challenges.length} challenges of ${difficulty} difficulty.

    Candidate's submissions:
    ${challenges.map((chal, i) => `
    Challenge ${i + 1}: ${chal.title}
    Code:
    ${JSON.stringify(userCodes[i])}
    `).join("\\n")}

    Evaluate the cleanliness, time complexity, and space complexity of the code. Did it solve the problem?
    Return a detailed feedback in this exact JSON format only:
    {
      "overallScore": number (out of 100),
      "feedback": "string (A 2-3 sentence overview of their performance)",
      "improvementTips": ["string", "string"],
      "evaluations": [
        {
           "title": "string",
           "passed": boolean,
           "timeComplexity": "string",
           "spaceComplexity": "string",
           "comments": "string"
        }
      ]
    }
    `;

    try {
        const result = await model.generateContent(prompt);
        const cleanedText = result.response.text().replace(/```(?:json)?\n?/g, "").trim();
        const feedbackData = JSON.parse(cleanedText);

        const assessment = await CodingAssessment.create({
            userId: user._id,
            difficulty,
            challenges: challenges.map((chal, i) => ({
                ...chal,
                userSubmission: userCodes[i],
                evaluation: feedbackData.evaluations[i]
            })),
            overallScore: feedbackData.overallScore,
            feedback: feedbackData.feedback,
            improvementTips: feedbackData.improvementTips
        });

        return JSON.parse(JSON.stringify(assessment));
    } catch (error) {
        console.error("Submission failed:", error);
        throw new Error("Failed to submit assessment");
    }
}

export async function getCodingAssessments() {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) throw new Error("Unauthorized");

    await dbConnect();
    const user = await User.findOne({ clerkUserId });
    if (!user) return [];

    try {
        const assessments = await CodingAssessment.find({ userId: user._id })
            .sort({ createdAt: -1 });
        return JSON.parse(JSON.stringify(assessments));
    } catch (error) {
        console.error("Error fetching coding assessments:", error);
        return [];
    }
}
