import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Resource from "@/models/Resource";
import User from "@/models/User";
import cloudinary from "@/lib/cloudinary";
import { authenticate } from "@/middleware/authMiddleware";

export async function POST(request) {
  try {
    const user = await authenticate(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const formData = await request.formData();
    const title = formData.get("title");
    const description = formData.get("description") || "";
    const subject = formData.get("subject") || "";
    const semester = formData.get("semester") || "";
    const department = formData.get("department") || "";
    const file = formData.get("file");

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    let fileUrl = "";
    if (file && file.size > 0) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ resource_type: "raw", folder: "notenova" }, (err, result) => {
            if (err) reject(err);
            else resolve(result);
          })
          .end(buffer);
      });
      fileUrl = result.secure_url;
    }

    const resource = await Resource.create({
      title,
      description,
      subject,
      semester,
      department,
      fileUrl,
      uploadedBy: user.userId,
    });

    await User.findByIdAndUpdate(user.userId, { $inc: { points: 10 } });

    return NextResponse.json(
      { message: "Resource uploaded", resource },
      { status: 201 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
