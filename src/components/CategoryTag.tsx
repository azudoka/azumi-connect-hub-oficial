import { cn } from "@/lib/utils";

export type TagCategoria = "modalidade" | "contrato" | "nivel" | "origem" | "urgencia";

const CORES: Record<TagCategoria, string> = {
  modalidade: "bg-primary/10 text-primary border-primary/30",
  contrato:   "bg-info/10 text-info border-info/30",
  nivel:      "bg-highlight/10 text-highlight border-highlight/30",
  origem:     "bg-warning/10 text-warning border-warning/30",
  urgencia:   "bg-destructive/10 text-destructive border-destructive/30",
};

export function CategoryTag({
  categoria,
  children,
  className,
}: {
  categoria: TagCategoria;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide",
        CORES[categoria],
        className
      )}
    >
      {children}
    </span>
  );
}
