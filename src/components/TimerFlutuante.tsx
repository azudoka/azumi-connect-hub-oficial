import { useLocation } from "react-router-dom";
import { Clock, Square, Pause, Play, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimerFlutuanteProps {
  ativo: boolean;
  tarefaNome: string;
  empresaNome: string;
  segundos: number;
  pausado: boolean;
  onIrParaHoras: () => void;
  onPausar: () => void;
  onRetomar: () => void;
  onEncerrar: () => void;
}

function formatarTempo(s: number): string {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return [h, m, sec].map((v) => String(v).padStart(2, "0")).join(":");
}

export function TimerFlutuante({
  ativo,
  tarefaNome,
  empresaNome,
  segundos,
  pausado,
  onIrParaHoras,
  onPausar,
  onRetomar,
  onEncerrar,
}: TimerFlutuanteProps) {
  const location = useLocation();
  const naHoras = location.pathname === "/app/horas";

  if (!ativo || naHoras) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-2.5 shadow-elevated max-w-[420px]">
      <span
        className={cn(
          "h-2.5 w-2.5 rounded-full shrink-0",
          pausado ? "bg-warning" : "bg-success animate-soft-pulse"
        )}
      />

      <button
        type="button"
        onClick={onIrParaHoras}
        className="flex-1 min-w-0 text-left"
      >
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {pausado ? "Pausado" : "Registrando"}
        </div>
        <div className="text-sm font-medium truncate">{tarefaNome}</div>
        <div className="text-[11px] text-muted-foreground truncate">
          {empresaNome}
        </div>
      </button>

      <span className="font-data tabular-nums text-sm font-semibold text-highlight shrink-0">
        {formatarTempo(segundos)}
      </span>

      <div className="flex items-center gap-1 shrink-0">
        <button
          type="button"
          onClick={pausado ? onRetomar : onPausar}
          className={cn(
            "h-7 w-7 rounded-full flex items-center justify-center hover:opacity-90",
            pausado
              ? "bg-success text-success-foreground"
              : "bg-warning text-warning-foreground"
          )}
          aria-label={pausado ? "Retomar" : "Pausar"}
        >
          {pausado ? <Play className="h-3.5 w-3.5 fill-current" /> : <Pause className="h-3.5 w-3.5 fill-current" />}
        </button>
        <button
          type="button"
          onClick={onEncerrar}
          className="h-7 w-7 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center hover:opacity-90"
          aria-label="Encerrar"
        >
          <Square className="h-3 w-3 fill-current" />
        </button>
      </div>
    </div>
  );
}
