import { cn } from "@/lib/utils";

interface DiscBarsProps {
  values: { D: number; I: number; S: number; C: number };
  compact?: boolean;
}

const meta = [
  { key: "D", label: "Dominância", cls: "bg-destructive" },
  { key: "I", label: "Influência", cls: "bg-warning" },
  { key: "S", label: "Estabilidade", cls: "bg-success" },
  { key: "C", label: "Conformidade", cls: "bg-info" },
] as const;

export function DiscBars({ values, compact }: DiscBarsProps) {
  return (
    <div className={cn("space-y-2", compact && "space-y-1.5")}>
      {meta.map(({ key, label, cls }) => {
        const v = values[key];
        return (
          <div key={key} className="flex items-center gap-2">
            <span className={cn("font-data text-xs w-4 text-muted-foreground", compact && "w-3")}>{key}</span>
            <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
              <div className={cn("h-full rounded-full", cls)} style={{ width: `${v}%` }} />
            </div>
            {!compact && <span className="text-xs text-muted-foreground w-24">{label}</span>}
            <span className="font-data text-xs tabular-nums w-8 text-right">{v}%</span>
          </div>
        );
      })}
    </div>
  );
}
