import { Link } from "react-router-dom";
import {
  Briefcase,
  Target,
  Clock,
  MessagesSquare,
  Plus,
  ArrowRight,
  Check,
  AlertTriangle,
  Clock as ClockIcon,
  Receipt,
} from "lucide-react";

import { PageHeader } from "@/components/PageHeader";
import { KpiCard } from "@/components/KpiCard";
import { StatusBadge } from "@/components/StatusBadge";
import { SectionDivider } from "@/components/SectionDivider";
import { ConsumoAlertCard } from "@/components/ConsumoAlertCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { vagas, projetos, solicitacoes } from "@/data/mock";
import { cn } from "@/lib/utils";

const entregaveisAguardando = [
  { id: "e1", projeto: "Atração — Gerente Comercial", titulo: "Shortlist de candidatos", prazo: "02/05/2026" },
  { id: "e2", projeto: "Política de Home Office", titulo: "Revisão final do documento", prazo: "05/05/2026" },
];

const projetosCliente = [
  { id: "p1", nome: "Atração — Gerente Comercial", status: "andamento" as const, pct: 65, consultor: "AB" },
  { id: "p2", nome: "Política de Home Office", status: "andamento" as const, pct: 40, consultor: "AB" },
  { id: "p3", nome: "Onboarding — Q2", status: "andamento" as const, pct: 20, consultor: "JM" },
];

const faturas = [
  { id: "f1", periodo: "Abr/2026", valor: "R$ 4.800,00", venc: "10/04/2026", status: "pago" as const },
  { id: "f2", periodo: "Mar/2026", valor: "R$ 4.800,00", venc: "10/03/2026", status: "pago" as const },
  { id: "f3", periodo: "Mai/2026", valor: "R$ 4.800,00", venc: "10/05/2026", status: "aberto" as const },
];

const statusFatura: Record<string, { label: string; cls: string; icon: any }> = {
  pago: { label: "Pago", cls: "bg-success/15 text-success border-success/30", icon: Check },
  aberto: { label: "Em aberto", cls: "bg-warning/15 text-warning border-warning/30", icon: ClockIcon },
  atrasado: { label: "Atrasado", cls: "bg-destructive/15 text-destructive border-destructive/30", icon: AlertTriangle },
};

