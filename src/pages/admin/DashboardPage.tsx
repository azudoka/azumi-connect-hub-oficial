import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  FileText,
  Loader2,
  Plus,
  Send,
  Star,
  Target,
  TrendingUp,
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";

import { ConnectStatCard } from "@/components/ConnectStatCard";
import { usePermissao } from "@/config/permissoes";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";

import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
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
  autor?: string;
  to: string;
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
  { id: "al1", severidade: "critical", titulo: "Fatura FAT-2026-0001 em atraso", descricao: "Kentaki Foods", to: "/app/financeiro" },
  { id: "al2", severidade: "critical", titulo: "Fatura FAT-2026-0005 em atraso", descricao: "Tech Plural", to: "/app/financeiro" },
  { id: "al3", severidade: "warning", titulo: 'Entregável "Workshop de validação" aguarda parecer do cliente', descricao: "Há 68h · SLA 72h", to: "/app/projetos/p3" },
  { id: "al4", severidade: "warning", titulo: 'Entregável "Revisão jurídica" com ajuste solicitado', descricao: "Prazo: 22/04/2026", to: "/app/projetos/p3" },
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

  useEffect(() => {
    document.title = "CONNECT - Azumi RH";
    return () => { document.title = "Azumi Connect — HR as a Service"; };
  }, []);

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
  const slaVagasDentro = VAGAS_SLA.filter((v) => v.pct <= 100).length;
  const slaVagasPct = Math.round((slaVagasDentro / VAGAS_SLA.length) * 100);

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
      {/* Banner de saudação */}
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

          {/* KPIs */}
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

          {/* Linha 1 — RevenueForecast (8/12) + SLA + Sparkline (4/12) */}
          <div className="grid grid-cols-12 gap-6">

            {/* RevenueForecast */}
            <div className="lg:col-span-8 col-span-12">
              <Card className="rounded-2xl shadow-md border-0 p-6 h-full">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="font-display text-base font-semibold">Faturamento mensal</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">Faturas emitidas por mês</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {fatMeses && fatMeses.some((m) => m.valor > 0) && (
                      <span className="text-sm font-semibold text-foreground tabular-nums">
                        {ocultar(formatBRL(fatMeses.reduce((s, m) => s + m.valor, 0)))}
                      </span>
                    )}
                    <Select defaultValue="6m">
                      <SelectTrigger className="w-[140px] h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="6m">Últimos 6 meses</SelectItem>
                        <SelectItem value="3m">Últimos 3 meses</SelectItem>
                        <SelectItem value="1a">Último ano</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {fatMeses === null ? (
                  <div className="h-56 flex items-center justify-center">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ) : fatMeses.every((m) => m.valor === 0) ? (
                  <div className="h-56 flex flex-col items-center justify-center text-center gap-2">
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
                    height={224}
                    width="100%"
                  />
                )}
              </Card>
            </div>

            {/* Coluna direita — SLA + Sparkline */}
            <div className="lg:col-span-4 col-span-12 flex flex-col gap-6">

              {/* SLA das vagas ativas (NewCustomers) */}
              <Card className="rounded-2xl shadow-md border-0 p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="bg-[hsl(var(--primary)/0.1)] p-3 rounded-xl shrink-0">
                    <iconify-icon icon="solar:target-bold-duotone" width="22" height="22" style={{ color: "hsl(var(--primary))" }} />
                  </div>
                  <p className="text-base font-semibold leading-tight">SLA das vagas ativas</p>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground">Vagas dentro do prazo</p>
                  <p className="text-sm font-semibold">{slaVagasPct}%</p>
                </div>
                <Progress value={slaVagasPct} className="h-2" />
                <p className="text-xs text-muted-foreground mt-2.5">
                  {slaVagasDentro} de {VAGAS_SLA.length} vagas no prazo · {VAGAS_SLA.length - slaVagasDentro} estourada{VAGAS_SLA.length - slaVagasDentro !== 1 ? "s" : ""}
                </p>
              </Card>

              {/* Faturamento sparkline (TotalIncome) */}
              <Card className="rounded-2xl shadow-md border-0 p-6 flex-1">
                <div className="flex items-start justify-between mb-1">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Faturamento total</p>
                    <p className="font-display text-2xl font-bold mt-1 tabular-nums">
                      {fatMeses && fatMeses.some((m) => m.valor > 0)
                        ? ocultar(formatBRL(fatMeses.reduce((s, m) => s + m.valor, 0)))
                        : "—"
                      }
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">Últimos 6 meses</p>
                  </div>
                  <span className={cn(
                    "text-xs font-semibold px-2.5 py-0.5 rounded-full shrink-0 mt-0.5",
                    pctFaturamento >= 80
                      ? "text-success bg-[hsl(var(--success)/0.12)]"
                      : "text-warning bg-[hsl(var(--warning)/0.12)]"
                  )}>
                    {pctFaturamento}% meta
                  </span>
                </div>
                {fatMeses === null ? (
                  <div className="h-16 flex items-center justify-center mt-3">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground/50" />
                  </div>
                ) : fatMeses.some((m) => m.valor > 0) ? (
                  <div className="mt-3 -mx-6 -mb-6">
                    <Chart
                      options={{
                        chart: { type: "area", toolbar: { show: false }, sparkline: { enabled: true } },
                        colors: ["hsl(var(--primary))"],
                        fill: { type: "gradient", gradient: { opacityFrom: 0.28, opacityTo: 0.02 } },
                        stroke: { curve: "smooth", width: 2 },
                        tooltip: {
                          theme: "light",
                          y: { formatter: (v: number) => ocultar(formatBRL(v)) },
                        },
                      } as ApexOptions}
                      series={[{ name: "Faturamento", data: fatMeses.map((f) => f.valor) }]}
                      type="area"
                      height={72}
                      width="100%"
                    />
                  </div>
                ) : (
                  <div className="h-16 flex items-center mt-3">
                    <p className="text-xs text-muted-foreground/60">Sem histórico ainda</p>
                  </div>
                )}
              </Card>
            </div>
          </div>

          {/* Linha 2 — Vagas em destaque (8/12) + Timeline (4/12) */}
          <div className="grid grid-cols-12 gap-6">

            {/* Vagas em destaque (ProductRevenue) */}
            <div className="lg:col-span-8 col-span-12">
              <Card className="overflow-hidden rounded-2xl shadow-md border-0 h-full">
                <div className="p-5 border-b border-border flex items-center justify-between">
                  <div>
                    <h2 className="font-display text-base font-semibold">Vagas em destaque</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">Vagas ativas · por urgência de SLA (meta 30 dias)</p>
                  </div>
                  <Link to="/app/atracao" className="text-xs text-primary hover:underline font-medium shrink-0">
                    Ver todas →
                  </Link>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[420px]">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">Vaga</th>
                        <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">Empresa</th>
                        <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">SLA</th>
                        <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {VAGAS_SLA.map((v, i) => {
                        const cor       = v.pct > 100 ? "hsl(var(--destructive))" : v.pct > 60 ? "hsl(var(--warning))" : "hsl(var(--success))";
                        const textCor   = v.pct > 100 ? "#A32D2D" : v.pct > 60 ? "#854F0B" : "#3B6D11";
                        const status    = (v.pct > 100 ? "atrasada" : v.pct > 60 ? "analise" : "andamento") as StatusKey;
                        const statusLbl = v.pct > 100 ? "SLA estourado" : v.pct > 60 ? "Atenção" : "No prazo";
                        return (
                          <tr
                            key={i}
                            onClick={() => navigate("/app/atracao")}
                            className="border-b border-border last:border-0 hover:bg-muted/40 cursor-pointer transition-colors"
                          >
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-lg bg-[hsl(var(--primary)/0.1)] flex items-center justify-center shrink-0">
                                  <iconify-icon icon="solar:case-round-bold-duotone" width="15" height="15" style={{ color: "hsl(var(--primary))" }} />
                                </div>
                                <span className="text-sm font-medium">{v.vaga}</span>
                              </div>
                            </td>
                            <td className="px-5 py-3.5 text-sm text-muted-foreground">{v.empresa}</td>
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden min-w-[64px]">
                                  <div
                                    className="h-full rounded-full transition-all"
                                    style={{ width: `${Math.min(100, v.pct)}%`, background: cor }}
                                  />
                                </div>
                                <span className="text-xs font-medium tabular-nums w-7 text-right shrink-0" style={{ color: textCor }}>
                                  {v.dias}d
                                </span>
                              </div>
                            </td>
                            <td className="px-5 py-3.5">
                              <StatusBadge status={status}>{statusLbl}</StatusBadge>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>

            {/* Timeline de atividade (DailyActivity) */}
            <div className="lg:col-span-4 col-span-12">
              <Card className="p-6 rounded-2xl shadow-md border-0 h-full">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-5">
                  Últimas atualizações
                </h2>
                {ATIVIDADES.length === 0 ? (
                  <EmptyState
                    icon={Clock}
                    title="Sem atividades recentes"
                    description="As últimas atualizações da operação aparecerão aqui."
                  />
                ) : (
                  <div className="relative pl-5 border-l border-border space-y-5">
                    {ATIVIDADES.map((a) => {
                      const meta = ATIVIDADE_META[a.icon];
                      return (
                        <div key={a.id} className="relative">
                          <span className={cn("absolute -left-[21px] h-3 w-3 rounded-full border-2 border-card", meta.dot)} />
                          <p className="text-xs text-muted-foreground tabular-nums">{a.quando}</p>
                          <p className="text-sm leading-snug mt-0.5">{a.texto}</p>
                          {a.ref && (
                            <button
                              onClick={() => navigate(a.to)}
                              className="text-xs text-primary hover:underline font-medium mt-0.5"
                            >
                              {a.ref}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            </div>
          </div>

          {/* Alertas ativos */}
          <Card className="p-6 rounded-2xl shadow-md border-0">
            <div className="flex items-center gap-2 mb-4">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ALERTAS.map((al) => {
                  const isCritical = al.severidade === "critical";
                  return (
                    <Link
                      key={al.id}
                      to={al.to}
                      className="group flex items-center gap-3 p-3 rounded-xl hover:bg-muted/30 border border-border transition-colors"
                    >
                      <div className={cn(
                        "shrink-0 h-8 w-8 rounded-lg flex items-center justify-center",
                        isCritical ? "bg-[hsl(var(--destructive)/0.12)]" : "bg-[hsl(var(--warning)/0.12)]"
                      )}>
                        <AlertTriangle className={cn("h-4 w-4", isCritical ? "text-destructive" : "text-warning")} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium leading-snug truncate">{al.titulo}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{al.descricao}</p>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                    </Link>
                  );
                })}
              </div>
            )}
          </Card>

        </TabsContent>

        {/* ── ABA OPERAÇÃO ── */}
        <TabsContent value="operacao" className="mt-0 space-y-4">

          {/* LINHA 1: Atrasos + Engajamento */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

            {/* Bloco 1: Tarefas em atraso */}
            <Card className="p-5 rounded-2xl shadow-md border-0">
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
            <Card className="p-5 rounded-2xl shadow-md border-0">
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

          {/* LINHA 2: Produtividade */}
          <Card className="p-5 rounded-2xl shadow-md border-0">
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
            <Card className="p-5 rounded-2xl shadow-md border-0">
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
            <Card className="p-5 rounded-2xl shadow-md border-0">
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
