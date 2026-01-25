import mongoose from "mongoose";

const IndustryInsightSchema = new mongoose.Schema(
    {
        industry: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        salaryRanges: [
            {
                role: String,
                min: Number,
                max: Number,
                median: Number,
                location: String,
            },
        ],
        growthRate: {
            type: Number,
            required: true,
        },
        demandLevel: {
            type: String,
            enum: ["HIGH", "MEDIUM", "LOW"],
            required: true,
        },
        topSkills: [
            {
                type: String,
            },
        ],
        marketOutlook: {
            type: String,
            enum: ["POSITIVE", "NEUTRAL", "NEGATIVE"],
            required: true,
        },
        keyTrends: [
            {
                type: String,
            },
        ],
        recommendedSkills: [
            {
                type: String,
            },
        ],
        lastUpdated: {
            type: Date,
            default: Date.now,
        },
        nextUpdate: {
            type: Date,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.models.IndustryInsight ||
    mongoose.model("IndustryInsight", IndustryInsightSchema);
