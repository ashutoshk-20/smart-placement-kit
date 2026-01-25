import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
    {
        clerkUserId: {
            type: String,
            required: true,
            unique: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        name: {
            type: String,
        },
        imageUrl: {
            type: String,
        },
        industry: {
            type: String,
        },
        bio: {
            type: String,
        },
        experience: {
            type: Number,
        },
        skills: [
            {
                type: String,
            },
        ],
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Virtual for industryInsight
UserSchema.virtual("industryInsight", {
    ref: "IndustryInsight",
    localField: "industry",
    foreignField: "industry",
    justOne: true,
});

// Virtual for assessments
UserSchema.virtual("assessments", {
    ref: "Assessment",
    localField: "_id",
    foreignField: "userId",
});

// Virtual for resume
UserSchema.virtual("resume", {
    ref: "Resume",
    localField: "_id",
    foreignField: "userId",
    justOne: true,
});

// Virtual for coverLetter
UserSchema.virtual("coverLetters", {
    ref: "CoverLetter",
    localField: "_id",
    foreignField: "userId",
});

export default mongoose.models.User || mongoose.model("User", UserSchema);
