import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Resource from "@/models/Resource";

// Rate limit
const rateMap = new Map();
const RATE_LIMIT = 15;
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

const MODES = {
  explain: {
    label: "Explain Concepts",
    prompt: `You are an expert academic tutor. The student is studying the resource described below and wants you to explain the difficult concepts in simple language.

Instructions:
- Identify the 5 most challenging concepts from this resource
- Explain each concept in clear, simple terms with analogies
- Use bullet points and examples for clarity
- End each explanation with a "💡 Remember" tip

Format your response in clean markdown with headers (##) for each concept.`,
  },
  quiz: {
    label: "Generate Quiz",
    prompt: `You are an academic quiz master. Generate a comprehensive quiz from the resource described below.

Instructions:
- Create exactly 10 questions total:
  - 4 Multiple Choice Questions (with 4 options each, mark the correct one)
  - 3 True/False questions
  - 3 Short Answer questions
- Questions should test deep understanding, not just memorization
- Vary difficulty: 3 easy, 4 medium, 3 hard
- After ALL questions, provide an "Answer Key" section

Format in clean markdown. Use numbered lists. For MCQs, use A) B) C) D) format.`,
  },
  "exam-areas": {
    label: "Key Exam Areas",
    prompt: `You are an experienced exam preparation coach. Analyze the resource below and highlight the key areas most likely to appear in exams.

Instructions:
- Identify the TOP 8 exam-critical topics from this resource
- For each topic:
  - Explain WHY it's important for exams
  - List 2-3 specific things to memorize
  - Give a sample exam question
- Rate each topic's exam probability: 🔴 Very Likely | 🟡 Likely | 🟢 Possible
- End with "📋 Exam Strategy Tips" section with 5 actionable tips

Format in clean markdown with clear sections.`,
  },
  revision: {
    label: "5-Min Revision",
    prompt: `You are an academic revision specialist. Create a quick 5-minute revision summary of the resource below that a student can review right before an exam.

Instructions:
- Start with a "⚡ Quick Overview" (2-3 sentences)
- Create "📝 Key Points" (8-10 bullet points of the most critical facts)
- Add "🔢 Formulas & Definitions" (if applicable, list key formulas/definitions)
- Include "🔗 Connections" (how topics relate to each other)
- End with "✅ Last-Minute Checklist" (5 things to double-check before the exam)
- Keep EVERYTHING concise — this should be readable in 5 minutes

Format in clean markdown. Be extremely concise.`,
  },
  chat: {
    label: "Ask About This",
    prompt: `You are a helpful academic tutor. The student is studying the resource described below and has a specific question about it.

Instructions:
- Answer the student's question in the context of this specific resource
- Use examples and analogies relevant to the resource's subject
- Keep the answer focused and helpful
- If the question is unclear, provide the most likely helpful answer

Format your response in clean markdown.`,
  },
};

function buildResourceContext(resource) {
  const parts = [
    `📄 Title: ${resource.title}`,
    resource.description ? `📝 Description: ${resource.description}` : "",
    resource.subject ? `📚 Subject: ${resource.subject}` : "",
    resource.department ? `🏛 Department: ${resource.department}` : "",
    resource.semester ? `📅 Semester: ${resource.semester}` : "",
    resource.resourceType ? `📋 Type: ${resource.resourceType}` : "",
    resource.yearBatch ? `📆 Year/Batch: ${resource.yearBatch}` : "",
    resource.tags?.length ? `🏷 Tags: ${resource.tags.join(", ")}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  return parts;
}

export async function POST(request) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a moment." },
        { status: 429 }
      );
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "AI service not configured" },
        { status: 503 }
      );
    }

    await dbConnect();

    const body = await request.json();
    const { resourceId, mode, question } = body;

    if (!resourceId) {
      return NextResponse.json(
        { error: "resourceId is required" },
        { status: 400 }
      );
    }

    if (!mode || !MODES[mode]) {
      return NextResponse.json(
        { error: "Invalid study mode" },
        { status: 400 }
      );
    }

    const resource = await Resource.findById(resourceId).populate(
      "uploadedBy",
      "name college department"
    );
    if (!resource) {
      return NextResponse.json(
        { error: "Resource not found" },
        { status: 404 }
      );
    }

    const resourceContext = buildResourceContext(resource);
    const systemPrompt = MODES[mode].prompt;

    let userMessage = `Here is the academic resource I'm studying:\n\n${resourceContext}`;

    // For chat mode, append the user's question
    if (mode === "chat" && question) {
      userMessage += `\n\nMy question: ${question}`;
    }

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage },
          ],
          temperature: 0.6,
          max_tokens: 2048,
        }),
      }
    );

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      console.error(
        "Groq Study AI error:",
        response.status,
        errData?.error?.message || "Unknown"
      );
      return NextResponse.json(
        { error: "AI request failed. Please try again." },
        { status: 502 }
      );
    }

    const data = await response.json();
    const answer =
      data.choices?.[0]?.message?.content || "No response from AI.";

    return NextResponse.json({
      answer,
      mode,
      resourceTitle: resource.title,
    });
  } catch (err) {
    console.error("Study AI error:", err.message);
    return NextResponse.json(
      { error: "Failed to process study request" },
      { status: 500 }
    );
  }
}
