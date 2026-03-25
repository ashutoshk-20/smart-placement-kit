"use server";

import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import CodingAssessment from "@/models/CodingAssessment";
import { auth } from "@clerk/nextjs/server";

const API_BASE = "https://coding-platform-1lnw.onrender.com";

// 🔹 Generate questions
export async function generateCodingChallenges(difficulty) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const res = await fetch(`${API_BASE}/questions`, {
    cache: "no-store",
  });

  if (!res.ok) throw new Error("Failed to fetch questions");

  const allQuestions = await res.json();

  let filtered = allQuestions.filter(
    (q) => q.difficulty?.toLowerCase() === difficulty.toLowerCase()
  );

  if (filtered.length === 0) filtered = allQuestions;

  const shuffled = filtered.sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, 3);

  return selected.map((q) => ({
    id: String(q.id),
    title: q.title,
    description: q.description,
    difficulty: q.difficulty,
    starterCode: q.starterCode,
    testCases: q.tests || [],
  }));
}

// 🔹 Run tests
export async function runCodeTest(challenge, code, language) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const res = await fetch(`${API_BASE}/run-tests`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      questionId: Number(challenge.id),
      language,
      code,
    }),
  });

  if (!res.ok) throw new Error("Run test failed");

  const data = await res.json();

  return data.results.map((r) => ({
    passed: r.pass,
    input: r.input,
    expectedOutput: r.expectedOutput,
    actualOutput: r.output,
    error: r.stderr,
  }));
}

// 🔥 SUBMIT (NOW WORKING)
export async function submitCodingAssessment(challenges, userCodes, difficulty) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  let total = 0;
  let passed = 0;

  for (let i = 0; i < challenges.length; i++) {
    const challenge = challenges[i];
    const code = userCodes[i]?.javascript || "";

    const res = await fetch(`${API_BASE}/run-tests`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        questionId: Number(challenge.id),
        language: "javascript",
        code,
      }),
    });

    const data = await res.json();

    const allPassed = data.results.every((r) => r.pass);

    total++;
    if (allPassed) passed++;
  }

  const score = Math.round((passed / total) * 100);

  // OPTIONAL DB SAVE
  try {
    await dbConnect();
    const user = await User.findOne({ clerkUserId: userId });

    if (user) {
      await CodingAssessment.create({
        userId: user._id,
        overallScore: score,
        difficulty,
        challenges,
      });
    }
  } catch (err) {
    console.log("DB save skipped:", err.message);
  }

  return {
    _id: "assessment-id",
    overallScore: score,
    passed: score >= 50,
  };
}

// 🔹 History
export async function getCodingAssessments() {
  const { userId } = await auth();
  if (!userId) return [];

  await dbConnect();
  const user = await User.findOne({ clerkUserId: userId });
  if (!user) return [];

  const data = await CodingAssessment.find({ userId: user._id }).lean();
  return JSON.parse(JSON.stringify(data));
}