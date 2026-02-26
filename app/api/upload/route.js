import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
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
    const title = body.title;
    const description = body.description || "";
    const subject = body.subject || "";
    const semester = body.semester || "";
    const department = body.department || "";
    const resourceType = body.resourceType || "Notes";
    const yearBatch = body.yearBatch || "";
    const tagsRaw = body.tags || "";
    const isPublic = body.isPublic !== "false" && body.isPublic !== false;
    const notebookLMLink = body.notebookLMLink || "";

    // Cloudinary details provided by frontend
    const fileUrl = body.fileUrl || "";

    if (!title) return NextResponse.json({ error: "Title is required" }, { status: 400 });

    const tags = tagsRaw
      ? (typeof tagsRaw === "string" ? tagsRaw.split(",") : tagsRaw).map((t) => t.trim()).filter(Boolean)
      : [];

    const resource = await Resource.create({
      title,
      description,
      subject,
      semester,
      department,
      resourceType,
      yearBatch,
      tags,
      isPublic,
      fileUrl,
      notebookLMLink,
      uploadedBy: decoded.userId,
    });

    await User.findByIdAndUpdate(decoded.userId, { $inc: { points: 10 } });

    return NextResponse.json({ resource }, { status: 201 });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: err.message || "Upload failed" }, { status: 500 });
  }
}
