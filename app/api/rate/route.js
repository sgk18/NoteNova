import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Rating from "@/models/Rating";
import Resource from "@/models/Resource";
import User from "@/models/User";
import { authenticate } from "@/middleware/authMiddleware";

export async function POST(request) {
  try {
    const user = await authenticate(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { resourceId, rating } = await request.json();

    if (!resourceId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Valid resourceId and rating (1-5) required" }, { status: 400 });
    }

    const existing = await Rating.findOne({ userId: user.userId, resourceId });
    if (existing) {
      return NextResponse.json({ error: "You have already rated this resource" }, { status: 400 });
    }

    await Rating.create({ rating, userId: user.userId, resourceId });

    const allRatings = await Rating.find({ resourceId });
    const avg = allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length;

    const resource = await Resource.findByIdAndUpdate(resourceId, { avgRating: Math.round(avg * 10) / 10 }, { new: true });

    if (avg > 4 && resource.uploadedBy) {
      await User.findByIdAndUpdate(resource.uploadedBy, { $inc: { points: 5 } });
    }

    return NextResponse.json({ message: "Rating submitted", avgRating: resource.avgRating });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
