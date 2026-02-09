import { NextRequest, NextResponse } from "next/server";
import { groq, DEFAULT_MODEL } from "@/lib/groq";
import { getEvaluationPrompt, InterviewConfig } from "@/lib/prompts";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { interviewId, settings, messages, codeSubmissions } = body;

    const config: InterviewConfig = {
      difficulty: settings.difficulty,
      type: settings.type,
      language: settings.language,
      durationMinutes: settings.durationMinutes,
    };

    // Format conversation history
    const conversationHistory = messages
      .map(
        (m: { role: string; content: string }) =>
          `${m.role.toUpperCase()}: ${m.content}`
      )
      .join("\n\n");

    // Format code submissions if any
    const codeText = codeSubmissions
      ?.map(
        (c: { language: string; code: string }, i: number) =>
          `Soumission ${i + 1} (${c.language}):\n${c.code}`
      )
      .join("\n\n---\n\n");

    const evaluationPrompt = getEvaluationPrompt(
      config,
      conversationHistory,
      codeText
    );

    const response = await groq.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [{ role: "user", content: evaluationPrompt }],
      temperature: 0.3,
      max_tokens: 2048,
    });

    const content = response.choices[0]?.message?.content || "";

    // Parse JSON response
    let result;
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse evaluation:", parseError);
      // Fallback result
      result = {
        overallScore: 50,
        communicationScore: 50,
        technicalScore: 50,
        problemSolvingScore: 50,
        strengths: ["Participation à l'entrevue"],
        improvements: ["Continuer à pratiquer"],
        timeManagement: "Non évalué",
        nextTopics: ["Algorithmes de base"],
      };
    }

    // Save to database
    if (interviewId) {
      await prisma.interviewResult.create({
        data: {
          interviewId,
          overallScore: result.overallScore,
          communicationScore: result.communicationScore,
          technicalScore: result.technicalScore,
          problemSolvingScore: result.problemSolvingScore,
          strengths: JSON.stringify(result.strengths),
          improvements: JSON.stringify(result.improvements),
          timeManagement: result.timeManagement,
          nextTopics: JSON.stringify(result.nextTopics),
        },
      });

      // Update interview status
      await prisma.interview.update({
        where: { id: interviewId },
        data: {
          status: "completed",
          endTime: new Date(),
        },
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Evaluation error:", error);
    return NextResponse.json(
      { error: "Failed to evaluate interview" },
      { status: 500 }
    );
  }
}
