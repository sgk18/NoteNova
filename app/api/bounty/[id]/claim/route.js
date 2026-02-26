import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Bounty from "@/models/Bounty";
import User from "@/models/User";
import { authenticate } from "@/middleware/authMiddleware";

export async function POST(request, { params }) {
  try {
    await dbConnect();
    const user = await authenticate(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const { solutionUrl, solutionText } = body;

    const bounty = await Bounty.findById(id);
    if (!bounty) {
      return NextResponse.json({ error: "Bounty not found" }, { status: 404 });
    }

    if (bounty.status === "Solved") {
      return NextResponse.json({ error: "Bounty already solved" }, { status: 400 });
    }

    if (bounty.postedBy.toString() === user.userId) {
      return NextResponse.json({ error: "You cannot solve your own bounty" }, { status: 400 });
    }

    // Mark as solved and reward the solver
    bounty.status = "Solved";
    bounty.solvedBy = user.userId;
    bounty.solutionUrl = solutionUrl;
    bounty.solutionText = solutionText;
    await bounty.save();

    // Reward points to solver
    const solverData = await User.findById(user.userId);
    solverData.points += bounty.rewardAmount;
    await solverData.save();

    return NextResponse.json({ 
      message: "Bounty claimed and points rewarded!", 
      bounty 
    });
  } catch (err) {
    console.error("Bounty Claim error:", err);
    return NextResponse.json({ error: "Failed to claim bounty" }, { status: 500 });
  }
}
