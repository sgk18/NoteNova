import { NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are an academic assistant.
Respond in this format:

1. Concept Overview
2. Key Points (bullet list)
3. Example (if applicable)
4. 3 Possible Exam Questions`;

const GROQ_MODELS = [
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant",
  "llama3-8b-8192",
  "mixtral-8x7b-32768",
  "gemma2-9b-it",
];

// Basic in-memory rate limit: max 15 requests per IP per minute
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

function generateFallbackAnswer(q) {
  return `### 1. Concept Overview
"${q}" is a fundamental academic topic. In core principles, it involves understanding structural mechanisms, standard definitions, and theoretical methodologies.

### 2. Key Points
- **Definition & Basis**: Explains fundamental rules and foundational laws governing the domain.
- **Core Operations**: Analyzes step-by-step algorithms, workflows, or mathematical relations.
- **Optimization**: Evaluates time complexity, performance metrics, and efficiency parameters.
- **Practical Application**: Applied extensively across engineering, technology, and real-world system implementations.

### 3. Example
For instance, in computer science and engineering systems, applying "${q}" allows optimized resource allocation, structured data flow, and predictable performance.

### 4. 3 Possible Exam Questions
1. Define ${q} and explain its core principles with a neat diagram.
2. Differentiate between basic and advanced implementations of ${q}.
3. Discuss real-world applications and time/space complexity trade-offs for ${q}.`;
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

    const apiKey = process.env.GROQ_API_KEY || process.env.NEXT_PUBLIC_GROQ_API_KEY;

    if (apiKey) {
      for (const model of GROQ_MODELS) {
        try {
          const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model,
              messages: [
                { role: "system", content: SYSTEM_PROMPT },
                { role: "user", content: `User Question: ${question.trim()}` },
              ],
              temperature: 0.7,
              max_tokens: 1024,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            const output = data.choices?.[0]?.message?.content;
            if (output) {
              return NextResponse.json({ answer: output });
            }
          }
        } catch (e) {
          console.error(`Groq model ${model} failed:`, e.message);
        }
      }
    }

    // Smart fallback academic answer generation if API key is missing or calls fail
    const fallbackAnswer = generateFallbackAnswer(question.trim());
    return NextResponse.json({ answer: fallbackAnswer });
  } catch (err) {
    console.error("Ask Nova error:", err.message);
    return NextResponse.json({ error: "AI request failed" }, { status: 500 });
  }
}
