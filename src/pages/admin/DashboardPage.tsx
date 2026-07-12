import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  AlertTriangle,
  ArrowRight,
  Briefcase,
  CheckCircle2,
  CircleDollarSign,
  Clock,
  FileText,
  Plus,
  Send,
  Star,
  Target,
  TrendingUp,
  Wallet,
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { PageHeader } from "@/components/PageHeader";
import { KpiCard } from "@/components/KpiCard";
import { ConnectStatCard } from "@/components/ConnectStatCard";
import { usePermissao } from "@/config/permissoes";
import { StatusBadge } from "@/components/StatusBadge";
import { SlaBar } from "@/components/SlaBar";
import { EmptyState } from "@/components/EmptyState";

import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { StatusKey } from "@/data/mock";

// =====================================================================
// Helpers
// =====================================================================

function getSaudacao(hour: number) {
  if (hour >= 5 && hour < 12) return "Bom dia";
  if (hour >= 12 && hour < 18) return "Boa tarde";
  return "Boa noite";
}

const formatBRL = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const parseISO = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
};

const formatDateBR = (iso: string) =>
  format(parseISO(iso), "dd/MM/yyyy", { locale: ptBR });

// =====================================================================
// Mock — Visão Geral
// =====================================================================

type AtividadeIcon = "check" | "clock" | "file" | "alert" | "plus" | "send";

interface AtividadeRecente {
  id: string;
  icon: AtividadeIcon;
  texto: string;
  quando: string;
  /** Se a atividade tem uma pessoa específica por trás, mostramos o avatar dela em vez do ícone genérico */
  autor?: string;
}

const ATIVIDADES: AtividadeRecente[] = [
  { id: "a1", icon: "check", texto: 'Ana Beatriz marcou "Diagnóstico inicial" como aprovado pelo cliente', quando: "há 2h", autor: "Ana Beatriz" },
  { id: "a2", icon: "clock", texto: 'Rafael Moura iniciou timer em "Hunting — Dev Full Stack"', quando: "há 3h", autor: "Rafael Moura" },
  { id: "a3", icon: "file",  texto: 'Camila Torres lançou 2h manuais em "Estruturação de RH"', quando: "há 5h", autor: "Camila Torres" },
  { id: "a4", icon: "alert", texto: "Fatura FAT-2026-0001 venceu sem pagamento (Kentaki Foods)", quando: "há 6h" },
  { id: "a5", icon: "plus",  texto: 'Novo projeto criado: "Implantação de PDP" (Grupo Maverick)', quando: "ontem" },
  { id: "a6", icon: "send",  texto: "Cronograma CRON-2026-0009 enviado para aprovação do cliente (Tech Plural)", quando: "ontem" },
];

const ATIVIDADE_META: Record<AtividadeIcon, { Icon: typeof CheckCircle2; cls: string }> = {
  check: { Icon: CheckCircle2, cls: "bg-[hsl(var(--success)/0.15)] text-success" },
  clock: { Icon: Clock,        cls: "bg-[hsl(var(--primary)/0.15)] text-primary" },
  file:  { Icon: FileText,     cls: "bg-[hsl(var(--info)/0.15)] text-info" },
  alert: { Icon: AlertTriangle, cls: "bg-[hsl(var(--destructive)/0.15)] text-destructive" },
  plus:  { Icon: Plus,         cls: "bg-[hsl(var(--success)/0.15)] text-success" },
  send:  { Icon: Send,         cls: "bg-[hsl(var(--primary)/0.15)] text-primary" },
};

interface Alerta {
  id: string;
  severidade: "critical" | "warning";
  titulo: string;
  descricao: string;
  to: string;
}

