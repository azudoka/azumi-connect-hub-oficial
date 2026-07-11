import { cn } from "@/lib/utils";
import type { StatusKey } from "@/data/mock";

const styles: Record<StatusKey, { label: string; cls: string }> = {
  ativa: { label: "Ativa", cls: "bg-[hsl(var(--success)/0.15)] text-success border-[hsl(var(--success)/0.3)]" },
  andamento: { label: "Em andamento", cls: "bg-[hsl(var(--success)/0.15)] text-success border-[hsl(var(--success)/0.3)]" },
  aguardando: { label: "Aguardando", cls: "bg-[hsl(var(--warning)/0.15)] text-warning border-[hsl(var(--warning)/0.3)]" },
  bloqueada: { label: "Bloqueada", cls: "bg-[hsl(var(--destructive)/0.15)] text-destructive border-[hsl(var(--destructive)/0.3)]" },
  atrasada: { label: "Atrasada", cls: "bg-[hsl(var(--destructive)/0.15)] text-destructive border-[hsl(var(--destructive)/0.3)]" },
  concluida: { label: "Concluída", cls: "bg-muted text-muted-foreground border-border" },
  cancelada: { label: "Cancelada", cls: "bg-muted text-muted-foreground border-border line-through" },
  standby:   { label: "Standby",   cls: "bg-[hsl(var(--warning)/0.15)] text-warning border-[hsl(var(--warning)/0.3)]" },
  analise: { label: "Em análise", cls: "bg-[hsl(var(--info)/0.15)] text-info border-[hsl(var(--info)/0.3)]" },
};

interface StatusBadgeProps {
  status: StatusKey;
  className?: string;
  children?: React.ReactNode;
}

export function StatusBadge({ status, className, children }: StatusBadgeProps) {
  const s = styles[status];
  return (
    <span className={cn("badge-pill", s.cls, className)}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      {children ?? s.label}
    </span>
  );
}
