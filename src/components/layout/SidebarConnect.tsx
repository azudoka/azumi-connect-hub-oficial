import { NavLink } from "@/components/NavLink";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Building2, Users, Briefcase, Clock, MessagesSquare, Target,
  BarChart3, Wallet, FileText, ShieldCheck, Calendar, Megaphone, BookOpen,
  Settings, LogOut, Menu, Sparkles, UserCog, Heart,
  ExternalLink, Mail, Phone,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { empresasMockById } from "@/data/mockEmpresas";
import { usePermissao, type Permissao } from "@/config/permissoes";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AzumiLogo } from "@/components/brand/AzumiLogo";

interface SidebarConnectProps {
  variant?: "admin" | "cliente";
}

// Mapa de permissões exigidas por rota. Itens sem entrada aqui ficam sempre visíveis.
const PERMISSAO_POR_ROTA: Record<string, Permissao> = {
  "/app/financeiro": "financeiro.ver_valores",
  "/app/gestao-de-conta": "gestao_conta.relatorio",
  "/cliente/gestao-conta": "gestao_conta.relatorio",
  "/app/empresas": "empresas.ver",
  "/app/usuarios": "usuarios.gerenciar",
  "/app/clientes": "clientes.gerenciar",
  "/app/auditoria": "auditoria.ver",
};

// Ícone de rail por grupo — cada grupo do menu tem um representante no rail fixo.
const GROUP_RAIL_ICON: Record<string, string> = {
  "Principal": "solar:widget-2-bold-duotone",
  "Visão Geral": "solar:widget-2-bold-duotone",
  "Operações": "solar:case-round-bold-duotone",
  "Inteligência": "solar:chart-2-bold-duotone",
  "Gestão": "solar:wallet-bold-duotone",
  "Plataforma": "solar:calendar-bold-duotone",
};

const adminGroups = [
  {
    label: "Principal",
    items: [
      { to: "/app/dashboard", icon: LayoutDashboard, label: "Dashboard" },
      { to: "/app/empresas", icon: Building2, label: "Empresas" },
      { to: "/app/usuarios", icon: Users, label: "Usuários" },
    ],
  },
  {
    label: "Operações",
    items: [
      { to: "/app/projetos", icon: Briefcase, label: "Projetos" },
      { to: "/app/horas", icon: Clock, label: "Horas" },
      { to: "/app/solicitacoes", icon: MessagesSquare, label: "Solicitações" },
      { to: "/app/atracao", icon: Target, label: "Atração & Hunting" },
    ],
  },
  {
    label: "Inteligência",
    items: [{ to: "/app/analytics", icon: BarChart3, label: "Analytics" }],
  },
  {
    label: "Gestão",
    items: [
      { to: "/app/clientes", icon: Building2, label: "Clientes" },
      { to: "/app/financeiro", icon: Wallet, label: "Financeiro" },
      { to: "/app/gestao-de-conta", icon: Wallet, label: "Gestão de Conta" },
      { to: "/app/relatorios", icon: BarChart3, label: "Relatórios" },
      { to: "/app/documentos", icon: FileText, label: "Documentos" },
      { to: "/app/auditoria", icon: ShieldCheck, label: "Auditoria" },
    ],
  },
  {
    label: "Plataforma",
    items: [
      { to: "/app/calendario", icon: Calendar, label: "Calendário" },
      { to: "/app/comunicados", icon: Megaphone, label: "Comunicados" },
    ],
  },
];

const clienteGroups = [
  {
    label: "Visão Geral",
    items: [
      { to: "/cliente/dashboard", icon: LayoutDashboard, label: "Dashboard" },
      { to: "/cliente/projetos", icon: Briefcase, label: "Projetos" },
      { to: "/cliente/horas", icon: Clock, label: "Horas" },
    ],
  },
  {
    label: "Operações",
    items: [
      { to: "/cliente/solicitacoes", icon: MessagesSquare, label: "Solicitações" },
      { to: "/cliente/atracao", icon: Target, label: "Atração" },
    ],
  },
  {
    label: "Gestão",
    items: [
      { to: "/cliente/gestao-conta", icon: Wallet, label: "Gestão de Conta" },
      { to: "/cliente/documentos", icon: FileText, label: "Documentos" },
    ],
  },
  {
    label: "Plataforma",
    items: [
      { to: "/cliente/calendario", icon: Calendar, label: "Calendário" },
      { to: "/cliente/comunicados", icon: Megaphone, label: "Comunicados" },
      { to: "/cliente/guia", icon: BookOpen, label: "Guia / FAQ" },
    ],
  },
];

