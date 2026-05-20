import { NavLink } from "@/components/NavLink";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Users, FileText, MessagesSquare, BookOpen,
  Megaphone, GraduationCap, ShieldQuestion, Wallet, Plane,
  Gift, Settings, LogOut, Briefcase, BarChart3,
  UserCircle2, Award, Grid3x3, Activity, ShieldAlert,
  ClipboardList, FileSignature, Route, Building2, Sparkles,
  Star, Receipt, Stethoscope, Gavel, Shield, KeyRound,
  ThermometerSun, History, FlaskConical,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useAuth, type ModuloSlug } from "@/context/AuthContext";
import { useModulos } from "@/context/ModulesContext";
import type { ModuloId, PaginaId } from "@/config/modules";

type HubProfile = "lider" | "colaborador" | "ceo";

const profileLabel: Record<HubProfile, string> = {
  lider: "Líder",
  colaborador: "Colaborador",
  ceo: "CEO",
};

interface NavItem {
  to: string;
  icon: any;
  label: string;
  moduloId?: ModuloId;
  paginaId?: PaginaId;
}

interface NavGroup {
  label: string;
  modulo?: ModuloSlug;
  items: NavItem[];
}

const FIXOS_POR_PERFIL: Record<HubProfile, NavGroup[]> = {
  colaborador: [
    {
      label: "Minha Área",
      items: [
        { to: "/hub/colaborador/inicio",      icon: LayoutDashboard, label: "Início" },
        { to: "/hub/colaborador/sobre-voce",  icon: UserCircle2,     label: "Sobre você" },
        { to: "/hub/colaborador/politicas",   icon: BookOpen,        label: "Políticas",       moduloId: "hub_wiki",        paginaId: "politicas" },
        { to: "/hub/colaborador/guias",       icon: FileText,        label: "Guias Internos",  moduloId: "hub_wiki",        paginaId: "guias" },
        { to: "/hub/colaborador/treinamentos",icon: GraduationCap,   label: "Treinamentos",    moduloId: "hub_wiki",        paginaId: "treinamentos" },
        { to: "/hub/colaborador/mural",       icon: Megaphone,       label: "Comunicados",     moduloId: "hub_comunicacao", paginaId: "mural" },
        { to: "/hub/colaborador/beneficios",  icon: Gift,            label: "Benefícios",      moduloId: "hub_pessoas",     paginaId: "beneficios" },
        { to: "/hub/colaborador/termometro",  icon: ThermometerSun,  label: "Termômetro",      moduloId: "hub_pessoas",     paginaId: "termometro" },
        { to: "/hub/colaborador/onboarding",  icon: Route,           label: "Onboarding",      moduloId: "hub_pessoas",     paginaId: "onboarding" },
        { to: "/hub/colaborador/holerites",   icon: Wallet,          label: "Holerites",       moduloId: "hub_dp",          paginaId: "holerites" },
        { to: "/hub/colaborador/ferias",      icon: Plane,           label: "Férias",          moduloId: "hub_dp",          paginaId: "ferias" },
        { to: "/hub/colaborador/solicitacoes",icon: ClipboardList,   label: "Solicitações" },
        { to: "/hub/colaborador/ajuda",       icon: ShieldQuestion,  label: "Ajuda" },
      ],
    },
  ],
  lider: [
    {
      label: "Gestão do Time",
      items: [
        { to: "/hub/lider/painel",      icon: LayoutDashboard, label: "Painel" },
        { to: "/hub/lider/sobre-voce",  icon: UserCircle2,     label: "Sobre você" },
        { to: "/hub/lider/meu-time",    icon: Users,           label: "Meu time" },
        { to: "/hub/lider/mural",       icon: Megaphone,       label: "Comunicados",  moduloId: "hub_comunicacao", paginaId: "mural" },
        { to: "/hub/lider/politicas",   icon: BookOpen,        label: "Políticas",    moduloId: "hub_wiki",        paginaId: "politicas" },
        { to: "/hub/lider/beneficios",  icon: Gift,            label: "Benefícios",   moduloId: "hub_pessoas",     paginaId: "beneficios" },
        { to: "/hub/lider/termometro",  icon: ThermometerSun,  label: "Termômetro",   moduloId: "hub_pessoas",     paginaId: "termometro" },
        { to: "/hub/lider/onboarding",  icon: Route,           label: "Onboarding",   moduloId: "hub_pessoas",     paginaId: "onboarding" },
        { to: "/hub/lider/solicitacoes",icon: ClipboardList,   label: "Solicitações" },
        { to: "/hub/lider/ajuda",       icon: ShieldQuestion,  label: "Ajuda" },
      ],
    },
  ],
  ceo: [
    {
      label: "Visão Executiva",
      items: [
        { to: "/hub/ceo/dashboard",      icon: LayoutDashboard, label: "Dashboard" },
        { to: "/hub/ceo/headcount",      icon: Users,           label: "Headcount" },
        { to: "/hub/ceo/clima",          icon: ThermometerSun,  label: "Clima",           moduloId: "hub_pessoas",  paginaId: "termometro" },
        { to: "/hub/ceo/politicas",      icon: BookOpen,        label: "Políticas",        moduloId: "hub_wiki",     paginaId: "politicas" },
        { to: "/hub/ceo/beneficios",     icon: Gift,            label: "Benefícios",       moduloId: "hub_pessoas",  paginaId: "beneficios" },
        { to: "/hub/ceo/minha-empresa",  icon: Building2,       label: "Minha empresa" },
        { to: "/hub/ceo/historico",      icon: History,         label: "Histórico" },
        { to: "/hub/ceo/solicitacoes",   icon: ClipboardList,   label: "Solicitações" },
        { to: "/hub/ceo/ajuda",          icon: ShieldQuestion,  label: "Ajuda" },
      ],
    },
  ],
};

