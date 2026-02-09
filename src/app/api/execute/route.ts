import { NextRequest, NextResponse } from "next/server";
import { executeCode } from "@/lib/code-execution";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, language, interviewId, stdin } = body;

    if (!code || !language) {
      return NextResponse.json(
        { error: "Code and language are required" },
        { status: 400 }
      );
    }

    const result = await executeCode(code, language, stdin);

    // Save code submission if interviewId provided
    if (interviewId) {
      await prisma.codeSubmission.create({
        data: {
          interviewId,
          code,
          language,
          testResults: JSON.stringify(result),
          executionTime: result.executionTime,
        },
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Code execution error:", error);
    return NextResponse.json(
      { error: "Failed to execute code" },
      { status: 500 }
    );
  }
}
