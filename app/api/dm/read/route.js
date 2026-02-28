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

// POST /api/dm/read — Mark conversation messages as read
export async function POST(req) {
  await dbConnect();
  const userId = getUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { conversationId } = await req.json();
  if (!conversationId) {
    return NextResponse.json({ error: "conversationId required" }, { status: 400 });
  }

  // Verify membership
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

  // Mark all messages not sent by this user as read
  const result = await Message.updateMany(
    {
      conversationId,
      sender: { $ne: userId },
      readBy: { $nin: [userId] },
    },
    { $addToSet: { readBy: userId } }
  );

  return NextResponse.json({ updated: result.modifiedCount });
}
