import mongoose from "mongoose";

const AssessmentSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        quizScore: {
            type: Number,
            required: true,
        },
        questions: [
            {
                type: mongoose.Schema.Types.Mixed,
            },
        ],
        category: {
            type: String,
            required: true,
        },
        improvementTip: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.models.Assessment ||
    mongoose.model("Assessment", AssessmentSchema);
