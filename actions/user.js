"use server";

import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import IndustryInsight from "@/models/IndustryInsight";
import { auth } from "@clerk/nextjs/server";
import { generateeAIInsights } from "./dashboard";

export async function updateUser(data) {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) throw new Error("Unauthorized");

    await dbConnect();

    const user = await User.findOne({ clerkUserId });

    if (!user) throw new Error("User not found");

    if (!data.industry) {
        throw new Error("Industry is required");
    }

    try {
        let industryInsight = await IndustryInsight.findOne({
            industry: data.industry,
        });

        // If industry does not exist, create it with default values
        if (!industryInsight) {
            const insights = await generateeAIInsights(data.industry);

            industryInsight = await IndustryInsight.create({
                industry: data.industry,
                ...insights,
                nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            });
        }

        // Update user
        const updatedUser = await User.findByIdAndUpdate(
            user._id,
            {
                industry: data.industry,
                experience: data.experience,
                bio: data.bio,
                skills: data.skills,
            },
            { new: true }
        );

        return {
            success: true,
            updateUser: JSON.parse(JSON.stringify(updatedUser)),
            industryInsight: JSON.parse(JSON.stringify(industryInsight)),
        };

    } catch (error) {
        console.log("Error updating the user and industry", error.message);
        throw new Error("Failed to update profile");
    }
}

export async function getUserOnboardingStatus() {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) throw new Error("Unauthorized");

    await dbConnect();

    try {
        const user = await User.findOne({ clerkUserId }).select("industry");

        if (!user) throw new Error("User not found");

        return {
            isOnboarded: !!user?.industry,
        }
    } catch (error) {
        console.error("Error checking onboarding status:", error);
        throw new Error("Failed to check onboarding status");
    }
}