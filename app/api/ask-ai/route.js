import { NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are an academic assistant for NoteNova, a campus resource sharing platform.
Respond using the following format:

1. Concept Overview
2. Key Points (bullet list)
3. Example (if applicable)
4. 3 Possible Exam Questions`;

export async function POST(request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "OpenAI API key is not configured" }, { status: 503 });
    }

    const body = await request.json();
    const { question } = body;

    if (!question || !question.trim()) {
      return NextResponse.json({ error: "Question is required" }, { status: 400 });
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
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
      console.error("OpenAI API error:", response.status, errData);
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
