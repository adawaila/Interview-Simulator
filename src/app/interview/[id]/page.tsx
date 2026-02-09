"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  MessageSquare,
  Code,
  StopCircle,
  Loader2,
  ArrowLeft,
  Sparkles,
  Volume2,
  VolumeX,
} from "lucide-react";
import { ChatInterface } from "@/components/interview/chat-interface";
import { CodeEditorPanel } from "@/components/interview/code-editor";
import { Timer } from "@/components/interview/timer";
import { VideoCall } from "@/components/interview/video-call";
import { useInterviewStore } from "@/lib/store";
import { getInterviewerById, INTERVIEWERS } from "@/lib/interviewers";

export default function InterviewPage() {
  const params = useParams();
  const router = useRouter();
  const interviewId = params.id as string;

  const {
    settings,
    messages,
    addMessage,
    startInterview,
    isLoading,
    setLoading,
    startTime,
    status,
    endInterview,
    code,
  } = useInterviewStore();

  const [showEndDialog, setShowEndDialog] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("chat");
  const [streamingMessage, setStreamingMessage] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Get interviewer for video mode
  const interviewer = settings?.interviewerId
    ? getInterviewerById(settings.interviewerId)
    : INTERVIEWERS[0];

  // Play TTS for assistant messages
  const playTTS = async (text: string) => {
    if (!audioEnabled || !settings?.videoMode || !interviewer) return;

    try {
      setIsSpeaking(true);
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          voiceId: interviewer.voiceId,
        }),
      });

      if (!response.ok) throw new Error("TTS failed");

      const { audio } = await response.json();
      const audioBlob = new Blob(
        [Uint8Array.from(atob(audio), (c) => c.charCodeAt(0))],
        { type: "audio/mp3" }
      );
      const audioUrl = URL.createObjectURL(audioBlob);

      if (audioRef.current) {
        audioRef.current.pause();
      }

      const audioElement = new Audio(audioUrl);
      audioRef.current = audioElement;

      audioElement.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
      };

      audioElement.onerror = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
      };

      await audioElement.play();
    } catch (error) {
      console.error("TTS error:", error);
      setIsSpeaking(false);
    }
  };

  // Initialize interview
  useEffect(() => {
    if (interviewId && status === "idle") {
      startInterview(interviewId);
      // Trigger initial message from interviewer
      handleInitialMessage();
    }
  }, [interviewId, status]);

  const handleInitialMessage = async () => {
    if (!settings) return;

    setLoading(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          interviewId,
          messages: [],
          settings,
        }),
      });

      if (!response.ok) throw new Error("Failed to get response");

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader");

      let fullMessage = "";
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;

            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                fullMessage += parsed.content;
                setStreamingMessage(fullMessage);
              }
            } catch {
              // Ignore parse errors
            }
          }
        }
      }

      if (fullMessage) {
        addMessage({ role: "assistant", content: fullMessage });
        setStreamingMessage("");
        // Play TTS for video mode
        if (settings.videoMode) {
          playTTS(fullMessage);
        }
      }
    } catch (error) {
      console.error("Error getting initial message:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!settings) return;

    // Add user message
    addMessage({ role: "user", content });

    // Save to database
    await fetch("/api/chat", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ interviewId, content }),
    });

    setLoading(true);

    try {
      const currentMessages = [...messages, { role: "user", content }];

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          interviewId,
          messages: currentMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          settings,
        }),
      });

      if (!response.ok) throw new Error("Failed to get response");

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader");

      let fullMessage = "";
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;

            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                fullMessage += parsed.content;
                setStreamingMessage(fullMessage);
              }
            } catch {
              // Ignore parse errors
            }
          }
        }
      }

      if (fullMessage) {
        addMessage({ role: "assistant", content: fullMessage });
        setStreamingMessage("");
        // Play TTS for video mode
        if (settings.videoMode) {
          playTTS(fullMessage);
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEndInterview = async () => {
    setIsEvaluating(true);

    try {
      const response = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          interviewId,
          settings,
          messages: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          codeSubmissions: code ? [{ language: "python", code }] : [],
        }),
      });

      if (!response.ok) throw new Error("Failed to evaluate");

      endInterview();
      router.push(`/results/${interviewId}`);
    } catch (error) {
      console.error("Error evaluating:", error);
      setIsEvaluating(false);
    }
  };

  const handleTimeUp = () => {
    setShowEndDialog(true);
  };

  if (!settings) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const showCodeEditor = settings.type === "algorithms";

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <header className="border-b px-4 py-3 flex items-center justify-between bg-background sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push("/")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quitter
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="font-semibold">Entrevue en cours</span>
          </div>
          <Badge variant="outline">{settings.difficulty}</Badge>
          <Badge variant="secondary">{settings.type.replace("_", " ")}</Badge>
          {settings.videoMode && interviewer && (
            <Badge variant="default" className="bg-gradient-to-r from-purple-500 to-pink-500">
              {interviewer.name}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-4">
          {settings.videoMode && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setAudioEnabled(!audioEnabled)}
              title={audioEnabled ? "Désactiver le son" : "Activer le son"}
            >
              {audioEnabled ? (
                <Volume2 className="h-4 w-4" />
              ) : (
                <VolumeX className="h-4 w-4" />
              )}
            </Button>
          )}
          {startTime && (
            <Timer
              startTime={startTime}
              durationMinutes={settings.durationMinutes}
              onTimeUp={handleTimeUp}
            />
          )}
          <Button
            variant="destructive"
            onClick={() => setShowEndDialog(true)}
            disabled={isLoading || messages.length < 2}
          >
            <StopCircle className="h-4 w-4 mr-2" />
            Terminer
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 container mx-auto p-4 overflow-hidden">
        {settings.videoMode && interviewer ? (
          // Video mode layout
          <div className="flex flex-col gap-4 h-[calc(100vh-120px)]">
            {/* Video Call Area */}
            <div className="h-48 md:h-64 flex-shrink-0">
              <VideoCall
                interviewer={interviewer}
                isSpeaking={isSpeaking}
                className="h-full"
              />
            </div>

            {/* Chat + Code Area */}
            <div className="flex-1 min-h-0 overflow-hidden">
              {showCodeEditor ? (
                <div className="grid lg:grid-cols-2 gap-4 h-full">
                  <div className="h-full min-h-0 overflow-hidden">
                    <ChatInterface
                      onSendMessage={handleSendMessage}
                      isLoading={isLoading}
                    />
                  </div>
                  <div className="h-full min-h-0 overflow-hidden">
                    <CodeEditorPanel />
                  </div>
                </div>
              ) : (
                <div className="max-w-3xl mx-auto h-full overflow-hidden">
                  <ChatInterface
                    onSendMessage={handleSendMessage}
                    isLoading={isLoading}
                  />
                </div>
              )}
            </div>
          </div>
        ) : showCodeEditor ? (
          // Two-panel layout for algorithms (no video)
          <div className="grid lg:grid-cols-2 gap-4 h-[calc(100vh-120px)]">
            {/* Chat Panel */}
            <div className="h-full min-h-0 overflow-hidden">
              <ChatInterface
                onSendMessage={handleSendMessage}
                isLoading={isLoading}
              />
            </div>

            {/* Code Editor Panel */}
            <div className="h-full min-h-0 overflow-hidden">
              <CodeEditorPanel />
            </div>
          </div>
        ) : (
          // Full-width chat for non-algorithm interviews (no video)
          <div className="max-w-3xl mx-auto h-[calc(100vh-120px)] overflow-hidden">
            <ChatInterface
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
            />
          </div>
        )}
      </div>

      {/* Mobile Tabs (for smaller screens with code editor) */}
      {showCodeEditor && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 border-t bg-background p-2">
          <div className="flex gap-2">
            <Button
              variant={activeTab === "chat" ? "default" : "outline"}
              className="flex-1"
              onClick={() => setActiveTab("chat")}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Chat
            </Button>
            <Button
              variant={activeTab === "code" ? "default" : "outline"}
              className="flex-1"
              onClick={() => setActiveTab("code")}
            >
              <Code className="h-4 w-4 mr-2" />
              Code
            </Button>
          </div>
        </div>
      )}

      {/* End Interview Dialog */}
      <Dialog open={showEndDialog} onOpenChange={setShowEndDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Terminer l'entrevue?</DialogTitle>
            <DialogDescription>
              L'IA va analyser ta performance et générer un rapport détaillé avec
              des scores et des recommandations.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEndDialog(false)}
              disabled={isEvaluating}
            >
              Continuer
            </Button>
            <Button onClick={handleEndInterview} disabled={isEvaluating}>
              {isEvaluating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Évaluation...
                </>
              ) : (
                "Terminer et Évaluer"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
