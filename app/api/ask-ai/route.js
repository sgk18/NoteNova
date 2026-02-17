import { NextResponse } from "next/server";

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

    // API key check
<<<<<<< HEAD
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "OpenAI API key is not configured" }, { status: 503 });
=======
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Groq API key is not configured" }, { status: 503 });
>>>>>>> 20e1cd558b63141784a903ec708d98775e66730e
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

<<<<<<< HEAD
    // OpenAI API call
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
=======
    // Groq API call (OpenAI-compatible endpoint)
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
>>>>>>> 20e1cd558b63141784a903ec708d98775e66730e
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
<<<<<<< HEAD
        model: "gpt-4o-mini",
=======
        model: "llama-3.1-8b-instant",
>>>>>>> 20e1cd558b63141784a903ec708d98775e66730e
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: question.trim() },
        ],
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
<<<<<<< HEAD
      console.error("OpenAI API error:", response.status, errData?.error?.message || "Unknown");
=======
      console.error("Groq API error:", response.status, errData?.error?.message || "Unknown");
>>>>>>> 20e1cd558b63141784a903ec708d98775e66730e
      return NextResponse.json({ error: "AI request failed" }, { status: 502 });
    }

    const data = await response.json();
    const answer = data.choices?.[0]?.message?.content || "No response from AI.";

    return NextResponse.json({ answer });
  } catch (err) {
    console.error("Ask AI error:", err.message);
    return NextResponse.json({ error: "AI request failed" }, { status: 500 });
  }
}
