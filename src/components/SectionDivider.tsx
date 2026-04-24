import { cn } from "@/lib/utils";

interface SectionDividerProps {
  children?: React.ReactNode;
  className?: string;
}

export function SectionDivider({ children, className }: SectionDividerProps) {
  if (!children) return <hr className={cn("divider-gradient my-6", className)} />;
  return (
    <div className={cn("flex items-center gap-3 my-6", className)}>
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{children}</span>
      <hr className="flex-1 divider-gradient" />
    </div>
  );
}
