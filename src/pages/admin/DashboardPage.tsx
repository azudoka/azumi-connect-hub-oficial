import { useEffect, useMemo, useState } from "react";
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
  Loader2,
  MoreVertical,
  Plus,
  Send,
  Star,
  Target,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";

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
  /** Pra onde essa atividade específica leva ao clicar — cada uma tem o destino certo, não um "ver tudo" genérico errado */
  to: string;
  /** Referência curta (estilo #PROJ-0001), como no modelo original */
  ref?: string;
}

const ATIVIDADES: AtividadeRecente[] = [
  { id: "a1", icon: "check", texto: 'Ana Beatriz marcou "Diagnóstico inicial" como aprovado pelo cliente', quando: "há 2h", autor: "Ana Beatriz", to: "/app/projetos", ref: "#PROJ-2026-0001" },
  { id: "a2", icon: "clock", texto: 'Rafael Moura iniciou timer em "Hunting — Dev Full Stack"', quando: "há 3h", autor: "Rafael Moura", to: "/app/horas" },
  { id: "a3", icon: "file",  texto: 'Camila Torres lançou 2h manuais em "Estruturação de RH"', quando: "há 5h", autor: "Camila Torres", to: "/app/horas" },
  { id: "a4", icon: "alert", texto: "Fatura FAT-2026-0001 venceu sem pagamento (Kentaki Foods)", quando: "há 6h", to: "/app/financeiro", ref: "#FAT-2026-0001" },
  { id: "a5", icon: "plus",  texto: 'Novo projeto criado: "Implantação de PDP" (Grupo Maverick)', quando: "ontem", to: "/app/projetos", ref: "#PROJ-2026-0005" },
  { id: "a6", icon: "send",  texto: "Cronograma CRON-2026-0009 enviado para aprovação do cliente (Tech Plural)", quando: "ontem", to: "/app/projetos", ref: "#CRON-2026-0009" },
];

