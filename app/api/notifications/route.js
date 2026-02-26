import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Notification from "@/models/Notification";
import jwt from "jsonwebtoken";

function getUserId(request) {
  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  try {
    const decoded = jwt.verify(auth.split(" ")[1], process.env.JWT_SECRET);
    return decoded.userId || decoded.id;
  } catch {
    return null;
  }
}

// GET — fetch notifications
export async function GET(request) {
  try {
    const userId = getUserId(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();

    const notifications = await Notification.find({ userId })
      .populate("fromUser", "name")
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    const unreadCount = await Notification.countDocuments({ userId, read: false });

    return NextResponse.json({ notifications, unreadCount });
  } catch (err) {
    console.error("Notifications GET error:", err.message);
    return NextResponse.json({ error: "Failed to load notifications" }, { status: 500 });
  }
}

// PUT — mark as read
export async function PUT(request) {
  try {
    const userId = getUserId(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { notificationId, markAll } = await request.json();

    await dbConnect();

    if (markAll) {
      await Notification.updateMany({ userId, read: false }, { read: true });
    } else if (notificationId) {
      await Notification.updateOne({ _id: notificationId, userId }, { read: true });
    }

    const unreadCount = await Notification.countDocuments({ userId, read: false });
    return NextResponse.json({ unreadCount });
  } catch (err) {
    console.error("Notifications PUT error:", err.message);
    return NextResponse.json({ error: "Failed to update notifications" }, { status: 500 });
  }
}
