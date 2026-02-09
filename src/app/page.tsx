"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Code,
  Layers,
  Users,
  Briefcase,
  Clock,
  Zap,
  ArrowRight,
  Loader2,
  History,
  Sparkles,
  Video,
  MessageSquare,
} from "lucide-react";
import { useInterviewStore } from "@/lib/store";
import { INTERVIEWERS } from "@/lib/interviewers";

const INTERVIEW_TYPES = [
  {
    value: "algorithms",
    label: "Algorithmes",
    description: "Arrays, trees, graphs, DP...",
    icon: Code,
  },
  {
    value: "system_design",
    label: "System Design",
    description: "Architecture, scalabilité...",
    icon: Layers,
  },
  {
    value: "behavioral",
    label: "Comportemental",
    description: "Soft skills, leadership...",
    icon: Users,
  },
  {
    value: "job_based",
    label: "Basé sur Offre",
    description: "Colle ton offre d'emploi",
    icon: Briefcase,
  },
];

const DIFFICULTY_LEVELS = [
  { value: "junior", label: "Junior", description: "Stage / Nouveau diplômé" },
  { value: "intermediate", label: "Intermédiaire", description: "1-3 ans d'exp." },
  { value: "senior", label: "Senior", description: "5+ ans d'exp." },
];

const DURATIONS = [
  { value: 30, label: "30 min", description: "Rapide" },
  { value: 45, label: "45 min", description: "Standard" },
  { value: 60, label: "60 min", description: "Complet" },
];

