import Bytez from "bytez.js";

const sdk = new Bytez(process.env.BYTEZ_API_KEY);

export async function POST(req) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return Response.json({ error: "Prompt is required" }, { status: 400 });
    }
    
    // Choose musicgen-stereo-melody model
    const model = sdk.model("facebook/musicgen-stereo-melody");

    // Send the input to the Bytez model
    const { error, output } = await model.run(prompt);

    // Handle API errors from Bytez
    if (error) {
      console.error("Bytez API Error:", error);
      return Response.json({ error: "Failed to generate audio overview" }, { status: 500 });
    }

    // Return the successful output
    return Response.json({ data: output });

  } catch (err) {
    console.error("Server Error:", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
