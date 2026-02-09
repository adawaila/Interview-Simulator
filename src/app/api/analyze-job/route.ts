import { NextRequest, NextResponse } from "next/server";
import { groq, DEFAULT_MODEL } from "@/lib/groq";
import { getJobOfferAnalysisPrompt } from "@/lib/prompts";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { jobOfferText } = body;

    if (!jobOfferText || jobOfferText.trim().length < 50) {
      return NextResponse.json(
        { error: "Veuillez fournir une offre d'emploi valide (minimum 50 caractères)" },
        { status: 400 }
      );
    }

    const prompt = getJobOfferAnalysisPrompt(jobOfferText);

    const response = await groq.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
      max_tokens: 1024,
    });

    const content = response.choices[0]?.message?.content || "";

    // Parse JSON response
    let result;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse job analysis:", parseError);
      return NextResponse.json(
        { error: "Failed to analyze job offer" },
        { status: 500 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Job analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze job offer" },
      { status: 500 }
    );
  }
}
