import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import User from "@/models/User";

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

// GET /api/dm/users/search?q=query — Search users by name
export async function GET(req) {
  await dbConnect();
  const userId = getUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const query = url.searchParams.get("q") || "";

  if (query.length < 2) {
    return NextResponse.json([]);
  }

  const users = await User.find({
    _id: { $ne: userId },
    name: { $regex: query, $options: "i" },
  })
    .select("name email college department")
    .limit(10)
    .lean();

  return NextResponse.json(users);
}
