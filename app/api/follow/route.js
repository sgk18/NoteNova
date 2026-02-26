import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Follow from "@/models/Follow";
import Notification from "@/models/Notification";
import User from "@/models/User";
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

// POST — follow/unfollow toggle
export async function POST(request) {
  try {
    const userId = getUserId(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { targetUserId } = await request.json();
    if (!targetUserId) return NextResponse.json({ error: "targetUserId required" }, { status: 400 });
    if (targetUserId === userId) return NextResponse.json({ error: "Cannot follow yourself" }, { status: 400 });

    await dbConnect();

    const existing = await Follow.findOne({ follower: userId, following: targetUserId });

    if (existing) {
      // Unfollow
      await Follow.deleteOne({ _id: existing._id });
      return NextResponse.json({ followed: false });
    } else {
      // Follow
      await Follow.create({ follower: userId, following: targetUserId });

      // Create notification for the followed user
      const fromUser = await User.findById(userId).select("name");
      if (fromUser) {
        await Notification.create({
          userId: targetUserId,
          type: "follow",
          fromUser: userId,
          message: `${fromUser.name} started following you`,
        });
      }

      return NextResponse.json({ followed: true });
    }
  } catch (err) {
    console.error("Follow error:", err.message);
    return NextResponse.json({ error: "Failed to follow/unfollow" }, { status: 500 });
  }
}

// GET — list followers or following
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const type = searchParams.get("type") || "followers";

    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

    await dbConnect();

    let users = [];
    if (type === "followers") {
      const follows = await Follow.find({ following: userId }).populate("follower", "name college department points").sort({ createdAt: -1 });
      users = follows.map(f => f.follower);
    } else {
      const follows = await Follow.find({ follower: userId }).populate("following", "name college department points").sort({ createdAt: -1 });
      users = follows.map(f => f.following);
    }

    // Get counts
    const followersCount = await Follow.countDocuments({ following: userId });
    const followingCount = await Follow.countDocuments({ follower: userId });

    return NextResponse.json({ users, followersCount, followingCount });
  } catch (err) {
    console.error("Follow list error:", err.message);
    return NextResponse.json({ error: "Failed to load followers" }, { status: 500 });
  }
}
