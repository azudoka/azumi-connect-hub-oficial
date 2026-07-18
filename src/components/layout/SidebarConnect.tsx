import { NavLink } from "@/components/NavLink";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Building2, Users, Briefcase, Clock, MessagesSquare, Target,
  BarChart3, Wallet, FileText, ShieldCheck, Calendar, Megaphone, BookOpen,
  Settings, LogOut, Sparkles, UserCog, Heart,
  ExternalLink, Mail, Phone,
} from "lucide-react";
import { useState } from "react";
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
  // open = true -> largura expandida (mostra rótulo ao lado de cada ícone)
  // Abre/fecha por hover, igual ao padrão de referência — sem clique manual.
  const [open, setOpen] = useState(false);
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

  const linkRowClass =
    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-sidebar-foreground " +
    "transition-colors duration-150 hover:bg-white/10 hover:text-white";
  const linkRowActiveClass = "!bg-white/15 !text-white font-medium";

  return (
    <div
      className="h-full shrink-0 overflow-hidden transition-[width] duration-300 ease-in-out"
      style={{ width: open ? "220px" : "64px" }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <aside
        className="sidebar-connect-brand h-full flex flex-col bg-gradient-sidebar border-r border-sidebar-border py-4"
        style={{ width: "220px" }}
        aria-label="Navegação principal"
      >
        {/* Logo — símbolo sempre visível, wordmark só aparece expandido */}
        <div className="flex items-center gap-2 px-4 mb-6 h-8">
          <div className="shrink-0">
            <AzumiLogo product="Connect" collapsed light size={22} />
          </div>
          <span
            className={cn(
              "font-display text-sm font-semibold text-white whitespace-nowrap transition-opacity duration-200",
              open ? "opacity-100" : "opacity-0"
            )}
          >
            Connect
          </span>
        </div>

        {/* Lista de páginas — um ícone por página, sem agrupamento em rail separado */}
        <nav className="flex-1 overflow-y-auto px-3 space-y-4">
          {groups.map((g) => (
            <div key={g.label}>
              <div
                className={cn(
                  "px-3 mb-1 text-[10px] font-semibold uppercase tracking-widest text-white/40 whitespace-nowrap transition-opacity duration-200",
                  open ? "opacity-100" : "opacity-0 h-0 overflow-hidden"
                )}
              >
                {g.label}
              </div>
              <ul className="space-y-0.5">
                {g.items.map((it) => (
                  <li key={it.to}>
                    <NavLink to={it.to} className={linkRowClass} activeClassName={linkRowActiveClass}>
                      <it.icon className="h-[18px] w-[18px] shrink-0" />
                      <span
                        className={cn(
                          "whitespace-nowrap transition-opacity duration-200",
                          open ? "opacity-100" : "opacity-0"
                        )}
                      >
                        {it.label}
                      </span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {variant === "admin" && (
            <div>
              <div
                className={cn(
                  "px-3 mb-1 flex items-center gap-1.5 whitespace-nowrap transition-opacity duration-200",
                  open ? "opacity-100" : "opacity-0 h-0 overflow-hidden"
                )}
              >
                <Sparkles className="h-3 w-3 text-highlight shrink-0" />
                <span className="text-[10px] font-semibold uppercase tracking-widest text-highlight">Hub</span>
              </div>
              <ul className="space-y-0.5">
                {[
                  { to: "/hub/lider/painel", icon: UserCog, label: "Meu Time (Líder)" },
                  { to: "/hub/colaborador/inicio", icon: Heart, label: "Colaborador" },
                  { to: "/hub/ceo/dashboard", icon: BarChart3, label: "CEO" },
                ].map((it) => (
                  <li key={it.to}>
                    <NavLink to={it.to} className={linkRowClass} activeClassName={linkRowActiveClass}>
                      <it.icon className="h-[18px] w-[18px] shrink-0" />
                      <span className={cn("whitespace-nowrap transition-opacity duration-200", open ? "opacity-100" : "opacity-0")}>
                        {it.label}
                      </span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="pt-3 mt-1 border-t border-white/10">
            {(() => {
              const configHref = variant === "cliente" ? "/cliente/gestao-conta" : "/app/configuracoes";
              return (
                <NavLink to={configHref} className={linkRowClass} activeClassName={linkRowActiveClass}>
                  <Settings className="h-[18px] w-[18px] shrink-0" />
                  <span className={cn("whitespace-nowrap transition-opacity duration-200", open ? "opacity-100" : "opacity-0")}>
                    Configurações
                  </span>
                </NavLink>
              );
            })()}

            {pode("portal_cliente.acessar") && (
              <button
                type="button"
                onClick={() => navigate("/portal")}
                className={cn(linkRowClass, "w-full")}
                aria-label="Acessar Portal do Cliente"
              >
                <ExternalLink className="h-[18px] w-[18px] shrink-0" />
                <span className={cn("whitespace-nowrap transition-opacity duration-200", open ? "opacity-100" : "opacity-0")}>
                  Acessar Portal do Cliente
                </span>
              </button>
            )}
          </div>
        </nav>

        {/* Cartão de rodapé — consultor (visão cliente), só faz sentido expandido */}
        {user?.papel === "cliente" && open && (
          <div className="px-3 pt-3">
            <div className="bg-white/10 rounded-xl p-3">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="h-9 w-9 rounded-lg bg-[image:linear-gradient(135deg,hsl(var(--primary)),hsl(var(--primary-glow)))] flex items-center justify-center text-xs font-semibold text-white">
                    {consultorIniciais}
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-success ring-2 ring-sidebar-background animate-soft-pulse" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] uppercase tracking-wider text-white/60">Seu consultor Azumi</div>
                  <div className="text-sm font-medium truncate text-white">{consultorNome}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setConsultorOpen(true)}
                className="mt-3 w-full text-xs text-white/70 hover:text-white flex items-center gap-1.5 px-2 py-1.5 rounded-md hover:bg-white/10"
              >
                <Mail className="h-3.5 w-3.5" /> Falar com consultor
              </button>
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          className={cn(linkRowClass, "mx-3 mt-2 hover:!bg-[hsl(var(--destructive)/0.2)] hover:!text-destructive")}
          aria-label="Sair"
        >
          <LogOut className="h-[18px] w-[18px] shrink-0" />
          <span className={cn("whitespace-nowrap transition-opacity duration-200", open ? "opacity-100" : "opacity-0")}>
            Sair
          </span>
        </button>
      </aside>

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
