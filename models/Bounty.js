import mongoose from "mongoose";

const BountySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  attachmentUrl: { type: String, default: "" },
  subject: { type: String, default: "" },
  department: { type: String, default: "" },
  rewardType: { 
    type: String, 
    enum: ["Points", "INR"], 
    default: "Points" 
  },
  rewardAmount: { type: Number, required: true, default: 0 },
  status: { 
    type: String, 
    enum: ["Open", "InProgress", "Solved", "Closed"], 
    default: "Open" 
  },
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  solvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  solutionUrl: { type: String, default: "" },
  solutionText: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date },
});

export default mongoose.models.Bounty || mongoose.model("Bounty", BountySchema);
