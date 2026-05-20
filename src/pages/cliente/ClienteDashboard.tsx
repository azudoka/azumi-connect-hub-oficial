import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Briefcase,
  Target,
  Clock,
  ArrowRight,
  Check,
  AlertTriangle,
  Clock as ClockIcon,
  Receipt,
  GraduationCap,
  FileText,
  TrendingUp,
  Megaphone,
  Sparkles,
  HelpCircle,
  FileCheck2,
  Timer,
  MapPin,
  Users,
  Image as ImageIcon,
  LifeBuoy,
  KeyRound,
  ClipboardList,
  ClipboardCheck,
  ShieldCheck,
  MessageSquareQuote,
  CalendarDays,
  GitBranch,
} from "lucide-react";

import { StatusBadge } from "@/components/StatusBadge";
import { SectionDivider } from "@/components/SectionDivider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Progress } from "@/components/ui/progress";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { vagas, projetos } from "@/data/mock";
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

// TODO: conectar Supabase — filiais da empresa e filial ativa do contexto do usuário
const filiaisEmpresa = ["Matriz SP", "Filial RJ"];
const filialAtiva = "Matriz SP";
const horasContratadasTotal = 40;
const horasConsumidasFilial = 12;
const horasFilial = Math.round(horasContratadasTotal / filiaisEmpresa.length);

const entregaveisAguardando = [
  { id: "e1", projeto: "Atração — Gerente Comercial", titulo: "Shortlist de candidatos", categoria: "atracao", prazo: "02/05/2026", vencido: true },
  { id: "e2", projeto: "Política de Home Office", titulo: "Revisão final do documento", categoria: "politica", prazo: "05/06/2026", vencido: false },
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
  capa: "/placeholder.svg",
  conteudo:
    "A partir de junho/2026 os SLAs de resposta para solicitações de Atração serão reduzidos de 48h para 24h úteis. Confira o detalhamento completo na sua área de comunicados ou fale diretamente com sua consultora para alinhar prioridades específicas do seu time.",
};

const categoriaIcone: Record<string, any> = {
  atracao: Target,
  politica: FileText,
  onboarding: GraduationCap,
  performance: TrendingUp,
  default: FileCheck2,
};

const faqItems = [
  { q: "Como abro uma nova solicitação para minha consultora?", a: "Use o botão 'Nova solicitação' no topo do painel ou acesse a aba Solicitações. Sua consultora recebe a notificação imediatamente.", icon: MessageSquareQuote },
  { q: "Onde acompanho o consumo de horas do mês?", a: "No card 'Horas do mês' na visão geral. Você também pode ver o histórico completo em Financeiro > Histórico.", icon: Timer },
  { q: "Posso adicionar mais usuários da minha empresa?", a: "Sim. Em Gestão da conta > Usuários você pode convidar membros do seu RH e definir permissões.", icon: Users },
  { q: "Como aprovo um entregável enviado pela Azumi?", a: "Os entregáveis aparecem em 'Aguardando seu parecer'. Clique em Revisar, leia o material e use Aprovar ou Solicitar ajuste.", icon: ClipboardList },
  { q: "Os candidatos veem meus dados de contato?", a: "Não. Todo o fluxo de candidatos é mediado pela Azumi até a contratação efetiva.", icon: ShieldCheck },
  { q: "Como funciona o NPS dos contratados?", a: "Após cada contratação, você recebe um pop-up para avaliar o candidato. Esse retorno alimenta nossa qualidade de entrega.", icon: KeyRound },
];

// Estilos por tipo de card destacado
const cardTone = {
  projetos: "bg-primary/5 border-primary/20",
  alerta:   "bg-warning/10 border-warning/30",
  horas:    "bg-emerald-500/5 border-emerald-500/20",
};
const iconTone = {
  projetos: "bg-primary/15 text-primary",
  alerta:   "bg-warning/20 text-warning",
  horas:    "bg-emerald-500/15 text-emerald-600",
};

