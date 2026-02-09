import { NextRequest } from "next/server";
import { groq, DEFAULT_MODEL } from "@/lib/groq";
import { getInterviewerPrompt, InterviewConfig } from "@/lib/prompts";
import { prisma } from "@/lib/db";
import { getInterviewerById, getInterviewerPrompt as getPersonaPrompt } from "@/lib/interviewers";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { interviewId, messages, settings } = body;

    // Get interviewer persona if video mode
    let interviewerPersona: string | undefined;
    if (settings.videoMode && settings.interviewerId) {
      const interviewer = getInterviewerById(settings.interviewerId);
      if (interviewer) {
        interviewerPersona = getPersonaPrompt(interviewer);
      }
    }

    const config: InterviewConfig = {
      difficulty: settings.difficulty,
      type: settings.type,
      language: settings.language,
      durationMinutes: settings.durationMinutes,
      companyName: settings.companyName,
      jobTitle: settings.jobTitle,
      extractedSkills: settings.extractedSkills,
      jobOfferText: settings.jobOfferText,
      interviewerPersona,
    };

    const systemPrompt = getInterviewerPrompt(config);

    // Format messages for Groq API
    const formattedMessages = [
      { role: "system" as const, content: systemPrompt },
      ...messages.map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    ];

    // Create streaming response
    const stream = await groq.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: formattedMessages,
      temperature: 0.7,
      max_tokens: 1024,
      stream: true,
    });

    // Create a ReadableStream for SSE
    const encoder = new TextEncoder();
    let fullResponse = "";

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || "";
            if (content) {
              fullResponse += content;
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ content })}\n\n`)
              );
            }
          }

          // Save message to database
          if (interviewId && fullResponse) {
            await prisma.message.create({
              data: {
                interviewId,
                role: "assistant",
                content: fullResponse,
              },
            });
          }

          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (error) {
          console.error("Stream error:", error);
          controller.error(error);
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to get response" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

// Save user message
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { interviewId, content } = body;

    const message = await prisma.message.create({
      data: {
        interviewId,
        role: "user",
        content,
      },
    });

    return new Response(JSON.stringify(message), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error saving message:", error);
    return new Response(
      JSON.stringify({ error: "Failed to save message" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