const ATIVIDADE_META: Record<AtividadeIcon, { Icon: typeof CheckCircle2; cls: string; dot: string }> = {
  check: { Icon: CheckCircle2, cls: "bg-[hsl(var(--success)/0.15)] text-success", dot: "bg-success" },
  clock: { Icon: Clock,        cls: "bg-[hsl(var(--primary)/0.15)] text-primary", dot: "bg-primary" },
  file:  { Icon: FileText,     cls: "bg-[hsl(var(--info)/0.15)] text-info", dot: "bg-info" },
  alert: { Icon: AlertTriangle, cls: "bg-[hsl(var(--destructive)/0.15)] text-destructive", dot: "bg-destructive" },
  plus:  { Icon: Plus,         cls: "bg-[hsl(var(--success)/0.15)] text-success", dot: "bg-success" },
  send:  { Icon: Send,         cls: "bg-[hsl(var(--primary)/0.15)] text-primary", dot: "bg-primary" },
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
import { supabase } from "@/integrations/supabase/client";
import ConsultorDashboard from "./ConsultorDashboard";

export default function DashboardPage() {
  const { usuario } = useAuth();
  if (usuario?.role === "consultor") {
    return <ConsultorDashboard />;
  }
  return <AdminDashboard />;
}

function AdminDashboard() {
  const [periodoProdutividade, setPeriodoProdutividade] = useState<"atual" | "anterior">("atual");
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

  // Faturamento real — últimos 6 meses
  type FatMes = { mes: string; valor: number };
  const [fatMeses, setFatMeses] = useState<FatMes[] | null>(null);
  useEffect(() => {
    const sixAgo = new Date();
    sixAgo.setMonth(sixAgo.getMonth() - 6);
    supabase
      .from("invoices")
      .select("amount, due_date")
      .gte("due_date", sixAgo.toISOString().slice(0, 10))
      .order("due_date")
      .then(({ data }) => {
        const buckets = Array.from({ length: 6 }, (_, i) => {
          const d = new Date();
          d.setMonth(d.getMonth() - (5 - i));
          return {
            key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
            mes: format(d, "MMM/yy", { locale: ptBR }),
            valor: 0,
          };
        });
        for (const inv of data ?? []) {
          const m = (inv as { amount: number; due_date: string }).due_date?.slice(0, 7);
          const b = buckets.find((bk) => bk.key === m);
          if (b) b.valor += (inv as { amount: number; due_date: string }).amount ?? 0;
        }
        setFatMeses(buckets.map(({ mes, valor }) => ({ mes, valor })));
      });
  }, []);
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
  const PRODUTIVIDADE_SEMANAS_MES_ANTERIOR = [
    { semana: "Sem 1", ana: 20,   camila: 24, rafael: 10 },
    { semana: "Sem 2", ana: 24,   camila: 19, rafael: 15 },
    { semana: "Sem 3", ana: 26,   camila: 21, rafael: 16 },
    { semana: "Sem 4", ana: 19,   camila: 25, rafael: 20 },
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
        <div className="flex items-center gap-4 mb-6">
          <div className="h-14 w-14 rounded-xl bg-card flex items-center justify-center shrink-0">
            <iconify-icon icon="solar:graph-new-up-bold-duotone" width="26" height="26" style={{ color: "hsl(var(--primary))" }} />
          </div>
          <div>
            <p className="font-display text-xl font-bold leading-tight">
              {saudacao}, {usuario?.nome?.split(" ")[0] ?? "Ana"} 👋
            </p>
            <p className="text-sm text-primary-foreground/75 mt-0.5">{dataCapitalizada}</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div>
            <p className="text-sm text-primary-foreground/70">Projetos ativos</p>
            <p className="font-display text-2xl font-bold mt-0.5">6</p>
          </div>
          <div className="h-10 w-px bg-primary-foreground/25" />
          <div>
            <p className="text-sm text-primary-foreground/70">Horas no mês</p>
            <p className="font-display text-2xl font-bold mt-0.5">115h</p>
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
                icon="solar:dollar-bold-duotone"
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
              icon="solar:case-round-bold-duotone"
              tone="blue"
              label="Projetos ativos"
              value="6"
              deltaValue="+1"
              positive
              onClick={() => navigate("/app/projetos")}
            />
            <ConnectStatCard
              variant="stat"
              icon="solar:clock-circle-bold-duotone"
              tone="violet"
              label="Horas no mês"
              value="115h"
              deltaValue="+17%"
              positive
              onClick={() => navigate("/app/horas")}
            />
            <ConnectStatCard
              variant="stat"
              icon="solar:danger-triangle-bold-duotone"
              tone={atrasados > 0 ? "red" : "green"}
              label="Entregáveis em atraso"
              value={atrasados}
              onClick={() => navigate("/app/projetos")}
            />
          </div>

          {/* 2. Gráfico de faturamento real */}
          <Card className="rounded-2xl shadow-md border-0 p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="font-display text-base font-semibold">Faturamento mensal</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Últimos 6 meses · faturas emitidas</p>
              </div>
              {fatMeses && fatMeses.some((m) => m.valor > 0) && (
                <span className="text-sm font-semibold text-foreground tabular-nums">
                  {ocultar(formatBRL(fatMeses.reduce((s, m) => s + m.valor, 0)))}
                </span>
              )}
            </div>
            {fatMeses === null ? (
              <div className="h-44 flex items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : fatMeses.every((m) => m.valor === 0) ? (
              <div className="h-44 flex flex-col items-center justify-center text-center gap-2">
                <TrendingUp className="h-8 w-8 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">Ainda não há histórico suficiente de faturamento.</p>
                <p className="text-xs text-muted-foreground/60">Os dados aparecerão aqui conforme faturas forem registradas.</p>
              </div>
            ) : (
              <Chart
                options={{
                  chart: { type: "area", toolbar: { show: false }, zoom: { enabled: false } },
                  colors: ["hsl(var(--primary))"],
                  fill: { type: "gradient", gradient: { opacityFrom: 0.18, opacityTo: 0.02, shadeIntensity: 0 } },
                  stroke: { curve: "smooth", width: 2.5 },
                  dataLabels: { enabled: false },
                  markers: { size: 3 },
                  xaxis: {
                    categories: fatMeses.map((f) => f.mes),
                    labels: { style: { colors: "hsl(var(--muted-foreground))", fontSize: "11px" } },
                    axisBorder: { show: false },
                    axisTicks: { show: false },
                  },
                  yaxis: {
                    labels: {
                      style: { colors: "hsl(var(--muted-foreground))", fontSize: "11px" },
                      formatter: (v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v),
                    },
                  },
                  grid: { borderColor: "hsl(var(--border))", strokeDashArray: 3, xaxis: { lines: { show: false } } },
                  tooltip: {
                    theme: "light",
                    y: { formatter: (v: number) => ocultar(formatBRL(v)), title: { formatter: () => "Faturado" } },
                  },
                } as ApexOptions}
                series={[{ name: "Faturamento", data: fatMeses.map((f) => f.valor) }]}
                type="area"
                height={176}
                width="100%"
              />
            )}
          </Card>

          {/* 3. Atividade + Alertas */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-start">
            <Card className="lg:col-span-3 p-6 rounded-2xl shadow-md border-0">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-6">
                Últimas atualizações
              </h2>
              {ATIVIDADES.length === 0 ? (
                <EmptyState
                  icon={Clock}
                  title="Sem atividades recentes"
                  description="As últimas atualizações da operação aparecerão aqui."
                />
              ) : (
                <ul>
                  {ATIVIDADES.map((a, i) => {
                    const meta = ATIVIDADE_META[a.icon];
                    const ultimo = i === ATIVIDADES.length - 1;
                    return (
                      <li key={a.id}>
                        <div className="flex gap-4 min-h-[64px]">
                          <p className="text-xs text-muted-foreground w-10 shrink-0 pt-0.5 tabular-nums">{a.quando}</p>
                          <div className="flex flex-col items-center shrink-0">
                            <span className={cn("rounded-full h-3 w-3 shrink-0", meta.dot)} />
                            {!ultimo && <span className="w-px flex-1 bg-border mt-1" />}
                          </div>
                          <div className="min-w-0 flex-1 pb-5">
                            <p className="text-sm leading-snug">{a.texto}</p>
                            {a.ref && (
                              <button
                                onClick={() => navigate(a.to)}
                                className="text-xs text-primary hover:underline font-medium mt-0.5"
                              >
                                {a.ref}
                              </button>
                            )}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Card>

            <Card className="lg:col-span-2 p-6 rounded-2xl shadow-md border-0">
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

          {/* 4. Entregáveis próximos do prazo */}
          <Card className="overflow-hidden rounded-2xl shadow-md border-0">
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
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px]">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left font-semibold text-sm px-4 py-3">Responsável</th>
                      <th className="text-left font-semibold text-sm px-4 py-3">Entregável</th>
                      <th className="text-left font-semibold text-sm px-4 py-3">Empresa</th>
                      <th className="text-left font-semibold text-sm px-4 py-3">Prazo</th>
                      <th className="text-left font-semibold text-sm px-4 py-3">Status</th>
                      <th className="w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {ENTREGAVEIS.map((e) => {
                      const atrasada = e.prazo < hojeISO;
                      return (
                        <tr
                          key={e.id}
                          onClick={() => navigate("/app/projetos")}
                          className="border-b border-border last:border-0 hover:bg-muted/40 cursor-pointer transition-colors"
                        >
                          <td className="px-4 py-3.5">
                            <div
                              title={e.responsavel}
                              className="h-[52px] w-[52px] rounded-lg bg-[image:linear-gradient(135deg,hsl(var(--primary)),hsl(var(--primary-glow)))] flex items-center justify-center text-sm font-semibold text-white shrink-0"
                            >
                              {e.responsavel.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                            </div>
                          </td>
                          <td className="px-4 py-3.5">
                            <p className="text-sm font-semibold truncate">{e.nome}</p>
                            <p className="text-xs text-muted-foreground truncate">{e.projeto}</p>
                          </td>
                          <td className="px-4 py-3.5 text-sm text-muted-foreground">{e.empresa}</td>
                          <td className={cn("px-4 py-3.5 text-sm tabular-nums", atrasada && "text-destructive font-semibold")}>
                            {formatDateBR(e.prazo)}
                          </td>
                          <td className="px-4 py-3.5">
                            <StatusBadge status={e.status}>{e.statusLabel}</StatusBadge>
                          </td>
                          <td className="px-2 py-3.5" onClick={(ev) => ev.stopPropagation()}>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button
                                  className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-[hsl(var(--primary)/0.1)] hover:text-primary text-muted-foreground transition-colors"
                                  aria-label="Ações"
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-40">
                                <DropdownMenuItem onClick={() => navigate("/app/projetos")} className="gap-2">
                                  <iconify-icon icon="solar:eye-bold-duotone" width="16" height="16" /> Ver projeto
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => navigate("/app/horas")} className="gap-2">
                                  <iconify-icon icon="solar:clock-circle-bold-duotone" width="16" height="16" /> Lançar horas
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {/* 5. Resumo financeiro */}
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
                icon="solar:graph-up-bold-duotone"
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
                icon="solar:check-circle-bold-duotone"
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
                icon="solar:wallet-money-bold-duotone"
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
            <Card className="p-5 rounded-xl border-0" style={{ boxShadow: "0 1px 4px rgba(133,146,173,0.2)" }}>
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
              <Chart
                options={{
                  chart: { type: "bar", toolbar: { show: false } },
                  plotOptions: { bar: { borderRadius: 4, columnWidth: "50%", distributed: true } },
                  colors: ATRASOS_POR_CONSULTOR.map((a) => a.cor),
                  dataLabels: { enabled: false },
                  legend: { show: false },
                  xaxis: {
                    categories: ATRASOS_POR_CONSULTOR.map((a) => a.nome),
                    labels: { style: { colors: "hsl(var(--muted-foreground))", fontSize: "11px" } },
                    axisBorder: { show: false },
                    axisTicks: { show: false },
                  },
                  yaxis: {
                    labels: {
                      style: { colors: "hsl(var(--muted-foreground))", fontSize: "11px" },
                      formatter: (v: number) => String(Math.round(v)),
                    },
                  },
                  grid: { borderColor: "hsl(var(--border))", strokeDashArray: 3, xaxis: { lines: { show: false } } },
                  tooltip: {
                    theme: "light",
                    y: { formatter: (v: number) => `${v} itens`, title: { formatter: () => "Atrasos" } },
                  },
                } as ApexOptions}
                series={[{ name: "Atrasos", data: ATRASOS_POR_CONSULTOR.map((a) => a.itens) }]}
                type="bar"
                height={130}
                width="100%"
              />
            </Card>

            {/* Bloco 2: Engajamento do cliente */}
            <Card className="p-5 rounded-xl border-0" style={{ boxShadow: "0 1px 4px rgba(133,146,173,0.2)" }}>
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
                <div className="shrink-0">
                  <Chart
                    options={{
                      chart: { type: "donut" },
                      colors: ENGAJAMENTO_PIZZA.map((e) => e.fill),
                      labels: ENGAJAMENTO_PIZZA.map((e) => e.name),
                      legend: { show: false },
                      dataLabels: { enabled: false },
                      plotOptions: { pie: { donut: { size: "60%" } } },
                      stroke: { width: 0 },
                      tooltip: { theme: "light" },
                    } as ApexOptions}
                    series={ENGAJAMENTO_PIZZA.map((e) => e.value)}
                    type="donut"
                    width={100}
                    height={100}
                  />
                </div>
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

          {/* LINHA 2: Produtividade — portado do RevenueForecast.tsx da referência */}
          <Card className="p-5 rounded-xl border-0" style={{ boxShadow: "0 1px 4px rgba(133,146,173,0.2)" }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-base font-semibold">Produtividade dos consultores</h2>
              <Select value={periodoProdutividade} onValueChange={(v) => setPeriodoProdutividade(v as "atual" | "anterior")}>
                <SelectTrigger className="w-[160px] h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="atual">Últimas 4 semanas</SelectItem>
                  <SelectItem value="anterior">Mês anterior</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-4 mb-2">
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
            {(() => {
              const dadosProd = periodoProdutividade === "atual" ? PRODUTIVIDADE_SEMANAS : PRODUTIVIDADE_SEMANAS_MES_ANTERIOR;
              return (
                <Chart
                  key={periodoProdutividade}
                  options={{
                    chart: { type: "bar", toolbar: { show: false } },
                    plotOptions: { bar: { borderRadius: 5, columnWidth: "70%", borderRadiusApplication: "end" } },
                    colors: ["hsl(var(--primary))", "hsl(var(--highlight))", "#06B6D4"],
                    dataLabels: { enabled: false },
                    legend: { show: false },
                    xaxis: {
                      categories: dadosProd.map((s) => s.semana),
                      labels: { style: { colors: "hsl(var(--muted-foreground))", fontSize: "11px" } },
                      axisBorder: { show: false },
                      axisTicks: { show: false },
                    },
                    yaxis: {
                      labels: {
                        style: { colors: "hsl(var(--muted-foreground))", fontSize: "11px" },
                        formatter: (v: number) => `${v}h`,
                      },
                    },
                    grid: { borderColor: "hsl(var(--border))", strokeDashArray: 3, xaxis: { lines: { show: false } } },
                    tooltip: {
                      theme: "light",
                      y: { formatter: (v: number) => `${v}h` },
                    },
                  } as ApexOptions}
                  series={[
                    { name: "Ana B.",    data: dadosProd.map((s) => s.ana) },
                    { name: "Camila T.", data: dadosProd.map((s) => s.camila) },
                    { name: "Rafael M.", data: dadosProd.map((s) => s.rafael) },
                  ]}
                  type="bar"
                  height={160}
                  width="100%"
                />
              );
            })()}
          </Card>

          {/* LINHA 3: NPS + SLA Vagas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

            {/* Bloco 4: NPS */}
            <Card className="p-5 rounded-xl border-0" style={{ boxShadow: "0 1px 4px rgba(133,146,173,0.2)" }}>
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
              <Chart
                options={{
                  chart: { type: "line", toolbar: { show: false }, zoom: { enabled: false } },
                  colors: ["hsl(var(--primary))"],
                  stroke: { curve: "smooth", width: 2 },
                  markers: { size: 3 },
                  dataLabels: { enabled: false },
                  xaxis: {
                    categories: NPS_MESES.map((n) => n.mes),
                    labels: { style: { colors: "hsl(var(--muted-foreground))", fontSize: "11px" } },
                    axisBorder: { show: false },
                    axisTicks: { show: false },
                  },
                  yaxis: {
                    min: 60,
                    max: 90,
                    labels: { style: { colors: "hsl(var(--muted-foreground))", fontSize: "11px" } },
                  },
                  grid: { borderColor: "hsl(var(--border))", strokeDashArray: 3, xaxis: { lines: { show: false } } },
                  tooltip: {
                    theme: "light",
                    y: { formatter: (v: number) => String(v), title: { formatter: () => "NPS" } },
                  },
                } as ApexOptions}
                series={[{ name: "NPS", data: NPS_MESES.map((n) => n.nps) }]}
                type="line"
                height={120}
                width="100%"
              />
            </Card>

            {/* Bloco 5: SLA Vagas */}
            <Card className="p-5 rounded-xl border-0" style={{ boxShadow: "0 1px 4px rgba(133,146,173,0.2)" }}>
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
