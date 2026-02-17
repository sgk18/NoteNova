import mongoose from "mongoose";

const BookmarkSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  resourceId: { type: mongoose.Schema.Types.ObjectId, ref: "Resource", required: true },
  createdAt: { type: Date, default: Date.now },
});

BookmarkSchema.index({ userId: 1, resourceId: 1 }, { unique: true });

export default mongoose.models.Bookmark || mongoose.model("Bookmark", BookmarkSchema);
