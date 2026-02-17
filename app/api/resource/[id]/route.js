import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Resource from "@/models/Resource";
import Rating from "@/models/Rating";
<<<<<<< HEAD
=======
import jwt from "jsonwebtoken";
>>>>>>> 20e1cd558b63141784a903ec708d98775e66730e

export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
<<<<<<< HEAD
    const resource = await Resource.findById(id).populate("uploadedBy", "name college department").lean();
    if (!resource) return NextResponse.json({ error: "Not found" }, { status: 404 });

=======
    const resource = await Resource.findById(id)
      .populate("uploadedBy", "name college department")
      .lean();

    if (!resource) {
      return NextResponse.json({ error: "Resource not found" }, { status: 404 });
    }

    // Access control for private resources
    if (resource.isPublic === false) {
      const authHeader = request.headers.get("authorization");
      const token = authHeader?.replace("Bearer ", "");

      if (!token) {
        return NextResponse.json({ error: "Login required to view this private resource" }, { status: 403 });
      }

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userCollege = decoded.college || "";
        const resourceCollege = resource.uploadedBy?.college || "";

        if (userCollege && resourceCollege && userCollege !== resourceCollege) {
          return NextResponse.json({ error: "This resource is only available to students from the same college" }, { status: 403 });
        }
      } catch {
        return NextResponse.json({ error: "Invalid or expired token" }, { status: 403 });
      }
    }

    // Increment view count (fire and forget)
    Resource.updateOne({ _id: id }, { $inc: { views: 1 } }).catch(() => {});

    // Fetch reviews
>>>>>>> 20e1cd558b63141784a903ec708d98775e66730e
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
