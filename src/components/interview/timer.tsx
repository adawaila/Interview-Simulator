"use client";

import { useState, useEffect } from "react";
import { Clock, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimerProps {
  startTime: Date;
  durationMinutes: number;
  onTimeUp?: () => void;
}

export function Timer({ startTime, durationMinutes, onTimeUp }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState<number>(durationMinutes * 60);
  const [hasWarned, setHasWarned] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const elapsed = Math.floor(
        (now.getTime() - new Date(startTime).getTime()) / 1000
      );
      const remaining = Math.max(0, durationMinutes * 60 - elapsed);
      setTimeLeft(remaining);

      // Warning at 5 minutes
      if (remaining <= 300 && remaining > 0 && !hasWarned) {
        setHasWarned(true);
      }

      // Time's up
      if (remaining === 0 && onTimeUp) {
        onTimeUp();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, durationMinutes, onTimeUp, hasWarned]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isLow = timeLeft <= 300; // 5 minutes
  const isCritical = timeLeft <= 60; // 1 minute

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-lg",
        isCritical
          ? "bg-red-500/20 text-red-600 animate-pulse"
          : isLow
          ? "bg-yellow-500/20 text-yellow-600"
          : "bg-secondary text-secondary-foreground"
      )}
    >
      {isLow ? (
        <AlertTriangle className="h-5 w-5" />
      ) : (
        <Clock className="h-5 w-5" />
      )}
      <span>
        {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
      </span>
    </div>
  );
}
