"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  TrendingUp,
  MessageSquare,
  Code,
  Brain,
  Clock,
  BookOpen,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { InterviewResult } from "@/lib/store";

interface ResultsPanelProps {
  result: InterviewResult;
}

function ScoreCircle({ score, label }: { score: number; label: string }) {
  const getColor = (s: number) => {
    if (s >= 80) return "text-green-500";
    if (s >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div className="flex flex-col items-center">
      <div
        className={`relative w-24 h-24 rounded-full border-4 ${getColor(
          score
        )} border-current flex items-center justify-center`}
      >
        <span className={`text-2xl font-bold ${getColor(score)}`}>{score}</span>
      </div>
      <span className="text-sm text-muted-foreground mt-2">{label}</span>
    </div>
  );
}

function ScoreBar({
  score,
  label,
  icon: Icon,
}: {
  score: number;
  label: string;
  icon: React.ElementType;
}) {
  const getColor = (s: number) => {
    if (s >= 80) return "bg-green-500";
    if (s >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">{label}</span>
        </div>
        <span className="text-sm font-bold">{score}/100</span>
      </div>
      <div className="h-2 bg-secondary rounded-full overflow-hidden">
        <div
          className={`h-full ${getColor(score)} transition-all duration-500`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

export function ResultsPanel({ result }: ResultsPanelProps) {
  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Résultat de l'Entrevue</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center">
          <ScoreCircle score={result.overallScore} label="Score Global" />
        </CardContent>
      </Card>

      {/* Detailed Scores */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Scores Détaillés
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ScoreBar
            score={result.communicationScore}
            label="Communication"
            icon={MessageSquare}
          />
          <ScoreBar
            score={result.technicalScore}
            label="Technique"
            icon={Code}
          />
          <ScoreBar
            score={result.problemSolvingScore}
            label="Résolution de Problèmes"
            icon={Brain}
          />
        </CardContent>
      </Card>

      {/* Strengths & Improvements */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="h-5 w-5" />
              Points Forts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {result.strengths.map((strength, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <Badge variant="outline" className="bg-green-500/10 text-green-600 shrink-0">
                    +
                  </Badge>
                  {strength}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-600">
              <AlertCircle className="h-5 w-5" />
              Axes d'Amélioration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {result.improvements.map((improvement, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <Badge variant="outline" className="bg-orange-500/10 text-orange-600 shrink-0">
                    !
                  </Badge>
                  {improvement}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Time Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Gestion du Temps
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{result.timeManagement}</p>
        </CardContent>
      </Card>

      {/* Next Topics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Prochains Sujets à Étudier
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {result.nextTopics.map((topic, i) => (
              <Badge key={i} variant="secondary">
                {topic}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
