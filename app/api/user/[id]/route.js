import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Resource from "@/models/Resource";
import Follow from "@/models/Follow";
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

// GET — public profile data
export async function GET(request, { params }) {
  try {
    const { id } = await params;

    await dbConnect();

    const user = await User.findById(id).select("name email college department semester points createdAt");
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Get follower/following counts
    const followersCount = await Follow.countDocuments({ following: id });
    const followingCount = await Follow.countDocuments({ follower: id });

    // Check if current viewer follows this user
    let isFollowing = false;
    const viewerId = getUserId(request);
    if (viewerId && viewerId !== id) {
      const follow = await Follow.findOne({ follower: viewerId, following: id });
      isFollowing = !!follow;
    }

    // Get public resources
    const resources = await Resource.find({ uploadedBy: id, isPublic: true })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    return NextResponse.json({
      user: {
        _id: user._id,
        name: user.name,
        college: user.college,
        department: user.department,
        semester: user.semester,
        points: user.points,
        createdAt: user.createdAt,
      },
      followersCount,
      followingCount,
      isFollowing,
      isOwnProfile: viewerId === id,
      resources,
    });
  } catch (err) {
    console.error("Public profile error:", err.message);
    return NextResponse.json({ error: "Failed to load profile" }, { status: 500 });
  }
}
