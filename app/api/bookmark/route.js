import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Bookmark from "@/models/Bookmark";
import Resource from "@/models/Resource";
import { authenticate } from "@/middleware/authMiddleware";

export async function GET(request) {
  try {
    const user = await authenticate(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const bookmarks = await Bookmark.find({ userId: user.userId })
      .populate("resourceId")
      .lean();

    return NextResponse.json({ bookmarks });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = await authenticate(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { resourceId } = await request.json();

    if (!resourceId) {
      return NextResponse.json({ error: "resourceId is required" }, { status: 400 });
    }

    const existing = await Bookmark.findOne({ userId: user.userId, resourceId });
    if (existing) {
      return NextResponse.json({ error: "Already bookmarked" }, { status: 400 });
    }

    await Bookmark.create({ userId: user.userId, resourceId });
    return NextResponse.json({ message: "Bookmarked" }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const user = await authenticate(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { searchParams } = new URL(request.url);
    const resourceId = searchParams.get("resourceId");

    if (!resourceId) {
      return NextResponse.json({ error: "resourceId is required" }, { status: 400 });
    }

    await Bookmark.findOneAndDelete({ userId: user.userId, resourceId });
    return NextResponse.json({ message: "Removed bookmark" });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
