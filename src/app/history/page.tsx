"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Calendar,
  Clock,
  TrendingUp,
  Code,
  Layers,
  Users,
  Briefcase,
  ChevronRight,
  Loader2,
  Sparkles,
} from "lucide-react";

interface InterviewSummary {
  id: string;
  difficulty: string;
  type: string;
  durationMinutes: number;
  startTime: string;
  endTime: string | null;
  status: string;
  companyName: string | null;
  jobTitle: string | null;
  result: {
    overallScore: number;
  } | null;
}

const TYPE_ICONS: Record<string, React.ElementType> = {
  algorithms: Code,
  system_design: Layers,
  behavioral: Users,
  job_based: Briefcase,
};

const TYPE_LABELS: Record<string, string> = {
  algorithms: "Algorithmes",
  system_design: "System Design",
  behavioral: "Comportemental",
  job_based: "Basé sur Offre",
};

const DIFFICULTY_COLORS: Record<string, string> = {
  junior: "bg-green-500/10 text-green-600",
  intermediate: "bg-yellow-500/10 text-yellow-600",
  senior: "bg-red-500/10 text-red-600",
};

function getScoreColor(score: number): string {
  if (score >= 80) return "text-green-600";
  if (score >= 60) return "text-yellow-600";
  return "text-red-600";
}

export default function HistoryPage() {
  const router = useRouter();
  const [interviews, setInterviews] = useState<InterviewSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchInterviews();
  }, []);

  const fetchInterviews = async () => {
    try {
      const response = await fetch("/api/interview");
      if (!response.ok) throw new Error("Failed to fetch");

      const data = await response.json();
      setInterviews(data);
    } catch (error) {
      console.error("Error fetching interviews:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const completedInterviews = interviews.filter((i) => i.status === "completed");
  const avgScore = completedInterviews.length > 0
    ? Math.round(
        completedInterviews.reduce(
          (acc, i) => acc + (i.result?.overallScore || 0),
          0
        ) / completedInterviews.length
      )
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push("/")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Accueil
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="font-semibold">Historique</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-primary">
                {interviews.length}
              </div>
              <div className="text-sm text-muted-foreground">Entrevues Total</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-primary">
                {completedInterviews.length}
              </div>
              <div className="text-sm text-muted-foreground">Complétées</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className={`text-3xl font-bold ${getScoreColor(avgScore)}`}>
                {avgScore}%
              </div>
              <div className="text-sm text-muted-foreground">Score Moyen</div>
            </CardContent>
          </Card>
        </div>

        {/* Interview List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Toutes les Entrevues
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : interviews.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  Aucune entrevue encore. Commence ta première!
                </p>
                <Button onClick={() => router.push("/")}>
                  Nouvelle Entrevue
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {interviews.map((interview) => {
                  const Icon = TYPE_ICONS[interview.type] || Code;
                  const typeLabel = TYPE_LABELS[interview.type] || interview.type;
                  const difficultyColor =
                    DIFFICULTY_COLORS[interview.difficulty] || "";

                  return (
                    <button
                      key={interview.id}
                      onClick={() =>
                        interview.status === "completed"
                          ? router.push(`/results/${interview.id}`)
                          : router.push(`/interview/${interview.id}`)
                      }
                      className="w-full p-4 rounded-lg border hover:border-primary/50 transition-all flex items-center gap-4 text-left"
                    >
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium truncate">
                            {interview.companyName || typeLabel}
                          </span>
                          {interview.jobTitle && (
                            <span className="text-sm text-muted-foreground truncate">
                              - {interview.jobTitle}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {new Date(interview.startTime).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                          <Clock className="h-3 w-3 ml-2" />
                          {interview.durationMinutes} min
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Badge
                          variant="outline"
                          className={difficultyColor}
                        >
                          {interview.difficulty}
                        </Badge>

                        {interview.status === "completed" && interview.result ? (
                          <div
                            className={`text-lg font-bold ${getScoreColor(
                              interview.result.overallScore
                            )}`}
                          >
                            {interview.result.overallScore}%
                          </div>
                        ) : (
                          <Badge variant="secondary">En cours</Badge>
                        )}

                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