export default function ClienteDashboard() {
  const { usuario } = useAuth();
  const isTrial = usuario?.role === "trial";
  const empresaNome = usuario?.empresaNome || "Kentaki Foods";
  const logoUrl = empresaLogos[empresaNome];
  const perfilLabel = isTrial ? "Trial da conta" : "Admin da conta";
  const consultoraNome = "Ana Beatriz";

  const projetosKentaki = projetos.filter((p) => p.empresaId === "kentaki" && p.status === "andamento").length + 1;

  const [comunicadoOpen, setComunicadoOpen] = useState(false);

  const vagasCliente = useMemo(
    () => (isTrial ? [] : vagas.filter((v) => v.empresaId === "kentaki")),
    [isTrial]
  );
  const entregaveis = isTrial ? [] : entregaveisAguardando;

  return (
    <div>
      {/* HEADER */}
      <div className="flex items-center gap-3 mb-6">
        {logoUrl && (
          <img
            src={logoUrl}
            alt={`Logo ${empresaNome}`}
            className="h-10 w-auto object-contain shrink-0"
          />
        )}
        <div className="min-w-0">
          <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight leading-10">
            Bem-vindo(a), {usuario?.nome?.split(" ")[0] ?? "cliente"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Você está logado(a) como {perfilLabel}. Sua consultora Azumi é {consultoraNome}.
          </p>
        </div>
      </div>

      <Tabs defaultValue="visao-geral" className="w-full mt-4">
        <TabsList className="mb-4">
          <TabsTrigger value="visao-geral">Visão geral</TabsTrigger>
          <TabsTrigger value="projetos">Projetos</TabsTrigger>
          {!isTrial && <TabsTrigger value="financeiro">Financeiro</TabsTrigger>}
        </TabsList>

        {/* TAB: VISÃO GERAL */}
        <TabsContent value="visao-geral" className="mt-0">
          {/* 3 cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Card 1 — Projetos */}
            <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-xs">
                <Briefcase className="h-5 w-5 text-blue-500" />
                Projetos em andamento
              </div>
              <div className="font-display font-bold text-3xl tabular-nums mt-2">
                {isTrial ? "0" : projetosKentaki}
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5">ativos com a Azumi</div>
            </div>

            {/* Card 2 — Entregáveis */}
            <div className="bg-amber-50 border border-amber-200 shadow-sm rounded-xl p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-xs">
                <ClipboardCheck className="h-5 w-5 text-amber-500" />
                Entregáveis aguardando seu parecer
              </div>
              <div className="font-display font-bold text-3xl tabular-nums mt-2">{entregaveis.length}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">ação pendente de você</div>
            </div>

            {/* Card 3 — Horas */}
            <div className="bg-blue-50 border border-blue-200 shadow-sm rounded-xl p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-xs">
                <Clock className="h-5 w-5 text-blue-500" />
                Horas do mês · {filialAtiva}
              </div>
              <div className="font-display font-bold text-3xl tabular-nums mt-2">
                {isTrial ? "0h" : `${horasConsumidasFilial}h / ${horasFilial}h`}
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5">
                {isTrial ? "Sem plano contratado" : `Pacote: ${horasContratadasTotal}h · desta filial: ${horasFilial}h`}
              </div>
              {!isTrial && (
                <Progress value={Math.min(100, (horasConsumidasFilial / horasFilial) * 100)} className="h-1.5 mt-3" />
              )}
            </div>
          </div>


          {/* 3 COLUNAS */}
          <SectionDivider>Visão do mês</SectionDivider>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
            {/* Coluna 1 — Entregáveis */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 min-h-[420px] flex flex-col">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                Entregáveis aguardando parecer
              </p>
              {entregaveis.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-xs text-muted-foreground text-center py-6">
                  Nenhum entregável pendente no momento.
                </div>
              ) : (
                <div className="flex-1">
                  {entregaveis.map((e) => {
                    const Icone = categoriaIcone[e.categoria] ?? categoriaIcone.default;
                    return (
                      <div key={e.id} className="border border-gray-100 rounded-lg p-3 mb-2 bg-gray-50">
                        <div className="flex items-center gap-2">
                          <Icone className="h-4 w-4 text-primary shrink-0" />
                          <span className="font-medium text-sm truncate">{e.titulo}</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">{e.projeto}</div>
                        <div className="flex items-center justify-between mt-2">
                          {e.vencido ? (
                            <span className="text-red-500 text-xs font-semibold">Vencido · {e.prazo}</span>
                          ) : (
                            <span className="text-muted-foreground text-xs">Prazo: {e.prazo}</span>
                          )}
                          <button className="text-primary text-xs font-medium inline-flex items-center gap-1">
                            Revisar <ArrowRight className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Coluna 2 — Comunicado mais recente */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 min-h-[420px] flex flex-col">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                Comunicado mais recente
              </p>
              <button
                onClick={() => setComunicadoOpen(true)}
                className="rounded-lg overflow-hidden border border-gray-100 text-left hover:opacity-95 transition"
              >
                {comunicadoRecente.capa ? (
                  <img src={comunicadoRecente.capa} alt="" className="w-full aspect-video object-cover" />
                ) : (
                  <div className="w-full aspect-video bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
                    <Megaphone className="h-8 w-8 text-primary/60" />
                  </div>
                )}
                <div className="p-3">
                  <div className="font-semibold text-sm leading-snug">{comunicadoRecente.titulo}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {comunicadoRecente.data} · {comunicadoRecente.autor}
                  </p>
                </div>
              </button>
              <div className="mt-auto pt-3">
                <Link
                  to="/cliente/comunicados"
                  className="text-primary text-sm font-medium inline-flex items-center gap-1"
                >
                  Ver todos os comunicados <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>

            {/* Coluna 3 — Agenda */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 min-h-[420px] flex flex-col">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                Agenda
              </p>
              <div className="w-full overflow-hidden">
                <Calendar
                  mode="single"
                  modifiers={{ evento: eventosAgendados }}
                  modifiersClassNames={{
                    evento: "bg-primary/20 text-primary font-semibold rounded-md",
                  }}
                  className="w-full rounded-md border-0 p-0"
                />
              </div>
              <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
                {eventosAgendados.slice(0, 2).map((d, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CalendarDays className="h-3 w-3 text-primary" />
                    {d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                  </li>
                ))}
              </ul>
            </div>
          </div>


          {/* VAGAS */}
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
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <Target className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-display font-semibold truncate">{v.titulo}</h3>
                        <p className="text-xs text-muted-foreground inline-flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3" /> {v.filial}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={v.status} />
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-lg bg-secondary/40 px-3 py-2">
                      <div className="text-muted-foreground text-[10px] uppercase tracking-wide">Etapa</div>
                      <div className="font-medium truncate">{v.etapa}</div>
                    </div>
                    <div className="rounded-lg bg-secondary/40 px-3 py-2">
                      <div className="text-muted-foreground text-[10px] uppercase tracking-wide">Perfis</div>
                      <div className="font-data tabular-nums font-medium">{v.candidatosEnviados}</div>
                    </div>
                  </div>
                  <div className="mt-3 inline-flex items-center gap-1 text-xs text-primary font-medium">
                    Ver detalhes <ArrowRight className="h-3 w-3" />
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* GUIA RÁPIDO */}
          <SectionDivider>Guia rápido</SectionDivider>
          <div className="bg-card border border-border rounded-xl p-2 sm:p-5">
            <div className="flex items-center gap-2 px-3 sm:px-0 pt-3 sm:pt-0 pb-2">
              <LifeBuoy className="h-4 w-4 text-primary" />
              <h3 className="font-display font-semibold text-sm">Dúvidas frequentes</h3>
            </div>
            <Accordion type="single" collapsible className="w-full">
              {faqItems.map((item, i) => {
                const Icone = item.icon ?? HelpCircle;
                return (
                  <AccordionItem key={i} value={`faq-${i}`}>
                    <AccordionTrigger className="text-sm text-left px-3 sm:px-0">
                      <span className="flex items-center gap-2.5">
                        <Icone className="h-4 w-4 text-primary shrink-0" />
                        {item.q}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground px-3 sm:px-0 pl-9">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
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
              <DashCard tone="horas" icon={Timer} label={`Horas · ${filialAtiva}`} value={`${horasConsumidasFilial}h`} hint={`de ${horasFilial}h da filial`} />
              <DashCard tone="alerta" icon={Receipt} label="Faturas em aberto" value="1" hint="R$ 4.800,00" />
              <DashCard tone="projetos" icon={Briefcase} label="Plano contratado" value="Ongoing" hint="R$ 4.800,00 / mês" />
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

function DashCard({
  tone,
  icon: Icone,
  label,
  value,
  hint,
  cta,
}: {
  tone: keyof typeof cardTone;
  icon: any;
  label: string;
  value: string;
  hint?: string;
  cta?: string;
}) {
  return (
    <div className={cn("rounded-xl border p-4 flex items-start gap-3", cardTone[tone])}>
      <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center shrink-0", iconTone[tone])}>
        <Icone className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="font-display font-bold text-2xl tabular-nums leading-tight mt-0.5">{value}</div>
        {hint && <div className="text-[11px] text-muted-foreground mt-0.5">{hint}</div>}
        {cta && (
          <button className="mt-2 text-xs font-semibold text-warning inline-flex items-center gap-1">
            {cta} <ArrowRight className="h-3 w-3" />
          </button>
        )}
      </div>
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
