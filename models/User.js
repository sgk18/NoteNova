import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  college: { type: String, default: "" },
  department: { type: String, default: "" },
  semester: { type: String, default: "" },
  points: { type: Number, default: 0 },
  role: { type: String, default: "student" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.User || mongoose.model("User", UserSchema);
