import { NavLink } from "@/components/NavLink";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Users, Heart, FileText, MessagesSquare, BookOpen,
  Calendar, Megaphone, GraduationCap, ShieldQuestion, Wallet, Plane,
  Gift, Settings, LogOut, Briefcase, BarChart3, TrendingUp,
  ChevronLeft, UserCircle2, Award, Grid3x3, Activity, ShieldAlert,
  Scale, ClipboardList, FileSignature, Route, Building2, Sparkles,
  Star, Receipt, Sun, Stethoscope, Gavel, Shield, KeyRound,
  ThermometerSun, History,
} from "lucide-react";
import { useState } from "react";
import { useAuth, type ModuloSlug } from "@/context/AuthContext";

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
}

interface NavGroup {
  label: string;
  modulo?: ModuloSlug;
  items: NavItem[];
}

// Menu base por perfil — APENAS estes itens são exibidos no momento.
// Módulos pagos (DP, Performance, Atração, Governança, etc.) ficam definidos
// mais abaixo em MODULOS como TODO e NÃO são renderizados ainda.
const FIXOS_POR_PERFIL: Record<HubProfile, NavGroup[]> = {
  colaborador: [
    {
      label: "Minha Área",
      items: [
        { to: "/hub/colaborador/inicio", icon: LayoutDashboard, label: "Início" },
        { to: "/hub/colaborador/sobre-voce", icon: UserCircle2, label: "Sobre você" },
        { to: "/hub/colaborador/politicas", icon: BookOpen, label: "Políticas" },
        { to: "/hub/colaborador/guias", icon: FileText, label: "Guias Internos" },
        { to: "/hub/colaborador/treinamentos", icon: GraduationCap, label: "Treinamentos" },
        { to: "/hub/colaborador/mural", icon: Megaphone, label: "Comunicados" },
        { to: "/hub/colaborador/beneficios", icon: Gift, label: "Benefícios" },
        { to: "/hub/colaborador/termometro", icon: ThermometerSun, label: "Termômetro" },
        { to: "/hub/colaborador/solicitacoes", icon: ClipboardList, label: "Solicitações" },
        { to: "/hub/colaborador/ajuda", icon: ShieldQuestion, label: "Ajuda" },
        { to: "/hub/colaborador/mural", icon: Sparkles, label: "Mural" },
        { to: "/hub/colaborador/onboarding", icon: Route, label: "Onboarding" },
      ],
    },
  ],
  lider: [
    {
      label: "Gestão do Time",
      items: [
        { to: "/hub/lider/painel", icon: LayoutDashboard, label: "Painel" },
        { to: "/hub/lider/sobre-voce", icon: UserCircle2, label: "Sobre você" },
        { to: "/hub/lider/meu-time", icon: Users, label: "Meu time" },
        { to: "/hub/lider/politicas", icon: BookOpen, label: "Políticas" },
        { to: "/hub/lider/beneficios", icon: Gift, label: "Benefícios" },
        { to: "/hub/lider/termometro", icon: ThermometerSun, label: "Termômetro" },
        { to: "/hub/lider/solicitacoes", icon: ClipboardList, label: "Solicitações" },
        { to: "/hub/lider/ajuda", icon: ShieldQuestion, label: "Ajuda" },
        { to: "/hub/lider/mural", icon: Sparkles, label: "Mural" },
        { to: "/hub/lider/onboarding", icon: Route, label: "Onboarding" },
      ],
    },
  ],
  ceo: [
    {
      label: "Visão Executiva",
      items: [
        { to: "/hub/ceo/dashboard", icon: LayoutDashboard, label: "Dashboard" },
        { to: "/hub/ceo/clima", icon: ThermometerSun, label: "Clima" },
        { to: "/hub/ceo/headcount", icon: Users, label: "Headcount" },
        { to: "/hub/ceo/politicas", icon: BookOpen, label: "Políticas" },
        { to: "/hub/ceo/minha-empresa", icon: Building2, label: "Minha empresa" },
        { to: "/hub/ceo/beneficios", icon: Gift, label: "Benefícios" },
        { to: "/hub/ceo/historico", icon: History, label: "Histórico" },
        { to: "/hub/ceo/solicitacoes", icon: ClipboardList, label: "Solicitações" },
        { to: "/hub/ceo/ajuda", icon: ShieldQuestion, label: "Ajuda" },
      ],
    },
  ],
};

