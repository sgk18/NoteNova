import mongoose from "mongoose";

const ResourceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: "" },
  subject: { type: String, default: "" },
  semester: { type: String, default: "" },
  department: { type: String, default: "" },
  resourceType: {
    type: String,
    enum: ["Notes", "Question Papers", "Solutions", "Project Reports", "Study Material"],
    default: "Notes",
  },
  yearBatch: { type: String, default: "" },
  tags: [{ type: String }],
  isPublic: { type: Boolean, default: true },
  fileUrl: { type: String, default: "" },
  downloads: { type: Number, default: 0 },
<<<<<<< HEAD
=======
  views: { type: Number, default: 0 },
>>>>>>> 20e1cd558b63141784a903ec708d98775e66730e
  avgRating: { type: Number, default: 0 },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Resource || mongoose.model("Resource", ResourceSchema);
