import { PageHeader } from "@/components/PageHeader";
import { KpiCard } from "@/components/KpiCard";
import { SectionDivider } from "@/components/SectionDivider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import {
  Users,
  ClipboardList,
  GraduationCap,
  Star,
  MessageSquarePlus,
  UserPlus,
  ListChecks,
} from "lucide-react";
import { timeLider, statusColabStyle, iniciaisDe } from "./_timeData";

export default function LiderPainelPage() {
  const headcount = timeLider.length;
  const onboarding = 3;
  const solicitacoesPendentes = 4;
  const avaliacoesAbertas = 2;

  return (
    <div>
      <PageHeader
        title="Painel do líder"
        subtitle="Visão consolidada da sua equipe e ações rápidas."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Headcount" value={headcount} icon={Users} hint="colaboradores diretos" />
        <KpiCard
          label="Solicitações"
          value={solicitacoesPendentes}
          icon={ClipboardList}
          hint="aguardando aprovação"
        />
        <KpiCard label="Em onboarding" value={onboarding} icon={GraduationCap} hint="em integração" />
        <KpiCard label="Avaliações" value={avaliacoesAbertas} icon={Star} hint="ciclos abertos" />
      </div>

      <SectionDivider>Atalhos rápidos</SectionDivider>
      <div className="flex flex-wrap gap-2">
        <Button asChild className="rounded-full">
          <Link to="/hub/lider/feedback">
            <MessageSquarePlus className="h-4 w-4 mr-1.5" />
            Novo feedback
          </Link>
        </Button>
        <Button asChild variant="outline" className="rounded-full">
          <Link to="/hub/lider/solicitacoes">
            <UserPlus className="h-4 w-4 mr-1.5" />
            Solicitar contratação
          </Link>
        </Button>
        <Button asChild variant="outline" className="rounded-full">
          <Link to="/hub/lider/avaliacoes">
            <ListChecks className="h-4 w-4 mr-1.5" />
            Ver avaliações abertas
          </Link>
        </Button>
      </div>

      <SectionDivider>Seu time</SectionDivider>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {timeLider.map((c) => {
          const s = statusColabStyle[c.status];
          return (
            <Link
              key={c.id}
              to={`/hub/lider/meu-time/${c.id}`}
              className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3 transition-all hover:border-primary/40 hover:shadow-card"
            >
              <div className="h-12 w-12 rounded-md bg-secondary text-foreground/80 flex items-center justify-center text-sm font-semibold shrink-0">
                {iniciaisDe(c.nome)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium truncate">{c.nome}</div>
                <div className="text-xs text-muted-foreground truncate">{c.cargo}</div>
              </div>
              <span className={cn("badge-pill shrink-0", s.cls)}>
                <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
                {s.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
