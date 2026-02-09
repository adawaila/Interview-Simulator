"use client";

import { useState } from "react";
import Editor from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Play, Loader2, Check, X } from "lucide-react";
import { useInterviewStore } from "@/lib/store";

const LANGUAGES = [
  { value: "python", label: "Python" },
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++" },
];

const DEFAULT_CODE: Record<string, string> = {
  python: `# Écrivez votre solution ici
def solution():
    pass

# Testez votre code
print(solution())
`,
  javascript: `// Écrivez votre solution ici
function solution() {

}

// Testez votre code
console.log(solution());
`,
  typescript: `// Écrivez votre solution ici
function solution(): void {

}

// Testez votre code
console.log(solution());
`,
  java: `// Écrivez votre solution ici
public class Solution {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}
`,
  cpp: `// Écrivez votre solution ici
#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    return 0;
}
`,
};

interface ExecutionResult {
  success: boolean;
  output: string;
  error?: string;
  executionTime?: number;
}

export function CodeEditorPanel() {
  const { code, setCode, codeLanguage, setCodeLanguage, interviewId } =
    useInterviewStore();
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<ExecutionResult | null>(null);

  const handleLanguageChange = (value: string) => {
    setCodeLanguage(value);
    if (!code || code === DEFAULT_CODE[codeLanguage]) {
      setCode(DEFAULT_CODE[value] || "");
    }
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setResult(null);

    try {
      const response = await fetch("/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code || DEFAULT_CODE[codeLanguage],
          language: codeLanguage,
          interviewId,
        }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        output: "",
        error: "Erreur lors de l'exécution du code",
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background rounded-lg border">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b px-4 py-2">
        <Select value={codeLanguage} onValueChange={handleLanguageChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Langage" />
          </SelectTrigger>
          <SelectContent>
            {LANGUAGES.map((lang) => (
              <SelectItem key={lang.value} value={lang.value}>
                {lang.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button onClick={handleRunCode} disabled={isRunning} size="sm">
          {isRunning ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Exécution...
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Exécuter
            </>
          )}
        </Button>
      </div>

      {/* Editor */}
      <div className="flex-1 min-h-0">
        <Editor
          height="100%"
          language={codeLanguage}
          value={code || DEFAULT_CODE[codeLanguage]}
          onChange={(value) => setCode(value || "")}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: "on",
          }}
        />
      </div>

      {/* Output */}
      {result && (
        <div className="border-t">
          <div
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium ${
              result.success
                ? "bg-green-500/10 text-green-600"
                : "bg-red-500/10 text-red-600"
            }`}
          >
            {result.success ? (
              <Check className="h-4 w-4" />
            ) : (
              <X className="h-4 w-4" />
            )}
            {result.success ? "Exécution réussie" : "Erreur"}
            {result.executionTime && (
              <span className="text-xs opacity-70 ml-auto">
                {result.executionTime}ms
              </span>
            )}
          </div>
          <pre className="p-4 text-sm font-mono bg-muted/50 max-h-[150px] overflow-auto">
            {result.output || result.error || "Aucune sortie"}
          </pre>
        </div>
      )}
    </div>
  );
}
