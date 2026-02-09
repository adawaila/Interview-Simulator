import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { text, voiceId = "fr-FR-DeniseNeural" } = await request.json();

    if (!text || text.length === 0) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    // Limit text length to prevent abuse
    const truncatedText = text.slice(0, 2000);

    // Create new TTS instance for each request
    const tts = new MsEdgeTTS();
    await tts.setMetadata(voiceId, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);

    // toStream returns { audioStream, metadataStream, requestId }
    const { audioStream } = tts.toStream(truncatedText);

    // Collect audio chunks using async iterator
    const chunks: Buffer[] = [];
    for await (const chunk of audioStream) {
      chunks.push(chunk);
    }

    const audioBuffer = Buffer.concat(chunks);
    const base64Audio = audioBuffer.toString("base64");

    return NextResponse.json({
      audio: base64Audio,
      format: "mp3",
    });
  } catch (error) {
    console.error("TTS API Error:", error);
    return NextResponse.json(
      { error: "Failed to generate speech" },
      { status: 500 }
    );
  }
}

// Get available voices
export async function GET() {
  const voices = [
    { id: "fr-FR-DeniseNeural", name: "Denise (Femme)", language: "fr-FR" },
    { id: "fr-FR-HenriNeural", name: "Henri (Homme)", language: "fr-FR" },
    { id: "fr-FR-EloiseNeural", name: "Eloise (Femme)", language: "fr-FR" },
    { id: "fr-CA-SylvieNeural", name: "Sylvie (Femme, Québec)", language: "fr-CA" },
    { id: "fr-CA-JeanNeural", name: "Jean (Homme, Québec)", language: "fr-CA" },
    { id: "en-US-JennyNeural", name: "Jenny (Female, US)", language: "en-US" },
    { id: "en-US-GuyNeural", name: "Guy (Male, US)", language: "en-US" },
    { id: "en-GB-SoniaNeural", name: "Sonia (Female, UK)", language: "en-GB" },
  ];

  return NextResponse.json({ voices });
}
