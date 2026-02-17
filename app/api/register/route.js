import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/db";
import User from "@/models/User";

export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { name, email, password, college, department, semester } = body;

    if (!name || !email || !password || !college) {
      return NextResponse.json({ error: "Name, email, password, and college are required" }, { status: 400 });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, college, department, semester });

    return NextResponse.json({
      message: "Registered successfully",
      user: { id: user._id, name: user.name, email: user.email, college: user.college },
    }, { status: 201 });
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
