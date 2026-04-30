import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ArrowLeft, Plus, LayoutGrid, List as ListIcon, Play, MoreHorizontal,
  CalendarIcon, Clock, History, Pencil, GitBranch, UserPlus, XCircle,
  CheckCircle2, AlertTriangle, Star, Lock, Paperclip, Send, MessageSquare,
  Trash2, FileText,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { SlaBar } from "@/components/SlaBar";
import { KpiCard } from "@/components/KpiCard";
import { EmptyState } from "@/components/EmptyState";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

import { Briefcase } from "lucide-react";

// ────────────────────────────────────────────────────────────────────
// Tipos / mocks
// ────────────────────────────────────────────────────────────────────

type EntregavelStatus =
  | "nao_iniciado" | "em_andamento" | "aprovacao_interna"
  | "aprovacao_cliente" | "ajuste_solicitado" | "aprovado_cliente" | "cancelado";

type Frente = "consultoria" | "estrategia" | "juridico" | "atracao" | "dp";
type Complexidade = "C1" | "C2" | "C3";

interface Subtarefa {
  id: string;
  nome: string;
  estimativaH: number;
  feita: boolean;
}

interface Anexo {
  id: string;
  nome: string;
}

interface Mensagem {
  id: string;
  autor: string;
  iniciais: string;
  quando: string;
  texto: string;
  canal: "interno" | "cliente";
  anexo?: string;
}

interface Entregavel {
  id: string;
  codigo: string;
  nome: string;
  frente: Frente;
  complexidade: Complexidade;
  status: EntregavelStatus;
  responsavelId: string;
  responsavelNome: string;
  responsavelIniciais: string;
  prazo: string; // yyyy-MM-dd
  /** Timestamp em ms quando entrou em aprovacao_cliente — para mostrar "72h" */
  aprovacaoClienteIniciadaEm?: number;
  /** Horas já consumidas (mock) — relevante quando o entregável é cancelado */
  horasGastas?: number;
  subtarefas?: Subtarefa[];
  mensagens?: Mensagem[];
  anexos?: Anexo[];
  motivoCancelamento?: string;
}

interface HistoricoEvento {
  id: string;
  titulo: string;
  autor: string;
  quando: string;
  descricao?: string;
}

const frenteLabels: Record<Frente, string> = {
  consultoria: "Consultoria",
  estrategia: "Estratégia",
  juridico: "Jurídico",
  atracao: "Atração",
  dp: "Dep. Pessoal",
};

const statusLabels: Record<EntregavelStatus, string> = {
  nao_iniciado: "Não iniciado",
  em_andamento: "Em andamento",
  aprovacao_interna: "Aprovação interna",
  aprovacao_cliente: "Aprovação cliente",
  ajuste_solicitado: "Ajuste solicitado",
  aprovado_cliente: "Aprovado pelo cliente",
  cancelado: "Cancelado",
};

const statusToBadge: Record<EntregavelStatus, "ativa" | "andamento" | "aguardando" | "analise" | "atrasada" | "concluida" | "cancelada"> = {
  nao_iniciado: "aguardando",
  em_andamento: "andamento",
  aprovacao_interna: "analise",
  aprovacao_cliente: "analise",
  ajuste_solicitado: "atrasada",
  aprovado_cliente: "concluida",
  cancelado: "cancelada",
};

const complexidadeStyle: Record<Complexidade, string> = {
  C1: "bg-muted text-muted-foreground border-border",
  C2: "bg-warning/15 text-warning border-warning/30",
  C3: "bg-primary/15 text-primary border-primary/30",
};

// Sequência permitida (usada no Select de status)
const sequenciaStatus: EntregavelStatus[] = [
  "nao_iniciado", "em_andamento", "aprovacao_interna",
  "aprovacao_cliente", "ajuste_solicitado", "aprovado_cliente", "cancelado",
];

// 72h em ms
const SLA_APROVACAO_MS = 72 * 60 * 60 * 1000;
const setentaEDuasHorasAtras = Date.now() - SLA_APROVACAO_MS + 4 * 60 * 60 * 1000; // ~68h ativo p/ exibir

