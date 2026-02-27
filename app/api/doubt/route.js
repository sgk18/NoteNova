import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Doubt from "@/models/Doubt";

const MONGODB_URI = process.env.MONGODB_URI;

async function connectDB() {
  if (mongoose.connections[0].readyState) return;
  await mongoose.connect(MONGODB_URI);
}

// POST — create a new doubt and return its _id (used as the Socket.io room)
export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { resourceId, askerId, questionText } = body;

    if (!askerId || !questionText) {
      return NextResponse.json(
        { error: "askerId and questionText are required" },
        { status: 400 }
      );
    }

    const doubt = await Doubt.create({ resourceId, askerId, questionText });

    return NextResponse.json(
      { doubtId: doubt._id, doubt },
      { status: 201 }
    );
  } catch (err) {
    console.error("Doubt POST error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// GET — fetch doubts, optionally filtered by resourceId
export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const resourceId = searchParams.get("resourceId");

    const filter = resourceId ? { resourceId } : {};
    const doubts = await Doubt.find(filter).sort({ createdAt: -1 });

    return NextResponse.json({ doubts }, { status: 200 });
  } catch (err) {
    console.error("Doubt GET error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