export default function ClienteDashboard() {
  const projetosKentaki = projetos.filter((p) => p.empresaId === "kentaki" && p.status === "andamento").length + 1;

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
        Você está logada como <span className="font-medium text-foreground">Admin da conta</span>. Sua consultora Azumi é{" "}
        <span className="font-medium text-foreground">Ana Beatriz</span>.
      </p>

      <Tabs defaultValue="visao-geral" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="visao-geral">Visão geral</TabsTrigger>
          <TabsTrigger value="projetos">Projetos</TabsTrigger>
          <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
        </TabsList>

        {/* TAB: VISÃO GERAL */}
        <TabsContent value="visao-geral" className="mt-0">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-2">
            <KpiCard label="Projetos em andamento" value={projetosKentaki} icon={Briefcase} />
            <KpiCard label="Entregáveis aguardando seu parecer" value={entregaveisAguardando.length} icon={MessagesSquare} hint="Ver e aprovar" />
            <KpiCard label="Faturas em aberto" value={1} icon={Clock} hint="R$ 4.800,00" />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <KpiCard label="Vagas em aberto" value={vagas.filter((v) => v.empresaId === "kentaki").length + 2} icon={Target} />
            <KpiCard label="Horas no mês" value="61h" icon={Clock} hint="de 80h contratadas" trend={{ value: "76%", positive: true }} />
            <KpiCard label="Solicitações abertas" value={solicitacoes.filter((s) => s.empresa === "Kentaki Foods").length + 1} icon={MessagesSquare} />
          </div>

          <SectionDivider>Consumo do mês</SectionDivider>
          <ConsumoAlertCard context="cliente" empresaId="kentaki" limit={1} />

          <SectionDivider>Entregáveis aguardando seu parecer</SectionDivider>
          <div className="bg-card border border-border rounded-xl divide-y divide-border">
            {entregaveisAguardando.map((e) => (
              <div key={e.id} className="p-4 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">{e.titulo}</div>
                  <div className="text-xs text-muted-foreground">{e.projeto}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground font-data">Prazo: {e.prazo}</span>
                  <button className="text-xs text-primary font-medium inline-flex items-center gap-1">
                    Revisar <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <SectionDivider>Suas vagas</SectionDivider>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vagas.filter((v) => v.empresaId === "kentaki").slice(0, 4).map((v) => (
              <Link key={v.id} to={`/cliente/atracao/${v.id}`} className="bg-card border border-border rounded-xl p-5 card-hover">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-display font-semibold">{v.titulo}</h3>
                    <p className="text-xs text-muted-foreground">{v.filial}</p>
                  </div>
                  <StatusBadge status={v.status} />
                </div>
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    Etapa: <span className="text-foreground">{v.etapa}</span>
                  </span>
                  <span className="font-data">{v.candidatosEnviados} perfis</span>
                </div>
                <div className="mt-3 inline-flex items-center gap-1 text-xs text-primary font-medium">
                  Ver detalhes <ArrowRight className="h-3 w-3" />
                </div>
              </Link>
            ))}
          </div>
        </TabsContent>

        {/* TAB: PROJETOS */}
        <TabsContent value="projetos" className="mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {projetosCliente.map((p) => (
              <div key={p.id} className="bg-card border border-border rounded-xl p-5 card-hover">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="text-base font-semibold truncate">{p.nome}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Consultor: {p.consultor}</p>
                  </div>
                  <StatusBadge status={p.status} />
                </div>
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-muted-foreground">Progresso</span>
                    <span className="font-data tabular-nums">{p.pct}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                    <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${p.pct}%` }} />
                  </div>
                </div>
                <Link to="/cliente/projetos" className="mt-4 inline-flex items-center gap-1 text-xs text-primary font-medium">
                  Ver entregáveis <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <Link to="/cliente/projetos" className="text-sm text-primary hover:underline">
              Ver todos os projetos →
            </Link>
          </div>
        </TabsContent>

        {/* TAB: FINANCEIRO */}
        <TabsContent value="financeiro" className="mt-0">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <KpiCard label="Horas consumidas" value="61h" icon={Clock} hint="de 80h contratadas" trend={{ value: "76%", positive: true }} />
            <KpiCard label="Faturas em aberto" value={1} icon={Receipt} hint="R$ 4.800,00" />
            <KpiCard label="Plano contratado" value="Ongoing Premium" icon={Briefcase} hint="R$ 4.800,00 / mês" />
          </div>

          <div className="bg-card border border-border rounded-2xl shadow-card p-5">
            <div className="flex items-start gap-3 mb-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Receipt className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display font-semibold">Faturas recentes</h3>
                <p className="text-xs text-muted-foreground">Resumo das últimas faturas da sua conta.</p>
              </div>
            </div>
            <div className="overflow-hidden rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead className="bg-secondary/40 text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="text-left font-medium px-4 py-3">Período</th>
                    <th className="text-right font-medium px-4 py-3">Valor</th>
                    <th className="text-left font-medium px-4 py-3">Vencimento</th>
                    <th className="text-left font-medium px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {faturas.map((f) => {
                    const s = statusFatura[f.status];
                    return (
                      <tr key={f.id} className="border-t border-border">
                        <td className="px-4 py-3 font-medium">{f.periodo}</td>
                        <td className="px-4 py-3 text-right font-data">{f.valor}</td>
                        <td className="px-4 py-3 font-data">{f.venc}</td>
                        <td className="px-4 py-3">
                          <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border", s.cls)}>
                            <s.icon className="h-3 w-3" /> {s.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="mt-3 text-right">
              <Link to="/cliente/gestao-conta" className="text-xs text-primary hover:underline">
                Ver histórico completo →
              </Link>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
