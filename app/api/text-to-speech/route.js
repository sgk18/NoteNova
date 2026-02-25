import Bytez from "bytez.js";

const sdk = new Bytez(process.env.BYTEZ_API_KEY);

export async function POST(req) {
  try {
    const { text } = await req.json();

    if (!text) {
      return Response.json({ error: "Text is required" }, { status: 400 });
    }
    
    // Choose facebook/mms-tts-eng model
    const model = sdk.model("facebook/mms-tts-eng");

    // Send the input to the Bytez model
    const { error, output } = await model.run(text);

    // Handle API errors from Bytez
    if (error) {
      console.error("Bytez API Error:", error);
      return Response.json({ error: "Failed to generate text-to-speech audio" }, { status: 500 });
    }

    // Return the successful output
    return Response.json({ data: output });

  } catch (err) {
    console.error("Server Error:", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
