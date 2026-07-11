import { cn } from "@/lib/utils";

export type TagCategoria = "modalidade" | "contrato" | "nivel" | "origem" | "urgencia";

const CORES: Record<TagCategoria, string> = {
  modalidade: "bg-[hsl(var(--primary)/0.1)] text-primary border-[hsl(var(--primary)/0.3)]",
  contrato:   "bg-[hsl(var(--info)/0.1)] text-info border-[hsl(var(--info)/0.3)]",
  nivel:      "bg-[hsl(var(--highlight)/0.1)] text-highlight border-[hsl(var(--highlight)/0.3)]",
  origem:     "bg-[hsl(var(--warning)/0.1)] text-warning border-[hsl(var(--warning)/0.3)]",
  urgencia:   "bg-[hsl(var(--destructive)/0.1)] text-destructive border-[hsl(var(--destructive)/0.3)]",
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