const ALERTAS: Alerta[] = [
  {
    id: "al1",
    severidade: "critical",
    titulo: "Fatura FAT-2026-0001 em atraso",
    descricao: "Kentaki Foods",
    to: "/app/financeiro",
  },
  {
    id: "al2",
    severidade: "critical",
    titulo: "Fatura FAT-2026-0005 em atraso",
    descricao: "Tech Plural",
    to: "/app/financeiro",
  },
  {
    id: "al3",
    severidade: "warning",
    titulo: 'Entregável "Workshop de validação" aguarda parecer do cliente',
    descricao: "Há 68h · SLA 72h",
    to: "/app/projetos/p3",
  },
  {
    id: "al4",
    severidade: "warning",
    titulo: 'Entregável "Revisão jurídica" com ajuste solicitado',
    descricao: "Prazo: 22/04/2026",
    to: "/app/projetos/p3",
  },
];

interface EntregavelProx {
  id: string;
  nome: string;
  projeto: string;
  empresa: string;
  responsavel: string;
  prazo: string;
  status: StatusKey;
  statusLabel: string;
  destaque?: boolean;
}

const ENTREGAVEIS: EntregavelProx[] = [
  { id: "e1", nome: "Workshop de validação", projeto: "Mapeamento de Cargos",   empresa: "Kentaki Foods", responsavel: "Ana Beatriz",   prazo: "2026-04-28", status: "aguardando", statusLabel: "Aprovação cliente" },
  { id: "e2", nome: "Política de cargos",    projeto: "Mapeamento de Cargos",   empresa: "Kentaki Foods", responsavel: "Camila Torres", prazo: "2026-05-10", status: "analise",    statusLabel: "Aprovação interna" },
  { id: "e3", nome: "Revisão jurídica",      projeto: "Revisão de políticas",   empresa: "Tech Plural",   responsavel: "Camila Torres", prazo: "2026-04-22", status: "atrasada",   statusLabel: "Ajuste solicitado", destaque: true },
  { id: "e4", nome: "Treinamento de líderes",projeto: "Mapeamento de Cargos",   empresa: "Kentaki Foods", responsavel: "Rafael Moura",  prazo: "2026-05-20", status: "andamento",  statusLabel: "Em andamento" },
  { id: "e5", nome: "Triagem técnica",       projeto: "Hunting Dev Full Stack", empresa: "Tech Plural",   responsavel: "Ana Beatriz",   prazo: "2026-05-15", status: "andamento",  statusLabel: "Em andamento" },
  { id: "e6", nome: "Go to Market",          projeto: "Go to Market",           empresa: "Alvo Digital",  responsavel: "Rafael Moura",  prazo: "2026-04-30", status: "aguardando", statusLabel: "Aguardando cliente" },
];

// =====================================================================
// Página
// =====================================================================

import { useAuth } from "@/context/AuthContext";
import { useValorFinanceiro } from "@/hooks/useValorFinanceiro";
import ConsultorDashboard from "./ConsultorDashboard";

export default function DashboardPage() {
  const { usuario } = useAuth();
  if (usuario?.role === "consultor") {
    return <ConsultorDashboard />;
  }
  return <AdminDashboard />;
}

