import { Bell, Search, ChevronDown } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

interface HeaderProps {
  showSwitcher?: boolean;
  context?: "connect" | "hub";
}

export function Header({ showSwitcher = true, context = "connect" }: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();

  function switchContext() {
    if (context === "connect") navigate("/hub/colaborador/inicio");
    else navigate("/app/dashboard");
  }

  return (
    <header className="h-16 shrink-0 border-b border-border bg-background/80 backdrop-blur sticky top-0 z-30">
      <div className="h-full flex items-center gap-3 px-6">
        {/* Search */}
        <div className="flex-1 max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Buscar empresas, vagas, candidatos…"
            className="w-full h-9 pl-9 pr-16 rounded-lg bg-secondary/60 border border-transparent focus:border-primary/40 focus:bg-secondary outline-none text-sm placeholder:text-muted-foreground transition-colors"
          />
          <kbd className="absolute right-2 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded border border-border bg-background text-[10px] font-data text-muted-foreground">⌘K</kbd>
        </div>

        <div className="ml-auto flex items-center gap-2">
          {showSwitcher && (
            <button
              onClick={switchContext}
              className={cn(
                "h-9 rounded-full px-1 flex items-center gap-1 border text-xs font-medium transition-colors",
                "border-border bg-secondary/40"
              )}
              aria-label="Trocar contexto"
            >
              <span className={cn(
                "px-3 py-1 rounded-full transition-colors",
                context === "connect" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              )}>Connect</span>
              <span className={cn(
                "px-3 py-1 rounded-full transition-colors",
                context === "hub" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              )}>Hub</span>
            </button>
          )}

          <button className="relative h-9 w-9 rounded-lg hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground">
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive ring-2 ring-background" />
          </button>

          <button className="flex items-center gap-2 h-9 px-2 pr-3 rounded-lg hover:bg-secondary">
            <div className="h-7 w-7 rounded-full bg-gradient-brand flex items-center justify-center text-[10px] font-semibold text-white">VC</div>
            <div className="text-left hidden sm:block">
              <div className="text-xs font-medium leading-tight">Você</div>
              <div className="text-[10px] text-muted-foreground leading-tight">Admin Azumi</div>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        </div>
      </div>
    </header>
  );
}
