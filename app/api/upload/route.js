import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Resource from "@/models/Resource";
import User from "@/models/User";
import { verifyToken } from "@/lib/auth";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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
    const file = formData.get("file");

    if (!title) return NextResponse.json({ error: "Title is required" }, { status: 400 });

    let fileUrl = "";
    if (file && file.size > 0) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      // Use "raw" for documents so Cloudinary serves them with correct content-type
      const fileName = file.name?.toLowerCase() || "";
      const docExts = [".pdf", ".doc", ".docx", ".ppt", ".pptx", ".xls", ".xlsx", ".txt", ".csv", ".zip", ".rar"];
      const isDoc = docExts.some((ext) => fileName.endsWith(ext));
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { resource_type: isDoc ? "raw" : "auto", folder: "notenova" },
          (err, result) => (err ? reject(err) : resolve(result))
        );
        stream.end(buffer);
      });
      fileUrl = result.secure_url;
    }

    const tags = tagsRaw ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean) : [];

    const resource = await Resource.create({
      title, description, subject, semester, department,
      resourceType, yearBatch, tags, isPublic, fileUrl,
      uploadedBy: decoded.userId,
    });

    await User.findByIdAndUpdate(decoded.userId, { $inc: { points: 10 } });

    return NextResponse.json({ resource }, { status: 201 });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: err.message || "Upload failed" }, { status: 500 });
  }
}
