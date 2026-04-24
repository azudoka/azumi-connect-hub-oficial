import { useMemo, useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  CalendarIcon,
  CircleDollarSign,
  Download,
  FileText,
  MoreHorizontal,
  Plus,
  TrendingUp,
  Wallet,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Receipt,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/PageHeader";
import { KpiCard } from "@/components/KpiCard";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { empresas, consultores } from "@/data/mock";
import type { StatusKey } from "@/data/mock";

// =====================================================================
// Tipos
// =====================================================================

type FaturaStatus = "aguardando" | "pago" | "atrasado" | "cancelado";

interface Fatura {
  id: string;
  numero: string;
  empresa: string;
  empresaId: string;
  referencia: string;
  valor: number;
  vencimento: string; // ISO yyyy-mm-dd
  status: FaturaStatus;
  consultor: string;
}

type RepasseStatus = "pendente" | "pago" | "analise";

interface Repasse {
  id: string;
  periodo: string;
  consultor: string;
  horas: number;
  taxa: number;
  bruto: number;
  desconto: number; // %
  liquido: number;
  status: RepasseStatus;
}

// =====================================================================
// Mock inicial
// =====================================================================

const FATURAS_INICIAIS: Fatura[] = [
  {
    id: "f1",
    numero: "FAT-2026-0001",
    empresa: "Kentaki Foods",
    empresaId: "kentaki",
    referencia: "Mapeamento de Cargos",
    valor: 8500,
    vencimento: "2026-04-15",
    status: "atrasado",
    consultor: "Ana Beatriz",
  },
  {
    id: "f2",
    numero: "FAT-2026-0002",
    empresa: "Studio Mira",
    empresaId: "mira",
    referencia: "Estruturação de RH",
    valor: 6200,
    vencimento: "2026-04-30",
    status: "aguardando",
    consultor: "Camila Torres",
  },
  {
    id: "f3",
    numero: "FAT-2026-0003",
    empresa: "Grupo Maverick",
    empresaId: "maverick",
    referencia: "Hunting Analista MKT",
    valor: 4800,
    vencimento: "2026-03-31",
    status: "pago",
    consultor: "Rafael Moura",
  },
  {
    id: "f4",
    numero: "FAT-2026-0004",
    empresa: "Alvo Digital",
    empresaId: "alvo",
    referencia: "Go to Market",
    valor: 12000,
    vencimento: "2026-05-10",
    status: "aguardando",
    consultor: "Rafael Moura",
  },
  {
    id: "f5",
    numero: "FAT-2026-0005",
    empresa: "Tech Plural",
    empresaId: "techplural",
    referencia: "Hunting Dev Full Stack",
    valor: 7300,
    vencimento: "2026-04-20",
    status: "atrasado",
    consultor: "Ana Beatriz",
  },
  {
    id: "f6",
    numero: "FAT-2026-0006",
    empresa: "Kentaki Foods",
    empresaId: "kentaki",
    referencia: "Hunting Gerente TI",
    valor: 5600,
    vencimento: "2026-02-28",
    status: "pago",
    consultor: "Ana Beatriz",
  },
];

const REPASSES_INICIAIS: Repasse[] = [
  { id: "r1", consultor: "Ana Beatriz",   periodo: "Abr/2026", horas: 42, taxa: 85, bruto: 3570, desconto: 5, liquido: 3391, status: "pendente" },
  { id: "r2", consultor: "Camila Torres", periodo: "Abr/2026", horas: 38, taxa: 80, bruto: 3040, desconto: 5, liquido: 2888, status: "pendente" },
  { id: "r3", consultor: "Rafael Moura",  periodo: "Abr/2026", horas: 35, taxa: 80, bruto: 2800, desconto: 5, liquido: 2660, status: "analise" },
  { id: "r4", consultor: "Ana Beatriz",   periodo: "Mar/2026", horas: 45, taxa: 85, bruto: 3825, desconto: 5, liquido: 3633, status: "pago" },
  { id: "r5", consultor: "Camila Torres", periodo: "Mar/2026", horas: 40, taxa: 80, bruto: 3200, desconto: 5, liquido: 3040, status: "pago" },
];

// =====================================================================
// Helpers
// =====================================================================

const formatBRL = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const parseISO = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
};

