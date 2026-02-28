import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import Conversation from "@/models/Conversation";
import User from "@/models/User";

// Helper: extract userId from Authorization header
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

// GET /api/dm/conversations — List user's conversations
export async function GET(req) {
  await dbConnect();
  const userId = getUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const conversations = await Conversation.find({
    participants: userId,
  })
    .sort({ updatedAt: -1 })
    .populate("participants", "name email")
    .lean();

  // Attach the "other" participant info for each conversation
  const result = conversations.map((conv) => {
    const other = conv.participants.find(
      (p) => p._id.toString() !== userId
    );
    return {
      _id: conv._id,
      otherUser: other || { name: "Unknown", _id: null },
      lastMessage: conv.lastMessage,
      updatedAt: conv.updatedAt,
    };
  });

  return NextResponse.json(result);
}

// POST /api/dm/conversations — Start or get existing conversation
export async function POST(req) {
  await dbConnect();
  const userId = getUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { recipientId } = await req.json();
  if (!recipientId || recipientId === userId) {
    return NextResponse.json({ error: "Invalid recipient" }, { status: 400 });
  }

  // Check if the recipient exists
  const recipient = await User.findById(recipientId).select("name email").lean();
  if (!recipient) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Check if a conversation already exists between these two users
  let conversation = await Conversation.findOne({
    participants: { $all: [userId, recipientId], $size: 2 },
  })
    .populate("participants", "name email")
    .lean();

  if (conversation) {
    const other = conversation.participants.find(
      (p) => p._id.toString() !== userId
    );
    return NextResponse.json({
      _id: conversation._id,
      otherUser: other,
      lastMessage: conversation.lastMessage,
      updatedAt: conversation.updatedAt,
      existing: true,
    });
  }

  // Create a new conversation
  const newConv = await Conversation.create({
    participants: [userId, recipientId],
    lastMessage: { text: "", sender: null, timestamp: new Date() },
  });

  return NextResponse.json({
    _id: newConv._id,
    otherUser: { _id: recipient._id, name: recipient.name, email: recipient.email },
    lastMessage: newConv.lastMessage,
    updatedAt: newConv.updatedAt,
    existing: false,
  });
}
