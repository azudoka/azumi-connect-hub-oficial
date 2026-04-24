import { NavLink } from "@/components/NavLink";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Building2, Users, Briefcase, Clock, MessagesSquare, Target,
  BarChart3, Wallet, FileText, ShieldCheck, Calendar, Megaphone, BookOpen,
  Settings, Settings2, LogOut, ChevronLeft, Sparkles, UserCog, Heart, Wrench,
  ExternalLink
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

interface SidebarConnectProps {
  variant?: "admin" | "cliente";
}

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
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();
  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  const groups = variant === "admin" ? adminGroups : clienteGroups;

  return (
    <aside
      className={cn(
        "flex flex-col shrink-0 border-r border-sidebar-border bg-gradient-sidebar transition-all duration-300",
        collapsed ? "w-16" : "w-60"
      )}
      aria-label="Navegação principal"
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-sidebar-border/60">
        {collapsed ? (
          <div className="h-9 w-9 rounded-lg bg-gradient-brand flex items-center justify-center font-logo font-bold text-white">
            A
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-gradient-brand flex items-center justify-center font-logo font-bold text-white">
              A
            </div>
            <div>
              <div className="font-logo font-bold text-base text-gradient-brand leading-none">
                Azumi Connect
              </div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">
                {variant === "admin" ? "Admin · Consultor" : "Cliente"}
              </div>
            </div>
          </div>
        )}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="ml-auto h-7 w-7 rounded-md hover:bg-sidebar-accent flex items-center justify-center text-muted-foreground"
          aria-label={collapsed ? "Expandir" : "Colapsar"}
        >
          <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-5">
        {groups.map((g) => (
          <div key={g.label}>
            {!collapsed && (
              <div className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
                {g.label}
              </div>
            )}
            <ul className="space-y-0.5">
              {g.items.map((it) => (
                <li key={it.to}>
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

        {variant === "admin" && (
          <div>
            {!collapsed && (
              <div className="px-3 mb-1.5 flex items-center gap-2">
                <Sparkles className="h-3 w-3 text-highlight" />
                <span className="text-[10px] font-semibold uppercase tracking-widest text-highlight">Hub</span>
              </div>
            )}
            <ul className="space-y-0.5">
              {[
                { to: "/hub/lider/painel", icon: UserCog, label: "Meu Time (Líder)" },
                { to: "/hub/colaborador/inicio", icon: Heart, label: "Colaborador" },
                { to: "/hub/ceo/dashboard", icon: BarChart3, label: "CEO" },
              ].map((it) => (
                <li key={it.to}>
                  <NavLink
                    to={it.to}
                    className={cn(
                      "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors",
                      collapsed && "justify-center px-0"
                    )}
                    activeClassName="!bg-primary/15 !text-foreground"
                  >
                    <it.icon className="h-4 w-4 shrink-0" />
                    {!collapsed && <span className="truncate">{it.label}</span>}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Configurações — sempre no final */}
        <div className="pt-2 mt-2 border-t border-sidebar-border/60">
          <NavLink
            to="/app/configuracoes"
            className={cn(
              "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors",
              collapsed && "justify-center px-0"
            )}
            activeClassName="!bg-primary/15 !text-foreground"
          >
            <Settings2 className="h-4 w-4 shrink-0" />
            {!collapsed && <span className="truncate">Configurações</span>}
          </NavLink>

          {variant === "admin" && (
            <>
              <div className="my-2 h-px bg-sidebar-border/60" />
              <button
                type="button"
                onClick={() => navigate("/portal")}
                className={cn(
                  "group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors",
                  collapsed ? "justify-center px-0" : "text-xs text-muted-foreground"
                )}
                aria-label="Acessar Portal do Cliente"
              >
                <ExternalLink className="h-4 w-4 shrink-0" />
                {!collapsed && (
                  <span className="truncate">Acessar Portal do Cliente</span>
                )}
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Consultor card */}
      <div className="p-3 border-t border-sidebar-border/60">
        {!collapsed ? (
          <div className="bg-card/60 backdrop-blur rounded-xl p-3 border border-border/60">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="h-9 w-9 rounded-full bg-gradient-brand flex items-center justify-center text-xs font-semibold text-white">
                  AB
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-success ring-2 ring-card animate-soft-pulse" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Seu consultor</div>
                <div className="text-sm font-medium truncate">Ana Beatriz</div>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <NavLink to="/app/configuracoes" className="flex-1 text-xs text-muted-foreground hover:text-foreground flex items-center gap-1.5 px-2 py-1.5 rounded-md hover:bg-secondary">
                <Settings className="h-3.5 w-3.5" /> Config.
              </NavLink>
              <button
                type="button"
                onClick={handleLogout}
                className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1.5 px-2 py-1.5 rounded-md hover:bg-secondary"
              >
                <LogOut className="h-3.5 w-3.5" /> Sair
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="relative">
              <div className="h-8 w-8 rounded-full bg-gradient-brand flex items-center justify-center text-[10px] font-semibold text-white">AB</div>
              <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-success ring-2 ring-sidebar" />
            </div>
            <NavLink to="/login" className="text-muted-foreground hover:text-destructive">
              <LogOut className="h-4 w-4" />
            </NavLink>
          </div>
        )}
      </div>
    </aside>
  );
}
