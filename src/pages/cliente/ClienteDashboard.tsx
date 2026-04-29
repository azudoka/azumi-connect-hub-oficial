import { PageHeader } from "@/components/PageHeader";
import { KpiCard } from "@/components/KpiCard";
import { StatusBadge } from "@/components/StatusBadge";
import { SectionDivider } from "@/components/SectionDivider";
import { vagas, projetos, solicitacoes } from "@/data/mock";
import { ConsumoAlertCard } from "@/components/ConsumoAlertCard";
import { Briefcase, Target, Clock, MessagesSquare, Plus, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function ClienteDashboard() {
  return (
    <div>
      <PageHeader
        title="Painel da Kentaki Foods"
        subtitle="Acompanhe seus projetos, entregáveis e financeiro com a Azumi."
        actions={
          <button className="h-9 px-3 rounded-lg bg-primary text-primary-foreground text-sm font-medium flex items-center gap-1.5">
            <Plus className="h-4 w-4" /> Nova solicitação
          </button>
        }
      />
      <p className="text-xs text-muted-foreground mb-4 -mt-2">
        Você está logada como <span className="font-medium text-foreground">Admin da conta</span>. Sua consultora Azumi é <span className="font-medium text-foreground">Ana Beatriz</span>.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-2">
        <KpiCard label="Projetos em andamento" value={projetos.filter(p => p.empresaId === "kentaki" && p.status === "andamento").length + 1} icon={Briefcase} />
        <KpiCard label="Entregáveis aguardando seu parecer" value={2} icon={MessagesSquare} hint="Ver e aprovar" />
        <KpiCard label="Faturas em aberto" value={1} icon={Clock} hint="R$ 4.800,00" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <KpiCard label="Vagas em aberto" value={vagas.filter(v => v.empresaId === "kentaki").length + 2} icon={Target} />
        <KpiCard label="Horas no mês" value="61h" icon={Clock} hint="de 80h contratadas" trend={{ value: "76%", positive: true }} />
        <KpiCard label="Solicitações abertas" value={solicitacoes.filter(s => s.empresa === "Kentaki Foods").length + 1} icon={MessagesSquare} />
      </div>

      <SectionDivider>Consumo do mês</SectionDivider>
      <ConsumoAlertCard context="cliente" empresaId="kentaki" limit={1} />

      <SectionDivider>Suas vagas</SectionDivider>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* B07: filtra apenas as vagas da empresa do cliente logado (Kentaki).
            Cenário A — filtro por empresaId. O filtro completo por branch_id
            virá na ETAPA 3, quando os mocks forem expandidos. */}
        {vagas.filter(v => v.empresaId === "kentaki").slice(0, 4).map(v => (
          <Link key={v.id} to={`/cliente/atracao/${v.id}`} className="bg-card border border-border rounded-xl p-5 card-hover">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-display font-semibold">{v.titulo}</h3>
                <p className="text-xs text-muted-foreground">{v.filial}</p>
              </div>
              <StatusBadge status={v.status} />
            </div>
            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Etapa: <span className="text-foreground">{v.etapa}</span></span>
              <span className="font-data">{v.candidatosEnviados} perfis</span>
            </div>
            <div className="mt-3 inline-flex items-center gap-1 text-xs text-primary font-medium">
              Ver detalhes <ArrowRight className="h-3 w-3" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
