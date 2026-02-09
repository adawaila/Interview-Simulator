"use client";

import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Interviewer } from "@/lib/interviewers";
import { cn } from "@/lib/utils";

interface VideoCallProps {
  interviewer: Interviewer;
  isSpeaking: boolean;
  className?: string;
}

export function VideoCall({ interviewer, isSpeaking, className }: VideoCallProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  useEffect(() => {
    if (cameraOn) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [cameraOn]);

  const startCamera = async () => {
    try {
      setCameraError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 },
        audio: micOn,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Camera error:", err);
      setCameraError("Impossible d'accéder à la caméra");
      setCameraOn(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const toggleMic = () => {
    if (stream) {
      stream.getAudioTracks().forEach((track) => {
        track.enabled = !micOn;
      });
    }
    setMicOn(!micOn);
  };

  return (
    <div className={cn("flex gap-4 h-full", className)}>
      {/* Interviewer Avatar */}
      <Card className="flex-1 relative overflow-hidden">
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-br flex items-center justify-center transition-all duration-300",
            interviewer.backgroundColor,
            isSpeaking && "animate-pulse"
          )}
        >
          {/* Avatar circle */}
          <div
            className={cn(
              "relative flex flex-col items-center justify-center",
              isSpeaking && "scale-105 transition-transform"
            )}
          >
            {/* Ripple effect when speaking */}
            {isSpeaking && (
              <>
                <div className="absolute w-40 h-40 rounded-full bg-white/20 animate-ping" />
                <div className="absolute w-48 h-48 rounded-full bg-white/10 animate-ping animation-delay-200" />
              </>
            )}

            {/* Avatar emoji */}
            <div
              className={cn(
                "w-32 h-32 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-7xl shadow-2xl border-4 border-white/30 z-10",
                isSpeaking && "ring-4 ring-white/50 ring-offset-4 ring-offset-transparent"
              )}
            >
              {interviewer.avatar}
            </div>

            {/* Name and role */}
            <div className="mt-6 text-center z-10">
              <h3 className="text-xl font-bold text-white drop-shadow-lg">
                {interviewer.name}
              </h3>
              <p className="text-white/80 text-sm drop-shadow">
                {interviewer.role} @ {interviewer.company}
              </p>
            </div>

            {/* Speaking indicator */}
            {isSpeaking && (
              <div className="mt-4 flex items-center gap-1 z-10">
                <div className="w-2 h-4 bg-white rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-6 bg-white rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-4 bg-white rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                <div className="w-2 h-5 bg-white rounded-full animate-bounce" style={{ animationDelay: "450ms" }} />
                <div className="w-2 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: "600ms" }} />
              </div>
            )}
          </div>
        </div>

        {/* Status badge */}
        <div className="absolute top-4 left-4 z-20">
          <div className={cn(
            "px-3 py-1 rounded-full text-xs font-medium flex items-center gap-2",
            isSpeaking ? "bg-green-500 text-white" : "bg-white/20 text-white backdrop-blur-sm"
          )}>
            <div className={cn(
              "w-2 h-2 rounded-full",
              isSpeaking ? "bg-white animate-pulse" : "bg-white/60"
            )} />
            {isSpeaking ? "Parle..." : "Écoute"}
          </div>
        </div>
      </Card>

      {/* User Camera */}
      <Card className="w-64 relative overflow-hidden flex-shrink-0">
        {cameraOn && !cameraError ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover mirror"
            style={{ transform: "scaleX(-1)" }}
          />
        ) : (
          <div className="w-full h-full bg-muted flex flex-col items-center justify-center gap-2">
            <VideoOff className="w-12 h-12 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {cameraError || "Caméra désactivée"}
            </span>
          </div>
        )}

        {/* User label */}
        <div className="absolute bottom-12 left-2 right-2">
          <div className="bg-black/50 backdrop-blur-sm rounded px-2 py-1 text-white text-sm text-center">
            Vous
          </div>
        </div>

        {/* Camera controls */}
        <div className="absolute bottom-2 left-2 right-2 flex justify-center gap-2">
          <Button
            size="icon"
            variant={cameraOn ? "secondary" : "destructive"}
            className="h-8 w-8"
            onClick={() => setCameraOn(!cameraOn)}
          >
            {cameraOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
          </Button>
          <Button
            size="icon"
            variant={micOn ? "secondary" : "destructive"}
            className="h-8 w-8"
            onClick={toggleMic}
          >
            {micOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
          </Button>
        </div>
      </Card>
    </div>
  );
}
