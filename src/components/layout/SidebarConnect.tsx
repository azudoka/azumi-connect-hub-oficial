import { NavLink } from "@/components/NavLink";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Building2, Users, Briefcase, Clock, MessagesSquare, Target,
  BarChart3, CreditCard, Receipt, FileText, ShieldCheck, Calendar, Megaphone, BookOpen,
  Settings, LogOut, ExternalLink, Mail, Phone
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { usePermissao, type Permissao } from "@/config/permissoes";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface SidebarConnectProps {
  variant?: "admin" | "cliente";
}

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

/* ─── Tooltip roxo para modo retraído ─── */
function NavTooltip({ label, children }: { label: string; children: React.ReactNode }) {
  const [show, setShow] = useState(false);
  return (
    <div
      style={{ position: "relative", width: "100%" }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <div
          style={{
            position: "absolute",
            left: "calc(100% + 8px)",
            top: "50%",
            transform: "translateY(-50%)",
            background: "#1E1B4B",
            color: "white",
            fontSize: 12,
            fontWeight: 500,
            padding: "6px 10px",
            borderRadius: 8,
            whiteSpace: "nowrap",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            fontFamily: "'Urbanist',sans-serif",
            zIndex: 50,
            pointerEvents: "none",
          }}
        >
          {label}
        </div>
      )}
    </div>
  );
}

export function SidebarConnect({ variant = "admin" }: SidebarConnectProps) {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { pode } = usePermissao();
  const [consultorOpen, setConsultorOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const groupsBase = variant === "admin" ? adminGroups : clienteGroups;
  const groups = groupsBase
    .map((g) => ({
      ...g,
      items: g.items.filter((it) => {
        const req = PERMISSAO_POR_ROTA[it.to];
        return req ? pode(req) : true;
      }),
    }))
    .filter((g) => g.items.length > 0);

  /* Auto-colapso após 10s de inatividade */
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

  const configHref = variant === "cliente" ? "/cliente/gestao-conta" : "/app/configuracoes";

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
        background: collapsed ? "#EDE9FE" : undefined,
        cursor: collapsed ? "pointer" : "default",
        height: "100svh",
        position: "sticky",
        top: 0,
      }}
      aria-label="Navegação principal"
    >
      {/* Logo */}
      <div style={{ height: 64, display: "flex", alignItems: "center", padding: "0 16px", borderBottom: "1px solid hsl(var(--sidebar-border) / 0.6)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: collapsed ? 0 : 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg,#031D38,#8B5CF6)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ color: "white", fontSize: 13, fontWeight: 800, fontFamily: "'Urbanist',sans-serif" }}>A</span>
          </div>
          {!collapsed && (
            <span style={{ fontSize: 16, fontWeight: 800, color: "#031D38", fontFamily: "'Urbanist',sans-serif", letterSpacing: "-0.03em" }}>
              Connect
            </span>
          )}
        </div>
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
                  {collapsed ? (
                    <NavLink
                      to={it.to}
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center justify-center w-full py-2.5 hover:bg-[#DDD6FE] transition-colors rounded-none"
                      activeClassName="!bg-[#C4B5FD]"
                    >
                      <span title={it.label}>
                        <it.icon className="h-4 w-4 shrink-0 text-[#8B5CF6]" />
                      </span>
                    </NavLink>
                  ) : (
                    <NavLink
                      to={it.to}
                      className="group flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      activeClassName="!bg-primary/15 !text-foreground border-l-[3px] border-primary rounded-l-none ml-[3px]"
                    >
                      <it.icon className="h-4 w-4 shrink-0 text-[#8B5CF6]" />
                      <span className="truncate" style={{ fontFamily: "'Urbanist',sans-serif" }}>{it.label}</span>
                    </NavLink>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Configurações */}
        <div className="pt-2 mt-2 border-t border-sidebar-border/60">
          {collapsed ? (
            <NavTooltip label="Configurações">
              <NavLink
                to={configHref}
                onClick={(e) => e.stopPropagation()}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", padding: "10px 0", borderRadius: 8, color: "#8B5CF6", transition: "background 0.15s" }}
                className="hover:bg-[#DDD6FE]"
                activeClassName="!bg-[#C4B5FD]"
              >
                <Settings className="h-5 w-5 shrink-0" />
              </NavLink>
            </NavTooltip>
          ) : (
            <NavLink
              to={configHref}
              className="group flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              activeClassName="!bg-primary/15 !text-foreground"
            >
              <Settings className="h-4 w-4 shrink-0 text-[#8B5CF6]" />
              <span className="truncate" style={{ fontFamily: "'Urbanist',sans-serif" }}>Configurações</span>
            </NavLink>
          )}

          {pode("portal_cliente.acessar") && (
            <>
              <div className="my-2 h-px bg-sidebar-border/60" />
              {collapsed ? (
                <NavTooltip label="Acessar Portal do Cliente">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); navigate("/portal"); }}
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", padding: "10px 0", borderRadius: 8, color: "#8B5CF6", background: "none", border: "none", cursor: "pointer", transition: "background 0.15s" }}
                    className="hover:bg-[#DDD6FE]"
                  >
                    <ExternalLink className="h-5 w-5 shrink-0" />
                  </button>
                </NavTooltip>
              ) : (
                <button
                  type="button"
                  onClick={() => navigate("/portal")}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
                >
                  <ExternalLink className="h-4 w-4 shrink-0 text-[#8B5CF6]" />
                  <span className="truncate">Acessar Portal do Cliente</span>
                </button>
              )}
            </>
          )}
        </div>
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="p-3 border-t border-sidebar-border/60">
          <div className="bg-card/60 backdrop-blur rounded-xl p-3 border border-border/60">
            {user?.papel === "cliente" && (
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="h-9 w-9 rounded-lg bg-gradient-brand flex items-center justify-center text-xs font-semibold text-white">AB</div>
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
        </div>
      )}

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
