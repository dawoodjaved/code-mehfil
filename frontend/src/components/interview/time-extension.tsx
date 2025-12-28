"use client";

import { Button } from "@/components/ui/button";
import { Clock, Plus } from "lucide-react";

interface TimeExtensionProps {
  sessionId: string;
  currentTime: number;
  onExtend: (minutes: number) => void;
  canExtend: boolean;
}

export function TimeExtension({ sessionId, currentTime, onExtend, canExtend }: TimeExtensionProps) {
  const handleExtend = async (minutes: number) => {
    try {
      await fetch(`/api/sessions/${sessionId}/extend-time`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ minutes }),
      });
      onExtend(minutes);
    } catch (error) {
      console.error("Failed to extend time:", error);
    }
  };

  if (!canExtend) return null;

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleExtend(5)}
        disabled={!canExtend}
      >
        <Plus className="w-4 h-4 mr-2" />
        +5 min
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleExtend(10)}
        disabled={!canExtend}
      >
        <Plus className="w-4 h-4 mr-2" />
        +10 min
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleExtend(15)}
        disabled={!canExtend}
      >
        <Plus className="w-4 h-4 mr-2" />
        +15 min
      </Button>
    </div>
  );
}

