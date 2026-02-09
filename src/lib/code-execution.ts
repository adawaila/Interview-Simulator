// Piston API for code execution (free, no API key needed)

const PISTON_API = process.env.PISTON_API_URL || "https://emkc.org/api/v2/piston";

interface ExecutionResult {
  success: boolean;
  output: string;
  error?: string;
  executionTime?: number;
}

const LANGUAGE_MAP: Record<string, { language: string; version: string }> = {
  python: { language: "python", version: "3.10" },
  javascript: { language: "javascript", version: "18.15" },
  java: { language: "java", version: "15.0" },
  cpp: { language: "cpp", version: "10.2" },
  typescript: { language: "typescript", version: "5.0" },
};

export async function executeCode(
  code: string,
  language: string,
  stdin?: string
): Promise<ExecutionResult> {
  const langConfig = LANGUAGE_MAP[language.toLowerCase()];

  if (!langConfig) {
    return {
      success: false,
      output: "",
      error: `Language '${language}' not supported. Available: ${Object.keys(LANGUAGE_MAP).join(", ")}`,
    };
  }

  try {
    const startTime = Date.now();

    const response = await fetch(`${PISTON_API}/execute`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        language: langConfig.language,
        version: langConfig.version,
        files: [
          {
            content: code,
          },
        ],
        stdin: stdin || "",
        run_timeout: 10000, // 10 seconds max
      }),
    });

    const executionTime = Date.now() - startTime;

    if (!response.ok) {
      throw new Error(`Piston API error: ${response.status}`);
    }

    const result = await response.json();

    if (result.run) {
      const hasError = result.run.stderr && result.run.stderr.trim() !== "";
      return {
        success: !hasError && result.run.code === 0,
        output: result.run.stdout || "",
        error: result.run.stderr || undefined,
        executionTime,
      };
    }

    if (result.compile && result.compile.code !== 0) {
      return {
        success: false,
        output: "",
        error: result.compile.stderr || "Compilation error",
        executionTime,
      };
    }

    return {
      success: false,
      output: "",
      error: "Unexpected response from code execution service",
      executionTime,
    };
  } catch (error) {
    return {
      success: false,
      output: "",
      error: error instanceof Error ? error.message : "Failed to execute code",
    };
  }
}

export async function getAvailableLanguages(): Promise<string[]> {
  try {
    const response = await fetch(`${PISTON_API}/runtimes`);
    if (!response.ok) throw new Error("Failed to fetch runtimes");

    const runtimes = await response.json();
    return runtimes.map((r: { language: string }) => r.language);
  } catch {
    return Object.keys(LANGUAGE_MAP);
  }
}