function AdminDashboard() {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const { pode } = usePermissao();
  const { ocultar } = useValorFinanceiro();
  const now = useMemo(() => new Date(), []);
  const saudacao = getSaudacao(now.getHours());
  const dataFormatada = useMemo(
    () => format(now, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR }),
    [now]
  );
  const dataCapitalizada = dataFormatada.charAt(0).toUpperCase() + dataFormatada.slice(1);
  const hojeISO = format(now, "yyyy-MM-dd");

  // Financeiro mock
  const fin = {
    faturado: 44400,
    metaFaturamento: 50000,
    recebido: 13400,
    pendente: 31000,
    repassesPendentes: 8939,
    repassado: 6673,
  };
  const pctFaturamento = Math.round((fin.faturado / fin.metaFaturamento) * 1000) / 10;
  const totalReceber = fin.recebido + fin.pendente || 1;
  const pctRecebido = Math.round((fin.recebido / totalReceber) * 1000) / 10;
  const totalRepasse = fin.repassesPendentes + fin.repassado || 1;
  const pctRepassado = Math.round((fin.repassado / totalRepasse) * 1000) / 10;
  const atrasados = 2;

  // Mock — Operação
  const ATRASOS_POR_CONSULTOR = [
    { nome: "Ana B.",    itens: 2, cor: "hsl(var(--destructive))" },
    { nome: "Camila T.", itens: 3, cor: "hsl(var(--destructive))" },
    { nome: "Rafael M.", itens: 1, cor: "hsl(var(--warning))" },
  ];

  const PRODUTIVIDADE_SEMANAS = [
    { semana: "Sem 1", ana: 25,   camila: 20, rafael: 14 },
    { semana: "Sem 2", ana: 28,   camila: 22, rafael: 18 },
    { semana: "Sem 3", ana: 22,   camila: 26, rafael: 12 },
    { semana: "Sem 4", ana: 28.5, camila: 14, rafael: 22 },
  ];

  const NPS_MESES = [
    { mes: "dez", nps: 72 },
    { mes: "jan", nps: 68 },
    { mes: "fev", nps: 74 },
    { mes: "mar", nps: 76 },
    { mes: "abr", nps: 78 },
    { mes: "mai", nps: 81 },
  ];

  const VAGAS_SLA = [
    { vaga: "Gerente TI",      empresa: "Kentaki",      dias: 48, pct: 160 },
    { vaga: "Dev Full Stack",  empresa: "Tech Plural",  dias: 35, pct: 117 },
    { vaga: "Analista MKT",    empresa: "Maverick",     dias: 20, pct: 67  },
    { vaga: "Coord. DP",       empresa: "Studio Mira",  dias: 10, pct: 33  },
    { vaga: "Head Comercial",  empresa: "Alvo Digital", dias: 4,  pct: 13  },
  ];

  const ENGAJAMENTO_PIZZA = [
    { name: "Ativos",            value: 2, fill: "hsl(var(--success))" },
    { name: "Sem resposta +5d",  value: 1, fill: "hsl(var(--warning))" },
    { name: "SLA crítico",       value: 2, fill: "hsl(var(--destructive))" },
  ];

  const ENGAJAMENTO_SLA = [
    { nome: "Kentaki Foods", slaH: 4  },
    { nome: "Studio Mira",   slaH: 31 },
  ];

  return (
    <div>
      <div className="rounded-xl p-7 text-primary-foreground bg-primary">
        <p className="font-display text-xl font-semibold">
          {saudacao}, {usuario?.nome?.split(" ")[0] ?? "Ana"} 👋
        </p>
        <p className="text-sm text-primary-foreground/80 mt-1 mb-5">{dataCapitalizada}</p>
        <div className="flex flex-wrap gap-3">
          <div className="bg-[hsl(var(--primary-glow))] rounded-full px-6 py-3">
            <div className="font-display text-lg font-bold leading-none">6</div>
            <div className="text-xs text-primary-foreground/80 mt-1">Projetos ativos</div>
          </div>
          <div className="bg-[hsl(var(--primary-glow))] rounded-full px-6 py-3">
            <div className="font-display text-lg font-bold leading-none">115h</div>
            <div className="text-xs text-primary-foreground/80 mt-1">Horas no mês</div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="visao-geral" className="w-full mt-6">
        <TabsList className="mb-6">
          <TabsTrigger value="visao-geral">Visão geral</TabsTrigger>
          <TabsTrigger value="operacao">Operação</TabsTrigger>
        </TabsList>

        {/* ── ABA VISÃO GERAL ── */}
        <TabsContent value="visao-geral" className="mt-0 space-y-6">

          {/* 1. KPIs — 4 cards de estatística, todos no mesmo formato (sem card largo, sem gráfico embutido) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
            {pode("financeiro.ver_valores") && (
              <ConnectStatCard
                variant="stat"
                icon={CircleDollarSign}
                tone="teal"
                label="Faturamento do mês"
                value={`${pctFaturamento}%`}
                deltaValue={ocultar(formatBRL(fin.faturado))}
                positive={pctFaturamento >= 80}
                barPercent={pctFaturamento}
                onClick={() => navigate("/app/financeiro")}
              />
            )}
            <ConnectStatCard
              variant="stat"
              icon={Briefcase}
              tone="blue"
              label="Projetos ativos"
              value="6"
              deltaValue="+1"
              positive
              onClick={() => navigate("/app/projetos")}
            />
            <ConnectStatCard
              variant="stat"
              icon={Clock}
              tone="violet"
              label="Horas no mês"
              value="115h"
              deltaValue="+17%"
              positive
              onClick={() => navigate("/app/horas")}
            />
            <ConnectStatCard
              variant="stat"
              icon={AlertTriangle}
              tone={atrasados > 0 ? "red" : "green"}
              label="Entregáveis em atraso"
              value={atrasados}
              onClick={() => navigate("/app/projetos")}
            />
          </div>

          {/* 2. Atividade + Alertas */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-start">
            <Card className="lg:col-span-3 p-6 rounded-xl shadow-[0_1px_4px_rgba(133,146,173,0.2)] border-0">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Últimas atualizações
                </h2>
                <button
                  type="button"
                  onClick={() => navigate("/app/horas")}
                  className="text-xs text-primary hover:underline font-medium"
                >
                  Ver tudo
                </button>
              </div>
              {ATIVIDADES.length === 0 ? (
                <EmptyState
                  icon={Clock}
                  title="Sem atividades recentes"
                  description="As últimas atualizações da operação aparecerão aqui."
                />
              ) : (
                <ul className="space-y-5">
                  {ATIVIDADES.map((a, i) => {
                    const meta = ATIVIDADE_META[a.icon];
                    const Icon = meta.Icon;
                    const iniciais = a.autor?.split(" ").filter(Boolean).slice(0, 2).map((n) => n[0]).join("").toUpperCase();
                    const corAvatar = ["#264478", "#6B3FBF", "#12786B", "#B4740E"][
                      a.autor ? a.autor.charCodeAt(0) % 4 : 0
                    ];
                    return (
                      <li
                        key={a.id}
                        style={{ animationDelay: `${i * 70}ms`, animationFillMode: "backwards" }}
                        className="flex items-center gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500"
                      >
                        {a.autor ? (
                          <div
                            className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0 text-xs font-semibold text-white"
                            style={{ background: corAvatar }}
                          >
                            {iniciais}
                          </div>
                        ) : (
                          <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center shrink-0", meta.cls)}>
                            <Icon className="h-4 w-4" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium leading-snug">{a.texto}</p>
                        </div>
                        <span className="shrink-0 text-xs text-muted-foreground">{a.quando}</span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Card>

            <Card className="lg:col-span-2 p-6 rounded-xl shadow-[0_1px_4px_rgba(133,146,173,0.2)] border-0">
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Alertas ativos</h2>
                <span className="badge-pill bg-[hsl(var(--destructive)/0.15)] text-destructive border border-[hsl(var(--destructive)/0.3)] text-xs">
                  {ALERTAS.length}
                </span>
              </div>
              {ALERTAS.length === 0 ? (
                <EmptyState
                  icon={CheckCircle2}
                  title="Nenhum alerta"
                  description="Tudo certo por aqui!"
                />
              ) : (
                <div className="flex flex-col">
                  <div className="h-px bg-border" />
                  {ALERTAS.map((al) => {
                    const isCritical = al.severidade === "critical";
                    return (
                      <Link key={al.id} to={al.to} className="group flex items-center gap-3 py-3.5 hover:bg-muted/30 transition-colors -mx-1 px-1 rounded-md">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium leading-snug truncate">{al.titulo}</p>
                            <span className={cn(
                              "shrink-0 badge-pill text-[10px] font-semibold px-2 py-0.5",
                              isCritical ? "bg-[hsl(var(--destructive)/0.15)] text-destructive" : "bg-[hsl(var(--warning)/0.15)] text-warning"
                            )}>
                              {isCritical ? "Crítico" : "Atenção"}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{al.descricao}</p>
                        </div>
                        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                      </Link>
                    );
                  })}
                  <div className="h-px bg-border" />
                </div>
              )}
            </Card>
          </div>

          {/* 3. Entregáveis próximos do prazo */}
          <Card className="overflow-hidden rounded-xl shadow-[0_1px_4px_rgba(133,146,173,0.2)] border-0">
            <div className="p-5 border-b border-border">
              <h2 className="font-display text-lg font-semibold">
                Entregáveis com prazo nos próximos 30 dias
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Priorize as entregas com prazo mais próximo ou atrasadas.
              </p>
            </div>
            {ENTREGAVEIS.length === 0 ? (
              <EmptyState
                icon={Briefcase}
                title="Sem entregáveis no horizonte"
                description="Nenhum entregável com prazo nos próximos 30 dias."
              />
            ) : (
              <div className="p-3 space-y-2">
                <div className="hidden md:grid grid-cols-[1.6fr_1fr_1fr_1fr_0.8fr] gap-4 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <span>Entregável</span>
                  <span>Empresa</span>
                  <span>Responsável</span>
                  <span>Prazo</span>
                  <span className="text-right">Status</span>
                </div>
                {ENTREGAVEIS.map((e) => {
                  const atrasada = e.prazo < hojeISO;
                  return (
                    <Link
                      key={e.id}
                      to="/app/projetos"
                      className={cn(
                        "grid grid-cols-1 md:grid-cols-[1.6fr_1fr_1fr_1fr_0.8fr] items-center gap-2 md:gap-4 rounded-xl border p-4 transition-colors",
                        e.destaque
                          ? "border-[hsl(var(--warning)/0.35)] bg-[hsl(var(--warning)/0.08)] hover:bg-[hsl(var(--warning)/0.14)]"
                          : "border-border bg-card hover:bg-muted/30"
                      )}
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate">{e.nome}</p>
                        <p className="text-xs text-muted-foreground truncate">{e.projeto}</p>
                      </div>
                      <span className="text-sm text-muted-foreground truncate">{e.empresa}</span>
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="h-6 w-6 rounded-md bg-[image:linear-gradient(135deg,hsl(var(--primary)),hsl(var(--primary-glow)))] flex items-center justify-center text-[9px] font-semibold text-white shrink-0">
                          {e.responsavel.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                        </div>
                        <span className="text-sm truncate">{e.responsavel}</span>
                      </div>
                      <span className={cn("text-sm tabular-nums", atrasada && "text-destructive font-semibold")}>
                        {formatDateBR(e.prazo)}
                      </span>
                      <div className="md:text-right">
                        <StatusBadge status={e.status}>{e.statusLabel}</StatusBadge>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </Card>

          {/* 4. Resumo financeiro */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-lg font-semibold">Resumo financeiro do mês</h2>
              <Link to="/app/financeiro" className="text-xs text-primary hover:underline font-medium">
                Ir para Financeiro →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
              <ConnectStatCard
                variant="stat"
                icon={TrendingUp}
                tone="blue"
                label={`Faturado — meta ${ocultar(formatBRL(fin.metaFaturamento))}`}
                value={ocultar(formatBRL(fin.faturado))}
                deltaValue={`${pctFaturamento.toFixed(1)}%`}
                positive={pctFaturamento >= 80}
                barPercent={pctFaturamento}
                onClick={() => navigate("/app/financeiro")}
              />

              <ConnectStatCard
                variant="stat"
                icon={CheckCircle2}
                tone="green"
                label={`Recebido — pendente ${ocultar(formatBRL(fin.pendente))}`}
                value={ocultar(formatBRL(fin.recebido))}
                deltaValue={`${pctRecebido.toFixed(1)}%`}
                positive={pctRecebido >= 50}
                barPercent={pctRecebido}
                onClick={() => navigate("/app/financeiro")}
              />

              <ConnectStatCard
                variant="stat"
                icon={Wallet}
                tone="teal"
                label={`Repasses — já repassado ${ocultar(formatBRL(fin.repassado))}`}
                value={ocultar(formatBRL(fin.repassesPendentes))}
                deltaValue={`${pctRepassado.toFixed(1)}%`}
                positive={pctRepassado >= 50}
                barPercent={pctRepassado}
                onClick={() => navigate("/app/financeiro")}
              />
            </div>
            </div>

        </TabsContent>

        {/* ── ABA OPERAÇÃO ── */}
        <TabsContent value="operacao" className="mt-0 space-y-4">

          {/* LINHA 1: Atrasos + Engajamento */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

            {/* Bloco 1: Tarefas em atraso */}
            <Card className="p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-display text-base font-semibold flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  Tarefas em atraso
                </h2>
                <span className="badge-pill bg-[hsl(var(--destructive)/0.15)] text-destructive border border-[hsl(var(--destructive)/0.3)] text-xs">
                  6 entregáveis
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div>
                  <div className="text-2xl font-semibold">6</div>
                  <div className="text-xs text-muted-foreground">em atraso agora</div>
                </div>
                <div>
                  <div className="text-2xl font-semibold text-warning">22</div>
                  <div className="text-xs text-muted-foreground">dias — maior atraso</div>
                </div>
                <div>
                  <div className="text-2xl font-semibold">8.5</div>
                  <div className="text-xs text-muted-foreground">dias em média</div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={130}>
                <BarChart data={ATRASOS_POR_CONSULTOR} barSize={40}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="nome" fontSize={11} tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" />
                  <YAxis fontSize={11} tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                    formatter={(v: number) => [`${v} itens`, "Atrasos"]}
                  />
                  <Bar dataKey="itens" radius={[4, 4, 0, 0]}>
                    {ATRASOS_POR_CONSULTOR.map((entry, i) => (
                      <Cell key={i} fill={entry.cor} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* Bloco 2: Engajamento do cliente */}
            <Card className="p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-display text-base font-semibold flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Engajamento do cliente
                </h2>
                <span className="badge-pill bg-[hsl(var(--warning)/0.15)] text-warning border border-[hsl(var(--warning)/0.3)] text-xs">
                  2 SLA crítico
                </span>
              </div>
              <div className="flex items-start gap-4 mb-4">
                <ResponsiveContainer width={100} height={100}>
                  <PieChart>
                    <Pie
                      data={ENGAJAMENTO_PIZZA}
                      cx="50%"
                      cy="50%"
                      innerRadius={28}
                      outerRadius={44}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {ENGAJAMENTO_PIZZA.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-2 pt-2">
                  {ENGAJAMENTO_PIZZA.map((e, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <span className="h-2 w-2 rounded-full shrink-0" style={{ background: e.fill }} />
                      <span className="text-muted-foreground flex-1">{e.name}</span>
                      <span className="font-medium">{e.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-2">
                SLA aprovação 72h — tempo restante
              </p>
              {ENGAJAMENTO_SLA.map((c, i) => (
                <div key={i} className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs text-muted-foreground w-24 shrink-0 truncate">
                    {c.nome.split(" ")[0]}
                  </span>
                  <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.min(100, Math.round(((72 - c.slaH) / 72) * 100))}%`,
                        background: c.slaH < 12 ? "hsl(var(--destructive))" : "hsl(var(--warning))",
                      }}
                    />
                  </div>
                  <span
                    className="text-xs font-medium w-16 text-right shrink-0"
                    style={{ color: c.slaH < 12 ? "#A32D2D" : "#854F0B" }}
                  >
                    {c.slaH}h restantes
                  </span>
                </div>
              ))}
            </Card>
          </div>

          {/* LINHA 2: Produtividade */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-display text-base font-semibold">Produtividade dos consultores</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Horas registradas — últimas 4 semanas</p>
              </div>
              <div className="flex items-center gap-4">
                {[
                  { label: "Ana B.",    cor: "hsl(var(--primary))" },
                  { label: "Camila T.", cor: "hsl(var(--highlight))" },
                  { label: "Rafael M.", cor: "#06B6D4" },
                ].map((c) => (
                  <span key={c.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className="h-2 w-2 rounded-sm inline-block" style={{ background: c.cor }} />
                    {c.label}
                  </span>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={PRODUTIVIDADE_SEMANAS} barGap={4} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="semana" fontSize={11} tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" />
                <YAxis fontSize={11} tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" tickFormatter={(v: number) => `${v}h`} />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                  formatter={(v: number, name: string) => [
                    `${v}h`,
                    name === "ana" ? "Ana B." : name === "camila" ? "Camila T." : "Rafael M.",
                  ]}
                />
                <Bar dataKey="ana"    fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} />
                <Bar dataKey="camila" fill="hsl(var(--highlight))" radius={[3, 3, 0, 0]} />
                <Bar dataKey="rafael" fill="#06B6D4" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* LINHA 3: NPS + SLA Vagas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

            {/* Bloco 4: NPS */}
            <Card className="p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-display text-base font-semibold flex items-center gap-2">
                  <Star className="h-4 w-4 text-warning" />
                  NPS de satisfação
                </h2>
                <span className="badge-pill bg-[hsl(var(--primary)/0.15)] text-primary border border-[hsl(var(--primary)/0.3)] text-xs">
                  +3 vs mês ant.
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-3xl font-semibold text-primary">81</div>
                  <div className="text-xs text-muted-foreground">NPS médio mai/26</div>
                  <div className="text-xs text-success mt-1">↑ tendência positiva</div>
                </div>
                <div>
                  <div className="text-3xl font-semibold">4.3</div>
                  <div className="text-xs text-muted-foreground">estrelas médias</div>
                  <div className="text-xs text-muted-foreground mt-1">18 avaliações</div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={120}>
                <LineChart data={NPS_MESES}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="mes" fontSize={11} tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" />
                  <YAxis domain={[60, 90]} fontSize={11} tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                    formatter={(v: number) => [v, "NPS"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="nps"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ r: 3, fill: "hsl(var(--primary))" }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            {/* Bloco 5: SLA Vagas */}
            <Card className="p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-display text-base font-semibold flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  SLA de vagas ativas
                </h2>
                <span className="badge-pill bg-[hsl(var(--destructive)/0.15)] text-destructive border border-[hsl(var(--destructive)/0.3)] text-xs">
                  2 estouradas
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div>
                  <div className="text-2xl font-semibold">5</div>
                  <div className="text-xs text-muted-foreground">vagas ativas</div>
                </div>
                <div>
                  <div className="text-2xl font-semibold text-warning">26</div>
                  <div className="text-xs text-muted-foreground">dias médio</div>
                </div>
                <div>
                  <div className="text-2xl font-semibold text-destructive">2</div>
                  <div className="text-xs text-muted-foreground">SLA estourado</div>
                </div>
              </div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-3">
                % do SLA consumido (meta: 30 dias)
              </p>
              <div className="space-y-2.5">
                {VAGAS_SLA.map((v, i) => {
                  const cor      = v.pct > 100 ? "hsl(var(--destructive))" : v.pct > 60 ? "hsl(var(--warning))" : "hsl(var(--success))";
                  const textCor  = v.pct > 100 ? "#A32D2D" : v.pct > 60 ? "#854F0B" : "#3B6D11";
                  return (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-24 shrink-0">
                        <div className="text-xs text-foreground leading-tight truncate">{v.vaga}</div>
                        <div className="text-[10px] text-muted-foreground">{v.empresa}</div>
                      </div>
                      <div className="flex-1 h-3 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full flex items-center justify-start pl-1.5"
                          style={{
                            width: `${Math.min(100, v.pct)}%`,
                            background: cor,
                            minWidth: v.pct > 10 ? "auto" : "20px",
                          }}
                        >
                          {v.pct > 20 && (
                            <span className="text-[9px] font-medium text-white">{v.pct}%</span>
                          )}
                        </div>
                      </div>
                      <span className="text-xs font-medium w-8 text-right shrink-0" style={{ color: textCor }}>
                        {v.dias}d
                      </span>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

        </TabsContent>

      </Tabs>
    </div>
  );
}
