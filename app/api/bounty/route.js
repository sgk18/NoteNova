import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Bounty from "@/models/Bounty";
import User from "@/models/User";
import { authenticate } from "@/middleware/authMiddleware";

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const department = searchParams.get("department");
    const status = searchParams.get("status") || "Open";

    let query = { status };
    if (department) {
      query.department = department;
    }

    const bounties = await Bounty.find(query)
      .populate("postedBy", "name college department")
      .sort({ createdAt: -1 });

    return NextResponse.json({ bounties });
  } catch (err) {
    console.error("Bounty GET error:", err);
    return NextResponse.json({ error: "Failed to fetch bounties" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const user = await authenticate(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, rewardAmount, department, subject, attachmentUrl } = body;

    if (!title || !description || !rewardAmount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if user has enough points
    const userData = await User.findById(user.userId);
    if (userData.points < rewardAmount) {
      return NextResponse.json({ error: "Insufficient Nova Points" }, { status: 400 });
    }

    const bounty = await Bounty.create({
      title,
      description,
      rewardAmount,
      department: department || userData.department,
      subject,
      attachmentUrl,
      postedBy: user.userId,
    });

    // Deduct points from poster
    userData.points -= rewardAmount;
    await userData.save();

    return NextResponse.json({ message: "Bounty posted successfully", bounty });
  } catch (err) {
    console.error("Bounty POST error:", err);
    return NextResponse.json({ error: "Failed to post bounty" }, { status: 500 });
  }
}
