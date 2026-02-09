import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const interview = await prisma.interview.create({
      data: {
        difficulty: body.difficulty,
        type: body.type,
        language: body.language,
        durationMinutes: body.durationMinutes,
        jobOfferText: body.jobOfferText || null,
        companyName: body.companyName || null,
        jobTitle: body.jobTitle || null,
        extractedSkills: body.extractedSkills
          ? JSON.stringify(body.extractedSkills)
          : null,
        status: "in_progress",
      },
    });

    return NextResponse.json({ id: interview.id });
  } catch (error) {
    console.error("Error creating interview:", error);
    return NextResponse.json(
      { error: "Failed to create interview" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (id) {
      const interview = await prisma.interview.findUnique({
        where: { id },
        include: {
          messages: { orderBy: { timestamp: "asc" } },
          result: true,
          codeSubmissions: true,
        },
      });

      if (!interview) {
        return NextResponse.json(
          { error: "Interview not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(interview);
    }

    // List all interviews
    const interviews = await prisma.interview.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        result: true,
      },
    });

    return NextResponse.json(interviews);
  } catch (error) {
    console.error("Error fetching interviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch interviews" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, endTime } = body;

    const interview = await prisma.interview.update({
      where: { id },
      data: {
        status,
        endTime: endTime ? new Date(endTime) : undefined,
      },
    });

    return NextResponse.json(interview);
  } catch (error) {
    console.error("Error updating interview:", error);
    return NextResponse.json(
      { error: "Failed to update interview" },
      { status: 500 }
    );
  }
}
