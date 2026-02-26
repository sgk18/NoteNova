import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Resource from "@/models/Resource";

const SMART_NOTES_PROMPT = `You are an academic AI assistant. Analyze the following academic content and return STRICT JSON with NO markdown, NO extra commentary, just valid JSON.

Return this exact structure:
{
  "summary": "A 3-5 sentence overview of the content",
  "keyConcepts": ["concept1", "concept2", "concept3", "concept4", "concept5"],
  "flashcards": [
    { "question": "Q1", "answer": "A1" },
    { "question": "Q2", "answer": "A2" },
    { "question": "Q3", "answer": "A3" },
    { "question": "Q4", "answer": "A4" },
    { "question": "Q5", "answer": "A5" }
  ],
  "mcqs": [
    { "question": "Q1", "options": ["A", "B", "C", "D"], "answer": "A" },
    { "question": "Q2", "options": ["A", "B", "C", "D"], "answer": "B" },
    { "question": "Q3", "options": ["A", "B", "C", "D"], "answer": "C" }
  ],
  "examQuestions": ["Question 1?", "Question 2?", "Question 3?", "Question 4?", "Question 5?"],
  "mindMap": [
    { "topic": "Main Topic", "subtopics": ["Sub 1", "Sub 2", "Sub 3"] },
    { "topic": "Another Topic", "subtopics": ["Sub A", "Sub B"] }
  ]
}

IMPORTANT: Return ONLY the JSON object. No \`\`\`json blocks. No explanation. Pure JSON.`;

export async function POST(request) {
  try {
    await dbConnect();

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "AI service not configured" }, { status: 503 });
    }

    const body = await request.json();
    const { resourceId, regenerate } = body;

    if (!resourceId) {
      return NextResponse.json({ error: "resourceId is required" }, { status: 400 });
    }

    const resource = await Resource.findById(resourceId);
    if (!resource) {
      return NextResponse.json({ error: "Resource not found" }, { status: 404 });
    }

    // Return cached notes if available and not regenerating
    if (resource.smartNotes && !regenerate) {
      return NextResponse.json({ smartNotes: resource.smartNotes, cached: true });
    }

    // Build content from resource metadata
    const contentParts = [
      `Title: ${resource.title}`,
      resource.description ? `Description: ${resource.description}` : "",
      resource.subject ? `Subject: ${resource.subject}` : "",
      resource.department ? `Department: ${resource.department}` : "",
      resource.semester ? `Semester: ${resource.semester}` : "",
      resource.resourceType ? `Type: ${resource.resourceType}` : "",
      resource.tags?.length ? `Tags: ${resource.tags.join(", ")}` : "",
    ].filter(Boolean).join("\n");

    // Limit text to 8000 chars
    const trimmedContent = contentParts.slice(0, 8000);

    // Call Groq API
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: SMART_NOTES_PROMPT },
          { role: "user", content: `Generate comprehensive smart notes for the following academic resource:\n\n${trimmedContent}` },
        ],
        temperature: 0.5,
        max_tokens: 2048,
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      console.error("Groq Smart Notes error:", response.status, errData?.error?.message || "Unknown");
      return NextResponse.json({ error: "AI generation failed" }, { status: 502 });
    }

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content || "";

    // Parse JSON from response
    let smartNotes;
    try {
      // Try direct parse first
      smartNotes = JSON.parse(raw);
    } catch {
      // Try extracting JSON from response
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          smartNotes = JSON.parse(jsonMatch[0]);
        } catch {
          console.error("Failed to parse extracted JSON:", raw.slice(0, 200));
          return NextResponse.json({ error: "AI returned invalid format. Please try again." }, { status: 502 });
        }
      } else {
        console.error("No JSON found in response:", raw.slice(0, 200));
        return NextResponse.json({ error: "AI returned invalid format. Please try again." }, { status: 502 });
      }
    }

    // Validate structure
    const valid = smartNotes.summary && Array.isArray(smartNotes.keyConcepts);
    if (!valid) {
      return NextResponse.json({ error: "AI returned incomplete data. Please try again." }, { status: 502 });
    }

    // Cache in database
    await Resource.findByIdAndUpdate(resourceId, { smartNotes });

    return NextResponse.json({ smartNotes, cached: false });
  } catch (err) {
    console.error("Smart Notes error:", err.message);
    return NextResponse.json({ error: "Failed to generate smart notes" }, { status: 500 });
  }
}
