import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";

export async function GET() {
  try {
    await dbConnect();
    const users = await User.find({})
      .sort({ points: -1 })
      .limit(50)
      .select("name college department semester points")
      .lean();

    return NextResponse.json({ users });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
