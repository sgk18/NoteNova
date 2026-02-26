import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import FlashcardProgress from "@/models/FlashcardProgress";
import Resource from "@/models/Resource";
import jwt from "jsonwebtoken";

function getUserId(request) {
  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  try {
    const decoded = jwt.verify(auth.split(" ")[1], process.env.JWT_SECRET);
    return decoded.userId || decoded.id;
  } catch {
    return null;
  }
}

// Interval multipliers per bucket (in minutes)
const INTERVALS = { new: 0, learning: 1, review: 10, mastered: 1440 };

function getNextReview(bucket) {
  const mins = INTERVALS[bucket] || 0;
  return new Date(Date.now() + mins * 60 * 1000);
}

// GET — fetch SRS progress for a resource (creates default if none)
export async function GET(request) {
  try {
    const userId = getUserId(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const resourceId = searchParams.get("resourceId");
    if (!resourceId) return NextResponse.json({ error: "resourceId required" }, { status: 400 });

    await dbConnect();

    let progress = await FlashcardProgress.findOne({ userId, resourceId });

    if (!progress) {
      // Seed from resource's smart notes flashcards
      const resource = await Resource.findById(resourceId);
      if (!resource) return NextResponse.json({ error: "Resource not found" }, { status: 404 });

      const flashcards = resource.smartNotes?.flashcards || [];
      if (flashcards.length === 0) {
        return NextResponse.json({ error: "No flashcards found. Generate Smart Notes first." }, { status: 400 });
      }

      const cards = flashcards.map((f, i) => ({
        cardIndex: i,
        question: f.question,
        answer: f.answer,
        bucket: "new",
        correctStreak: 0,
        lastReviewed: null,
        nextReview: new Date(),
      }));

      progress = await FlashcardProgress.create({
        userId,
        resourceId,
        cards,
        stats: { totalReviews: 0, correctCount: 0, wrongCount: 0 },
      });
    }

    return NextResponse.json({ progress });
  } catch (err) {
    console.error("SRS GET error:", err.message);
    return NextResponse.json({ error: "Failed to load SRS progress" }, { status: 500 });
  }
}

// POST — update a card after review
export async function POST(request) {
  try {
    const userId = getUserId(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { resourceId, cardIndex, result } = await request.json();

    if (!resourceId || cardIndex === undefined || !["correct", "wrong", "easy"].includes(result)) {
      return NextResponse.json({ error: "resourceId, cardIndex, and result (correct|wrong|easy) required" }, { status: 400 });
    }

    await dbConnect();

    const progress = await FlashcardProgress.findOne({ userId, resourceId });
    if (!progress) return NextResponse.json({ error: "No SRS session found" }, { status: 404 });

    const card = progress.cards.find(c => c.cardIndex === cardIndex);
    if (!card) return NextResponse.json({ error: "Card not found" }, { status: 404 });

    // Update stats
    progress.stats.totalReviews += 1;

    if (result === "wrong") {
      card.bucket = "learning";
      card.correctStreak = 0;
      progress.stats.wrongCount += 1;
    } else if (result === "easy") {
      card.bucket = "mastered";
      card.correctStreak += 1;
      progress.stats.correctCount += 1;
    } else {
      // correct — advance one bucket
      progress.stats.correctCount += 1;
      card.correctStreak += 1;
      if (card.bucket === "new" || card.bucket === "learning") card.bucket = "review";
      else if (card.bucket === "review") card.bucket = "mastered";
    }

    card.lastReviewed = new Date();
    card.nextReview = getNextReview(card.bucket);
    progress.updatedAt = new Date();

    await progress.save();

    return NextResponse.json({ progress });
  } catch (err) {
    console.error("SRS POST error:", err.message);
    return NextResponse.json({ error: "Failed to update SRS progress" }, { status: 500 });
  }
}
