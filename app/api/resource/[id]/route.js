import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Resource from "@/models/Resource";
import Rating from "@/models/Rating";

export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    const resource = await Resource.findById(id).populate("uploadedBy", "name college department").lean();
    if (!resource) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const reviews = await Rating.find({ resourceId: id })
      .sort({ createdAt: -1 })
      .populate("userId", "name college")
      .lean();

    const avgRating = reviews.length
      ? parseFloat((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1))
      : 0;

    return NextResponse.json({ resource, reviews, avgRating });
  } catch (err) {
    console.error("Resource detail error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
