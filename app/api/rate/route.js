import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Rating from "@/models/Rating";
import Resource from "@/models/Resource";
import User from "@/models/User";
import { verifyToken } from "@/lib/auth";

export async function POST(request) {
  try {
    await dbConnect();
    const authHeader = request.headers.get("authorization");
    if (!authHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const decoded = verifyToken(authHeader.split(" ")[1]);
    if (!decoded) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const body = await request.json();
    const { resourceId, rating, review } = body;

    if (!resourceId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Valid resourceId and rating (1-5) required" }, { status: 400 });
    }

    const existing = await Rating.findOne({ userId: decoded.userId, resourceId });
    if (existing) {
      existing.rating = rating;
      if (review !== undefined) existing.review = review;
      await existing.save();
    } else {
      await Rating.create({ rating, review: review || "", userId: decoded.userId, resourceId });
    }

    const allRatings = await Rating.find({ resourceId });
    const avg = allRatings.reduce((s, r) => s + r.rating, 0) / allRatings.length;
    await Resource.findByIdAndUpdate(resourceId, { avgRating: parseFloat(avg.toFixed(1)) });

    if (rating > 4) {
      const resource = await Resource.findById(resourceId);
      if (resource?.uploadedBy) {
        await User.findByIdAndUpdate(resource.uploadedBy, { $inc: { points: 5 } });
      }
    }

    return NextResponse.json({ message: existing ? "Review updated" : "Review submitted", avgRating: avg });
  } catch (err) {
    console.error("Rate error:", err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const resourceId = searchParams.get("resourceId");
    if (!resourceId) return NextResponse.json({ error: "resourceId required" }, { status: 400 });

    const reviews = await Rating.find({ resourceId })
      .sort({ createdAt: -1 })
      .populate("userId", "name college")
      .lean();

    return NextResponse.json({ reviews });
  } catch (err) {
    console.error("Get reviews error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
