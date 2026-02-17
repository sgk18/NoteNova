import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Resource from "@/models/Resource";
import User from "@/models/User";

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const subject = searchParams.get("subject") || "";
    const semester = searchParams.get("semester") || "";
    const department = searchParams.get("department") || "";
    const sort = searchParams.get("sort") || "trending";
    const userId = searchParams.get("userId") || "";
    const download = searchParams.get("download") || "";

    if (download) {
      const resource = await Resource.findById(download);
      if (resource) {
        resource.downloads += 1;
        await resource.save();
        if (resource.uploadedBy) {
          await User.findByIdAndUpdate(resource.uploadedBy, { $inc: { points: 2 } });
        }
        return NextResponse.json({ fileUrl: resource.fileUrl });
      }
      return NextResponse.json({ error: "Resource not found" }, { status: 404 });
    }

    const query = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { subject: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }
    if (subject) query.subject = { $regex: subject, $options: "i" };
    if (semester) query.semester = semester;
    if (department) query.department = { $regex: department, $options: "i" };
    if (userId) query.uploadedBy = userId;

    let sortOption = {};
    if (sort === "trending") {
      sortOption = { score: -1 };
    } else if (sort === "latest") {
      sortOption = { createdAt: -1 };
    } else if (sort === "rating") {
      sortOption = { avgRating: -1 };
    } else if (sort === "downloads") {
      sortOption = { downloads: -1 };
    }

    let resources;
    if (sort === "trending") {
      resources = await Resource.aggregate([
        { $match: query },
        {
          $addFields: {
            score: { $add: [{ $multiply: ["$downloads", 2] }, { $multiply: ["$avgRating", 5] }] },
          },
        },
        { $sort: { score: -1 } },
        { $limit: 50 },
      ]);
    } else {
      resources = await Resource.find(query).sort(sortOption).limit(50).populate("uploadedBy", "name department").lean();
    }

    return NextResponse.json({ resources });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
