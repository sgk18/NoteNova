import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/db";
import Resource from "@/models/Resource";
import User from "@/models/User";
import { runSeed } from "@/lib/seed";
import { verifyToken } from "@/lib/auth";

export async function GET(request) {
  try {
    await dbConnect();
    await runSeed();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const subject = searchParams.get("subject") || "";
    const semester = searchParams.get("semester") || "";
    const department = searchParams.get("department") || "";
    const resourceType = searchParams.get("resourceType") || "";
    const yearBatch = searchParams.get("yearBatch") || "";
    const isPublic = searchParams.get("isPublic");
    const tag = searchParams.get("tag") || "";
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
        let url = resource.fileUrl;
        // Fix URLs stored with wrong resource type path
        if (url && url.includes("/image/upload/")) {
          url = url.replace("/image/upload/", "/raw/upload/");
        }
        return NextResponse.json({ fileUrl: url });
      }
      return NextResponse.json({ error: "Resource not found" }, { status: 404 });
    }

    const query = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { subject: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
      ];
    }
    if (subject) query.subject = { $regex: subject, $options: "i" };
    if (semester) query.semester = semester;
    if (department) query.department = { $regex: department, $options: "i" };
    if (resourceType) query.resourceType = resourceType;
    if (yearBatch) query.yearBatch = yearBatch;
    if (isPublic !== null && isPublic !== undefined && isPublic !== "") {
      query.isPublic = isPublic === "true";
    }
    if (tag) query.tags = { $in: [new RegExp(tag, "i")] };
    if (userId) query.uploadedBy = new mongoose.Types.ObjectId(userId);



    // Access control for private resources
    let userCollege = null;
    const authHeader = request.headers.get("authorization");
    if (authHeader) {
      const decoded = verifyToken(authHeader.split(" ")[1]);
      if (decoded) {
        const user = await User.findById(decoded.userId).select("college");
        userCollege = user?.college;
      }
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
        { $lookup: { from: "users", localField: "uploadedBy", foreignField: "_id", as: "uploadedBy" } },
        { $unwind: { path: "$uploadedBy", preserveNullAndEmptyArrays: true } },
        { $project: { "uploadedBy.password": 0 } },
      ]);
      // Populate uploadedBy manually for aggregation
      resources = await Resource.populate(resources, { path: "uploadedBy", select: "name college department" });
    } else {
      let sortOption = {};
      if (sort === "latest") sortOption = { createdAt: -1 };
      else if (sort === "rating") sortOption = { avgRating: -1 };
      else if (sort === "popular") sortOption = { downloads: -1 };
      else sortOption = { createdAt: -1 };

      resources = await Resource.find(query).sort(sortOption).limit(50).populate("uploadedBy", "name college department").lean();
    }

    // Filter out private resources from other colleges
    // Resources without isPublic field are treated as public (backwards compatible)
    resources = resources.filter((r) => {
      if (r.isPublic === false) {
        // Explicitly private — only show to same college
        if (!userCollege) return false;
        const uploaderCollege = r.uploadedBy?.college || "";
        return uploaderCollege.toLowerCase() === userCollege.toLowerCase();
      }
      // isPublic is true, undefined, or null — treat as public
      return true;
    });

    return NextResponse.json({ resources });
  } catch (err) {
    console.error("Resources error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    await dbConnect();
    const authHeader = request.headers.get("authorization");
    if (!authHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const decoded = verifyToken(authHeader.split(" ")[1]);
    if (!decoded) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const body = await request.json();
    const { resourceId, title, description, subject, semester, department, resourceType, yearBatch, tags, isPublic } = body;

    const resource = await Resource.findById(resourceId);
    if (!resource) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (resource.uploadedBy.toString() !== decoded.userId) {
      return NextResponse.json({ error: "Only the uploader can edit" }, { status: 403 });
    }

    if (title !== undefined) resource.title = title;
    if (description !== undefined) resource.description = description;
    if (subject !== undefined) resource.subject = subject;
    if (semester !== undefined) resource.semester = semester;
    if (department !== undefined) resource.department = department;
    if (resourceType !== undefined) resource.resourceType = resourceType;
    if (yearBatch !== undefined) resource.yearBatch = yearBatch;
    if (tags !== undefined) resource.tags = tags;
    if (isPublic !== undefined) resource.isPublic = isPublic;

    await resource.save();
    return NextResponse.json({ resource });
  } catch (err) {
    console.error("Edit error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    await dbConnect();
    const authHeader = request.headers.get("authorization");
    if (!authHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const decoded = verifyToken(authHeader.split(" ")[1]);
    if (!decoded) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const resourceId = searchParams.get("resourceId");
    if (!resourceId) return NextResponse.json({ error: "resourceId required" }, { status: 400 });

    const resource = await Resource.findById(resourceId);
    if (!resource) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (resource.uploadedBy.toString() !== decoded.userId) {
      return NextResponse.json({ error: "Only the uploader can delete" }, { status: 403 });
    }

    await Resource.findByIdAndDelete(resourceId);
    return NextResponse.json({ message: "Deleted" });
  } catch (err) {
    console.error("Delete error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
