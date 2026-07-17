import {
  Bell, Search, ChevronDown, AlertTriangle, ArrowRight, Eye, EyeOff, Sparkles,
  User as UserIcon, Settings as SettingsIcon, LogOut as LogOutIcon,
  Sun, Moon, MessageSquare,
} from "lucide-react";
import { useFinanceiro } from "@/context/FinanceiroContext";
import { useNavigate, Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import { consumoNotificacoes } from "@/data/mock";
import { useAuth } from "@/context/AuthContext";
import { UpgradePlanoModal } from "@/components/UpgradePlanoModal";

interface HeaderProps {
  showSwitcher?: boolean;
  context?: "connect" | "hub";
  variant?: "admin" | "cliente";
}

// Atalhos do menu de acesso rápido (ícone de grade) — mesmo padrão do app-launcher
// da referência, só que com destinos reais do Connect.
const QUICK_LINKS = [
  { label: "Nova vaga", desc: "Abrir vaga na Atração", icon: "solar:case-round-bold-duotone", to: "/app/atracao" },
  { label: "Lançar horas", desc: "Timer ou lançamento manual", icon: "solar:clock-circle-bold-duotone", to: "/app/horas" },
  { label: "Nova fatura", desc: "Gerar cobrança", icon: "solar:bill-list-bold-duotone", to: "/app/financeiro" },
  { label: "Novo entregável", desc: "Adicionar a um projeto", icon: "solar:document-add-bold-duotone", to: "/app/projetos" },
];
const QUICK_SHORTCUTS = [
  { label: "Financeiro", to: "/app/financeiro" },
  { label: "Documentos", to: "/app/documentos" },
  { label: "Auditoria", to: "/app/auditoria" },
  { label: "Gestão de Conta", to: "/app/gestao-de-conta" },
];

export function Header({ showSwitcher = true, context = "connect", variant = "admin" }: HeaderProps) {
  const navigate = useNavigate();
  const { logout, user, usuario } = useAuth();
  const { visivel, toggle } = useFinanceiro();
  const [openNotif, setOpenNotif] = useState(false);
  const [openQuick, setOpenQuick] = useState(false);
  const [openPerfil, setOpenPerfil] = useState(false);
  const [openUpgrade, setOpenUpgrade] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const quickRef = useRef<HTMLDivElement>(null);
  const perfilRef = useRef<HTMLDivElement>(null);

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

  // fecha ao clicar fora
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setOpenNotif(false);
      if (quickRef.current && !quickRef.current.contains(e.target as Node)) setOpenQuick(false);
      if (perfilRef.current && !perfilRef.current.contains(e.target as Node)) setOpenPerfil(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const isCliente = typeof window !== "undefined" && window.location.pathname.startsWith("/cliente");
  const linkFor = (empresaId: string) =>
    isCliente ? "/cliente/gestao-conta" : `/app/empresas/${empresaId}`;

  const totalAlertas = consumoNotificacoes.filter((n) => n.severidade !== "info").length;
  const handleLogout = () => { logout(); navigate("/login"); };

  return (
    <header className="h-16 shrink-0 border-b border-border bg-[hsl(var(--background)/0.8)] backdrop-blur sticky top-0 z-30">
      <div className="h-full flex items-center gap-1 px-6">

        {/* Ícone de busca — sem caixa de texto, igual à referência */}
        <button
          type="button"
          title="Busca — em breve"
          className="h-9 w-9 rounded-lg hover:bg-secondary flex items-center justify-center text-muted-foreground"
        >
          <Search className="h-4 w-4" />
        </button>

        {/* Menu de acesso rápido (ícone de grade) — atalhos reais do Connect */}
        <div className="relative" ref={quickRef}>
          <button
            type="button"
            onClick={() => setOpenQuick((v) => !v)}
            title="Acessos rápidos"
            className="h-9 w-9 rounded-lg hover:bg-secondary flex items-center justify-center text-muted-foreground"
          >
            <iconify-icon icon="solar:widget-2-bold-duotone" width="18" height="18" />
          </button>
          {openQuick && (
            <div className="absolute left-0 mt-2 w-[520px] bg-card border border-border rounded-xl shadow-elevated z-50 animate-fade-in overflow-hidden flex">
              <div className="flex-1 grid grid-cols-2 gap-1 p-3">
                {QUICK_LINKS.map((q) => (
                  <Link
                    key={q.label}
                    to={q.to}
                    onClick={() => setOpenQuick(false)}
                    className="flex items-start gap-2.5 p-2.5 rounded-lg hover:bg-secondary transition-colors"
                  >
                    <span className="h-9 w-9 rounded-lg bg-[hsl(var(--primary)/0.1)] text-primary flex items-center justify-center shrink-0">
                      <iconify-icon icon={q.icon} width="18" height="18" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-medium truncate">{q.label}</span>
                      <span className="block text-[11px] text-muted-foreground truncate">{q.desc}</span>
                    </span>
                  </Link>
                ))}
              </div>
              <div className="w-[180px] border-l border-border p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-1">
                  Atalhos
                </p>
                <ul className="space-y-0.5">
                  {QUICK_SHORTCUTS.map((s) => (
                    <li key={s.label}>
                      <Link
                        to={s.to}
                        onClick={() => setOpenQuick(false)}
                        className="block px-2 py-1.5 rounded-md text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                      >
                        {s.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        <div className="ml-auto flex items-center gap-1">
          {variant === "cliente" && (
            <button
              type="button"
              onClick={() => setOpenUpgrade(true)}
              className="h-9 rounded-full px-3.5 flex items-center gap-1.5 text-xs font-semibold bg-primary text-primary-foreground hover:brightness-105 transition-[filter] mr-1"
            >
              <Sparkles className="h-3.5 w-3.5" /> Faça seu upgrade
            </button>
          )}

          {showSwitcher && (
            <button
              onClick={switchContext}
              className={cn(
                "h-9 rounded-full px-1 flex items-center gap-1 border text-xs font-medium transition-colors mr-1",
                "border-border bg-[hsl(var(--secondary)/0.4)]"
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

          {/* Claro/escuro — visual pronto; modo escuro completo é uma frente própria, ainda não liga de verdade */}
          <button
            type="button"
            onClick={() => setDarkMode((v) => !v)}
            title="Modo escuro (em breve)"
            className="h-9 w-9 rounded-lg hover:bg-secondary flex items-center justify-center text-muted-foreground"
          >
            {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {/* Mensagens — mapeado pra Solicitações, que é a comunicação real com cliente */}
          <button
            type="button"
            onClick={() => navigate(isCliente ? "/cliente/solicitacoes" : "/app/solicitacoes")}
            title="Solicitações"
            className="h-9 w-9 rounded-lg hover:bg-secondary flex items-center justify-center text-muted-foreground"
          >
            <MessageSquare className="h-4 w-4" />
          </button>

          {/* Notificações de consumo */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setOpenNotif((v) => !v)}
              className="relative h-9 w-9 rounded-lg hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground"
              aria-label="Notificações"
            >
              <Bell className="h-4 w-4" />
              {totalAlertas > 0 && (
                <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-destructive text-destructive-foreground text-[9px] font-semibold flex items-center justify-center ring-2 ring-background">
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
                  <span className="text-[11px] text-muted-foreground">{totalAlertas} ativos</span>
                </div>

                <ul className="max-h-[360px] overflow-y-auto">
                  {consumoNotificacoes.map((n) => (
                    <li key={n.id} className="border-b border-border last:border-b-0">
                      <Link
                        to={linkFor(n.empresaId)}
                        onClick={() => setOpenNotif(false)}
                        className="group block px-4 py-3 hover:bg-[hsl(var(--secondary)/0.5)] transition-colors"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-medium truncate">{n.empresa}</span>
                              <span className={cn(
                                "text-[10px] font-semibold px-1.5 py-0.5 rounded",
                                n.severidade === "critical" && "bg-[hsl(var(--destructive)/0.15)] text-destructive",
                                n.severidade === "warning" && "bg-[hsl(var(--warning)/0.15)] text-warning",
                                n.severidade === "info" && "bg-[hsl(var(--info)/0.15)] text-info",
                              )}>
                                {n.percent}%
                              </span>
                            </div>
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                              <span className="">{n.consumido}h / {n.contratadas}h</span> consumidas · {n.quando}
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

                <div className="px-4 py-2.5 border-t border-border bg-[hsl(var(--secondary)/0.2)]">
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
                : "text-warning bg-[hsl(var(--warning)/0.1)] hover:bg-[hsl(var(--warning)/0.2)]"
            )}
          >
            {visivel ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </button>

          {/* Perfil — dropdown completo, destinos reais */}
          <div className="relative" ref={perfilRef}>
            <button
              onClick={() => setOpenPerfil((v) => !v)}
              className="flex items-center gap-2 h-9 px-2 pr-3 rounded-lg hover:bg-secondary"
            >
              {usuario?.avatarUrl ? (
                <img src={usuario.avatarUrl} alt={usuario.nome} className="h-7 w-7 rounded-lg object-cover" />
              ) : (
                <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center text-[10px] font-semibold text-primary-foreground">
                  {usuario?.nome
                    ? usuario.nome.split(" ").filter(Boolean).slice(0, 2).map((n) => n[0]).join("").toUpperCase()
                    : "VC"}
                </div>
              )}
              <div className="text-left hidden sm:block">
                <div className="text-xs font-medium leading-tight">{usuario?.nome?.split(" ")[0] ?? "Você"}</div>
                <div className="text-[10px] text-muted-foreground leading-tight">
                  {usuario?.role === "admin" ? "Admin Azumi" :
                   usuario?.role === "consultor" ? "Consultor Azumi" :
                   usuario?.empresaNome ?? "Convidado"}
                </div>
              </div>
              <ChevronDown className={cn("h-3.5 w-3.5 text-muted-foreground transition-transform", openPerfil && "rotate-180")} />
            </button>

            {openPerfil && (
              <div className="absolute right-0 mt-2 w-64 bg-card border border-border rounded-xl shadow-elevated z-50 animate-fade-in overflow-hidden">
                <div className="px-4 py-4 flex items-center gap-3 border-b border-border">
                  {usuario?.avatarUrl ? (
                    <img src={usuario.avatarUrl} alt={usuario.nome} className="h-11 w-11 rounded-lg object-cover shrink-0" />
                  ) : (
                    <div className="h-11 w-11 rounded-lg bg-primary flex items-center justify-center text-sm font-semibold text-primary-foreground shrink-0">
                      {usuario?.nome
                        ? usuario.nome.split(" ").filter(Boolean).slice(0, 2).map((n) => n[0]).join("").toUpperCase()
                        : "VC"}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">{usuario?.nome ?? "Você"}</p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {usuario?.role === "admin" ? "Admin Azumi" :
                       usuario?.role === "consultor" ? "Consultor Azumi" :
                       usuario?.empresaNome ?? "Convidado"}
                    </p>
                    {usuario?.email && <p className="text-[11px] text-muted-foreground truncate">{usuario.email}</p>}
                  </div>
                </div>
                <div className="py-1.5">
                  <Link
                    to="/app/perfil"
                    onClick={() => setOpenPerfil(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-sm hover:bg-secondary transition-colors"
                  >
                    <UserIcon className="h-4 w-4 text-muted-foreground" /> Meu perfil
                  </Link>
                  <Link
                    to="/app/configuracoes"
                    onClick={() => setOpenPerfil(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-sm hover:bg-secondary transition-colors"
                  >
                    <SettingsIcon className="h-4 w-4 text-muted-foreground" /> Configurações
                  </Link>
                </div>
                <div className="border-t border-border py-1.5">
                  <button
                    onClick={() => { setOpenPerfil(false); handleLogout(); }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-destructive hover:bg-[hsl(var(--destructive)/0.08)] transition-colors"
                  >
                    <LogOutIcon className="h-4 w-4" /> Sair
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {variant === "cliente" && (
        <UpgradePlanoModal
          open={openUpgrade}
          onClose={() => setOpenUpgrade(false)}
          planoAtual={usuario?.plano ?? "trial"}
        />
      )}
    </header>
  );
}
