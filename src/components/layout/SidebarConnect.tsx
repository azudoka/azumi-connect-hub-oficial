import { NavLink } from "@/components/NavLink";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Building2, Users, Briefcase, Clock, MessagesSquare, Target,
  BarChart3, CreditCard, Receipt, FileText, ShieldCheck, Calendar, Megaphone, BookOpen,
  Settings, LogOut, ChevronLeft,
  ExternalLink, Mail, Phone
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { usePermissao, type Permissao } from "@/config/permissoes";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";


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
      { to: "/app/financeiro", icon: CreditCard, label: "Financeiro" },
      { to: "/app/gestao-de-conta", icon: Receipt, label: "Gestão de Conta" },
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
      { to: "/cliente/gestao-conta", icon: Receipt, label: "Gestão de Conta" },
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
  const { logout, user } = useAuth();
  const { pode } = usePermissao();
  const papelLabel =
    user?.papel === "admin"
      ? "Administrador"
      : user?.papel === "consultor"
      ? "Consultor"
      : user?.papel === "cliente"
      ? "Cliente"
      : "";
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
  }, [collapsed]);

  return (
    <aside
      className={cn(
        "flex flex-col shrink-0 border-r border-sidebar-border transition-all duration-300",
        collapsed ? "w-16 bg-[#F5F3FF]" : "w-60 bg-gradient-sidebar"
      )}
      aria-label="Navegação principal"
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-sidebar-border/60">
        <div style={{ display: "flex", alignItems: "center", gap: collapsed ? 0 : 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg,#031D38,#8B5CF6)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ color: "white", fontSize: 13, fontWeight: 800, fontFamily: "'Urbanist',sans-serif" }}>A</span>
          </div>
          {!collapsed && (
            <span style={{ fontSize: 15, fontWeight: 800, color: "#0F172A", fontFamily: "'Urbanist',sans-serif", letterSpacing: "-0.02em" }}>
              Connect
            </span>
          )}
        </div>
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
                      collapsed && "justify-center px-0 bg-[#8B5CF6]/10"
                    )}
                    activeClassName="!bg-primary/15 !text-foreground border-l-[3px] border-primary rounded-l-none ml-[3px]"
                  >
                    {collapsed ? (
                      <span title={it.label}>
                        <it.icon className="h-5 w-5 shrink-0" />
                      </span>
                    ) : (
                      <>
                        <it.icon className="h-4 w-4 shrink-0" />
                        <span className="truncate">{it.label}</span>
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}



        {/* Configurações — sempre no final */}
        <div className="pt-2 mt-2 border-t border-sidebar-border/60">
          {(() => {
            const configHref = variant === "cliente" ? "/cliente/gestao-conta" : "/app/configuracoes";
            return (
              <NavLink
                to={configHref}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors",
                  collapsed && "justify-center px-0"
                )}
                activeClassName="!bg-primary/15 !text-foreground"
              >
                <Settings className="h-4 w-4 shrink-0" />
                {!collapsed && <span className="truncate">Configurações</span>}
              </NavLink>
            );
          })()}

          {pode("portal_cliente.acessar") && (
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

      {/* Footer card */}
      <div className="p-3 border-t border-sidebar-border/60">
        {!collapsed ? (
          <div className="bg-card/60 backdrop-blur rounded-xl p-3 border border-border/60">
            {user?.papel === "cliente" && (
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="h-9 w-9 rounded-lg bg-gradient-brand flex items-center justify-center text-xs font-semibold text-white">
                    AB
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-success ring-2 ring-card animate-soft-pulse" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Seu consultor Azumi</div>
                  <div className="text-sm font-medium truncate">Ana Beatriz</div>
                </div>
              </div>
            )}
            <div className={cn("flex items-center gap-2", user?.papel === "cliente" && "mt-3")}>
              {user?.papel === "cliente" && (
                <button
                  type="button"
                  onClick={() => setConsultorOpen(true)}
                  className="flex-1 text-xs text-muted-foreground hover:text-foreground flex items-center gap-1.5 px-2 py-1.5 rounded-md hover:bg-secondary"
                >
                  <Mail className="h-3.5 w-3.5" /> Falar com consultor
                </button>
              )}
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
            {user?.papel === "cliente" && (
              <div className="relative">
                <div className="h-8 w-8 rounded-lg bg-gradient-brand flex items-center justify-center text-[10px] font-semibold text-white">AB</div>
                <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-success ring-2 ring-sidebar" />
              </div>
            )}
            <button
              type="button"
              onClick={handleLogout}
              aria-label="Sair"
              className="text-muted-foreground hover:text-destructive"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      <Dialog open={consultorOpen} onOpenChange={setConsultorOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sua consultora Azumi</DialogTitle>
            <DialogDescription>Fale diretamente com quem cuida da sua conta.</DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-3 mt-2">
            <div className="h-12 w-12 rounded-full bg-gradient-brand flex items-center justify-center text-sm font-semibold text-white">AB</div>
            <div>
              <div className="text-base font-semibold">Ana Beatriz</div>
              <div className="text-xs text-muted-foreground">Consultora sênior — Azumi</div>
            </div>
          </div>
          <div className="space-y-2 text-sm mt-2">
            <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" /> ana.beatriz@azumi.com.br</div>
            <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" /> (11) 98888-1234</div>
            <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-muted-foreground" /> Seg–Sex, 9h às 18h</div>
          </div>
        </DialogContent>
      </Dialog>
    </aside>
  );
}
