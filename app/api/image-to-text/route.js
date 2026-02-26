import Bytez from "bytez.js";

const sdk = new Bytez(process.env.BYTEZ_API_KEY);

export async function POST(req) {
  try {
    const { imageUrl } = await req.json();

    if (!imageUrl) {
      return Response.json({ error: "Image URL is required" }, { status: 400 });
    }
    
    // Choose THAI-BLIP-2 model
    const model = sdk.model("kkatiz/THAI-BLIP-2");

    // Send the input to the Bytez model
    const { error, output } = await model.run(imageUrl);

    // Handle API errors from Bytez
    if (error) {
      console.error("Bytez API Error:", error);
      return Response.json({ error: "Failed to generate text from image" }, { status: 500 });
    }

    // Return the successful output
    return Response.json({ data: output });

  } catch (err) {
    console.error("Server Error:", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