const MODULOS: NavGroup[] = [
  {
    label: "Atração de Talentos",
    modulo: "atracao",
    items: [
      { to: "#", icon: Briefcase,    label: "Vagas" },
      { to: "#", icon: Users,        label: "Banco de Talentos" },
      { to: "#", icon: UserCircle2,  label: "Candidatos" },
    ],
  },
  {
    label: "Performance",
    modulo: "performance",
    items: [
      { to: "#", icon: Award,         label: "Avaliação de Desempenho" },
      { to: "#", icon: MessagesSquare,label: "Feedbacks" },
      { to: "#", icon: Grid3x3,       label: "Matriz 9Box" },
      { to: "#", icon: Activity,      label: "Perfil Comportamental" },
    ],
  },
  {
    label: "Governança e Ética",
    modulo: "governanca",
    items: [
      { to: "#", icon: ShieldAlert, label: "Canal de Denúncias" },
      { to: "#", icon: Shield,      label: "Compliance" },
    ],
  },
  {
    label: "Regulamentação",
    modulo: "regulamentacao",
    items: [{ to: "#", icon: ClipboardList, label: "Normas e SST" }],
  },
  {
    label: "Políticas e Manuais",
    modulo: "politicas",
    items: [
      { to: "#", icon: BookOpen,       label: "Políticas" },
      { to: "#", icon: FileSignature,  label: "Assinaturas" },
    ],
  },
  {
    label: "Engenharia de Pessoas",
    modulo: "engenharia_pessoas",
    items: [
      { to: "#", icon: Building2, label: "Cargos" },
      { to: "#", icon: Route,     label: "Trilha de Carreira" },
    ],
  },
  {
    label: "Endomarketing",
    modulo: "endomarketing",
    items: [
      { to: "#", icon: Megaphone, label: "Comunicados" },
      { to: "#", icon: Sparkles,  label: "Mural" },
      { to: "#", icon: Star,      label: "Destaques" },
    ],
  },
  {
    label: "Departamento Pessoal",
    modulo: "dp",
    items: [
      { to: "/hub/colaborador/holerites", icon: Wallet,      label: "Holerites" },
      { to: "/hub/colaborador/ferias",    icon: Plane,       label: "Férias" },
      { to: "#",                          icon: Stethoscope, label: "Afastamentos" },
      { to: "#",                          icon: FileText,    label: "Sindicato e CCT" },
    ],
  },
  {
    label: "Contabilidade",
    modulo: "contabilidade",
    items: [
      { to: "#", icon: BarChart3, label: "Visão Geral Contábil" },
      { to: "#", icon: Receipt,   label: "Holerites" },
      { to: "#", icon: FileText,  label: "Arquivos do Mês" },
    ],
  },
  {
    label: "Jurídico",
    modulo: "juridico",
    items: [{ to: "#", icon: Gavel, label: "Processos Trabalhistas" }],
  },
];

