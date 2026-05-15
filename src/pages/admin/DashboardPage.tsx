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
  TrendingUp,
  Wallet,
} from "lucide-react";

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
// Mock local
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
  prazo: string; // ISO
  status: StatusKey;
  statusLabel: string;
  destaque?: boolean; // ajuste solicitado
}

const ENTREGAVEIS: EntregavelProx[] = [
  { id: "e1", nome: "Workshop de validação", projeto: "Mapeamento de Cargos", empresa: "Kentaki Foods", responsavel: "Ana Beatriz",   prazo: "2026-04-28", status: "aguardando", statusLabel: "Aprovação cliente" },
  { id: "e2", nome: "Política de cargos",    projeto: "Mapeamento de Cargos", empresa: "Kentaki Foods", responsavel: "Camila Torres", prazo: "2026-05-10", status: "analise",    statusLabel: "Aprovação interna" },
  { id: "e3", nome: "Revisão jurídica",      projeto: "Revisão de políticas", empresa: "Tech Plural",   responsavel: "Camila Torres", prazo: "2026-04-22", status: "atrasada",   statusLabel: "Ajuste solicitado", destaque: true },
  { id: "e4", nome: "Treinamento de líderes",projeto: "Mapeamento de Cargos", empresa: "Kentaki Foods", responsavel: "Rafael Moura",  prazo: "2026-05-20", status: "andamento",  statusLabel: "Em andamento" },
  { id: "e5", nome: "Triagem técnica",       projeto: "Hunting Dev Full Stack", empresa: "Tech Plural", responsavel: "Ana Beatriz",   prazo: "2026-05-15", status: "andamento",  statusLabel: "Em andamento" },
  { id: "e6", nome: "Go to Market",          projeto: "Go to Market",         empresa: "Alvo Digital",  responsavel: "Rafael Moura",  prazo: "2026-04-30", status: "aguardando", statusLabel: "Aguardando cliente" },
];

// =====================================================================
// Página
// =====================================================================

import { useAuth } from "@/context/AuthContext";
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

  return (
    <div>
      <PageHeader
        title={`${saudacao}, Ana 👋`}
        subtitle={dataCapitalizada}
      />

      {/* =================== 1. KPIs =================== */}
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
            value={formatBRL(fin.faturado)}
            icon={CircleDollarSign}
            hint={`Meta: ${formatBRL(fin.metaFaturamento)}`}
            trend={{ value: `${pctFaturamento}% da meta`, positive: pctFaturamento >= 80 }}
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

      {/* =================== 2. Atividade + Alertas =================== */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mt-6">
        {/* Atividade recente — 60% */}
        <Card className="lg:col-span-3 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display text-lg font-semibold">Últimas atualizações</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Movimentações recentes da operação
              </p>
            </div>
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
            <ul className="space-y-3">
              {ATIVIDADES.map((a) => {
                const meta = ATIVIDADE_META[a.icon];
                const Icon = meta.Icon;
                return (
                  <li key={a.id} className="flex items-start gap-3">
                    <div
                      className={cn(
                        "h-9 w-9 rounded-lg flex items-center justify-center shrink-0",
                        meta.cls
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1 pt-1">
                      <p className="text-sm leading-snug">{a.texto}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{a.quando}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        {/* Alertas — 40% */}
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
                        <p className="text-xs text-muted-foreground mt-0.5">{al.descricao}</p>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>

      {/* =================== 3. Entregáveis próximos do prazo =================== */}
      <Card className="mt-6 overflow-hidden">
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
                    <TableCell
                      className={cn(
                        "font-data tabular-nums",
                        atrasada && "text-destructive font-semibold"
                      )}
                    >
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

      {/* =================== 4. Resumo financeiro =================== */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-lg font-semibold">Resumo financeiro do mês</h2>
          <Link
            to="/app/financeiro"
            className="text-xs text-primary hover:underline font-medium"
          >
            Ir para Financeiro →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Faturado vs Meta */}
          <Card className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
                  Faturado
                </p>
                <p className="font-data text-2xl font-semibold tabular-nums mt-1">
                  {formatBRL(fin.faturado)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Meta: {formatBRL(fin.metaFaturamento)}
                </p>
              </div>
              <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
            <SlaBar
              percent={pctFaturamento}
              label={`${pctFaturamento.toFixed(1)}% da meta`}
              className="mt-4"
            />
          </Card>

          {/* Recebido / Pendente */}
          <Card className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
                  Recebido
                </p>
                <p className="font-data text-2xl font-semibold tabular-nums mt-1">
                  {formatBRL(fin.recebido)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Pendente: {formatBRL(fin.pendente)}
                </p>
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

          {/* Repasses */}
          <Card className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
                  Repasses pendentes
                </p>
                <p className="font-data text-2xl font-semibold tabular-nums mt-1">
                  {formatBRL(fin.repassesPendentes)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Repassado: {formatBRL(fin.repassado)}
                </p>
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
    </div>
  );
}
