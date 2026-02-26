import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
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

    const formData = await request.formData();
    const title = formData.get("title");
    const description = formData.get("description") || "";
    const subject = formData.get("subject") || "";
    const semester = formData.get("semester") || "";
    const department = formData.get("department") || "";
    const resourceType = formData.get("resourceType") || "Notes";
    const yearBatch = formData.get("yearBatch") || "";
    const tagsRaw = formData.get("tags") || "";
    const isPublic = formData.get("isPublic") !== "false";
    const notebookLMLink = formData.get("notebookLMLink") || "";
    const file = formData.get("file");

    if (!title) return NextResponse.json({ error: "Title is required" }, { status: 400 });

    let fileUrl = "";
    if (file && file.size > 0) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Generate a unique filename
      const timestamp = Date.now();
      const safeName = (file.name || "upload").replace(/[^a-zA-Z0-9._-]/g, "_");
      const fileName = `${timestamp}_${safeName}`;

      // Save to public/uploads directory
      const uploadsDir = path.join(process.cwd(), "public", "uploads");
      await mkdir(uploadsDir, { recursive: true });
      const filePath = path.join(uploadsDir, fileName);
      await writeFile(filePath, buffer);

      // File URL served from public directory
      fileUrl = `/uploads/${fileName}`;
    }

    const tags = tagsRaw ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean) : [];

    const resource = await Resource.create({
      title, description, subject, semester, department,
      resourceType, yearBatch, tags, isPublic, fileUrl,
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
