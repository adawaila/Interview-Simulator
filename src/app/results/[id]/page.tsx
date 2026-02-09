"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, RotateCcw, Home } from "lucide-react";
import { ResultsPanel } from "@/components/interview/results-panel";
import { useInterviewStore, InterviewResult } from "@/lib/store";

export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();
  const interviewId = params.id as string;

  const { result: storedResult, reset } = useInterviewStore();
  const [result, setResult] = useState<InterviewResult | null>(storedResult);
  const [isLoading, setIsLoading] = useState(!storedResult);

  useEffect(() => {
    if (!storedResult && interviewId) {
      // Fetch result from database
      fetchResult();
    }
  }, [interviewId, storedResult]);

  const fetchResult = async () => {
    try {
      const response = await fetch(`/api/interview?id=${interviewId}`);
      if (!response.ok) throw new Error("Failed to fetch");

      const data = await response.json();
      if (data.result) {
        const parsedResult: InterviewResult = {
          overallScore: data.result.overallScore,
          communicationScore: data.result.communicationScore,
          technicalScore: data.result.technicalScore,
          problemSolvingScore: data.result.problemSolvingScore,
          strengths: JSON.parse(data.result.strengths),
          improvements: JSON.parse(data.result.improvements),
          timeManagement: data.result.timeManagement,
          nextTopics: JSON.parse(data.result.nextTopics),
        };
        setResult(parsedResult);
      }
    } catch (error) {
      console.error("Error fetching result:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewInterview = () => {
    reset();
    router.push("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Chargement des résultats...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg mb-4">Résultats non disponibles</p>
          <Button onClick={handleNewInterview}>
            <Home className="h-4 w-4 mr-2" />
            Retour à l'accueil
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => router.push("/history")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Historique
          </Button>
          <Button onClick={handleNewInterview}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Nouvelle Entrevue
          </Button>
        </div>
      </header>

      {/* Results Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <ResultsPanel result={result} />

        {/* Actions */}
        <div className="mt-8 flex justify-center gap-4">
          <Button variant="outline" onClick={() => router.push("/history")}>
            Voir l'historique
          </Button>
          <Button onClick={handleNewInterview}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Nouvelle Entrevue
          </Button>
        </div>
      </main>
    </div>
  );
}
