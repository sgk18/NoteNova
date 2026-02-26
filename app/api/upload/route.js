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
      // Convert file to buffer for proper transfer
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const fileName = file.name || "upload";
      const contentType = file.type || "application/octet-stream";

      // Upload to Uploadcare
      const uploadForm = new FormData();
      uploadForm.append("UPLOADCARE_PUB_KEY", process.env.UPLOADCARE_PUB_KEY);
      uploadForm.append("UPLOADCARE_STORE", "auto");
      uploadForm.append("file", new Blob([buffer], { type: contentType }), fileName);

      const uploadRes = await fetch("https://upload.uploadcare.com/base/", {
        method: "POST",
        body: uploadForm,
      });

      if (!uploadRes.ok) {
        const errText = await uploadRes.text();
        console.error("Uploadcare error:", uploadRes.status, errText);
        throw new Error("File upload to Uploadcare failed");
      }

      const uploadData = await uploadRes.json();
      console.log("Uploadcare success:", uploadData);
      // Uploadcare CDN URL
      fileUrl = `https://ucarecdn.com/${uploadData.file}/`;
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
