import mongoose from "mongoose";

const ResourceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: "" },
  subject: { type: String, default: "" },
  semester: { type: String, default: "" },
  department: { type: String, default: "" },
  resourceType: {
    type: String,
    enum: ["Notes", "Question Papers", "Solutions", "Project Reports", "Study Material", "Google NotebookLM"],
    default: "Notes",
  },
  yearBatch: { type: String, default: "" },
  tags: [{ type: String }],
  isPublic: { type: Boolean, default: true },
  fileUrl: { type: String, default: "" },
  notebookLMLink: { type: String, default: "" },
  downloads: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  avgRating: { type: Number, default: 0 },
  smartNotes: { type: Object, default: null },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Resource || mongoose.model("Resource", ResourceSchema);
