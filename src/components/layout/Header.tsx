import { Bell, Search, ChevronDown, AlertTriangle, ArrowRight, Eye, EyeOff, LogOut, User, Users, Settings, Sparkles, ArrowUp, Wrench } from "lucide-react";
import { useFinanceiro } from "@/context/FinanceiroContext";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import { consumoNotificacoes } from "@/data/mock";
import { useAuth } from "@/context/AuthContext";
import { UpgradePlanoModal } from "@/components/UpgradePlanoModal";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  showSwitcher?: boolean;
  context?: "connect" | "hub";
}

export function Header({ showSwitcher = true, context = "connect" }: HeaderProps) {
  const navigate = useNavigate();
  const { user, usuario, logout } = useAuth();
  const { visivel, toggle } = useFinanceiro();
  const [openNotif, setOpenNotif] = useState(false);
  const [openUpgrade, setOpenUpgrade] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);


  function switchContext() {
    if (context === "connect") {
      if (user?.papel === "cliente") {
        navigate("/cliente/hub-indisponivel");
        return;
      }
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

  function handleLogout() {
    logout();
    navigate("/login");
  }

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setOpenNotif(false);
      }
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

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

          {(usuario?.role === "admin" || usuario?.role === "consultor") && (
            <a
              href="https://tools.azumirh.com.br/"
              target="_blank"
              rel="noreferrer"
              style={{ display: "flex", alignItems: "center", gap: 5, height: 32, padding: "0 12px", borderRadius: 8, border: "1px solid #E4E6EA", background: "white", fontSize: 13, fontWeight: 600, color: "#374151", textDecoration: "none", fontFamily: "'Urbanist',sans-serif" }}
            >
              <Wrench size={13} /> Tools
            </a>
          )}

          {/* Sair — portinha de saída da plataforma */}
          <button
            type="button"
            onClick={handleLogout}
            title="Sair da plataforma"
            aria-label="Sair da plataforma"
            className="h-9 w-9 rounded-lg hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>

          {/* Botão de upgrade/conversão */}
          {(() => {
            const role = usuario?.role;
            const plano = usuario?.plano;
            if (role === "admin" || role === "consultor") return null;
            let cfg: { bg: string; icon: typeof Sparkles; label: string } | null = null;
            if (role === "trial") cfg = { bg: "#8B5CF6", icon: Sparkles, label: "Conheça os planos" };
            else if (plano === "start") cfg = { bg: "#3B82F6", icon: ArrowUp, label: "Upgrade para Ongoing" };
            else if (plano === "ongoing") cfg = { bg: "#031D38", icon: ArrowUp, label: "Upgrade para Growth" };
            if (!cfg) return null;
            const Icon = cfg.icon;
            return (
              <button
                type="button"
                onClick={() => setOpenUpgrade(true)}
                className="h-9 px-3 rounded-lg flex items-center gap-1.5 text-xs font-semibold text-white hover:opacity-90 transition-opacity"
                style={{ background: cfg.bg, fontFamily: "'Urbanist',sans-serif" }}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="hidden md:inline">{cfg.label}</span>
              </button>
            );
          })()}

          {/* Sino de notificações */}

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

          <button
            type="button"
            onClick={toggle}
            title={visivel ? "Ocultar dados financeiros" : "Revelar dados financeiros"}
            aria-label={visivel ? "Ocultar dados financeiros" : "Revelar dados financeiros"}
            className={cn(
              "h-8 w-8 rounded-md flex items-center justify-center transition-colors",
              visivel
                ? "text-muted-foreground hover:text-foreground hover:bg-muted"
                : "text-warning bg-warning/10 hover:bg-warning/20"
            )}
          >
            {visivel ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </button>

          {/* User dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 h-11 px-2 pr-3 rounded-lg hover:bg-secondary">
                <div className="h-9 w-9 rounded-lg bg-gradient-brand flex items-center justify-center text-xs font-semibold text-white">VC</div>
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-medium leading-tight">Você</div>
                  <div className="text-[10px] text-muted-foreground leading-tight">Admin Azumi</div>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Configurações</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/app/configuracoes?tab=perfil")}>
                <User className="h-4 w-4 mr-2" /> Meu perfil
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/app/configuracoes?tab=equipe")}>
                <Users className="h-4 w-4 mr-2" /> Equipe
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/app/configuracoes?tab=sistema")}>
                <Settings className="h-4 w-4 mr-2" /> Sistema
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                <LogOut className="h-4 w-4 mr-2" /> Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <UpgradePlanoModal
        open={openUpgrade}
        onClose={() => setOpenUpgrade(false)}
        planoAtual={usuario?.plano ?? "trial"}
      />
    </header>
  );

}
