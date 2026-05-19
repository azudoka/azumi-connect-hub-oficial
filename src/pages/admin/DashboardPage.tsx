import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  AlertTriangle,
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
}

const ATIVIDADES: AtividadeRecente[] = [
  { id: "a1", icon: "check", texto: 'Ana Beatriz marcou "Diagnóstico inicial" como aprovado pelo cliente', quando: "há 2h" },
  { id: "a2", icon: "clock", texto: 'Rafael Moura iniciou timer em "Hunting — Dev Full Stack"', quando: "há 3h" },
  { id: "a3", icon: "file",  texto: 'Camila Torres lançou 2h manuais em "Estruturação de RH"', quando: "há 5h" },
  { id: "a4", icon: "alert", texto: "Fatura FAT-2026-0001 venceu sem pagamento (Kentaki Foods)", quando: "há 6h" },
  { id: "a5", icon: "plus",  texto: 'Novo projeto criado: "Implantação de PDP" (Grupo Maverick)', quando: "ontem" },
  { id: "a6", icon: "send",  texto: "Cronograma CRON-2026-0009 enviado para aprovação do cliente (Tech Plural)", quando: "ontem" },
];

const ATIVIDADE_META: Record<AtividadeIcon, { Icon: typeof CheckCircle2; cls: string }> = {
  check: { Icon: CheckCircle2, cls: "bg-success/15 text-success" },
  clock: { Icon: Clock,        cls: "bg-primary/15 text-primary" },
  file:  { Icon: FileText,     cls: "bg-info/15 text-info" },
  alert: { Icon: AlertTriangle, cls: "bg-destructive/15 text-destructive" },
  plus:  { Icon: Plus,         cls: "bg-success/15 text-success" },
  send:  { Icon: Send,         cls: "bg-primary/15 text-primary" },
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
    descricao: "R$ 8.500 · Kentaki Foods",
    to: "/app/financeiro",
  },
  {
    id: "al2",
    severidade: "critical",
    titulo: "Fatura FAT-2026-0005 em atraso",
    descricao: "R$ 7.300 · Tech Plural",
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
    { nome: "Ana B.",    itens: 2, cor: "#E24B4A" },
    { nome: "Camila T.", itens: 3, cor: "#E24B4A" },
    { nome: "Rafael M.", itens: 1, cor: "#EF9F27" },
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
    { name: "Ativos",            value: 2, fill: "#639922" },
    { name: "Sem resposta +5d",  value: 1, fill: "#EF9F27" },
    { name: "SLA crítico",       value: 2, fill: "#E24B4A" },
  ];

  const ENGAJAMENTO_SLA = [
    { nome: "Kentaki Foods", slaH: 4  },
    { nome: "Studio Mira",   slaH: 31 },
  ];

  return (
    <div>
      <PageHeader
        title={`${saudacao}, Ana 👋`}
        subtitle={dataCapitalizada}
      />

      <Tabs defaultValue="visao-geral" className="w-full mt-6">
        <TabsList className="mb-6">
          <TabsTrigger value="visao-geral">Visão geral</TabsTrigger>
          <TabsTrigger value="operacao">Operação</TabsTrigger>
        </TabsList>

        {/* ── ABA VISÃO GERAL ── */}
        <TabsContent value="visao-geral" className="mt-0 space-y-6">

          {/* 1. KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              label="Projetos ativos"
              value="6"
              icon={Briefcase}
              hint="+1 desde semana passada"
              trend={{ value: "+1", positive: true }}
              onClick={() => navigate("/app/projetos")}
            />
            <KpiCard
              label="Horas no mês"
              value="115h"
              icon={Clock}
              hint="vs 98h mês anterior"
              trend={{ value: "+17%", positive: true }}
              onClick={() => navigate("/app/horas")}
            />
            {pode("financeiro.ver_valores") && (
              <KpiCard
                label="Faturamento do mês"
                value={ocultar(formatBRL(fin.faturado))}
                icon={CircleDollarSign}
                hint={`Meta: ${ocultar(formatBRL(fin.metaFaturamento))}`}
                trend={{ value: ocultar(`${pctFaturamento}% da meta`), positive: pctFaturamento >= 80 }}
                onClick={() => navigate("/app/financeiro")}
              />
            )}
            <KpiCard
              label="Entregáveis em atraso"
              value={String(atrasados)}
              icon={AlertTriangle}
              hint={atrasados > 0 ? "Requer atenção imediata" : "Tudo no prazo"}
              className={cn(atrasados > 0 && "ring-1 ring-destructive/40")}
              onClick={() => navigate("/app/projetos")}
            />
          </div>

          {/* 2. Atividade + Alertas */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            {(() => {
              const comunicadoRecente = {
                id: "C-001",
                titulo: "Atualização da política de férias 2026",
                corpo: "Os colaboradores poderão fracionar em até 3 períodos, com mínimo de 5 dias corridos cada. A atualização entra em vigor a partir de junho/2026.",
                coverUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80",
                tipo: "atualizacao" as const,
                autor: "Patricia Lima",
                iniciais: "PL",
                data: "20/04/2026",
                reacoes: { "❤️": 5, "👍": 8, "🎉": 3, "🔥": 1 },
                comentarios: 2,
                leitores: 3,
              };
              const TIPO_COR = { label: "Atualização", hex: "#3B82F6", bg: "#EFF6FF", border: "#BFDBFE" };
              const U: React.CSSProperties = { fontFamily: "'Urbanist',sans-serif" };
              return (
                <div className="lg:col-span-3" style={{ background: "white", border: "1px solid #E4E6EA", borderRadius: 12, overflow: "hidden", boxShadow: "0 2px 8px rgba(3,29,56,.06)" }}>
                  <div style={{ padding: "14px 18px 10px", borderBottom: "1px solid #F0F5FF", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                      <p style={{ fontSize: 16, fontWeight: 700, color: "#0F172A", margin: 0, ...U }}>Comunicados</p>
                      <p style={{ fontSize: 12, color: "#94A3B8", margin: 0, ...U }}>Publicação mais recente</p>
                    </div>
                    <Link to="/app/comunicados" style={{ fontSize: 12, color: "#3B82F6", textDecoration: "none", fontWeight: 600, ...U }}>Ver todos →</Link>
                  </div>
                  <div style={{ display: "flex", gap: 0 }}>
                    <div style={{ flex: "0 0 42%", maxHeight: 260, overflow: "hidden" }}>
                      {comunicadoRecente.coverUrl ? (
                        <img src={comunicadoRecente.coverUrl} alt={comunicadoRecente.titulo}
                          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                      ) : (
                        <div style={{ width: "100%", height: "100%", minHeight: 200, background: "linear-gradient(135deg,#031D38,#3B82F6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <span style={{ fontSize: 48, opacity: 0.25 }}>📢</span>
                        </div>
                      )}
                    </div>
                    <div style={{ flex: 1, padding: "16px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: TIPO_COR.bg, color: TIPO_COR.hex, border: `1px solid ${TIPO_COR.border}`, ...U }}>{TIPO_COR.label}</span>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: "#EFF6FF", color: "#3B82F6", border: "1px solid #BFDBFE", ...U }}>Interno</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ width: 24, height: 24, borderRadius: 6, background: "linear-gradient(135deg,#031D38,#3B82F6)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 9, fontWeight: 700, flexShrink: 0, ...U }}>
                          {comunicadoRecente.iniciais}
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 700, color: "#374151", flex: 1, ...U }}>{comunicadoRecente.autor}</span>
                        <span style={{ fontSize: 11, color: "#94A3B8", ...U }}>{comunicadoRecente.data}</span>
                      </div>
                      <p style={{ fontSize: 15, fontWeight: 800, color: "#0F172A", margin: 0, lineHeight: 1.3, ...U }}>{comunicadoRecente.titulo}</p>
                      <p style={{ fontSize: 13, color: "#64748B", margin: 0, lineHeight: 1.55, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" as never, overflow: "hidden", ...U }}>{comunicadoRecente.corpo}</p>
                      <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: "auto", paddingTop: 8, borderTop: "1px solid #F0F5FF" }}>
                        {Object.entries(comunicadoRecente.reacoes).map(([emoji, count]) => (
                          <span key={emoji} style={{ display: "flex", alignItems: "center", gap: 3, padding: "2px 8px", borderRadius: 20, border: "1px solid #E4E6EA", background: "white", fontSize: 12, color: "#64748B", ...U }}>
                            <span style={{ fontSize: 13 }}>{emoji}</span>{count}
                          </span>
                        ))}
                        <span style={{ display: "flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: 20, border: "1px solid #E4E6EA", background: "white", fontSize: 12, color: "#94A3B8", marginLeft: "auto", ...U }}>
                          💬 {comunicadoRecente.comentarios} · 👁 {comunicadoRecente.leitores}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            <Card className="lg:col-span-2 p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h2 className="font-display text-lg font-semibold">Alertas ativos</h2>
                  <span className="badge-pill bg-destructive/15 text-destructive border border-destructive/30 text-xs">
                    {ALERTAS.length}
                  </span>
                </div>
              </div>
              {ALERTAS.length === 0 ? (
                <EmptyState
                  icon={CheckCircle2}
                  title="Nenhum alerta"
                  description="Tudo certo por aqui!"
                />
              ) : (
                <ul className="space-y-3">
                  {ALERTAS.map((al) => {
                    const isCritical = al.severidade === "critical";
                    return (
                      <li key={al.id}>
                        <Link
                          to={al.to}
                          className={cn(
                            "flex items-start gap-2 rounded-lg border p-3 transition-colors hover:brightness-95",
                            isCritical
                              ? "border-destructive/30 bg-destructive/5"
                              : "border-warning/30 bg-warning/5"
                          )}
                        >
                          <AlertTriangle
                            className={cn(
                              "h-4 w-4 shrink-0 mt-0.5",
                              isCritical ? "text-destructive" : "text-warning"
                            )}
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium leading-snug">{al.titulo}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{al.descricao.match(/R\$/) ? ocultar(al.descricao) : al.descricao}</p>
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Card>
          </div>

          {/* 3. Entregáveis próximos do prazo */}
          <Card className="overflow-hidden">
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Entregável</TableHead>
                    <TableHead>Projeto</TableHead>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Responsável</TableHead>
                    <TableHead>Prazo</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ENTREGAVEIS.map((e) => {
                    const atrasada = e.prazo < hojeISO;
                    return (
                      <TableRow
                        key={e.id}
                        className={cn(e.destaque && "bg-warning/10 hover:bg-warning/15")}
                      >
                        <TableCell className="font-medium">{e.nome}</TableCell>
                        <TableCell className="text-muted-foreground">{e.projeto}</TableCell>
                        <TableCell>{e.empresa}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-md bg-gradient-brand flex items-center justify-center text-[9px] font-semibold text-white shrink-0">
                              {e.responsavel.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                            </div>
                            <span className="text-sm">{e.responsavel}</span>
                          </div>
                        </TableCell>
                        <TableCell className={cn("font-data tabular-nums", atrasada && "text-destructive font-semibold")}>
                          {formatDateBR(e.prazo)}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={e.status}>{e.statusLabel}</StatusBadge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium">Faturado</p>
                    <p className="font-data text-2xl font-semibold tabular-nums mt-1">{ocultar(formatBRL(fin.faturado))}</p>
                    <p className="text-xs text-muted-foreground mt-1">Meta: {ocultar(formatBRL(fin.metaFaturamento))}</p>
                  </div>
                  <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                </div>
                <SlaBar percent={pctFaturamento} label={ocultar(`${pctFaturamento.toFixed(1)}% da meta`)} className="mt-4" />
              </Card>

              <Card className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium">Recebido</p>
                    <p className="font-data text-2xl font-semibold tabular-nums mt-1">{ocultar(formatBRL(fin.recebido))}</p>
                    <p className="text-xs text-muted-foreground mt-1">Pendente: {ocultar(formatBRL(fin.pendente))}</p>
                  </div>
                  <div className="h-9 w-9 rounded-lg bg-success/15 text-success flex items-center justify-center">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-4 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Taxa de recebimento</span>
                    <span className="font-data tabular-nums">{pctRecebido.toFixed(1)}%</span>
                  </div>
                  <Progress value={pctRecebido} className="h-1.5" />
                </div>
              </Card>

              <Card className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium">Repasses pendentes</p>
                    <p className="font-data text-2xl font-semibold tabular-nums mt-1">{ocultar(formatBRL(fin.repassesPendentes))}</p>
                    <p className="text-xs text-muted-foreground mt-1">Repassado: {ocultar(formatBRL(fin.repassado))}</p>
                  </div>
                  <div className="h-9 w-9 rounded-lg bg-info/15 text-info flex items-center justify-center">
                    <Wallet className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-4 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">% já repassado</span>
                    <span className="font-data tabular-nums">{pctRepassado.toFixed(1)}%</span>
                  </div>
                  <Progress value={pctRepassado} className="h-1.5" />
                </div>
              </Card>
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
                <span className="badge-pill bg-destructive/15 text-destructive border border-destructive/30 text-xs">
                  6 entregáveis
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div>
                  <div className="font-data text-2xl font-semibold">6</div>
                  <div className="text-xs text-muted-foreground">em atraso agora</div>
                </div>
                <div>
                  <div className="font-data text-2xl font-semibold text-warning">22</div>
                  <div className="text-xs text-muted-foreground">dias — maior atraso</div>
                </div>
                <div>
                  <div className="font-data text-2xl font-semibold">8.5</div>
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
                <span className="badge-pill bg-warning/15 text-warning border border-warning/30 text-xs">
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
                        background: c.slaH < 12 ? "#E24B4A" : "#EF9F27",
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
                  { label: "Ana B.",    cor: "#3B82F6" },
                  { label: "Camila T.", cor: "#8B5CF6" },
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
                <Bar dataKey="ana"    fill="#3B82F6" radius={[3, 3, 0, 0]} />
                <Bar dataKey="camila" fill="#8B5CF6" radius={[3, 3, 0, 0]} />
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
                <span className="badge-pill bg-primary/15 text-primary border border-primary/30 text-xs">
                  +3 vs mês ant.
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="font-data text-3xl font-semibold text-primary">81</div>
                  <div className="text-xs text-muted-foreground">NPS médio mai/26</div>
                  <div className="text-xs text-success mt-1">↑ tendência positiva</div>
                </div>
                <div>
                  <div className="font-data text-3xl font-semibold">4.3</div>
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
                    stroke="#3B82F6"
                    strokeWidth={2}
                    dot={{ r: 3, fill: "#3B82F6" }}
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
                <span className="badge-pill bg-destructive/15 text-destructive border border-destructive/30 text-xs">
                  2 estouradas
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div>
                  <div className="font-data text-2xl font-semibold">5</div>
                  <div className="text-xs text-muted-foreground">vagas ativas</div>
                </div>
                <div>
                  <div className="font-data text-2xl font-semibold text-warning">26</div>
                  <div className="text-xs text-muted-foreground">dias médio</div>
                </div>
                <div>
                  <div className="font-data text-2xl font-semibold text-destructive">2</div>
                  <div className="text-xs text-muted-foreground">SLA estourado</div>
                </div>
              </div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-3">
                % do SLA consumido (meta: 30 dias)
              </p>
              <div className="space-y-2.5">
                {VAGAS_SLA.map((v, i) => {
                  const cor      = v.pct > 100 ? "#E24B4A" : v.pct > 60 ? "#EF9F27" : "#639922";
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
                      <span className="text-xs font-medium w-8 text-right shrink-0 font-data" style={{ color: textCor }}>
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
