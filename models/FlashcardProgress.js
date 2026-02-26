import mongoose from "mongoose";

const CardStateSchema = new mongoose.Schema({
  cardIndex: { type: Number, required: true },
  question: { type: String, default: "" },
  answer: { type: String, default: "" },
  bucket: { type: String, enum: ["new", "learning", "review", "mastered"], default: "new" },
  correctStreak: { type: Number, default: 0 },
  lastReviewed: { type: Date, default: null },
  nextReview: { type: Date, default: Date.now },
}, { _id: false });

const FlashcardProgressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  resourceId: { type: mongoose.Schema.Types.ObjectId, ref: "Resource", required: true },
  cards: [CardStateSchema],
  stats: {
    totalReviews: { type: Number, default: 0 },
    correctCount: { type: Number, default: 0 },
    wrongCount: { type: Number, default: 0 },
  },
  updatedAt: { type: Date, default: Date.now },
});

FlashcardProgressSchema.index({ userId: 1, resourceId: 1 }, { unique: true });

export default mongoose.models.FlashcardProgress || mongoose.model("FlashcardProgress", FlashcardProgressSchema);
