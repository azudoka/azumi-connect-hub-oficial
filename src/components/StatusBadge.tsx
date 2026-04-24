import { cn } from "@/lib/utils";
import type { StatusKey } from "@/data/mock";

const styles: Record<StatusKey, { label: string; cls: string }> = {
  ativa: { label: "Ativa", cls: "bg-success/15 text-success border-success/30" },
  andamento: { label: "Em andamento", cls: "bg-success/15 text-success border-success/30" },
  aguardando: { label: "Aguardando", cls: "bg-warning/15 text-warning border-warning/30" },
  bloqueada: { label: "Bloqueada", cls: "bg-destructive/15 text-destructive border-destructive/30" },
  atrasada: { label: "Atrasada", cls: "bg-destructive/15 text-destructive border-destructive/30" },
  concluida: { label: "Concluída", cls: "bg-muted text-muted-foreground border-border" },
  cancelada: { label: "Cancelada", cls: "bg-muted text-muted-foreground border-border line-through" },
  analise: { label: "Em análise", cls: "bg-info/15 text-info border-info/30" },
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