const formatDateBR = (iso: string) =>
  format(parseISO(iso), "dd/MM/yyyy", { locale: ptBR });

const isAtrasado = (iso: string) =>
  parseISO(iso).getTime() < new Date(new Date().toDateString()).getTime();

// Mapa fatura → StatusKey usado pelo <StatusBadge />
const faturaStatusMap: Record<FaturaStatus, { key: StatusKey; label: string }> = {
  aguardando: { key: "aguardando", label: "Aguardando pagamento" },
  pago:       { key: "concluida",  label: "Pago" },
  atrasado:   { key: "atrasada",   label: "Atrasado" },
  cancelado:  { key: "cancelada",  label: "Cancelado" },
};

const repasseStatusMap: Record<RepasseStatus, { key: StatusKey; label: string }> = {
  pendente: { key: "aguardando", label: "Pendente" },
  pago:     { key: "concluida",  label: "Pago" },
  analise:  { key: "analise",    label: "Em análise" },
};

// =====================================================================
// Componente principal
// =====================================================================

export default function FinanceiroPage() {
  const [tab, setTab] = useState("faturas");

  // ---- Faturas state ----
  const [faturas, setFaturas] = useState<Fatura[]>(FATURAS_INICIAIS);
  const [filtroEmpresa, setFiltroEmpresa] = useState<string>("todas");
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");
  const [filtroConsultor, setFiltroConsultor] = useState<string>("todos");
  const [periodoIni, setPeriodoIni] = useState<Date | undefined>();
  const [periodoFim, setPeriodoFim] = useState<Date | undefined>();

  // dialogs
  const [novaFaturaOpen, setNovaFaturaOpen] = useState(false);
  const [cancelarFaturaId, setCancelarFaturaId] = useState<string | null>(null);
  const [justificativaCancel, setJustificativaCancel] = useState("");

  const faturasFiltradas = useMemo(() => {
    return faturas.filter((f) => {
      if (filtroEmpresa !== "todas" && f.empresaId !== filtroEmpresa) return false;
      if (filtroStatus !== "todos" && f.status !== filtroStatus) return false;
      if (filtroConsultor !== "todos" && f.consultor !== filtroConsultor) return false;
      if (periodoIni && parseISO(f.vencimento) < periodoIni) return false;
      if (periodoFim && parseISO(f.vencimento) > periodoFim) return false;
      return true;
    });
  }, [faturas, filtroEmpresa, filtroStatus, filtroConsultor, periodoIni, periodoFim]);

  const kpisFaturas = useMemo(() => {
    const base = faturasFiltradas.filter((f) => f.status !== "cancelado");
    const total = base.reduce((acc, f) => acc + f.valor, 0);
    const aReceber = base
      .filter((f) => f.status === "aguardando" || f.status === "atrasado")
      .reduce((acc, f) => acc + f.valor, 0);
    const recebido = base
      .filter((f) => f.status === "pago")
      .reduce((acc, f) => acc + f.valor, 0);
    const atraso = base
      .filter((f) => f.status === "atrasado")
      .reduce((acc, f) => acc + f.valor, 0);
    return { total, aReceber, recebido, atraso };
  }, [faturasFiltradas]);

  // ---- Repasses state ----
  const [repasses, setRepasses] = useState<Repasse[]>(REPASSES_INICIAIS);
  const [novoRepasseOpen, setNovoRepasseOpen] = useState(false);

  const kpisRepasses = useMemo(() => {
    const totalARepassar = repasses
      .filter((r) => r.status !== "pago")
      .reduce((acc, r) => acc + r.liquido, 0);
    const repassado = repasses
      .filter((r) => r.status === "pago")
      .reduce((acc, r) => acc + r.liquido, 0);
    const pendente = repasses
      .filter((r) => r.status === "pendente")
      .reduce((acc, r) => acc + r.liquido, 0);
    return { totalARepassar, repassado, pendente };
  }, [repasses]);

  // ---- Resumo state ----
  const [resumoMes, setResumoMes] = useState<Date>(new Date(2026, 3, 1));

  const resumoData = useMemo(() => {
    const bruto = faturas
      .filter((f) => f.status !== "cancelado")
      .reduce((acc, f) => acc + f.valor, 0);
    const totalRepasses = repasses.reduce((acc, r) => acc + r.liquido, 0);
    const liquido = bruto - totalRepasses;

    // breakdown por empresa
    const porEmpresa = new Map<string, { empresa: string; faturamento: number; repasse: number }>();
    faturas
      .filter((f) => f.status !== "cancelado")
      .forEach((f) => {
        const cur = porEmpresa.get(f.empresa) ?? { empresa: f.empresa, faturamento: 0, repasse: 0 };
        cur.faturamento += f.valor;
        porEmpresa.set(f.empresa, cur);
      });
    // repasses são por consultor — distribuímos proporcionalmente ao faturamento
    const totalFat = Array.from(porEmpresa.values()).reduce((a, b) => a + b.faturamento, 0) || 1;
    porEmpresa.forEach((v) => {
      v.repasse = (v.faturamento / totalFat) * totalRepasses;
    });

    return {
      bruto,
      totalRepasses,
      liquido,
      projetosAtivos: 4,
      breakdown: Array.from(porEmpresa.values()),
    };
  }, [faturas, repasses]);

  // =====================================================================
  // Ações
  // =====================================================================

  const marcarFaturaPaga = (id: string) => {
    setFaturas((prev) =>
      prev.map((f) => (f.id === id ? { ...f, status: "pago" } : f))
    );
    toast.success("Fatura marcada como paga.");
  };

  const confirmarCancelamento = () => {
    if (!cancelarFaturaId) return;
    if (!justificativaCancel.trim()) {
      toast.error("Justificativa é obrigatória para cancelar.");
      return;
    }
    setFaturas((prev) =>
      prev.map((f) => (f.id === cancelarFaturaId ? { ...f, status: "cancelado" } : f))
    );
    toast.success("Fatura cancelada.");
    setCancelarFaturaId(null);
    setJustificativaCancel("");
  };

  const marcarRepassePago = (id: string) => {
    setRepasses((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "pago" } : r))
    );
    toast.success("Repasse marcado como pago.");
  };

  // =====================================================================
  // Render
  // =====================================================================

  return (
    <div>
      <PageHeader
        title="Financeiro"
        subtitle="Faturas, repasses e resultado consolidado do período"
        actions={
          <>
            <Button variant="outline" onClick={() => setNovoRepasseOpen(true)}>
              <Plus className="h-4 w-4 mr-1" /> Novo repasse
            </Button>
            <Button onClick={() => setNovaFaturaOpen(true)}>
              <Plus className="h-4 w-4 mr-1" /> Nova fatura
            </Button>
          </>
        }
      />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="faturas">Faturas</TabsTrigger>
          <TabsTrigger value="repasses">Repasses</TabsTrigger>
          <TabsTrigger value="resumo">Resumo do período</TabsTrigger>
        </TabsList>

        {/* =================== FATURAS =================== */}
        <TabsContent value="faturas" className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard label="Total faturado" value={formatBRL(kpisFaturas.total)} icon={CircleDollarSign} />
            <KpiCard label="A receber" value={formatBRL(kpisFaturas.aReceber)} icon={Clock} />
            <KpiCard label="Recebido" value={formatBRL(kpisFaturas.recebido)} icon={CheckCircle2} />
            <KpiCard label="Em atraso" value={formatBRL(kpisFaturas.atraso)} icon={AlertTriangle} />
          </div>

          {/* Filtros */}
          <Card className="p-4">
            <div className="flex flex-wrap items-center gap-3">
              <Select value={filtroEmpresa} onValueChange={setFiltroEmpresa}>
                <SelectTrigger className="w-[180px]"><SelectValue placeholder="Empresa" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas as empresas</SelectItem>
                  {empresas.map((e) => (
                    <SelectItem key={e.id} value={e.id}>{e.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                <SelectTrigger className="w-[180px]"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os status</SelectItem>
                  <SelectItem value="aguardando">Aguardando pagamento</SelectItem>
                  <SelectItem value="pago">Pago</SelectItem>
                  <SelectItem value="atrasado">Atrasado</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filtroConsultor} onValueChange={setFiltroConsultor}>
                <SelectTrigger className="w-[180px]"><SelectValue placeholder="Consultor" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os consultores</SelectItem>
                  {consultores.map((c) => (
                    <SelectItem key={c.id} value={c.nome}>{c.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("justify-start text-left font-normal", !periodoIni && "text-muted-foreground")}>
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    {periodoIni ? format(periodoIni, "dd/MM/yyyy") : "Período: início"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={periodoIni} onSelect={setPeriodoIni} initialFocus className={cn("p-3 pointer-events-auto")} />
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("justify-start text-left font-normal", !periodoFim && "text-muted-foreground")}>
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    {periodoFim ? format(periodoFim, "dd/MM/yyyy") : "Período: fim"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={periodoFim} onSelect={setPeriodoFim} initialFocus className={cn("p-3 pointer-events-auto")} />
                </PopoverContent>
              </Popover>

              {(periodoIni || periodoFim || filtroEmpresa !== "todas" || filtroStatus !== "todos" || filtroConsultor !== "todos") && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFiltroEmpresa("todas");
                    setFiltroStatus("todos");
                    setFiltroConsultor("todos");
                    setPeriodoIni(undefined);
                    setPeriodoFim(undefined);
                  }}
                >
                  Limpar filtros
                </Button>
              )}

              <div className="ml-auto">
                <Button variant="outline" size="sm" onClick={() => toast.info("Exportação disponível na versão completa")}>
                  <Download className="h-4 w-4 mr-1" /> Exportar
                </Button>
              </div>
            </div>
          </Card>

          {/* Tabela */}
          <Card className="overflow-hidden">
            {faturasFiltradas.length === 0 ? (
              <EmptyState
                icon={Receipt}
                title="Nenhuma fatura encontrada"
                description="Ajuste os filtros ou crie uma nova fatura."
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nº Fatura</TableHead>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Projeto / Referência</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Consultor</TableHead>
                    <TableHead className="w-[60px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {faturasFiltradas.map((f) => {
                    const atrasada = f.status === "atrasado" || (f.status === "aguardando" && isAtrasado(f.vencimento));
                    const bloqueada = f.status === "pago" || f.status === "cancelado";
                    const meta = faturaStatusMap[f.status];
                    return (
                      <TableRow key={f.id}>
                        <TableCell className="font-data text-xs">{f.numero}</TableCell>
                        <TableCell className="font-medium">{f.empresa}</TableCell>
                        <TableCell className="text-muted-foreground">{f.referencia}</TableCell>
                        <TableCell className="text-right font-data tabular-nums">{formatBRL(f.valor)}</TableCell>
                        <TableCell className={cn(atrasada && "text-destructive font-medium")}>
                          {formatDateBR(f.vencimento)}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={meta.key}>{meta.label}</StatusBadge>
                        </TableCell>
                        <TableCell className="text-sm">{f.consultor}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                disabled={bloqueada}
                                onClick={() => marcarFaturaPaga(f.id)}
                              >
                                <CheckCircle2 className="h-4 w-4 mr-2" /> Marcar como pago
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                disabled={bloqueada}
                                onClick={() => toast.info("Geração de recibo disponível em breve")}
                              >
                                <FileText className="h-4 w-4 mr-2" /> Gerar recibo
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                disabled={bloqueada}
                                className="text-destructive focus:text-destructive"
                                onClick={() => setCancelarFaturaId(f.id)}
                              >
                                Cancelar fatura
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </Card>
        </TabsContent>

        {/* =================== REPASSES =================== */}
        <TabsContent value="repasses" className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <KpiCard label="Total a repassar" value={formatBRL(kpisRepasses.totalARepassar)} icon={Wallet} />
            <KpiCard label="Repassado" value={formatBRL(kpisRepasses.repassado)} icon={CheckCircle2} />
            <KpiCard label="Pendente" value={formatBRL(kpisRepasses.pendente)} icon={Clock} />
          </div>

          <Card className="overflow-hidden">
            {repasses.length === 0 ? (
              <EmptyState
                icon={Wallet}
                title="Nenhum repasse cadastrado"
                description="Cadastre o primeiro repasse para acompanhar a remuneração dos consultores."
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Período</TableHead>
                    <TableHead>Consultor</TableHead>
                    <TableHead className="text-right">Horas</TableHead>
                    <TableHead className="text-right">Taxa/hora</TableHead>
                    <TableHead className="text-right">Bruto</TableHead>
                    <TableHead className="text-right">Desc.</TableHead>
                    <TableHead className="text-right">Líquido</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[60px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {repasses.map((r) => {
                    const meta = repasseStatusMap[r.status];
                    const bloqueado = r.status === "pago";
                    return (
                      <TableRow key={r.id}>
                        <TableCell className="text-sm">{r.periodo}</TableCell>
                        <TableCell className="font-medium">{r.consultor}</TableCell>
                        <TableCell className="text-right font-data tabular-nums">{r.horas}h</TableCell>
                        <TableCell className="text-right font-data tabular-nums">{formatBRL(r.taxa)}</TableCell>
                        <TableCell className="text-right font-data tabular-nums">{formatBRL(r.bruto)}</TableCell>
                        <TableCell className="text-right text-muted-foreground">{r.desconto}%</TableCell>
                        <TableCell className="text-right font-data font-semibold tabular-nums">{formatBRL(r.liquido)}</TableCell>
                        <TableCell>
                          <StatusBadge status={meta.key}>{meta.label}</StatusBadge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem disabled={bloqueado} onClick={() => marcarRepassePago(r.id)}>
                                <CheckCircle2 className="h-4 w-4 mr-2" /> Marcar como pago
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => toast.info("Detalhes em breve")}>
                                Ver detalhes
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </Card>
        </TabsContent>

        {/* =================== RESUMO =================== */}
        <TabsContent value="resumo" className="space-y-5">
          <div className="flex items-center gap-3">
            <Label className="text-sm text-muted-foreground">Mês de referência:</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="font-normal">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  {format(resumoMes, "MMMM 'de' yyyy", { locale: ptBR })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={resumoMes}
                  onSelect={(d) => d && setResumoMes(d)}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <KpiCard label="Faturamento bruto" value={formatBRL(resumoData.bruto)} icon={TrendingUp} />
            <KpiCard label="Total de repasses" value={formatBRL(resumoData.totalRepasses)} icon={Wallet} />
            <KpiCard
              label="Resultado líquido"
              value={formatBRL(resumoData.liquido)}
              icon={CircleDollarSign}
              trend={{ value: `${resumoData.liquido >= 0 ? "+" : ""}${((resumoData.liquido / (resumoData.bruto || 1)) * 100).toFixed(1)}% margem`, positive: resumoData.liquido >= 0 }}
            />
            <KpiCard label="Projetos ativos" value={String(resumoData.projetosAtivos)} icon={FileText} />
          </div>

          <Card className="overflow-hidden">
            <div className="p-4 border-b border-border">
              <h3 className="font-display text-base font-semibold">Breakdown por empresa</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Faturamento, repasse proporcional e resultado por cliente.
              </p>
            </div>
            {resumoData.breakdown.length === 0 ? (
              <EmptyState icon={CircleDollarSign} title="Sem dados no período" />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Empresa</TableHead>
                    <TableHead className="text-right">Faturamento</TableHead>
                    <TableHead className="text-right">Repasse</TableHead>
                    <TableHead className="text-right">Resultado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {resumoData.breakdown.map((b) => {
                    const result = b.faturamento - b.repasse;
                    return (
                      <TableRow key={b.empresa}>
                        <TableCell className="font-medium">{b.empresa}</TableCell>
                        <TableCell className="text-right font-data tabular-nums">{formatBRL(b.faturamento)}</TableCell>
                        <TableCell className="text-right font-data tabular-nums text-muted-foreground">{formatBRL(b.repasse)}</TableCell>
                        <TableCell className={cn("text-right font-data font-semibold tabular-nums", result >= 0 ? "text-success" : "text-destructive")}>
                          {formatBRL(result)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      {/* =================== Dialog: Nova fatura =================== */}
      <NovaFaturaDialog
        open={novaFaturaOpen}
        onOpenChange={setNovaFaturaOpen}
        onCreate={(f) => {
          const next: Fatura = {
            ...f,
            id: `f${Date.now()}`,
            numero: `FAT-2026-${String(faturas.length + 1).padStart(4, "0")}`,
            status: "aguardando",
          };
          setFaturas((prev) => [next, ...prev]);
          toast.success(`Fatura ${next.numero} criada com sucesso.`);
        }}
      />

      {/* =================== Dialog: Novo repasse =================== */}
      <NovoRepasseDialog
        open={novoRepasseOpen}
        onOpenChange={setNovoRepasseOpen}
        onCreate={(r) => {
          const bruto = r.horas * r.taxa;
          const liquido = bruto * (1 - 5 / 100);
          const next: Repasse = {
            ...r,
            id: `r${Date.now()}`,
            bruto,
            desconto: 5,
            liquido,
            status: "pendente",
          };
          setRepasses((prev) => [next, ...prev]);
          toast.success("Repasse cadastrado.");
        }}
      />

      {/* =================== Dialog: Cancelar fatura =================== */}
      <Dialog open={!!cancelarFaturaId} onOpenChange={(o) => !o && setCancelarFaturaId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar fatura</DialogTitle>
            <DialogDescription>
              Esta ação é irreversível. Informe o motivo do cancelamento.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="just-cancel">Justificativa <span className="text-destructive">*</span></Label>
            <Textarea
              id="just-cancel"
              value={justificativaCancel}
              onChange={(e) => setJustificativaCancel(e.target.value)}
              placeholder="Ex: cobrança duplicada, erro de valor, contrato encerrado…"
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setCancelarFaturaId(null); setJustificativaCancel(""); }}>
              Voltar
            </Button>
            <Button variant="destructive" onClick={confirmarCancelamento}>
              Cancelar fatura
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// =====================================================================
// Sub-componentes de Dialog
// =====================================================================

interface NovaFaturaPayload {
  empresa: string;
  empresaId: string;
  referencia: string;
  valor: number;
  vencimento: string;
  consultor: string;
}

function NovaFaturaDialog({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreate: (f: NovaFaturaPayload) => void;
}) {
  const [empresaId, setEmpresaId] = useState<string>("");
  const [referencia, setReferencia] = useState("");
  const [valor, setValor] = useState<string>("");
  const [vencimento, setVencimento] = useState<Date | undefined>();
  const [consultor, setConsultor] = useState<string>("");

  const reset = () => {
    setEmpresaId(""); setReferencia(""); setValor(""); setVencimento(undefined); setConsultor("");
  };

  const handleSave = () => {
    const valorNum = parseFloat(valor.replace(",", "."));
    if (!empresaId || !referencia.trim() || !valorNum || valorNum <= 0 || !vencimento || !consultor) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }
    const empresa = empresas.find((e) => e.id === empresaId);
    if (!empresa) return;
    onCreate({
      empresa: empresa.nome,
      empresaId,
      referencia: referencia.trim(),
      valor: valorNum,
      vencimento: format(vencimento, "yyyy-MM-dd"),
      consultor,
    });
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) reset(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova fatura</DialogTitle>
          <DialogDescription>Cadastre uma nova fatura para envio ao cliente.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Empresa <span className="text-destructive">*</span></Label>
            <Select value={empresaId} onValueChange={setEmpresaId}>
              <SelectTrigger><SelectValue placeholder="Selecione a empresa" /></SelectTrigger>
              <SelectContent>
                {empresas.map((e) => (
                  <SelectItem key={e.id} value={e.id}>{e.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Projeto / Referência <span className="text-destructive">*</span></Label>
            <Input
              value={referencia}
              onChange={(e) => setReferencia(e.target.value)}
              placeholder="Ex: Mapeamento de Cargos"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Valor (R$) <span className="text-destructive">*</span></Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                placeholder="0,00"
              />
            </div>
            <div className="space-y-2">
              <Label>Vencimento <span className="text-destructive">*</span></Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start font-normal", !vencimento && "text-muted-foreground")}>
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    {vencimento ? format(vencimento, "dd/MM/yyyy") : "Selecionar"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={vencimento} onSelect={setVencimento} initialFocus className={cn("p-3 pointer-events-auto")} />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Consultor responsável <span className="text-destructive">*</span></Label>
            <Select value={consultor} onValueChange={setConsultor}>
              <SelectTrigger><SelectValue placeholder="Selecione o consultor" /></SelectTrigger>
              <SelectContent>
                {consultores.map((c) => (
                  <SelectItem key={c.id} value={c.nome}>{c.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave}>Criar fatura</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface NovoRepassePayload {
  consultor: string;
  periodo: string;
  horas: number;
  taxa: number;
}

function NovoRepasseDialog({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreate: (r: NovoRepassePayload) => void;
}) {
  const [consultor, setConsultor] = useState("");
  const [periodo, setPeriodo] = useState("");
  const [horas, setHoras] = useState("");
  const [taxa, setTaxa] = useState("");

  const reset = () => { setConsultor(""); setPeriodo(""); setHoras(""); setTaxa(""); };

  const handleSave = () => {
    const horasNum = parseFloat(horas.replace(",", "."));
    const taxaNum = parseFloat(taxa.replace(",", "."));
    if (!consultor || !periodo.trim() || !horasNum || !taxaNum) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }
    onCreate({ consultor, periodo: periodo.trim(), horas: horasNum, taxa: taxaNum });
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) reset(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo repasse</DialogTitle>
          <DialogDescription>Cadastre um repasse para um consultor.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Consultor <span className="text-destructive">*</span></Label>
            <Select value={consultor} onValueChange={setConsultor}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {consultores.map((c) => (
                  <SelectItem key={c.id} value={c.nome}>{c.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Período de referência <span className="text-destructive">*</span></Label>
            <Input value={periodo} onChange={(e) => setPeriodo(e.target.value)} placeholder="Ex: Mai/2026" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Horas <span className="text-destructive">*</span></Label>
              <Input type="number" step="0.5" min="0" value={horas} onChange={(e) => setHoras(e.target.value)} placeholder="40" />
            </div>
            <div className="space-y-2">
              <Label>Taxa/hora (R$) <span className="text-destructive">*</span></Label>
              <Input type="number" step="0.01" min="0" value={taxa} onChange={(e) => setTaxa(e.target.value)} placeholder="80,00" />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave}>Cadastrar repasse</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
