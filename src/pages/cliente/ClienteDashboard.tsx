import { useMemo, useState } from "react";
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
  Users,
  GraduationCap,
  FileText,
  TrendingUp,
  Megaphone,
  Sparkles,
  HelpCircle,
  X,
} from "lucide-react";

import { PageHeader } from "@/components/PageHeader";
import { KpiCard } from "@/components/KpiCard";
import { StatusBadge } from "@/components/StatusBadge";
import { SectionDivider } from "@/components/SectionDivider";
import { ConsumoAlertCard } from "@/components/ConsumoAlertCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { vagas, projetos, solicitacoes } from "@/data/mock";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

// TODO: conectar Supabase — logo_url da tabela empresas
const empresaLogos: Record<string, string> = {
  "Kentaki Foods": "/placeholder.svg",
};

// TODO: conectar Supabase — agendamentos do cliente
const eventosAgendados = [
  new Date(2026, 4, 21),
  new Date(2026, 4, 23),
  new Date(2026, 4, 28),
  new Date(2026, 5, 3),
];

// TODO: conectar Supabase — mapear "tipo" do projeto para ícone
const projetoIconePorTipo: Record<string, any> = {
  atracao: Target,
  politica: FileText,
  onboarding: GraduationCap,
  performance: TrendingUp,
  default: Briefcase,
};

const entregaveisAguardando = [
  { id: "e1", projeto: "Atração — Gerente Comercial", titulo: "Shortlist de candidatos", prazo: "02/05/2026" },
  { id: "e2", projeto: "Política de Home Office", titulo: "Revisão final do documento", prazo: "05/05/2026" },
];

