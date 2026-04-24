import { useEffect, useRef, useState } from "react";
import { Pause, Play, Square } from "lucide-react";
import { cn } from "@/lib/utils";

function fmt(s: number) {
  const h = Math.floor(s / 3600).toString().padStart(2, "0");
  const m = Math.floor((s % 3600) / 60).toString().padStart(2, "0");
  const sec = Math.floor(s % 60).toString().padStart(2, "0");
  return `${h}:${m}:${sec}`;
}

interface TimerProps {
  initial?: number;
  compact?: boolean;
  onStop?: (seconds: number) => void;
}

export function Timer({ initial = 0, compact, onStop }: TimerProps) {
  const [seconds, setSeconds] = useState(initial);
  const [state, setState] = useState<"idle" | "running" | "paused">("idle");
  const ref = useRef<number | null>(null);

  useEffect(() => {
    if (state === "running") {
      ref.current = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    } else if (ref.current) {
      window.clearInterval(ref.current);
      ref.current = null;
    }
    return () => {
      if (ref.current) window.clearInterval(ref.current);
    };
  }, [state]);

  const dotColor =
    state === "running" ? "bg-success animate-soft-pulse" :
    state === "paused" ? "bg-warning" : "bg-muted-foreground/40";

  return (
    <div className={cn(
      "flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-2",
      compact ? "py-1.5" : ""
    )}>
      <div className="flex items-center gap-2">
        <span className={cn("h-2 w-2 rounded-full", dotColor)} />
        <span className={cn("font-data tabular-nums text-highlight", compact ? "text-sm" : "text-lg font-semibold")}>
          {fmt(seconds)}
        </span>
      </div>
      <div className="flex items-center gap-1 ml-1">
        {state !== "running" ? (
          <button
            onClick={() => setState("running")}
            className="h-7 w-7 rounded-full bg-success text-success-foreground flex items-center justify-center hover:opacity-90"
            aria-label="Iniciar"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
          </button>
        ) : (
          <button
            onClick={() => setState("paused")}
            className="h-7 w-7 rounded-full bg-warning text-warning-foreground flex items-center justify-center hover:opacity-90"
            aria-label="Pausar"
          >
            <Pause className="h-3.5 w-3.5 fill-current" />
          </button>
        )}
        <button
          onClick={() => {
            onStop?.(seconds);
            setSeconds(0);
            setState("idle");
          }}
          className="h-7 w-7 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center hover:opacity-90"
          aria-label="Parar"
        >
          <Square className="h-3 w-3 fill-current" />
        </button>
      </div>
    </div>
  );
}
