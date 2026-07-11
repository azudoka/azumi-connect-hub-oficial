import { cn } from "@/lib/utils";

interface SlaBarProps {
  percent: number;
  label?: string;
  className?: string;
}

export function SlaBar({ percent, label, className }: SlaBarProps) {
  const color =
    percent >= 100 ? "bg-destructive" :
    percent >= 90 ? "bg-destructive" :
    percent >= 70 ? "bg-warning" : "bg-success";
  const text =
    percent >= 100 ? "Atrasado" :
    percent >= 90 ? "Crítico" :
    percent >= 70 ? "Atenção" : "No prazo";
  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label ?? "SLA"}</span>
        <span className="tabular-nums font-medium">{Math.min(percent, 999)}% · {text}</span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all", color)}
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>
    </div>
  );
}
