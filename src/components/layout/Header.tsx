import { Bell, Search, ChevronDown, AlertTriangle, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import { consumoNotificacoes } from "@/data/mock";
import { useAuth } from "@/context/AuthContext";

interface HeaderProps {
  showSwitcher?: boolean;
  context?: "connect" | "hub";
}

export function Header({ showSwitcher = true, context = "connect" }: HeaderProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [openNotif, setOpenNotif] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  function switchContext() {
    if (context === "connect") {
      // Cliente ADM: por enquanto, não tem Hub liberado (mock).
      if (user?.papel === "cliente") {
        navigate("/cliente/hub-indisponivel");
        return;
      }
      // Roteamento por papel para perfis com Hub.
      const hubHomeByRole: Record<string, string> = {
        ceo: "/hub/ceo/dashboard",
        lider: "/hub/lider/painel",
        colaborador: "/hub/colaborador/inicio",
        rh: "/hub/ceo/dashboard",
        admin: "/hub/ceo/dashboard",
      };
      navigate(hubHomeByRole[user?.papel ?? ""] ?? "/hub/colaborador/inicio");
    } else {
      navigate("/app/dashboard");
    }
  }

  // fecha ao clicar fora
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setOpenNotif(false);
      }
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  // B08: link contextual conforme o tipo de usuário (admin/cliente)
  const isCliente = typeof window !== "undefined" && window.location.pathname.startsWith("/cliente");
  const linkFor = (empresaId: string) =>
    isCliente ? "/cliente/gestao-conta" : `/app/empresas/${empresaId}`;

  const totalAlertas = consumoNotificacoes.filter((n) => n.severidade !== "info").length;

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

          {/* B08: Sino com dropdown de notificações de consumo */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setOpenNotif((v) => !v)}
              className="relative h-9 w-9 rounded-lg hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground"
              aria-label="Notificações"
            >
              <Bell className="h-4 w-4" />
              {totalAlertas > 0 && (
                <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-destructive text-destructive-foreground text-[9px] font-data font-semibold flex items-center justify-center ring-2 ring-background">
                  {totalAlertas}
                </span>
              )}
            </button>

            {openNotif && (
              <div className="absolute right-0 mt-2 w-[360px] bg-card border border-border rounded-xl shadow-elevated z-50 animate-fade-in overflow-hidden">
                <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-warning" />
                    <h4 className="font-display font-semibold text-sm">Alertas de consumo</h4>
                  </div>
                  <span className="text-[11px] text-muted-foreground font-data">{totalAlertas} ativos</span>
                </div>

                <ul className="max-h-[360px] overflow-y-auto">
                  {consumoNotificacoes.map((n) => (
                    <li key={n.id} className="border-b border-border last:border-b-0">
                      <Link
                        to={linkFor(n.empresaId)}
                        onClick={() => setOpenNotif(false)}
                        className="group block px-4 py-3 hover:bg-secondary/50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-medium truncate">{n.empresa}</span>
                              <span className={cn(
                                "text-[10px] font-data font-semibold px-1.5 py-0.5 rounded",
                                n.severidade === "critical" && "bg-destructive/15 text-destructive",
                                n.severidade === "warning" && "bg-warning/15 text-warning",
                                n.severidade === "info" && "bg-info/15 text-info",
                              )}>
                                {n.percent}%
                              </span>
                            </div>
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                              <span className="font-data">{n.consumido}h / {n.contratadas}h</span> consumidas · {n.quando}
                            </p>
                            <div className="mt-1.5 h-1 rounded-full bg-muted overflow-hidden">
                              <div
                                className={cn(
                                  "h-full",
                                  n.severidade === "critical" && "bg-destructive",
                                  n.severidade === "warning" && "bg-warning",
                                  n.severidade === "info" && "bg-primary",
                                )}
                                style={{ width: `${Math.min(100, n.percent)}%` }}
                              />
                            </div>
                          </div>
                          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary mt-1 shrink-0" />
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>

                <div className="px-4 py-2.5 border-t border-border bg-secondary/20">
                  <Link
                    to={isCliente ? "/cliente/gestao-conta" : "/app/gestao-de-conta"}
                    onClick={() => setOpenNotif(false)}
                    className="text-xs text-primary hover:underline font-medium"
                  >
                    Ver todos os relatórios de consumo →
                  </Link>
                </div>
              </div>
            )}
          </div>

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
