import mongoose from "mongoose";

const PlacementProcessSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        role: { type: String, required: true },
        jobDescription: { type: String, required: true },
        salary: { type: String }, // To determine coding difficulty if needed
        resumeUrl: { type: String }, // optional if using text or file
        resumeText: { type: String }, // extracted text from resume
        
        currentStep: { type: Number, default: 1 },
        status: {
            type: String,
            enum: ["in_progress", "failed", "completed"],
            default: "in_progress",
        },
        
        // Round 1
        resumeShortlistResult: {
            passed: { type: Boolean },
            feedback: { type: String },
            score: { type: Number }
        },
        
        // Round 2
        aptitudeResult: {
            passed: { type: Boolean },
            score: { type: Number },
            feedback: { type: String },
            assessmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Assessment" }
        },
        
        // Round 3
        codingResult: {
            passed: { type: Boolean },
            score: { type: Number },
            feedback: { type: String },
            codingAssessmentId: { type: mongoose.Schema.Types.ObjectId, ref: "CodingAssessment" }
        },
        
        // Round 4
        technicalResult: {
            passed: { type: Boolean },
            score: { type: Number },
            feedback: { type: String },
            interviewId: { type: mongoose.Schema.Types.ObjectId, ref: "Interview" }
        },
        
        // Round 5
        hrResult: {
            passed: { type: Boolean },
            score: { type: Number },
            feedback: { type: String },
            interviewId: { type: mongoose.Schema.Types.ObjectId, ref: "Interview" }
        }
    },
    { timestamps: true }
);

export default mongoose.models.PlacementProcess || mongoose.model("PlacementProcess", PlacementProcessSchema);
