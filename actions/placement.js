"use server";

import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import PlacementProcess from "@/models/PlacementProcess";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export async function startPlacementProcess({ role, jobDescription, salary, resumeText }) {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) throw new Error("Unauthorized");

    await dbConnect();
    const user = await User.findOne({ clerkUserId });
    if (!user) throw new Error("User not found");

    const process = await PlacementProcess.create({
        userId: user._id,
        role,
        jobDescription,
        salary,
        resumeText,
        currentStep: 1,
        status: "in_progress"
    });

    return JSON.parse(JSON.stringify(process));
}

export async function evaluateResumeShortlist(processId) {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) throw new Error("Unauthorized");
    
    await dbConnect();
    const process = await PlacementProcess.findById(processId);
    if (!process) throw new Error("Process not found");

    const prompt = `
    You are an expert HR recruiter. Evaluate the following resume against the job description strictly.
    Role: ${process.role}
    Job Description: ${process.jobDescription}
    
    Resume content: 
    ${process.resumeText}
    
    Evaluate if the candidate is suitable for the role. Give a score out of 100.
    If the score is >= 50, they pass. Otherwise, they fail.
    
    Return exactly ONLY a JSON format:
    {
      "passed": boolean,
      "score": number,
      "feedback": "string (Explain exactly why they passed or conditionally failed the check in 2-4 sentences)"
    }
    `;

    try {
        const result = await model.generateContent(prompt);
        const cleanedText = result.response.text().replace(/```(?:json)?\n?/g, "").trim();
        const evalResult = JSON.parse(cleanedText);

        process.resumeShortlistResult = evalResult;
        
        if (!evalResult.passed) {
            process.status = "failed";
        } else {
            process.currentStep = 2; // Move to aptitude
        }
        await process.save();
        return JSON.parse(JSON.stringify(process));
    } catch (error) {
        console.error("Resume Shortlist Error:", error);
        throw new Error("Failed to evaluate resume");
    }
}

export async function saveAptitudeResult(processId, score, maxScore) {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) throw new Error("Unauthorized");
    
    await dbConnect();
    const process = await PlacementProcess.findById(processId);
    
    const passed = (score / maxScore) >= 0.5; // pass threshold 50%
    process.aptitudeResult = {
        passed,
        score: Math.round((score / maxScore) * 100),
        feedback: passed ? "Good performance in aptitude." : "Failed to meet minimum criteria in aptitude round."
    };
    
    if (!passed) {
        process.status = "failed";
    } else {
        process.currentStep = 3; // Move to coding
    }
    
    await process.save();
    return JSON.parse(JSON.stringify(process));
}

export async function advanceToTechnical(processId, assessmentId, overallScore) {
    // This is called after Coding Assessment returns completion
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) throw new Error("Unauthorized");
    
    await dbConnect();
    const process = await PlacementProcess.findById(processId);
    
    const passed = overallScore >= 50;
    process.codingResult = {
        passed,
        score: overallScore,
        feedback: passed ? "Good problem-solving skills." : "Needs improvement in data structures & algorithms.",
        codingAssessmentId: assessmentId
    };
    
    if (!passed) {
        process.status = "failed";
    } else {
        process.currentStep = 4; // Move to Technical Interview
    }
    await process.save();
    return JSON.parse(JSON.stringify(process));
}

export async function evaluateTechnicalInterviewFeedback(processId, feedbackObj) {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) throw new Error("Unauthorized");
    
    await dbConnect();
    const process = await PlacementProcess.findById(processId);
    
    const score = feedbackObj.overallScore;
    const passed = score >= 50;

    process.technicalResult = {
        passed,
        score,
        feedback: feedbackObj.contentFeedback || "Completed Technical Interview"
    };

    if (!passed) {
        process.status = "failed";
    } else {
        process.currentStep = 5; // Move to HR
    }
    await process.save();
    return JSON.parse(JSON.stringify(process));
}

export async function evaluateHRInterviewFeedback(processId, feedbackObj) {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) throw new Error("Unauthorized");
    
    await dbConnect();
    const process = await PlacementProcess.findById(processId);
    
    const score = feedbackObj.overallScore;
    const passed = score >= 50;

    process.hrResult = {
        passed,
        score,
        feedback: feedbackObj.contentFeedback || "Completed HR Interview"
    };

    if (!passed) {
        process.status = "failed";
    } else {
        process.status = "completed"; // Placed!
    }
    await process.save();
    return JSON.parse(JSON.stringify(process));
}

export async function getPlacementProcess(processId) {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) throw new Error("Unauthorized");
    
    await dbConnect();
    const user = await User.findOne({ clerkUserId });
    const process = await PlacementProcess.findOne({ _id: processId, userId: user._id });
    if (!process) return null;
    return JSON.parse(JSON.stringify(process));
}
export async function getUserPlacementProcesses() {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) throw new Error("Unauthorized");
    
    await dbConnect();
    const user = await User.findOne({ clerkUserId });
    if (!user) return [];
    
    const processes = await PlacementProcess.find({ userId: user._id }).sort({ createdAt: -1 });
    return JSON.parse(JSON.stringify(processes));
}