const projetosCliente = [
  { id: "p1", nome: "Atração — Gerente Comercial", tipo: "atracao", status: "andamento" as const, pct: 65, consultor: "AB" },
  { id: "p2", nome: "Política de Home Office", tipo: "politica", status: "andamento" as const, pct: 40, consultor: "AB" },
  { id: "p3", nome: "Onboarding — Q2", tipo: "onboarding", status: "andamento" as const, pct: 20, consultor: "JM" },
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

// TODO: conectar Supabase — comunicado mais recente publicado
const comunicadoRecente = {
  id: "com1",
  titulo: "Atualização nos prazos de SLA do plano Ongoing",
  data: "18/05/2026",
  autor: "Ana Beatriz · Consultora Azumi",
  conteudo:
    "A partir de junho/2026 os SLAs de resposta para solicitações de Atração serão reduzidos de 48h para 24h úteis. Confira o detalhamento completo na sua área de comunicados ou fale diretamente com sua consultora para alinhar prioridades específicas do seu time.",
};

const faqItems = [
  {
    q: "Como abro uma nova solicitação para minha consultora?",
    a: "Use o botão 'Nova solicitação' no topo do painel ou acesse a aba Solicitações. Sua consultora recebe a notificação imediatamente.",
  },
  {
    q: "Onde acompanho o consumo de horas do mês?",
    a: "No card 'Consumo do mês' na visão geral. Você também pode ver o histórico completo em Financeiro > Histórico.",
  },
  {
    q: "Posso adicionar mais usuários da minha empresa?",
    a: "Sim. Em Gestão da conta > Usuários você pode convidar membros do seu RH e definir permissões.",
  },
  {
    q: "Como aprovo um entregável enviado pela Azumi?",
    a: "Os entregáveis aparecem em 'Aguardando seu parecer'. Clique em Revisar, leia o material e use Aprovar ou Solicitar ajuste.",
  },
  {
    q: "Os candidatos veem meus dados de contato?",
    a: "Não. Todo o fluxo de candidatos é mediado pela Azumi até a contratação efetiva.",
  },
  {
    q: "Como funciona o NPS dos contratados?",
    a: "Após cada contratação, você recebe um pop-up para avaliar o candidato. Esse retorno alimenta nossa qualidade de entrega.",
  },
];

export default function ClienteDashboard() {
  const { usuario } = useAuth();
  const isTrial = usuario?.role === "trial";
  const empresaNome = usuario?.empresaNome || "Kentaki Foods";
  const logoUrl = empresaLogos[empresaNome];

  const projetosKentaki = projetos.filter((p) => p.empresaId === "kentaki" && p.status === "andamento").length + 1;

  const [comunicadoOpen, setComunicadoOpen] = useState(false);

  // Trial: dados podem vir vazios; cards vazios viram CTA
  const vagasCliente = useMemo(
    () => (isTrial ? [] : vagas.filter((v) => v.empresaId === "kentaki")),
    [isTrial]
  );
  const entregaveis = isTrial ? [] : entregaveisAguardando;

  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        {logoUrl && (
          <img
            src={logoUrl}
            alt={`Logo ${empresaNome}`}
            className="h-12 w-12 rounded-lg object-cover border border-border bg-card"
          />
        )}
        <PageHeader
          title={`Bem-vindo(a), ${usuario?.nome?.split(" ")[0] ?? "cliente"}`}
          subtitle={`Painel ${empresaNome} — acompanhe seus projetos, entregáveis e financeiro com a Azumi.`}
          actions={
            <button className="h-9 px-3 rounded-lg bg-primary text-primary-foreground text-sm font-medium flex items-center gap-1.5">
              <Plus className="h-4 w-4" /> Nova solicitação
            </button>
          }
        />
      </div>
      <p className="text-xs text-muted-foreground mb-4 -mt-2">
        Você está logada como <span className="font-medium text-foreground">Admin da conta</span>. Sua consultora Azumi é{" "}
        <span className="font-medium text-foreground">Ana Beatriz</span>.
      </p>

      <Tabs defaultValue="visao-geral" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="visao-geral">Visão geral</TabsTrigger>
          <TabsTrigger value="projetos">Projetos</TabsTrigger>
          {!isTrial && <TabsTrigger value="financeiro">Financeiro</TabsTrigger>}
        </TabsList>

        {/* TAB: VISÃO GERAL */}
        <TabsContent value="visao-geral" className="mt-0">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-2">
            <KpiCard label="Projetos em andamento" value={isTrial ? 0 : projetosKentaki} icon={Briefcase} />
            <KpiCard label="Entregáveis aguardando seu parecer" value={entregaveis.length} icon={MessagesSquare} hint="Ver e aprovar" />
            {!isTrial && <KpiCard label="Faturas em aberto" value={1} icon={Clock} hint="R$ 4.800,00" />}
            {isTrial && (
              <EmptyCta
                titulo="Conheça o plano completo"
                texto="Faturas e financeiro liberam após contratar um plano."
                cta="Solicitar proposta"
              />
            )}
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <KpiCard label="Vagas em aberto" value={isTrial ? 0 : vagasCliente.length + 2} icon={Target} />
            <KpiCard label="Horas no mês" value={isTrial ? "0h" : "61h"} icon={Clock} hint={isTrial ? "Sem plano contratado" : "de 80h contratadas"} trend={isTrial ? undefined : { value: "76%", positive: true }} />
            <KpiCard label="Solicitações abertas" value={isTrial ? 0 : solicitacoes.filter((s) => s.empresa === "Kentaki Foods").length + 1} icon={MessagesSquare} />
          </div>

          <SectionDivider>Consumo do mês</SectionDivider>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              {isTrial ? (
                <EmptyCta
                  titulo="Consumo aparece após contratar um plano"
                  texto="No plano Ongoing você acompanha em tempo real as horas usadas pelo seu time."
                  cta="Fale com a Azumi"
                />
              ) : (
                <ConsumoAlertCard context="cliente" empresaId="kentaki" limit={1} />
              )}
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <CalendarMini />
              </div>
            </div>
          </div>

          <SectionDivider>Entregáveis aguardando seu parecer</SectionDivider>
          {entregaveis.length === 0 ? (
            <EmptyCta
              titulo="Nenhum entregável no momento"
              texto={isTrial ? "Comece um projeto com a Azumi para receber entregáveis revisáveis aqui." : "Volte mais tarde — sua consultora envia novos entregáveis assim que estiverem prontos."}
              cta={isTrial ? "Solicitar proposta" : "Fale com a Azumi"}
            />
          ) : (
            <div className="bg-card border border-border rounded-xl divide-y divide-border">
              {entregaveis.map((e) => (
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
          )}

          <SectionDivider>Suas vagas</SectionDivider>
          {vagasCliente.length === 0 ? (
            <EmptyCta
              titulo="Você ainda não tem vagas em aberto"
              texto={isTrial ? "Contrate o módulo de Atração e a Azumi conduz todo o processo seletivo para você." : "Abra uma nova vaga conversando com sua consultora."}
              cta={isTrial ? "Solicitar proposta" : "Fale com a Azumi"}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {vagasCliente.slice(0, 4).map((v) => (
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
          )}

          {/* Comunicado mais recente */}
          <SectionDivider>Comunicado mais recente</SectionDivider>
          <div className="bg-card border border-border rounded-xl p-5 flex items-start gap-4">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Megaphone className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-display font-semibold text-sm">{comunicadoRecente.titulo}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {comunicadoRecente.data} · {comunicadoRecente.autor}
              </p>
            </div>
            <button
              onClick={() => setComunicadoOpen(true)}
              className="h-8 px-3 rounded-lg border border-border text-xs font-medium hover:bg-secondary inline-flex items-center gap-1.5 shrink-0"
            >
              Ver mais <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          {/* FAQ */}
          <SectionDivider>Dúvidas frequentes</SectionDivider>
          <div className="bg-card border border-border rounded-xl p-2 sm:p-5">
            <div className="flex items-center gap-2 px-3 sm:px-0 pt-3 sm:pt-0 pb-2">
              <HelpCircle className="h-4 w-4 text-primary" />
              <h3 className="font-display font-semibold text-sm">Guia rápido</h3>
            </div>
            <Accordion type="single" collapsible className="w-full">
              {faqItems.map((item, i) => (
                <AccordionItem key={i} value={`faq-${i}`}>
                  <AccordionTrigger className="text-sm text-left px-3 sm:px-0">{item.q}</AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground px-3 sm:px-0">{item.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </TabsContent>

        {/* TAB: PROJETOS */}
        <TabsContent value="projetos" className="mt-0">
          {projetosCliente.length === 0 || isTrial ? (
            <EmptyCta
              titulo="Você ainda não tem projetos ativos"
              texto="Comece um projeto com a Azumi e acompanhe progresso, entregáveis e cronograma por aqui."
              cta="Solicitar proposta"
            />
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {projetosCliente.map((p) => {
                  const Icone = projetoIconePorTipo[p.tipo] ?? projetoIconePorTipo.default;
                  return (
                    <div key={p.id} className="bg-card border border-border rounded-xl p-5 card-hover">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                            <Icone className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-base font-semibold truncate">{p.nome}</h3>
                            <p className="text-xs text-muted-foreground mt-0.5">Consultor: {p.consultor}</p>
                          </div>
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
                  );
                })}
              </div>
              <div className="mt-4 text-center">
                <Link to="/cliente/projetos" className="text-sm text-primary hover:underline">
                  Ver todos os projetos →
                </Link>
              </div>
            </>
          )}
        </TabsContent>

        {/* TAB: FINANCEIRO — oculto para trial */}
        {!isTrial && (
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
        )}
      </Tabs>

      {/* Modal de comunicado */}
      <Dialog open={comunicadoOpen} onOpenChange={setComunicadoOpen}>
        <DialogContent className="max-w-[640px]">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Megaphone className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-display font-semibold text-base">{comunicadoRecente.titulo}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {comunicadoRecente.data} · {comunicadoRecente.autor}
              </p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed mt-2">{comunicadoRecente.conteudo}</p>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Subcomponents
// ─────────────────────────────────────────────────────────────────────

function CalendarMini() {
  return (
    <div className="w-full">
      <div className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1.5">
        <ClockIcon className="h-3.5 w-3.5" /> Próximas reuniões
      </div>
      <Calendar
        mode="single"
        modifiers={{ evento: eventosAgendados }}
        modifiersClassNames={{
          evento: "bg-primary/15 text-primary font-semibold rounded-md",
        }}
        className="p-0 [&_table]:w-full"
      />
    </div>
  );
}

function EmptyCta({ titulo, texto, cta }: { titulo: string; texto: string; cta: string }) {
  return (
    <div className="bg-card border border-dashed border-border rounded-xl p-6 flex flex-col items-start gap-2">
      <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
        <Sparkles className="h-4 w-4" />
      </div>
      <div className="text-sm font-medium">{titulo}</div>
      <div className="text-xs text-muted-foreground">{texto}</div>
      <button className="mt-2 h-8 px-3 rounded-lg bg-primary text-primary-foreground text-xs font-medium inline-flex items-center gap-1.5">
        {cta} <ArrowRight className="h-3 w-3" />
      </button>
    </div>
  );
}