// 10 módulos do Hub
const MODULOS: NavGroup[] = [
  {
    label: "Atração de Talentos",
    modulo: "atracao",
    items: [
      { to: "#", icon: Briefcase, label: "Vagas" },
      { to: "#", icon: Users, label: "Banco de Talentos" },
      { to: "#", icon: UserCircle2, label: "Candidatos" },
    ],
  },
  {
    label: "Performance",
    modulo: "performance",
    items: [
      { to: "#", icon: Award, label: "Avaliação de Desempenho" },
      { to: "#", icon: MessagesSquare, label: "Feedbacks" },
      { to: "#", icon: Grid3x3, label: "Matriz 9Box" },
      { to: "#", icon: Activity, label: "Perfil Comportamental" },
    ],
  },
  {
    label: "Governança e Ética",
    modulo: "governanca",
    items: [
      { to: "#", icon: ShieldAlert, label: "Canal de Denúncias" },
      { to: "#", icon: Shield, label: "Compliance" },
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
      { to: "#", icon: BookOpen, label: "Políticas" },
      { to: "#", icon: FileSignature, label: "Assinaturas" },
    ],
  },
  {
    label: "Engenharia de Pessoas",
    modulo: "engenharia_pessoas",
    items: [
      { to: "#", icon: Building2, label: "Cargos" },
      { to: "#", icon: Route, label: "Trilha de Carreira" },
    ],
  },
  {
    label: "Endomarketing",
    modulo: "endomarketing",
    items: [
      { to: "#", icon: Megaphone, label: "Comunicados" },
      { to: "#", icon: Sparkles, label: "Mural" },
      { to: "#", icon: Star, label: "Destaques" },
    ],
  },
  {
    label: "Departamento Pessoal",
    modulo: "dp",
    items: [
      { to: "/hub/colaborador/holerites", icon: Wallet, label: "Holerites" },
      { to: "/hub/colaborador/ferias", icon: Plane, label: "Férias" },
      { to: "#", icon: Stethoscope, label: "Afastamentos" },
      { to: "#", icon: FileText, label: "Sindicato e CCT" },
    ],
  },
  {
    label: "Contabilidade",
    modulo: "contabilidade",
    items: [
      { to: "#", icon: BarChart3, label: "Visão Geral Contábil" },
      { to: "#", icon: Receipt, label: "Holerites" },
      { to: "#", icon: FileText, label: "Arquivos do Mês" },
    ],
  },
  {
    label: "Jurídico",
    modulo: "juridico",
    items: [{ to: "#", icon: Gavel, label: "Processos Trabalhistas" }],
  },
];

export function SidebarHub({ profile }: { profile: HubProfile }) {
  const [collapsed, setCollapsed] = useState(false);
  const { hasModulo, podeOperar, usuario, logout } = useAuth();

  // Mostra grupo se: não tem guard OU usuário tem o módulo
  // TODO: quando os módulos pagos forem ativados, voltar a usar:
  // const visiveis = MODULOS.filter((g) => !g.modulo || hasModulo(g.modulo));
  void hasModulo; // mantém import enquanto MODULOS está como TODO

  // Permissões mostra apenas para quem opera algo administrativo (admin)
  const mostrarPermissoes =
    !!usuario && (usuario.role === "admin" || podeOperar("dp"));

  return (
    <aside
      className={cn(
        "flex flex-col shrink-0 border-r border-sidebar-border bg-gradient-sidebar transition-all duration-300",
        collapsed ? "w-16" : "w-60"
      )}
    >
      <div className="h-16 flex items-center px-4 border-b border-sidebar-border/60">
        {collapsed ? (
          <div className="h-9 w-9 rounded-lg bg-gradient-brand flex items-center justify-center font-logo font-bold text-white">A</div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-gradient-brand flex items-center justify-center font-logo font-bold text-white">A</div>
            <div>
              <div className="font-logo font-bold text-base text-gradient-brand leading-none">Azumi Hub</div>
              <div className="mt-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[9px] uppercase tracking-wider font-semibold">
                {profileLabel[profile]}
              </div>
            </div>
          </div>
        )}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="ml-auto h-7 w-7 rounded-md hover:bg-sidebar-accent flex items-center justify-center text-muted-foreground"
          aria-label="Recolher menu"
        >
          <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-5">
        {FIXOS_POR_PERFIL[profile].map((g) => (
          <div key={g.label}>
            {!collapsed && (
              <div className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">{g.label}</div>
            )}
            <ul className="space-y-0.5">
              {g.items.map((it) => (
                <li key={`${g.label}-${it.label}`}>
                  <NavLink
                    to={it.to}
                    className={cn(
                      "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors",
                      collapsed && "justify-center px-0"
                    )}
                    activeClassName="!bg-primary/15 !text-foreground border-l-[3px] border-primary rounded-l-none ml-[3px]"
                  >
                    <it.icon className="h-4 w-4 shrink-0" />
                    {!collapsed && <span className="truncate">{it.label}</span>}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Sempre visível no rodapé do nav */}
        <div>
          {!collapsed && (
            <div className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">Sistema</div>
          )}
          <ul className="space-y-0.5">
            <li>
              <NavLink
                to="#"
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors",
                  collapsed && "justify-center px-0"
                )}
                activeClassName="!bg-primary/15 !text-foreground border-l-[3px] border-primary rounded-l-none ml-[3px]"
              >
                <Settings className="h-4 w-4 shrink-0" />
                {!collapsed && <span className="truncate">Configurações</span>}
              </NavLink>
            </li>
            {mostrarPermissoes && (
              <li>
                <NavLink
                  to="#"
                  className={cn(
                    "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors",
                    collapsed && "justify-center px-0"
                  )}
                  activeClassName="!bg-primary/15 !text-foreground border-l-[3px] border-primary rounded-l-none ml-[3px]"
                >
                  <KeyRound className="h-4 w-4 shrink-0" />
                  {!collapsed && <span className="truncate">Permissões</span>}
                </NavLink>
              </li>
            )}
          </ul>
        </div>
      </nav>

      <div className="p-3 border-t border-sidebar-border/60">
        {!collapsed ? (
          <div className="bg-card/70 rounded-xl p-3 border border-border/60">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-gradient-brand flex items-center justify-center text-xs font-semibold text-white">
                {(usuario?.nome ?? "VC").slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium truncate">{usuario?.nome ?? "Você"}</div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{profileLabel[profile]}</div>
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
            <div className="h-8 w-8 rounded-full bg-gradient-brand flex items-center justify-center text-[10px] font-semibold text-white">
              {(usuario?.nome ?? "VC").slice(0, 2).toUpperCase()}
            </div>
            <NavLink to="/login" onClick={() => logout()} className="text-muted-foreground hover:text-destructive">
              <LogOut className="h-4 w-4" />
            </NavLink>
          </div>
        )}
      </div>
    </aside>
  );
}