const entregaveisIniciais: Entregavel[] = [
  { id: "1", codigo: "ENT-001", nome: "Diagnóstico inicial",     frente: "consultoria", complexidade: "C1", status: "aprovado_cliente",  responsavelId: "ab", responsavelNome: "Ana Beatriz",   responsavelIniciais: "AB", prazo: "2026-04-10", horasGastas: 18 },
  { id: "2", codigo: "ENT-002", nome: "Workshop de validação",   frente: "consultoria", complexidade: "C2", status: "aprovacao_cliente", responsavelId: "ab", responsavelNome: "Ana Beatriz",   responsavelIniciais: "AB", prazo: "2026-04-28", aprovacaoClienteIniciadaEm: setentaEDuasHorasAtras, horasGastas: 12,
    subtarefas: [
      { id: "s1", nome: "Material de apoio", estimativaH: 4, feita: true },
      { id: "s2", nome: "Roteiro do workshop", estimativaH: 6, feita: false },
    ],
    mensagens: [
      { id: "m1", autor: "Ana Beatriz", iniciais: "AB", quando: "26/04 10:14", texto: "Subi a v2 do roteiro — pronto para revisão interna.", canal: "interno" },
      { id: "m2", autor: "Camila Torres", iniciais: "CT", quando: "26/04 11:02", texto: "Revisei, ok do meu lado @Ana Beatriz", canal: "interno" },
      { id: "m3", autor: "Ana Beatriz", iniciais: "AB", quando: "27/04 09:00", texto: "Olá! Material em anexo para sua aprovação. https://docs.azumi.com/ws-2026", canal: "cliente", anexo: "workshop_v2.pdf" },
    ],
    anexos: [{ id: "a1", nome: "workshop_v2.pdf" }],
  },
  { id: "3", codigo: "ENT-003", nome: "Política de cargos",      frente: "consultoria", complexidade: "C2", status: "aprovacao_interna", responsavelId: "ct", responsavelNome: "Camila Torres", responsavelIniciais: "CT", prazo: "2026-05-10", horasGastas: 9 },
  { id: "4", codigo: "ENT-004", nome: "Treinamento de líderes",  frente: "consultoria", complexidade: "C3", status: "em_andamento",      responsavelId: "rm", responsavelNome: "Rafael Moura",  responsavelIniciais: "RM", prazo: "2026-05-20", horasGastas: 4 },
  { id: "5", codigo: "ENT-005", nome: "Relatório executivo",     frente: "estrategia",  complexidade: "C3", status: "nao_iniciado",      responsavelId: "ab", responsavelNome: "Ana Beatriz",   responsavelIniciais: "AB", prazo: "2026-06-01", horasGastas: 0 },
  { id: "6", codigo: "ENT-006", nome: "Revisão jurídica",        frente: "juridico",    complexidade: "C1", status: "ajuste_solicitado", responsavelId: "ct", responsavelNome: "Camila Torres", responsavelIniciais: "CT", prazo: "2026-04-22", horasGastas: 6 },
  { id: "7", codigo: "ENT-007", nome: "Entrega final",           frente: "consultoria", complexidade: "C3", status: "nao_iniciado",      responsavelId: "ab", responsavelNome: "Ana Beatriz",   responsavelIniciais: "AB", prazo: "2026-06-15", horasGastas: 0 },
];

const historicoMock: HistoricoEvento[] = [
  { id: "h1", titulo: "Entregável criado",                      autor: "Ana Beatriz",   quando: "01/03/2026", descricao: "Cadastrado pela consultora responsável." },
  { id: "h2", titulo: "Status alterado para Em andamento",      autor: "Ana Beatriz",   quando: "15/03/2026", descricao: "Trabalho iniciado após reunião de kickoff." },
  { id: "h3", titulo: "Enviado para aprovação interna",         autor: "Camila Torres", quando: "05/04/2026", descricao: "Documento submetido à revisão da liderança Azumi." },
  { id: "h4", titulo: "Enviado para aprovação do cliente",      autor: "Ana Beatriz",   quando: "20/04/2026", descricao: "Cliente notificado por e-mail. SLA de parecer: 72h." },
];

const responsaveisDisponiveis = [
  { id: "ab", nome: "Ana Beatriz",   iniciais: "AB" },
  { id: "rm", nome: "Rafael Moura",  iniciais: "RM" },
  { id: "ct", nome: "Camila Torres", iniciais: "CT" },
];

// Tempo restante (horas) das 72h de aprovação cliente
function horasRestantes72h(iniciadaEm?: number): number | null {
  if (!iniciadaEm) return null;
  const passadoMs = Date.now() - iniciadaEm;
  const restanteMs = SLA_APROVACAO_MS - passadoMs;
  return Math.max(0, Math.round(restanteMs / (60 * 60 * 1000)));
}

// ────────────────────────────────────────────────────────────────────
// Página
// ────────────────────────────────────────────────────────────────────

const VIEW_KEY = "projeto-detalhe:view";

