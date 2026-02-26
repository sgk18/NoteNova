import { NextResponse } from "next/server";
import Bytez from "bytez.js";

export async function POST(request) {
  try {
    const apiKey = process.env.BYTEZ_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "AI service not configured" }, { status: 503 });

    const { questions, answers, timeTaken } = await request.json();

    if (!questions || !answers) {
      return NextResponse.json({ error: "questions and answers required" }, { status: 400 });
    }

    const sdk = new Bytez(apiKey);
    const breakdown = [];
    let totalScore = 0;
    let totalPoints = 0;

    for (const q of questions) {
      const userAnswer = answers[q.id] || "";
      const points = q.points || 5;
      totalPoints += points;

      let isCorrect = false;
      let earned = 0;

      if (q.type === "mcq" || q.type === "trueFalse") {
        // Exact match (case-insensitive)
        isCorrect = userAnswer.toLowerCase().trim() === q.correctAnswer.toLowerCase().trim();
        earned = isCorrect ? points : 0;
      } else if (q.type === "shortAnswer") {
        // Simple keyword matching for short answers
        if (!userAnswer.trim()) {
          earned = 0;
          isCorrect = false;
        } else {
          // Check if user answer contains key words from correct answer
          const correctWords = q.correctAnswer.toLowerCase().split(/\s+/).filter(w => w.length > 3);
          const userWords = userAnswer.toLowerCase().split(/\s+/);
          const matchCount = correctWords.filter(w => userWords.some(uw => uw.includes(w) || w.includes(uw))).length;
          const matchRatio = correctWords.length > 0 ? matchCount / correctWords.length : 0;

          if (matchRatio >= 0.6) {
            earned = points;
            isCorrect = true;
          } else if (matchRatio >= 0.3) {
            earned = Math.round(points * 0.5);
            isCorrect = false; // partial
          } else {
            earned = 0;
            isCorrect = false;
          }
        }
      }

      totalScore += earned;
      breakdown.push({
        id: q.id,
        question: q.question,
        type: q.type,
        userAnswer,
        correctAnswer: q.correctAnswer,
        isCorrect,
        earned,
        points,
      });
    }

    const percentage = totalPoints > 0 ? Math.round((totalScore / totalPoints) * 100) : 0;
    let grade = "F";
    if (percentage >= 90) grade = "A+";
    else if (percentage >= 80) grade = "A";
    else if (percentage >= 70) grade = "B";
    else if (percentage >= 60) grade = "C";
    else if (percentage >= 50) grade = "D";

    // Generate a celebratory image
    let scoreImage = null;
    try {
      const imgModel = sdk.model("stabilityai/stable-diffusion-xl-base-1.0");
      const imgPrompt = percentage >= 70
        ? "A beautiful golden trophy with confetti and sparkles on a dark gradient background, celebration, achievement, digital art, clean"
        : "A motivational sunrise over mountains with 'Keep Going' energy, digital art, inspirational, clean background";

      const imgResult = await imgModel.run(imgPrompt);
      if (imgResult.output && !imgResult.error) {
        // output is typically a Buffer or base64
        if (Buffer.isBuffer(imgResult.output)) {
          scoreImage = `data:image/png;base64,${imgResult.output.toString("base64")}`;
        } else if (typeof imgResult.output === "string") {
          scoreImage = imgResult.output.startsWith("data:") ? imgResult.output : `data:image/png;base64,${imgResult.output}`;
        }
      }
    } catch (imgErr) {
      console.error("Score image generation failed (non-critical):", imgErr.message);
      // Not critical — proceed without image
    }

    return NextResponse.json({
      score: totalScore,
      total: totalPoints,
      percentage,
      grade,
      timeTaken,
      breakdown,
      scoreImage,
    });
  } catch (err) {
    console.error("Mock exam grade error:", err.message);
    return NextResponse.json({ error: "Failed to grade exam" }, { status: 500 });
  }
}
