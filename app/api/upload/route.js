import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Resource from "@/models/Resource";
import User from "@/models/User";
import { verifyToken } from "@/lib/auth";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import b2 from "@/lib/b2";

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

      const fileName = file.name?.toLowerCase() || "";
      const validName = fileName.replace(/[^a-z0-9.]/g, '_');
      const key = `notenova/${Date.now()}_${validName}`;

      const command = new PutObjectCommand({
        Bucket: process.env.B2_BUCKET,
        Key: key,
        Body: buffer,
        ContentType: file.type || "application/octet-stream",
      });

      await b2.send(command);

      // Virtual-hosted style URL for Backblaze B2
      // e.g. https://notenovacloud.s3.us-west-000.backblazeb2.com/notenova/...
      const bucketName = process.env.B2_BUCKET;
      const endpoint = process.env.B2_ENDPOINT.replace("https://", "");
      fileUrl = `https://${bucketName}.${endpoint}/${key}`;
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
