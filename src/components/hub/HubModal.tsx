import { ReactNode, useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useScrollLock } from "@/hooks/use-scroll-lock";

interface HubModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  /** largura do conteúdo */
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: "max-w-md",
  md: "max-w-2xl",
  lg: "max-w-3xl",
};

/**
 * Modal padrão do Hub: backdrop centralizado, scroll lock, fecha no ESC e ao clicar fora.
 */
export function HubModal({ open, onClose, children, className, size = "md" }: HubModalProps) {
  useScrollLock(open);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className={cn(
          "relative w-full bg-card border border-border rounded-2xl shadow-elevated overflow-hidden flex flex-col max-h-[90vh] animate-scale-in",
          sizeMap[size],
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 h-8 w-8 rounded-md bg-card/80 hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Fechar"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
