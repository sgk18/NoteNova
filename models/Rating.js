import mongoose from "mongoose";

const RatingSchema = new mongoose.Schema({
  rating: { type: Number, required: true, min: 1, max: 5 },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  resourceId: { type: mongoose.Schema.Types.ObjectId, ref: "Resource", required: true },
  createdAt: { type: Date, default: Date.now },
});

RatingSchema.index({ userId: 1, resourceId: 1 }, { unique: true });

export default mongoose.models.Rating || mongoose.model("Rating", RatingSchema);
