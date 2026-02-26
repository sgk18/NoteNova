import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, enum: ["follow", "upload", "like"], required: true },
  fromUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  resourceId: { type: mongoose.Schema.Types.ObjectId, ref: "Resource" },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, read: 1 });

export default mongoose.models.Notification || mongoose.model("Notification", NotificationSchema);
