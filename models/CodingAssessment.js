import mongoose from "mongoose";

const CodingAssessmentSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        difficulty: {
            type: String,
            required: true,
        },
        challenges: [
            {
                type: mongoose.Schema.Types.Mixed,
            },
        ],
        overallScore: {
            type: Number,
            required: true,
        },
        feedback: {
            type: String,
        },
        improvementTips: [
            {
                type: String,
            }
        ],
    },
    {
        timestamps: true,
    }
);

export default mongoose.models.CodingAssessment ||
    mongoose.model("CodingAssessment", CodingAssessmentSchema);