/* ─── Tooltip portal (idêntico ao Connect) ─── */
function NavTooltip({ label, children }: { label: string; children: React.ReactNode }) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const ref = useRef<HTMLSpanElement | null>(null);
  const show = () => {
    const r = ref.current?.getBoundingClientRect();
    if (r) setPos({ x: r.right + 8, y: r.top + r.height / 2 });
  };
  const hide = () => setPos(null);
  return (
    <>
      <span
        ref={ref}
        onMouseEnter={show}
        onMouseLeave={hide}
        style={{ display: "inline-flex", alignItems: "center", justifyContent: "center" }}
      >
        {children}
      </span>
      {pos && createPortal(
        <div
          style={{
            position: "fixed",
            left: pos.x,
            top: pos.y,
            transform: "translateY(-50%)",
            background: "#DBEAFE",
            color: "#031D38",
            fontSize: 12,
            fontWeight: 500,
            padding: "4px 10px",
            borderRadius: 6,
            whiteSpace: "nowrap",
            border: "1px solid #BFDBFE",
            boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
            fontFamily: "'Urbanist',sans-serif",
            zIndex: 9999,
            pointerEvents: "none",
          }}
        >
          {label}
        </div>,
        document.body
      )}
    </>
  );
}

const ICON_COLOR = "#3B82F6";