export default function ProjetoDetalhe() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [entregaveis, setEntregaveis] = useState<Entregavel[]>(entregaveisIniciais);
  const [view, setView] = useState<"lista" | "kanban">(() => {
    if (typeof window === "undefined") return "lista";
    return (localStorage.getItem(VIEW_KEY) as "lista" | "kanban") ?? "lista";
  });
  useEffect(() => { localStorage.setItem(VIEW_KEY, view); }, [view]);

  // ── Estado de Dialogs/Sheets ────────────────────────────────────
  const [novoOpen, setNovoOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState<{ open: boolean; entId: string | null }>({ open: false, entId: null });
  const [editOpen, setEditOpen] = useState<{ open: boolean; entId: string | null }>({ open: false, entId: null });
  const [historicoOpen, setHistoricoOpen] = useState<{ open: boolean; entId: string | null }>({ open: false, entId: null });
  const [cancelarOpen, setCancelarOpen] = useState<{ open: boolean; entId: string | null }>({ open: false, entId: null });
  const [panelOpen, setPanelOpen] = useState<{ open: boolean; entId: string | null }>({ open: false, entId: null });
  const [dragOverCol, setDragOverCol] = useState<EntregavelStatus | null>(null);
  const [confirmAvancarOpen, setConfirmAvancarOpen] = useState<{
    open: boolean; entId: string | null; targetStatus: EntregavelStatus | null;
  }>({ open: false, entId: null, targetStatus: null });
  const [npsOpen, setNpsOpen] = useState<{ open: boolean; entId: string | null }>({ open: false, entId: null });

  // KPIs
  const kpis = useMemo(() => ({
    total: entregaveis.length,
    aprovados: entregaveis.filter((e) => e.status === "aprovado_cliente").length,
    emAndamento: entregaveis.filter((e) => e.status === "em_andamento").length,
    bloqueados: entregaveis.filter((e) => e.status === "ajuste_solicitado").length,
  }), [entregaveis]);

  const progresso = useMemo(() => {
    const total = entregaveis.length || 1;
    const concluidos = entregaveis.filter((e) => e.status === "aprovado_cliente").length;
    // Mantém 62% para refletir o mock do projeto
    return Math.round((concluidos / total) * 100) || 62;
  }, [entregaveis]);

  function ativaTimerPara(codigo: string) {
    navigate(`/app/horas?task_id=${codigo}`);
  }

  function aplicarMudancaStatus(entId: string, novoStatus: EntregavelStatus) {
    setEntregaveis((prev) => prev.map((e) => {
      if (e.id !== entId) return e;
      const next: Entregavel = { ...e, status: novoStatus };
      if (novoStatus === "aprovacao_cliente" && !e.aprovacaoClienteIniciadaEm) {
        next.aprovacaoClienteIniciadaEm = Date.now();
      }
      if (novoStatus !== "aprovacao_cliente") {
        next.aprovacaoClienteIniciadaEm = undefined;
      }
      return next;
    }));
  }

  // Atualiza qualquer campo de um entregável (subtarefas, mensagens, consultor…)
  function patchEntregavel(entId: string, patch: Partial<Entregavel>) {
    setEntregaveis((prev) => prev.map((e) => (e.id === entId ? { ...e, ...patch } : e)));
  }

  // ── Drag & Drop entre colunas do Kanban ─────────────────────────
  function onDropColuna(targetStatus: EntregavelStatus, entId: string) {
    setDragOverCol(null);
    const ent = entregaveis.find((x) => x.id === entId);
    if (!ent) return;
    if (ent.status === targetStatus) return;

    // Bloqueio: aprovado_cliente nunca pode voltar
    if (ent.status === "aprovado_cliente") {
      toast.error("Entregável aprovado pelo cliente — edição e mudança de status bloqueadas.");
      return;
    }
    // Não permite voltar manualmente para nao_iniciado quando já em andamento
    if (targetStatus === "nao_iniciado" && ent.status !== "nao_iniciado") {
      toast.error("Não é possível voltar um entregável já iniciado para 'Não iniciado'.");
      return;
    }
    // Avanços que exigem confirmação reaproveitam o dialog
    if (targetStatus === "aprovacao_cliente" || targetStatus === "aprovado_cliente") {
      setConfirmAvancarOpen({ open: true, entId, targetStatus });
      return;
    }
    if (targetStatus === "cancelado") {
      setCancelarOpen({ open: true, entId });
      return;
    }
    aplicarMudancaStatus(entId, targetStatus);
    toast.success(`Status alterado para "${statusLabels[targetStatus]}".`);
  }

  // Alerta no header: entregáveis cancelados com horas registradas
  const canceladosComHoras = useMemo(
    () => entregaveis.filter((e) => e.status === "cancelado" && (e.horasGastas ?? 0) > 0),
    [entregaveis],
  );

  // ── Handlers de mudança de status ───────────────────────────────
  function pedirMudancaStatus(entId: string, novoStatus: EntregavelStatus, justificativa?: string) {
    if (novoStatus === "aprovacao_cliente" || novoStatus === "aprovado_cliente") {
      setConfirmAvancarOpen({ open: true, entId, targetStatus: novoStatus });
      return;
    }
    if (novoStatus === "cancelado") {
      // Já validado upstream; aplica direto
      aplicarMudancaStatus(entId, novoStatus);
      toast.warning("Entregável cancelado.", { description: justificativa });
      return;
    }
    aplicarMudancaStatus(entId, novoStatus);
    toast.success(`Status alterado para "${statusLabels[novoStatus]}".`);
  }

  function confirmarAvanco() {
    const { entId, targetStatus } = confirmAvancarOpen;
    if (!entId || !targetStatus) return;
    aplicarMudancaStatus(entId, targetStatus);
    setConfirmAvancarOpen({ open: false, entId: null, targetStatus: null });
    setStatusOpen({ open: false, entId: null });

    if (targetStatus === "aprovado_cliente") {
      toast.success("Entregável aprovado pelo cliente.");
      // dispara NPS automaticamente
      setNpsOpen({ open: true, entId });
    } else if (targetStatus === "aprovacao_cliente") {
      toast.success("Enviado para aprovação do cliente — prazo de 72h para resposta.");
    } else {
      toast.success(`Status alterado para "${statusLabels[targetStatus]}".`);
    }
  }

  // ── Card de entregável (lista) ──────────────────────────────────
  function renderCardLista(e: Entregavel) {
    const bloqueado = e.status === "aprovado_cliente";
    const atrasado = new Date(e.prazo) < new Date() && e.status !== "aprovado_cliente" && e.status !== "cancelado";
    const horasRest = horasRestantes72h(e.aprovacaoClienteIniciadaEm);

    return (
      <div key={e.id} className="bg-card border border-border rounded-xl p-5 card-hover">
        <div className="flex items-start gap-3 flex-wrap">
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-data text-muted-foreground uppercase tracking-wider">{e.codigo}</div>
            <h4 className="font-display font-semibold mt-0.5">{e.nome}</h4>

            <div className="mt-2 flex items-center gap-2 flex-wrap">
              <span className="badge-pill bg-secondary text-secondary-foreground border-border">
                {frenteLabels[e.frente]}
              </span>
              <span className={cn("badge-pill border", complexidadeStyle[e.complexidade])}>
                {e.complexidade}
              </span>
              <StatusBadge status={statusToBadge[e.status]}>{statusLabels[e.status]}</StatusBadge>
              {e.status === "aprovacao_cliente" && horasRest !== null && (
                <span className={cn(
                  "badge-pill border",
                  horasRest <= 12
                    ? "bg-destructive/15 text-destructive border-destructive/30"
                    : "bg-warning/15 text-warning border-warning/30"
                )}>
                  <Clock className="h-3 w-3" />
                  {horasRest}h restantes
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span tabIndex={0}>
                    <Button
                      size="icon"
                      variant="outline"
                      disabled={bloqueado}
                      onClick={() => ativaTimerPara(e.codigo)}
                      aria-label={`Iniciar timer para ${e.codigo}`}
                    >
                      {bloqueado ? <Lock className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  {bloqueado ? "Entregável aprovado pelo cliente — edição bloqueada" : "Iniciar timer"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Menu ··· */}
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span tabIndex={0}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild disabled={bloqueado}>
                        <Button size="icon" variant="ghost" disabled={bloqueado} aria-label="Mais opções">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuItem onClick={() => setPanelOpen({ open: true, entId: e.id })}>
                          <MessageSquare className="mr-2 h-4 w-4" /> Abrir painel (subtarefas / chat)
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setStatusOpen({ open: true, entId: e.id })}>
                          <CheckCircle2 className="mr-2 h-4 w-4" /> Alterar status
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setEditOpen({ open: true, entId: e.id })}>
                          <Pencil className="mr-2 h-4 w-4" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setPanelOpen({ open: true, entId: e.id })}>
                          <GitBranch className="mr-2 h-4 w-4" /> Subtarefas
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setPanelOpen({ open: true, entId: e.id })}>
                          <UserPlus className="mr-2 h-4 w-4" /> Marcar consultor
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setHistoricoOpen({ open: true, entId: e.id })}>
                          <History className="mr-2 h-4 w-4" /> Ver histórico
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => setCancelarOpen({ open: true, entId: e.id })}
                          className="text-destructive focus:text-destructive"
                        >
                          <XCircle className="mr-2 h-4 w-4" /> Cancelar entregável
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </span>
                </TooltipTrigger>
                {bloqueado && (
                  <TooltipContent>
                    Entregável aprovado pelo cliente — edição bloqueada
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-md bg-gradient-brand flex items-center justify-center text-[10px] font-semibold text-white">
              {e.responsavelIniciais}
            </div>
            <span className="text-xs text-muted-foreground">{e.responsavelNome}</span>
          </div>
          <div className={cn(
            "text-xs flex items-center gap-1 font-data",
            atrasado ? "text-destructive font-semibold" : "text-muted-foreground"
          )}>
            <CalendarIcon className="h-3.5 w-3.5" />
            {format(new Date(e.prazo), "dd MMM yyyy", { locale: ptBR })}
            {atrasado && <span>· atrasado</span>}
          </div>
        </div>
      </div>
    );
  }

  // ── Card compacto (kanban) ──────────────────────────────────────
  function renderCardKanban(e: Entregavel) {
    const atrasado = new Date(e.prazo) < new Date() && e.status !== "aprovado_cliente" && e.status !== "cancelado";
    const bloqueado = e.status === "aprovado_cliente";
    const subCount = e.subtarefas?.length ?? 0;
    return (
      <div
        key={e.id}
        draggable={!bloqueado}
        onDragStart={(ev) => {
          if (bloqueado) {
            ev.preventDefault();
            toast.error("Entregável aprovado pelo cliente — edição e mudança de status bloqueadas.");
            return;
          }
          ev.dataTransfer.setData("text/plain", e.id);
          ev.dataTransfer.effectAllowed = "move";
        }}
        onClick={() => setPanelOpen({ open: true, entId: e.id })}
        className={cn(
          "bg-background/60 border border-border rounded-lg p-3 transition-colors cursor-pointer hover:border-primary/40",
          bloqueado && "opacity-90"
        )}
      >
        <div className="flex items-center justify-between">
          <div className="text-[10px] font-data text-muted-foreground uppercase">{e.codigo}</div>
          {bloqueado && <Lock className="h-3 w-3 text-muted-foreground" aria-label="Bloqueado" />}
        </div>
        <div className="text-sm font-medium leading-tight mt-0.5 line-clamp-2">{e.nome}</div>

        <div className="mt-2 flex items-center gap-2 flex-wrap">
          <span className={cn("badge-pill border text-[10px]", complexidadeStyle[e.complexidade])}>
            {e.complexidade}
          </span>
          <span className={cn(
            "text-[10px] font-data",
            atrasado ? "text-destructive font-semibold" : "text-muted-foreground"
          )}>
            {format(new Date(e.prazo), "dd/MM", { locale: ptBR })}
          </span>
          {subCount > 0 && (
            <span className="text-[10px] text-muted-foreground inline-flex items-center gap-1">
              <GitBranch className="h-3 w-3" /> {subCount}
            </span>
          )}
        </div>

        <div className="mt-2 flex items-center gap-1.5">
          <div className="h-5 w-5 rounded-md bg-gradient-brand flex items-center justify-center text-[8px] font-semibold text-white">
            {e.responsavelIniciais}
          </div>
          <span className="text-[10px] text-muted-foreground truncate">{e.responsavelNome}</span>
        </div>
      </div>
    );
  }

  const colunasKanban: { status: EntregavelStatus; label: string }[] = [
    { status: "nao_iniciado",       label: "Não iniciado" },
    { status: "em_andamento",       label: "Em andamento" },
    { status: "aprovacao_interna",  label: "Aprovação interna" },
    { status: "aprovacao_cliente",  label: "Aprovação cliente" },
    { status: "ajuste_solicitado",  label: "Ajuste solicitado" },
    { status: "aprovado_cliente",   label: "Aprovado" },
  ];

  return (
    <div>
      <Link to="/app/projetos" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-3">
        <ArrowLeft className="h-3.5 w-3.5" /> Voltar para projetos
      </Link>

      <PageHeader
        title="Mapeamento de Cargos"
        subtitle="Kentaki Foods · São Paulo — Matriz"
        actions={
          <>
            <StatusBadge status="andamento">Vigente</StatusBadge>
          </>
        }
      />

      {/* Cabeçalho — informações do projeto */}
      <div className="bg-card border border-border rounded-xl p-5 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Código</div>
            <div className="text-sm font-data font-semibold mt-0.5">PROJ-2026-0001 · {id}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Consultor responsável</div>
            <div className="mt-1 flex items-center gap-2">
              <div className="h-7 w-7 rounded-full bg-gradient-brand flex items-center justify-center text-[10px] font-semibold text-white">AB</div>
              <span className="text-sm">Ana Beatriz</span>
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Período</div>
            <div className="text-sm font-data mt-0.5">01/03/2026 → 30/06/2026</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Conclusão</div>
            <div className="flex items-center gap-2">
              <Progress value={progresso} className="h-2 flex-1" />
              <span className="font-data text-sm font-semibold tabular-nums">{progresso}%</span>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <SlaBar percent={55} label="SLA do projeto" />
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Entregáveis" value={kpis.total} icon={Briefcase} />
        <KpiCard label="Aprovados" value={kpis.aprovados} icon={CheckCircle2} />
        <KpiCard label="Em andamento" value={kpis.emAndamento} icon={Clock} />
        <KpiCard label="Ajuste solicitado" value={kpis.bloqueados} icon={AlertTriangle} />
      </div>

      {/* Controles */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h3 className="font-display font-semibold">Entregáveis</h3>
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg border border-border p-0.5 bg-secondary/40">
            <button
              type="button"
              onClick={() => setView("lista")}
              className={cn(
                "h-8 px-3 rounded-md text-xs font-medium inline-flex items-center gap-1.5 transition-colors",
                view === "lista" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <ListIcon className="h-3.5 w-3.5" /> Lista
            </button>
            <button
              type="button"
              onClick={() => setView("kanban")}
              className={cn(
                "h-8 px-3 rounded-md text-xs font-medium inline-flex items-center gap-1.5 transition-colors",
                view === "kanban" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <LayoutGrid className="h-3.5 w-3.5" /> Kanban
            </button>
          </div>
          <Button onClick={() => setNovoOpen(true)} className="gap-1.5">
            <Plus className="h-4 w-4" /> Novo entregável
          </Button>
        </div>
      </div>

      {/* Lista / Kanban */}
      {entregaveis.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="Nenhum entregável cadastrado"
          description="Comece criando o primeiro entregável deste projeto."
          action={<Button onClick={() => setNovoOpen(true)}><Plus className="mr-1.5 h-4 w-4" /> Novo entregável</Button>}
        />
      ) : view === "lista" ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {entregaveis.map(renderCardLista)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          {colunasKanban.map((col) => {
            const itens = entregaveis.filter((e) => e.status === col.status);
            return (
              <div key={col.status} className="bg-card border border-border rounded-xl p-3 min-h-[200px]">
                <div className="flex items-center justify-between px-1 mb-3">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground truncate">
                    {col.label}
                  </span>
                  <span className="font-data text-xs text-muted-foreground">{itens.length}</span>
                </div>
                {itens.length === 0 ? (
                  <div className="flex items-center justify-center h-24 text-xs text-muted-foreground">—</div>
                ) : (
                  <ul className="space-y-2">{itens.map(renderCardKanban)}</ul>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ─────────── Dialog: Novo Entregável ─────────── */}
      <NovoEntregavelDialog
        open={novoOpen}
        onOpenChange={setNovoOpen}
        onCreate={(novo) => setEntregaveis((prev) => {
          const codigo = `ENT-${String(prev.length + 1).padStart(3, "0")}`;
          return [...prev, { ...novo, id: String(Date.now()), codigo }];
        })}
      />

      {/* ─────────── Dialog: Alterar status ─────────── */}
      <AlterarStatusDialog
        state={statusOpen}
        onClose={() => setStatusOpen({ open: false, entId: null })}
        entregavel={entregaveis.find((e) => e.id === statusOpen.entId) ?? null}
        onChange={(novoStatus) => {
          const entId = statusOpen.entId;
          if (!entId) return;
          if (novoStatus === "cancelado") {
            setStatusOpen({ open: false, entId: null });
            setCancelarOpen({ open: true, entId });
            return;
          }
          if (novoStatus === "aprovacao_cliente" || novoStatus === "aprovado_cliente") {
            setConfirmAvancarOpen({ open: true, entId, targetStatus: novoStatus });
            return;
          }
          aplicarMudancaStatus(entId, novoStatus);
          setStatusOpen({ open: false, entId: null });
          toast.success(`Status alterado para "${statusLabels[novoStatus]}".`);
        }}
      />

      {/* ─────────── Dialog: Confirmar avanço ─────────── */}
      <Dialog
        open={confirmAvancarOpen.open}
        onOpenChange={(o) => !o && setConfirmAvancarOpen({ open: false, entId: null, targetStatus: null })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmAvancarOpen.targetStatus === "aprovado_cliente"
                ? "Confirmar aprovação do cliente?"
                : "Enviar para aprovação do cliente?"}
            </DialogTitle>
            <DialogDescription>
              {confirmAvancarOpen.targetStatus === "aprovado_cliente"
                ? "Esta ação encerra o entregável e dispara automaticamente a avaliação NPS. Não poderá ser desfeita pela interface."
                : "O cliente será notificado e terá 72h para emitir parecer. O SLA do entregável passa a contar a partir de agora."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmAvancarOpen({ open: false, entId: null, targetStatus: null })}>
              Cancelar
            </Button>
            <Button onClick={confirmarAvanco}>Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─────────── Dialog: Cancelar entregável ─────────── */}
      <CancelarDialog
        open={cancelarOpen.open}
        entregavel={entregaveis.find((e) => e.id === cancelarOpen.entId) ?? null}
        onClose={() => setCancelarOpen({ open: false, entId: null })}
        onConfirm={(justificativa) => {
          const entId = cancelarOpen.entId;
          if (!entId) return;
          aplicarMudancaStatus(entId, "cancelado");
          setCancelarOpen({ open: false, entId: null });
          toast.warning("Entregável cancelado.", { description: justificativa });
        }}
      />

      {/* ─────────── Dialog: Editar entregável ─────────── */}
      <EditarEntregavelDialog
        open={editOpen.open}
        entregavel={entregaveis.find((e) => e.id === editOpen.entId) ?? null}
        onClose={() => setEditOpen({ open: false, entId: null })}
        onSave={(patch) => {
          const entId = editOpen.entId;
          if (!entId) return;
          setEntregaveis((prev) => prev.map((e) => e.id === entId ? { ...e, ...patch } : e));
          setEditOpen({ open: false, entId: null });
          toast.success("Entregável atualizado.");
        }}
      />

      {/* ─────────── Sheet: Histórico ─────────── */}
      <Sheet
        open={historicoOpen.open}
        onOpenChange={(o) => !o && setHistoricoOpen({ open: false, entId: null })}
      >
        <SheetContent side="right" className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Histórico do entregável</SheetTitle>
            <SheetDescription>
              {entregaveis.find((e) => e.id === historicoOpen.entId)?.nome ?? "—"}
            </SheetDescription>
          </SheetHeader>

          <ol className="mt-6 relative border-l border-border pl-6 space-y-5">
            {historicoMock.map((h) => (
              <li key={h.id} className="relative">
                <span className="absolute -left-[31px] top-1 h-3 w-3 rounded-full bg-primary ring-4 ring-background" />
                <div className="text-sm font-medium">{h.titulo}</div>
                <div className="text-[11px] text-muted-foreground font-data mt-0.5">
                  {h.autor} · {h.quando}
                </div>
                {h.descricao && (
                  <p className="text-xs text-muted-foreground mt-1">{h.descricao}</p>
                )}
              </li>
            ))}
          </ol>
        </SheetContent>
      </Sheet>

      {/* ─────────── Modal NPS (sem botão de fechar) ─────────── */}
      <NpsDialog
        open={npsOpen.open}
        entregavel={entregaveis.find((e) => e.id === npsOpen.entId) ?? null}
        onSubmit={(nota, comentario) => {
          setNpsOpen({ open: false, entId: null });
          toast.success(`Avaliação registrada (${nota}/5).`, {
            description: comentario ? `"${comentario}"` : undefined,
          });
        }}
      />
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────
// Sub-componentes
// ────────────────────────────────────────────────────────────────────

function NovoEntregavelDialog({
  open, onOpenChange, onCreate,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onCreate: (e: Omit<Entregavel, "id" | "codigo">) => void;
}) {
  const [nome, setNome] = useState("");
  const [frente, setFrente] = useState<Frente | "">("");
  const [complexidade, setComplexidade] = useState<Complexidade | "">("");
  const [responsavel, setResponsavel] = useState("");
  const [prazo, setPrazo] = useState<Date | undefined>();

  function reset() {
    setNome(""); setFrente(""); setComplexidade(""); setResponsavel(""); setPrazo(undefined);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!nome.trim() || !frente || !complexidade || !responsavel || !prazo) {
      toast.error("Preencha todos os campos.");
      return;
    }
    const r = responsaveisDisponiveis.find((x) => x.id === responsavel)!;
    onCreate({
      nome: nome.trim(),
      frente: frente as Frente,
      complexidade: complexidade as Complexidade,
      responsavelId: r.id,
      responsavelNome: r.nome,
      responsavelIniciais: r.iniciais,
      prazo: format(prazo, "yyyy-MM-dd"),
      status: "nao_iniciado",
    });
    toast.success("Entregável criado.");
    reset();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) reset(); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Novo entregável</DialogTitle>
          <DialogDescription>Os campos abaixo são todos obrigatórios.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="ne-nome">Nome</Label>
            <Input id="ne-nome" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Diagnóstico inicial" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Frente</Label>
              <Select value={frente} onValueChange={(v) => setFrente(v as Frente)}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(frenteLabels) as Frente[]).map((f) => (
                    <SelectItem key={f} value={f}>{frenteLabels[f]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Complexidade</Label>
              <Select value={complexidade} onValueChange={(v) => setComplexidade(v as Complexidade)}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="C1">C1 — Simples</SelectItem>
                  <SelectItem value="C2">C2 — Média</SelectItem>
                  <SelectItem value="C3">C3 — Complexa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Responsável</Label>
              <Select value={responsavel} onValueChange={setResponsavel}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {responsaveisDisponiveis.map((r) => (
                    <SelectItem key={r.id} value={r.id}>{r.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Prazo</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" type="button" className={cn(
                    "w-full justify-start text-left font-normal",
                    !prazo && "text-muted-foreground"
                  )}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {prazo ? format(prazo, "dd/MM/yyyy", { locale: ptBR }) : "Selecione"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={prazo} onSelect={setPrazo} initialFocus className={cn("p-3 pointer-events-auto")} />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => { reset(); onOpenChange(false); }}>Cancelar</Button>
            <Button type="submit">Criar entregável</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AlterarStatusDialog({
  state, entregavel, onClose, onChange,
}: {
  state: { open: boolean; entId: string | null };
  entregavel: Entregavel | null;
  onClose: () => void;
  onChange: (novo: EntregavelStatus) => void;
}) {
  const [novo, setNovo] = useState<EntregavelStatus | "">("");

  useEffect(() => {
    if (state.open && entregavel) setNovo(entregavel.status);
  }, [state.open, entregavel]);

  return (
    <Dialog open={state.open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Alterar status</DialogTitle>
          <DialogDescription>
            {entregavel?.codigo} · {entregavel?.nome}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label>Novo status</Label>
          <Select value={novo} onValueChange={(v) => setNovo(v as EntregavelStatus)}>
            <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent>
              {sequenciaStatus.map((s) => (
                <SelectItem key={s} value={s}>{statusLabels[s]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-[11px] text-muted-foreground">
            Avançar para "Aprovação cliente" ou "Aprovado pelo cliente" exige confirmação adicional.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button
            disabled={!novo || novo === entregavel?.status}
            onClick={() => novo && onChange(novo)}
          >
            Aplicar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EditarEntregavelDialog({
  open, entregavel, onClose, onSave,
}: {
  open: boolean;
  entregavel: Entregavel | null;
  onClose: () => void;
  onSave: (patch: Partial<Entregavel>) => void;
}) {
  const [nome, setNome] = useState("");
  const [responsavel, setResponsavel] = useState("");
  const [prazo, setPrazo] = useState<Date | undefined>();

  useEffect(() => {
    if (entregavel) {
      setNome(entregavel.nome);
      setResponsavel(entregavel.responsavelId);
      setPrazo(new Date(entregavel.prazo));
    }
  }, [entregavel]);

  if (!entregavel) return null;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!nome.trim() || !responsavel || !prazo) {
      toast.error("Preencha todos os campos.");
      return;
    }
    const r = responsaveisDisponiveis.find((x) => x.id === responsavel)!;
    onSave({
      nome: nome.trim(),
      responsavelId: r.id,
      responsavelNome: r.nome,
      responsavelIniciais: r.iniciais,
      prazo: format(prazo, "yyyy-MM-dd"),
    });
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar entregável</DialogTitle>
          <DialogDescription>{entregavel.codigo}</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Nome</Label>
            <Input value={nome} onChange={(e) => setNome(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Responsável</Label>
              <Select value={responsavel} onValueChange={setResponsavel}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {responsaveisDisponiveis.map((r) => (
                    <SelectItem key={r.id} value={r.id}>{r.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Prazo</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" type="button" className={cn(
                    "w-full justify-start text-left font-normal",
                    !prazo && "text-muted-foreground"
                  )}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {prazo ? format(prazo, "dd/MM/yyyy", { locale: ptBR }) : "Selecione"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={prazo} onSelect={setPrazo} initialFocus className={cn("p-3 pointer-events-auto")} />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit">Salvar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function CancelarDialog({
  open, entregavel, onClose, onConfirm,
}: {
  open: boolean;
  entregavel: Entregavel | null;
  onClose: () => void;
  onConfirm: (justificativa: string) => void;
}) {
  const [just, setJust] = useState("");

  useEffect(() => { if (open) setJust(""); }, [open]);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <XCircle className="h-5 w-5" /> Cancelar entregável
          </DialogTitle>
          <DialogDescription>
            {entregavel?.codigo} · {entregavel?.nome}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="cancel-just">
            Justificativa <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="cancel-just"
            rows={4}
            placeholder="Explique o motivo do cancelamento…"
            value={just}
            onChange={(e) => setJust(e.target.value)}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Voltar</Button>
          <Button
            variant="destructive"
            disabled={!just.trim()}
            onClick={() => onConfirm(just.trim())}
          >
            Confirmar cancelamento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function NpsDialog({
  open, entregavel, onSubmit,
}: {
  open: boolean;
  entregavel: Entregavel | null;
  onSubmit: (nota: number, comentario?: string) => void;
}) {
  const [nota, setNota] = useState<number>(0);
  const [comentario, setComentario] = useState("");

  useEffect(() => {
    if (open) { setNota(0); setComentario(""); }
  }, [open]);

  const negativo = nota >= 1 && nota <= 3;
  const positivo = nota >= 4;
  const podeEnviar = nota > 0 && (!negativo || comentario.trim().length > 0);

  return (
    <Dialog open={open}>
      {/* Sem botão de fechar — não passa onOpenChange */}
      <DialogContent
        className="[&>button]:hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Como foi este entregável?</DialogTitle>
          <DialogDescription>{entregavel?.nome ?? "—"}</DialogDescription>
        </DialogHeader>

        <div className="py-2">
          <div className="flex items-center justify-center gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setNota(n)}
                className="p-1 transition-transform hover:scale-110"
                aria-label={`Nota ${n}`}
              >
                <Star
                  className={cn(
                    "h-9 w-9 transition-colors",
                    n <= nota ? "text-warning fill-warning" : "text-muted-foreground"
                  )}
                />
              </button>
            ))}
          </div>
          <p className="text-center text-xs text-muted-foreground mt-2">
            {nota === 0 && "Toque em uma estrela para avaliar"}
            {nota > 0 && `${nota} de 5 estrelas`}
          </p>
        </div>

        {(negativo || positivo) && (
          <div className="space-y-1.5">
            <Label htmlFor="nps-coment">
              {negativo ? "Conte o que não funcionou bem" : "Algum comentário adicional?"}
              {negativo && <span className="text-destructive"> *</span>}
              {positivo && <span className="text-muted-foreground text-xs ml-1">(opcional)</span>}
            </Label>
            <Textarea
              id="nps-coment"
              rows={4}
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              placeholder={negativo ? "Sua resposta nos ajuda a melhorar…" : "Compartilhe um elogio ou sugestão…"}
            />
          </div>
        )}

        <DialogFooter>
          <Button
            disabled={!podeEnviar}
            onClick={() => onSubmit(nota, comentario.trim() || undefined)}
            className="w-full"
          >
            Enviar avaliação
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
