import mongoose from "mongoose";

const CoverLetterSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        content: {
            type: String,
            required: true,
        },
        jobDescription: {
            type: String,
        },
        companyName: {
            type: String,
            required: true,
        },
        jobTitle: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            default: "draft",
            enum: ["draft", "completed"],
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.models.CoverLetter ||
    mongoose.model("CoverLetter", CoverLetterSchema);