export function SidebarConnect({ variant = "admin" }: SidebarConnectProps) {
  // collapsed = true -> flyout fechado (só o rail de 80px aparece)
  const [collapsed, setCollapsed] = useState(false);
  const inactivityRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resetInactivity = () => {
    if (inactivityRef.current) clearTimeout(inactivityRef.current);
    inactivityRef.current = setTimeout(() => setCollapsed(true), 5000);
  };
  useEffect(() => {
    resetInactivity();
    window.addEventListener("mousemove", resetInactivity);
    window.addEventListener("keydown", resetInactivity);
    return () => {
      if (inactivityRef.current) clearTimeout(inactivityRef.current);
      window.removeEventListener("mousemove", resetInactivity);
      window.removeEventListener("keydown", resetInactivity);
    };
  }, []);
  const navigate = useNavigate();
  const { logout, user, usuario } = useAuth();
  const empresaInfo = usuario?.empresaId ? empresasMockById[usuario.empresaId] : null;
  const consultorNome = empresaInfo?.consultor ?? "Ana Beatriz";
  const consultorIniciais = empresaInfo?.consultorIniciais ?? "AB";
  const consultorEmail = empresaInfo?.consultorEmail ?? "ana.beatriz@azumirh.com.br";
  const { pode } = usePermissao();
  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  const [consultorOpen, setConsultorOpen] = useState(false);
  const groupsBase = variant === "admin" ? adminGroups : clienteGroups;
  // Filtra itens cuja rota exige permissão que o usuário não possui.
  const groups = groupsBase
    .map((g) => ({
      ...g,
      items: g.items.filter((it) => {
        const req = PERMISSAO_POR_ROTA[it.to];
        return req ? pode(req) : true;
      }),
    }))
    .filter((g) => g.items.length > 0);

  const [activeGroup, setActiveGroup] = useState<string | null>(groups[0]?.label ?? null);

  function openGroup(label: string) {
    setActiveGroup(label);
    setCollapsed(false);
    resetInactivity();
  }

  const pillClass =
    "group flex items-center gap-3 rounded-full px-4 py-3 text-[15px] text-sidebar-foreground " +
    "transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] hover:translate-x-1 " +
    "hover:bg-[hsl(var(--primary)/0.12)] hover:text-primary";
  const pillActiveClass = "!bg-[hsl(var(--primary)/0.12)] !text-primary";

  return (
    <div className="relative flex shrink-0">
      {/* Rail fixo — 80px, sempre visível */}
      <aside className="sidebar-connect-brand w-20 h-full flex flex-col items-center bg-gradient-sidebar border-r border-sidebar-border py-4 gap-1" aria-label="Navegação — atalhos">
        <div className="mb-4">
          <AzumiLogo product="Connect" collapsed light size={26} />
        </div>

        <button
          onClick={() => setCollapsed((c) => !c)}
          className="h-11 w-11 rounded-full flex items-center justify-center text-white/90 hover:bg-white/15 hover:text-white transition-colors mb-2"
          aria-label={collapsed ? "Abrir menu" : "Fechar menu"}
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex-1 flex flex-col gap-1 overflow-y-auto">
          {groups.map((g) => (
            <button
              key={g.label}
              onClick={() => openGroup(g.label)}
              title={g.label}
              className={cn(
                "h-11 w-11 rounded-full flex items-center justify-center transition-colors",
                activeGroup === g.label && !collapsed
                  ? "bg-[hsl(var(--primary-glow))] text-white shadow-sm"
                  : "text-white/90 hover:bg-white/15 hover:text-white"
              )}
            >
              <iconify-icon icon={GROUP_RAIL_ICON[g.label] ?? "solar:widget-2-bold-duotone"} width="22" height="22" />
            </button>
          ))}
        </div>

        <button
          onClick={handleLogout}
          className="h-11 w-11 rounded-full flex items-center justify-center text-white/90 hover:bg-white/15 hover:text-destructive transition-colors"
          aria-label="Sair"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </aside>

      {/* Flyout — faz parte do fluxo normal agora: a largura anima, então o conteúdo ao lado
          é empurrado/reduzido de verdade, não fica coberto por cima. */}
      <div
        className="h-full overflow-hidden shrink-0 transition-[width] duration-[400ms] ease-in-out"
        style={{ width: collapsed ? "0px" : "260px" }}
      >
        <aside
          className="h-full w-[260px] bg-[hsl(var(--primary)/0.07)] border-r border-border flex flex-col"
          style={{ boxShadow: collapsed ? "none" : "7px 7px 10px rgba(0,0,0,0.03)" }}
          aria-label="Navegação principal"
        >
        <div className="h-24 flex items-center justify-center px-5 border-b border-border">
          <AzumiLogo product="Connect" size={30} />
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
          {groups
            .filter((g) => g.label === activeGroup)
            .map((g) => (
              <div key={g.label}>
                <div className="px-4 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
                  {g.label}
                </div>
                <ul className="space-y-0.5">
                  {g.items.map((it) => (
                    <li key={it.to}>
                      <NavLink to={it.to} className={pillClass} activeClassName={pillActiveClass}>
                        <it.icon className="h-4 w-4 shrink-0" />
                        <span className="truncate">{it.label}</span>
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

          {variant === "admin" && activeGroup === "Plataforma" && (
            <div>
              <div className="px-4 mb-1.5 flex items-center gap-2">
                <Sparkles className="h-3 w-3 text-highlight" />
                <span className="text-[10px] font-semibold uppercase tracking-widest text-highlight">Hub</span>
              </div>
              <ul className="space-y-0.5">
                {[
                  { to: "/hub/lider/painel", icon: UserCog, label: "Meu Time (Líder)" },
                  { to: "/hub/colaborador/inicio", icon: Heart, label: "Colaborador" },
                  { to: "/hub/ceo/dashboard", icon: BarChart3, label: "CEO" },
                ].map((it) => (
                  <li key={it.to}>
                    <NavLink to={it.to} className={pillClass} activeClassName={pillActiveClass}>
                      <it.icon className="h-4 w-4 shrink-0" />
                      <span className="truncate">{it.label}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="pt-2 mt-2 border-t border-border">
            {(() => {
              const configHref = variant === "cliente" ? "/cliente/gestao-conta" : "/app/configuracoes";
              return (
                <NavLink to={configHref} className={pillClass} activeClassName={pillActiveClass}>
                  <Settings className="h-4 w-4 shrink-0" />
                  <span className="truncate">Configurações</span>
                </NavLink>
              );
            })()}

            {pode("portal_cliente.acessar") && (
              <button
                type="button"
                onClick={() => navigate("/portal")}
                className={cn(pillClass, "w-full text-xs text-muted-foreground")}
                aria-label="Acessar Portal do Cliente"
              >
                <ExternalLink className="h-4 w-4 shrink-0" />
                <span className="truncate">Acessar Portal do Cliente</span>
              </button>
            )}
          </div>
        </nav>

        {/* Cartão de rodapé — consultor (visão cliente) */}
        {user?.papel === "cliente" && (
          <div className="p-3 border-t border-border">
            <div className="bg-muted rounded-xl p-3">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="h-9 w-9 rounded-lg bg-[image:linear-gradient(135deg,hsl(var(--primary)),hsl(var(--primary-glow)))] flex items-center justify-center text-xs font-semibold text-white">
                    {consultorIniciais}
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-success ring-2 ring-card animate-soft-pulse" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Seu consultor Azumi</div>
                  <div className="text-sm font-medium truncate">{consultorNome}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setConsultorOpen(true)}
                className="mt-3 w-full text-xs text-muted-foreground hover:text-foreground flex items-center gap-1.5 px-2 py-1.5 rounded-md hover:bg-secondary"
              >
                <Mail className="h-3.5 w-3.5" /> Falar com consultor
              </button>
            </div>
          </div>
        )}
        </aside>
      </div>

      <Dialog open={consultorOpen} onOpenChange={setConsultorOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sua consultora Azumi</DialogTitle>
            <DialogDescription>Fale diretamente com quem cuida da sua conta.</DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-3 mt-2">
            <div className="h-12 w-12 rounded-lg bg-[image:linear-gradient(135deg,hsl(var(--primary)),hsl(var(--primary-glow)))] flex items-center justify-center text-sm font-semibold text-white">{consultorIniciais}</div>
            <div>
              <div className="text-base font-semibold">{consultorNome}</div>
              <div className="text-xs text-muted-foreground">Consultor(a) — Azumi RH</div>
            </div>
          </div>
          <div className="space-y-2 text-sm mt-2">
            <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" /> {consultorEmail}</div>
            <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" /> (11) 98888-1234</div>
            <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-muted-foreground" /> Seg–Sex, 9h às 18h</div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
