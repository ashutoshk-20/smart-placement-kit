import mongoose from "mongoose";

const InterviewSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        roomName: {
            type: String,
            required: true,
        },
        transcript: [
            {
                role: { type: String, enum: ["interviewer", "candidate"] },
                content: { type: String },
                timestamp: { type: Date, default: Date.now },
            },
        ],
        feedback: {
            overallScore: { type: Number },
            tone: { type: String },
            contentFeedback: { type: String },
            improvementTips: [{ type: String }],
        },
        behavioralMetrics: {
            eyeContact: { type: Number },
            posture: { type: Number },
            confidence: { type: Number },
        },
        status: {
            type: String,
            enum: ["completed", "aborted"],
            default: "completed",
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.models.Interview ||
    mongoose.model("Interview", InterviewSchema);
