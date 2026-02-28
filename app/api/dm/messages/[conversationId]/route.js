import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import Message from "@/models/Message";
import Conversation from "@/models/Conversation";

function getUserId(req) {
  const auth = req.headers.get("authorization");
  if (!auth || !auth.startsWith("Bearer ")) return null;
  try {
    const decoded = verifyToken(auth.split(" ")[1]);
    return decoded.userId || decoded.id || decoded._id;
  } catch {
    return null;
  }
}

// GET /api/dm/messages/[conversationId] — Fetch paginated messages
export async function GET(req, { params }) {
  await dbConnect();
  const userId = getUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { conversationId } = await params;

  // Verify the user is a participant in this conversation
  const conversation = await Conversation.findById(conversationId).lean();
  if (!conversation) {
    return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  }
  const isParticipant = conversation.participants.some(
    (p) => p.toString() === userId
  );
  if (!isParticipant) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Pagination
  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get("page") || "1", 10);
  const limit = parseInt(url.searchParams.get("limit") || "50", 10);
  const skip = (page - 1) * limit;

  const messages = await Message.find({ conversationId })
    .sort({ createdAt: 1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await Message.countDocuments({ conversationId });

  return NextResponse.json({
    messages,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}
