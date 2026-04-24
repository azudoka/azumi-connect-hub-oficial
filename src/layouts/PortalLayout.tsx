import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const navItems = [
  { to: "/portal", label: "Visão geral", end: true },
  { to: "/portal/projetos", label: "Projetos", end: false },
  { to: "/portal/financeiro", label: "Financeiro", end: false },
];

export default function PortalLayout() {
  const navigate = useNavigate();

  const handleSair = () => {
    toast.info("Sessão encerrada");
    setTimeout(() => navigate("/login"), 600);
  };

  return (
    <div className="flex min-h-full w-full flex-col bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-4 px-6">
          <div className="flex items-center gap-3">
            <span className="font-display text-lg font-semibold text-gradient-brand">
              Azumi RH
            </span>
            <span className="hidden h-4 w-px bg-border sm:block" />
            <span className="hidden text-sm font-medium text-foreground sm:block">
              Kentaki Foods
            </span>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/15 text-xs font-semibold text-primary">
                  AB
                </AvatarFallback>
              </Avatar>
              <span className="hidden text-sm font-medium sm:block">Ana Beatriz</span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleSair} className="gap-2">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sair</span>
            </Button>
          </div>
        </div>

        <nav className="mx-auto flex max-w-[1400px] items-center gap-1 px-6">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "relative px-3 py-3 text-sm font-medium transition-colors",
                  isActive
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )
              }
            >
              {({ isActive }) => (
                <>
                  {item.label}
                  {isActive && (
                    <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-primary" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[1400px] animate-fade-in p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