export function SidebarHub({ profile }: { profile: HubProfile }) {
  const [collapsed, setCollapsed] = useState(false);
  const { hasModulo, podeOperar, usuario, logout } = useAuth();
  const { isPaginaAtiva, isModuloAtivo, isEmTrial, diasRestantesTrial } = useModulos();

  const mostrarPermissoes =
    !!usuario && (usuario.role === "admin" || podeOperar("dp"));

  const modulosVisiveis = MODULOS.filter(
    (g) => g.modulo && hasModulo(g.modulo) && isModuloAtivo(g.modulo as ModuloId)
  );

  /* Auto-colapso 10s */
  const inactivityRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resetInactivity = () => {
    if (inactivityRef.current) clearTimeout(inactivityRef.current);
    inactivityRef.current = setTimeout(() => setCollapsed(true), 10000);
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

  const renderItem = (it: NavItem, keyPrefix: string, extraBadge?: React.ReactNode) => (
    <li key={`${keyPrefix}-${it.label}`}>
      {collapsed ? (
        <NavLink
          to={it.to}
          onClick={(e) => e.stopPropagation()}
          className="flex items-center justify-center w-full py-2.5 hover:bg-[#BFDBFE] transition-colors rounded-none"
          activeClassName="!bg-[#93C5FD]"
        >
          <NavTooltip label={it.label}>
            <it.icon className="h-4 w-4 shrink-0" style={{ color: ICON_COLOR }} />
          </NavTooltip>
        </NavLink>
      ) : (
        <NavLink
          to={it.to}
          className="group flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
          activeClassName="!bg-primary/15 !text-foreground border-l-[3px] border-primary rounded-l-none ml-[3px]"
        >
          <it.icon className="h-4 w-4 shrink-0" style={{ color: ICON_COLOR }} />
          <span className="truncate flex-1" style={{ fontFamily: "'Urbanist',sans-serif" }}>{it.label}</span>
          {extraBadge}
        </NavLink>
      )}
    </li>
  );

  return (
    <aside
      onClick={() => { if (collapsed) setCollapsed(false); }}
      className={cn(collapsed ? "" : "bg-gradient-sidebar")}
      style={{
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        width: collapsed ? 64 : 240,
        transition: "width 0.3s ease",
        borderRight: "1px solid hsl(var(--sidebar-border))",
        background: collapsed ? "#DBEAFE" : undefined,
        cursor: collapsed ? "pointer" : "default",
        height: "100svh",
        position: "sticky",
        top: 0,
      }}
      aria-label="Navegação Hub"
    >
      {/* Logo */}
      <div style={{ height: 64, display: "flex", alignItems: "center", padding: "0 16px", borderBottom: "1px solid hsl(var(--sidebar-border) / 0.6)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: collapsed ? 0 : 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg,#3B82F6,#031D38)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ color: "white", fontSize: 13, fontWeight: 800, fontFamily: "'Urbanist',sans-serif" }}>A</span>
          </div>
          {!collapsed && (
            <span style={{ fontSize: 16, fontWeight: 800, color: "#031D38", fontFamily: "'Urbanist',sans-serif", letterSpacing: "-0.03em" }}>
              Hub
            </span>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-5">
        {FIXOS_POR_PERFIL[profile].map((g) => {
          const itensFiltrados = g.items.filter((it) => {
            if (!it.moduloId || !it.paginaId) return true;
            return isPaginaAtiva(it.moduloId, it.paginaId);
          });
          if (itensFiltrados.length === 0) return null;
          return (
            <div key={g.label}>
              {!collapsed && (
                <div className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
                  {g.label}
                </div>
              )}
              <ul className="space-y-0.5">
                {itensFiltrados.map((it) => {
                  const emTrial = it.moduloId ? isEmTrial(it.moduloId) : false;
                  const diasTrial = it.moduloId ? diasRestantesTrial(it.moduloId) : null;
                  const badge = emTrial && diasTrial !== null ? (
                    <span
                      title={`Período de teste — ${diasTrial} dia${diasTrial === 1 ? "" : "s"} restante${diasTrial === 1 ? "" : "s"}`}
                      className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-600 text-[9px] font-semibold shrink-0"
                    >
                      <FlaskConical className="h-2.5 w-2.5" />
                      {diasTrial}d
                    </span>
                  ) : undefined;
                  return renderItem(it, g.label, badge);
                })}
              </ul>
            </div>
          );
        })}

        {modulosVisiveis.map((g) => {
          const emTrial = g.modulo ? isEmTrial(g.modulo as ModuloId) : false;
          const diasTrial = g.modulo ? diasRestantesTrial(g.modulo as ModuloId) : null;
          return (
            <div key={g.label}>
              {!collapsed && (
                <div className="px-3 mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
                  {g.label}
                  {emTrial && diasTrial !== null && (
                    <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-600 text-[9px] font-semibold normal-case tracking-normal">
                      <FlaskConical className="h-2.5 w-2.5" />
                      Trial {diasTrial}d
                    </span>
                  )}
                </div>
              )}
              <ul className="space-y-0.5">
                {g.items.map((it) => renderItem(it, g.label))}
              </ul>
            </div>
          );
        })}

        {/* Sistema */}
        <div className="pt-2 mt-2 border-t border-sidebar-border/60">
          {!collapsed && (
            <div className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
              Sistema
            </div>
          )}
          <ul className="space-y-0.5">
            {renderItem({ to: "#", icon: Settings, label: "Configurações" }, "sys")}
            {mostrarPermissoes && renderItem({ to: "#", icon: KeyRound, label: "Permissões" }, "sys")}
          </ul>
        </div>
      </nav>

      {/* Footer / usuário */}
      <div className="p-3 border-t border-sidebar-border/60">
        {!collapsed ? (
          <div className="bg-card/70 rounded-xl p-3 border border-border/60">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-gradient-brand flex items-center justify-center text-xs font-semibold text-white">
                {(usuario?.nome ?? "VC").slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium truncate" style={{ fontFamily: "'Urbanist',sans-serif" }}>{usuario?.nome ?? "Você"}</div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {profileLabel[profile]}
                </div>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <button className="flex-1 text-xs text-muted-foreground hover:text-foreground flex items-center gap-1.5 px-2 py-1.5 rounded-md hover:bg-secondary">
                <Settings className="h-3.5 w-3.5" /> Config.
              </button>
              <NavLink
                to="/login"
                onClick={() => logout()}
                className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1.5 px-2 py-1.5 rounded-md hover:bg-secondary"
              >
                <LogOut className="h-3.5 w-3.5" /> Sair
              </NavLink>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <NavTooltip label={usuario?.nome ?? "Você"}>
              <div className="h-8 w-8 rounded-lg bg-gradient-brand flex items-center justify-center text-[10px] font-semibold text-white">
                {(usuario?.nome ?? "VC").slice(0, 2).toUpperCase()}
              </div>
            </NavTooltip>
            <NavLink to="/login" onClick={(e) => { e.stopPropagation(); logout(); }} className="text-muted-foreground hover:text-destructive">
              <LogOut className="h-4 w-4" />
            </NavLink>
          </div>
        )}
      </div>
    </aside>
  );
}
