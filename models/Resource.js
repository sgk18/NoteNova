import mongoose from "mongoose";

const ResourceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: "" },
  subject: { type: String, default: "" },
  semester: { type: String, default: "" },
  department: { type: String, default: "" },
  fileUrl: { type: String, default: "" },
  downloads: { type: Number, default: 0 },
  avgRating: { type: Number, default: 0 },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Resource || mongoose.model("Resource", ResourceSchema);
