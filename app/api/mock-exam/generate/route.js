import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Resource from "@/models/Resource";
import Bytez from "bytez.js";

const EXAM_PROMPT = `You are an expert academic exam generator. Generate a mock exam from the resource described below.

STRICT RULES:
- Generate exactly 20 questions total
- 12 Multiple Choice Questions (4 options each, one correct)
- 4 True/False questions
- 4 Short Answer questions (2-3 sentences expected)
- Vary difficulty: 6 easy (3 pts each), 8 medium (4 pts each), 6 hard (6 pts each) = 86 pts base, adjust to total 100
- Each question must have: id, type, question, difficulty, points
- MCQ must have: options (array of 4), correctAnswer (the correct option text)
- TrueFalse must have: correctAnswer ("True" or "False")
- ShortAnswer must have: correctAnswer (model answer)

Return ONLY valid JSON, no markdown, no explanation:
{
  "title": "Mock Exam: [Subject]",
  "totalPoints": 100,
  "duration": 30,
  "questions": [
    { "id": 1, "type": "mcq", "question": "...", "options": ["A","B","C","D"], "correctAnswer": "A", "difficulty": "easy", "points": 5 },
    { "id": 2, "type": "trueFalse", "question": "...", "correctAnswer": "True", "difficulty": "medium", "points": 5 },
    { "id": 3, "type": "shortAnswer", "question": "...", "correctAnswer": "...", "difficulty": "hard", "points": 5 }
  ]
}`;

export async function POST(request) {
  try {
    const apiKey = process.env.BYTEZ_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "AI service not configured" }, { status: 503 });

    await dbConnect();
    const { resourceId } = await request.json();

    if (!resourceId) return NextResponse.json({ error: "resourceId required" }, { status: 400 });

    const resource = await Resource.findById(resourceId);
    if (!resource) return NextResponse.json({ error: "Resource not found" }, { status: 404 });

    const context = [
      `Title: ${resource.title}`,
      resource.description ? `Description: ${resource.description}` : "",
      resource.subject ? `Subject: ${resource.subject}` : "",
      resource.department ? `Department: ${resource.department}` : "",
      resource.semester ? `Semester: ${resource.semester}` : "",
      resource.resourceType ? `Type: ${resource.resourceType}` : "",
      resource.tags?.length ? `Tags: ${resource.tags.join(", ")}` : "",
    ].filter(Boolean).join("\n");

    const sdk = new Bytez(apiKey);
    const model = sdk.model("meta-llama/Meta-Llama-3-8B");

    const prompt = `${EXAM_PROMPT}\n\nResource:\n${context}\n\nGenerate the exam JSON:`;
    const { error, output } = await model.run(prompt);

    if (error) {
      console.error("Bytez exam generation error:", error);
      return NextResponse.json({ error: "AI generation failed" }, { status: 502 });
    }

    // Extract JSON from output
    let examData;
    const raw = typeof output === "string" ? output : JSON.stringify(output);

    try {
      examData = JSON.parse(raw);
    } catch {
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          examData = JSON.parse(jsonMatch[0]);
        } catch {
          console.error("Failed to parse exam JSON:", raw.slice(0, 300));
          return NextResponse.json({ error: "AI returned invalid format. Please try again." }, { status: 502 });
        }
      } else {
        // Fallback: generate a basic exam from smart notes
        examData = generateFallbackExam(resource);
      }
    }

    // Validate & fix structure
    if (!examData.questions || !Array.isArray(examData.questions)) {
      examData = generateFallbackExam(resource);
    }

    examData.totalPoints = examData.questions.reduce((sum, q) => sum + (q.points || 5), 0);
    examData.duration = 30;
    examData.title = examData.title || `Mock Exam: ${resource.subject || resource.title}`;

    return NextResponse.json({ exam: examData });
  } catch (err) {
    console.error("Mock exam generate error:", err.message);
    return NextResponse.json({ error: "Failed to generate exam" }, { status: 500 });
  }
}

function generateFallbackExam(resource) {
  const smartNotes = resource.smartNotes;
  const questions = [];
  let id = 1;

  // Use MCQs from smart notes
  if (smartNotes?.mcqs) {
    for (const mcq of smartNotes.mcqs.slice(0, 12)) {
      questions.push({
        id: id++,
        type: "mcq",
        question: mcq.question,
        options: mcq.options,
        correctAnswer: mcq.answer,
        difficulty: "medium",
        points: 5,
      });
    }
  }

  // Use flashcards as true/false
  if (smartNotes?.flashcards) {
    for (const fc of smartNotes.flashcards.slice(0, 4)) {
      questions.push({
        id: id++,
        type: "trueFalse",
        question: `${fc.question} — The answer is: ${fc.answer}`,
        correctAnswer: "True",
        difficulty: "easy",
        points: 5,
      });
    }
  }

  // Use exam questions as short answer
  if (smartNotes?.examQuestions) {
    for (const eq of smartNotes.examQuestions.slice(0, 4)) {
      questions.push({
        id: id++,
        type: "shortAnswer",
        question: eq,
        correctAnswer: "Refer to course material for a detailed answer.",
        difficulty: "hard",
        points: 5,
      });
    }
  }

  return {
    title: `Mock Exam: ${resource.subject || resource.title}`,
    totalPoints: questions.reduce((sum, q) => sum + q.points, 0),
    duration: 30,
    questions,
  };
}
