import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    // ❌ REMOVE clerkUserId completely

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
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

// ✅ KEEP ALL YOUR RELATIONS (VERY GOOD DESIGN)

UserSchema.virtual("industryInsight", {
  ref: "IndustryInsight",
  localField: "industry",
  foreignField: "industry",
  justOne: true,
});

UserSchema.virtual("assessments", {
  ref: "Assessment",
  localField: "_id",
  foreignField: "userId",
});

UserSchema.virtual("resume", {
  ref: "Resume",
  localField: "_id",
  foreignField: "userId",
  justOne: true,
});

UserSchema.virtual("coverLetters", {
  ref: "CoverLetter",
  localField: "_id",
  foreignField: "userId",
});

export default mongoose.models.User || mongoose.model("User", UserSchema);