import Bytez from "bytez.js";
import { NextResponse } from "next/server";

const sdk = new Bytez(process.env.BYTEZ_API_KEY);

const SYSTEM_PROMPT = `You are an academic assistant.
Respond in this format:

1. Concept Overview
2. Key Points (bullet list)
3. Example (if applicable)
4. 3 Possible Exam Questions`;

// Basic in-memory rate limit: max 10 requests per IP per minute
const rateMap = new Map();
const RATE_LIMIT = 10;
const RATE_WINDOW = 60_000;

function isRateLimited(ip) {
  const now = Date.now();
  const entry = rateMap.get(ip);
  if (!entry || now - entry.start > RATE_WINDOW) {
    rateMap.set(ip, { start: now, count: 1 });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT;
}

export async function POST(request) {
  try {
    // Rate limit check
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    if (isRateLimited(ip)) {
      return NextResponse.json({ error: "Too many requests. Please wait a moment." }, { status: 429 });
    }

    // Input validation
    const body = await request.json();
    const { question } = body;

    if (!question || !question.trim()) {
      return NextResponse.json({ error: "Question is required" }, { status: 400 });
    }

    if (question.length > 500) {
      return NextResponse.json({ error: "Question must be under 500 characters" }, { status: 400 });
    }

    // Connect to Meta Llama 3 using Bytez SDK
    const model = sdk.model("meta-llama/Meta-Llama-3-8B-Instruct");

    const fullPrompt = `${SYSTEM_PROMPT}\n\nUser Question: ${question.trim()}`;

    const { error, output } = await model.run(fullPrompt);

    if (error) {
      console.error("Bytez API error:", error);
      return NextResponse.json({ error: "AI request failed" }, { status: 502 });
    }

    return NextResponse.json({ answer: output || "No response from AI." });
  } catch (err) {
    console.error("Ask AI error:", err.message);
    return NextResponse.json({ error: "AI request failed" }, { status: 500 });
  }
}