export default function HomePage() {
  const router = useRouter();
  const { setSettings } = useInterviewStore();

  const [type, setType] = useState<string>("algorithms");
  const [difficulty, setDifficulty] = useState<string>("junior");
  const [duration, setDuration] = useState<number>(30);
  const [jobOffer, setJobOffer] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [videoMode, setVideoMode] = useState(false);
  const [selectedInterviewer, setSelectedInterviewer] = useState(INTERVIEWERS[0].id);
  const [analyzedJob, setAnalyzedJob] = useState<{
    companyName: string;
    jobTitle: string;
    skills: string[];
    experienceLevel: string;
  } | null>(null);

  const handleAnalyzeJob = async () => {
    if (!jobOffer.trim() || jobOffer.length < 50) return;

    setIsAnalyzing(true);
    try {
      const response = await fetch("/api/analyze-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobOfferText: jobOffer }),
      });

      if (response.ok) {
        const data = await response.json();
        setAnalyzedJob(data);
        if (data.experienceLevel) {
          setDifficulty(data.experienceLevel);
        }
      }
    } catch (error) {
      console.error("Error analyzing job:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleStartInterview = async () => {
    setIsStarting(true);

    try {
      const response = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          difficulty,
          type,
          language: "fr",
          durationMinutes: duration,
          jobOfferText: type === "job_based" ? jobOffer : null,
          companyName: analyzedJob?.companyName,
          jobTitle: analyzedJob?.jobTitle,
          extractedSkills: analyzedJob?.skills,
        }),
      });

      if (!response.ok) throw new Error("Failed to create interview");

      const { id } = await response.json();

      setSettings({
        difficulty: difficulty as "junior" | "intermediate" | "senior",
        type: type as "algorithms" | "system_design" | "behavioral" | "job_based",
        language: "fr",
        durationMinutes: duration,
        jobOfferText: type === "job_based" ? jobOffer : undefined,
        companyName: analyzedJob?.companyName,
        jobTitle: analyzedJob?.jobTitle,
        extractedSkills: analyzedJob?.skills,
        videoMode,
        interviewerId: videoMode ? selectedInterviewer : undefined,
      });

      router.push(`/interview/${id}`);
    } catch (error) {
      console.error("Error starting interview:", error);
      setIsStarting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">InterviewAI</span>
          </div>
          <Button variant="outline" onClick={() => router.push("/history")}>
            <History className="h-4 w-4 mr-2" />
            Historique
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Pratique tes Entrevues Techniques
          <br />
          <span className="text-primary">avec l'IA</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
          Simule des entrevues réalistes avec un interviewer IA.
          Reçois du feedback détaillé et améliore tes compétences.
        </p>
      </section>

      {/* Main Setup Card */}
      <section className="container mx-auto px-4 pb-12">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Nouvelle Entrevue
            </CardTitle>
            <CardDescription>
              Configure ton entrevue simulée
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Interview Type */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Type d'Entrevue</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {INTERVIEW_TYPES.map((t) => {
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.value}
                      onClick={() => {
                        setType(t.value);
                        if (t.value !== "job_based") {
                          setAnalyzedJob(null);
                        }
                      }}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        type === t.value
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <Icon className={`h-5 w-5 mb-2 ${
                        type === t.value ? "text-primary" : "text-muted-foreground"
                      }`} />
                      <div className="font-medium text-sm">{t.label}</div>
                      <div className="text-xs text-muted-foreground">{t.description}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Video Mode Toggle */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Mode d'Entrevue</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setVideoMode(false)}
                  className={`p-4 rounded-lg border-2 text-left transition-all flex items-center gap-3 ${
                    !videoMode
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <MessageSquare className={`h-6 w-6 ${!videoMode ? "text-primary" : "text-muted-foreground"}`} />
                  <div>
                    <div className="font-medium">Chat</div>
                    <div className="text-xs text-muted-foreground">Texte uniquement</div>
                  </div>
                </button>
                <button
                  onClick={() => setVideoMode(true)}
                  className={`p-4 rounded-lg border-2 text-left transition-all flex items-center gap-3 ${
                    videoMode
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <Video className={`h-6 w-6 ${videoMode ? "text-primary" : "text-muted-foreground"}`} />
                  <div>
                    <div className="font-medium">Vidéo</div>
                    <div className="text-xs text-muted-foreground">Webcam + Avatar IA</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Interviewer Selection (when video mode is on) */}
            {videoMode && (
              <div className="space-y-3 p-4 rounded-lg bg-muted/50 border">
                <label className="text-sm font-medium">Choisis ton Interviewer</label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {INTERVIEWERS.map((interviewer) => (
                    <button
                      key={interviewer.id}
                      onClick={() => setSelectedInterviewer(interviewer.id)}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        selectedInterviewer === interviewer.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${interviewer.backgroundColor} flex items-center justify-center text-2xl`}>
                          {interviewer.avatar}
                        </div>
                        <div>
                          <div className="font-medium">{interviewer.name}</div>
                          <div className="text-xs text-muted-foreground">{interviewer.role}</div>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">{interviewer.company}</Badge>
                      <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                        {interviewer.personality}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Job Offer Input (conditional) */}
            {type === "job_based" && (
              <div className="space-y-3 p-4 rounded-lg bg-muted/50 border">
                <label className="text-sm font-medium">Offre d'Emploi</label>
                <Textarea
                  placeholder="Colle l'offre d'emploi complète ici..."
                  value={jobOffer}
                  onChange={(e) => setJobOffer(e.target.value)}
                  className="min-h-[150px]"
                />
                <div className="flex items-center gap-3">
                  <Button
                    variant="secondary"
                    onClick={handleAnalyzeJob}
                    disabled={isAnalyzing || jobOffer.length < 50}
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Analyse...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Analyser l'offre
                      </>
                    )}
                  </Button>
                  {jobOffer.length < 50 && jobOffer.length > 0 && (
                    <span className="text-xs text-muted-foreground">
                      Minimum 50 caractères
                    </span>
                  )}
                </div>

                {/* Analyzed Job Results */}
                {analyzedJob && (
                  <div className="mt-4 p-3 rounded-lg bg-background border space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge>{analyzedJob.companyName}</Badge>
                      <span className="font-medium">{analyzedJob.jobTitle}</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {analyzedJob.skills.slice(0, 8).map((skill, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <Separator />

            {/* Difficulty & Duration Row */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Difficulty */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Niveau de Difficulté</label>
                <div className="space-y-2">
                  {DIFFICULTY_LEVELS.map((d) => (
                    <button
                      key={d.value}
                      onClick={() => setDifficulty(d.value)}
                      className={`w-full p-3 rounded-lg border text-left transition-all flex justify-between items-center ${
                        difficulty === d.value
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <span className="font-medium">{d.label}</span>
                      <span className="text-xs text-muted-foreground">{d.description}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration */}
              <div className="space-y-3">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Durée
                </label>
                <div className="space-y-2">
                  {DURATIONS.map((d) => (
                    <button
                      key={d.value}
                      onClick={() => setDuration(d.value)}
                      className={`w-full p-3 rounded-lg border text-left transition-all flex justify-between items-center ${
                        duration === d.value
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <span className="font-medium">{d.label}</span>
                      <span className="text-xs text-muted-foreground">{d.description}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <Separator />

            {/* Start Button */}
            <Button
              size="lg"
              className="w-full"
              onClick={handleStartInterview}
              disabled={isStarting || (type === "job_based" && !analyzedJob)}
            >
              {isStarting ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Préparation...
                </>
              ) : (
                <>
                  Commencer l'Entrevue
                  <ArrowRight className="h-5 w-5 ml-2" />
                </>
              )}
            </Button>

            {type === "job_based" && !analyzedJob && jobOffer.length >= 50 && (
              <p className="text-sm text-center text-muted-foreground">
                Analyse d'abord l'offre d'emploi pour continuer
              </p>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <Card>
            <CardContent className="pt-6">
              <Code className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-semibold mb-2">Éditeur de Code Intégré</h3>
              <p className="text-sm text-muted-foreground">
                Écris et exécute ton code directement dans l'interface.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <Sparkles className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-semibold mb-2">Feedback IA Détaillé</h3>
              <p className="text-sm text-muted-foreground">
                Reçois une évaluation complète avec scores et conseils.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <History className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-semibold mb-2">Suivi de Progression</h3>
              <p className="text-sm text-muted-foreground">
                Visualise ton évolution au fil des entrevues.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
