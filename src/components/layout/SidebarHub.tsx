import { NavLink } from "@/components/NavLink";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Users, Heart, FileText, MessagesSquare, BookOpen,
  Calendar, Megaphone, GraduationCap, ShieldQuestion, Wallet, Plane,
  Gift, Settings, LogOut, Briefcase, BarChart3, TrendingUp,
  ChevronLeft, UserCircle2
} from "lucide-react";
import { useState } from "react";

type HubProfile = "lider" | "colaborador" | "ceo";

const groups: Record<HubProfile, { label: string; items: { to: string; icon: any; label: string }[] }[]> = {
  lider: [
    {
      label: "Liderança",
      items: [
        { to: "/hub/lider/painel", icon: LayoutDashboard, label: "Painel" },
        { to: "/hub/lider/meu-time", icon: Users, label: "Meu Time" },
        { to: "/hub/lider/onboarding", icon: GraduationCap, label: "Onboarding" },
      ],
    },
    {
      label: "Pessoas",
      items: [
        { to: "/hub/lider/feedback", icon: MessagesSquare, label: "Feedback" },
        { to: "/hub/lider/avaliacoes", icon: BarChart3, label: "Avaliações" },
        { to: "/hub/lider/solicitacoes", icon: FileText, label: "Solicitações" },
      ],
    },
    {
      label: "Plataforma",
      items: [
        { to: "/hub/lider/politicas", icon: BookOpen, label: "Políticas" },
        { to: "/hub/lider/treinamentos", icon: GraduationCap, label: "Treinamentos" },
        { to: "/hub/lider/calendario", icon: Calendar, label: "Calendário" },
        { to: "/hub/lider/comunicados", icon: Megaphone, label: "Comunicados" },
      ],
    },
  ],
  colaborador: [
    {
      label: "Você",
      items: [
        { to: "/hub/colaborador/inicio", icon: Heart, label: "Início" },
        { to: "/hub/colaborador/sobre-voce", icon: UserCircle2, label: "Sobre você" },
        { to: "/hub/colaborador/solicitacoes", icon: MessagesSquare, label: "Solicitações" },
      ],
    },
    {
      label: "Vida no trabalho",
      items: [
        { to: "/hub/colaborador/holerites", icon: Wallet, label: "Holerites" },
        { to: "/hub/colaborador/ferias", icon: Plane, label: "Férias" },
        { to: "/hub/colaborador/beneficios", icon: Gift, label: "Benefícios" },
      ],
    },
    {
      label: "Aprendizado",
      items: [
        { to: "/hub/colaborador/politicas", icon: BookOpen, label: "Políticas" },
        { to: "/hub/colaborador/treinamentos", icon: GraduationCap, label: "Treinamentos" },
        { to: "/hub/colaborador/ajuda", icon: ShieldQuestion, label: "Ajuda / Denúncia" },
      ],
    },
  ],
  ceo: [
    {
      label: "Estratégia",
      items: [
        { to: "/hub/ceo/dashboard", icon: LayoutDashboard, label: "Dashboard" },
        { to: "/hub/ceo/headcount", icon: Users, label: "Headcount" },
        { to: "/hub/ceo/financeiro", icon: Wallet, label: "Financeiro" },
      ],
    },
    {
      label: "Pessoas",
      items: [
        { to: "/hub/ceo/avaliacoes", icon: BarChart3, label: "Avaliações" },
        { to: "/hub/ceo/turnover", icon: TrendingUp, label: "Turnover" },
      ],
    },
  ],
};

const profileLabel: Record<HubProfile, string> = {
  lider: "Líder",
  colaborador: "Colaborador",
  ceo: "CEO",
};

export function SidebarHub({ profile }: { profile: HubProfile }) {
  const [collapsed, setCollapsed] = useState(false);
  const gs = groups[profile];

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
        >
          <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-5">
        {gs.map((g) => (
          <div key={g.label}>
            {!collapsed && (
              <div className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">{g.label}</div>
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
      </nav>

      <div className="p-3 border-t border-sidebar-border/60">
        {!collapsed ? (
          <div className="bg-card/70 rounded-xl p-3 border border-border/60">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-gradient-brand flex items-center justify-center text-xs font-semibold text-white">VC</div>
              <div className="min-w-0">
                <div className="text-sm font-medium truncate">Você</div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{profileLabel[profile]}</div>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <button className="flex-1 text-xs text-muted-foreground hover:text-foreground flex items-center gap-1.5 px-2 py-1.5 rounded-md hover:bg-secondary">
                <Settings className="h-3.5 w-3.5" /> Config.
              </button>
              <NavLink to="/login" className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1.5 px-2 py-1.5 rounded-md hover:bg-secondary">
                <LogOut className="h-3.5 w-3.5" /> Sair
              </NavLink>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-gradient-brand flex items-center justify-center text-[10px] font-semibold text-white">VC</div>
            <NavLink to="/login" className="text-muted-foreground hover:text-destructive">
              <LogOut className="h-4 w-4" />
            </NavLink>
          </div>
        )}
      </div>
    </aside>
  );
}
