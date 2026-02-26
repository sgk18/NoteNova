import Bytez from "bytez.js";

const sdk = new Bytez(process.env.BYTEZ_API_KEY);

export async function POST(req) {
  try {
    const { content, type } = await req.json();
    
    // Select the Llama 3 8B Instruct model
    const model = sdk.model("meta-llama/Meta-Llama-3-8B-Instruct");

    // The system prompt adapted for Llama 3
    const prompt = `You are an advanced academic assistant for NoteNova. Your task is to process the provided study material and generate specific educational resources.

Requirements:
1. Notes: Provide a structured summary with headings, bullet points, and a 'Key Takeaway' section. Use Markdown.
2. Flashcards: Provide a JSON array of objects with 'front' (question/term) and 'back' (answer/definition) keys.
3. Exam Questions: Generate 5 high-level conceptual questions (Short & Long Answer) suitable for university-level testing.
4. Quiz: Provide 5 Multiple Choice Questions (MCQs) in a JSON format including 'question', 'options' (array), and 'correctAnswer'.
5. Tone: Academic, concise, and helpful. Do not include conversational filler.

Based on this text: "${content}"
Task: Generate ${type} only. Format strictly as ${type === 'Notes' ? 'Markdown' : 'JSON'}.`;

    // Send the input to the Bytez model
    const { error, output } = await model.run(prompt);

    // Handle API errors from Bytez
    if (error) {
      console.error("Bytez API Error:", error);
      return Response.json({ error: "Failed to generate content from Bytez" }, { status: 500 });
    }

    // Return the successful output to your frontend
    return Response.json({ data: output });

  } catch (err) {
    console.error("Server Error:", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
