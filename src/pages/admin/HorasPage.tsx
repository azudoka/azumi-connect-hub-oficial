import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Clock, Timer as TimerIcon, PenSquare, Download, Play,
  CalendarIcon, ChevronDown, ChevronRight, AlertTriangle, Filter,
  Briefcase, MessageSquare,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/PageHeader";
import { KpiCard } from "@/components/KpiCard";
import { Timer } from "@/components/Timer";
import { EmptyState } from "@/components/EmptyState";
import { StatusBadge } from "@/components/StatusBadge";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

import { useAuth } from "@/context/AuthContext";
import { useTimerGlobal } from "@/context/TimerContext";
import { empresas, consultores } from "@/data/mock";

// ────────────────────────────────────────────────────────────────────
// Tipos e mocks locais
// ────────────────────────────────────────────────────────────────────

type LancamentoTipo = "timer" | "manual";

const ETAPAS_VAGA = [
  "Briefing",
  "Divulgação",
  "Triagem",
  "Entrevista Azumi",
  "Entrevista Cliente",
  "Encerramento",
] as const;
type EtapaVaga = typeof ETAPAS_VAGA[number];

interface Lancamento {
  id: string;
  data: string;            // "2025-04-21"
  empresaId: string;
  empresaNome: string;
  projeto: string;
  entregavel: string;
  horas: number;
  tipo: LancamentoTipo;
  consultorId: string;
  consultorNome: string;
  justificativa?: string;  // só para manual
  observacao?: string;     // detalhe extra (somente expandido)
  requerRevisao?: boolean;
  etapaVaga?: EtapaVaga;
}

type CanalInteracao = "WhatsApp" | "E-mail" | "Ligação" | "Visita presencial" | "Outro";

interface Interacao {
  id: string;
  data: string;
  canal: CanalInteracao;
  empresaId: string;
  empresaNome: string;
  entregavel?: string;
  duracaoMin: number;
  descricao: string;
  consultorId: string;
  consultorNome: string;
}

// Projetos por empresa para o select dependente
const projetosPorEmpresa: Record<string, { projeto: string; entregaveis: string[] }[]> = {
  kentaki: [
    { projeto: "Mapeamento de Cargos", entregaveis: ["Diagnóstico inicial", "Workshop de validação", "Documento final"] },
    { projeto: "Hunting — Gerente TI", entregaveis: ["Briefing", "Triagem", "Entrevistas"] },
  ],
  maverick: [
    { projeto: "Recolocação executiva", entregaveis: ["Reunião de alinhamento", "Apresentação de perfis"] },
    { projeto: "Hunting — Analista MKT", entregaveis: ["Briefing", "Divulgação", "Triagem"] },
  ],
  mira: [
    { projeto: "Estruturação de RH", entregaveis: ["Diagnóstico", "Política de cargos", "Treinamento líderes"] },
  ],
  techplural: [
    { projeto: "Hunting — Dev Full Stack", entregaveis: ["Triagem técnica", "Entrevista cultural"] },
  ],
  alvo: [
    { projeto: "Go to Market", entregaveis: ["Pesquisa de mercado", "Plano comercial"] },
  ],
};

const lancamentosIniciais: Lancamento[] = [
  {
    id: "h1", data: "2025-04-21", empresaId: "kentaki", empresaNome: "Kentaki Foods",
    projeto: "Mapeamento de Cargos", entregavel: "Diagnóstico inicial",
    horas: 2.5, tipo: "timer", consultorId: "ab", consultorNome: "Ana Beatriz",
    observacao: "Reunião com diretoria de operações para alinhar escopo do diagnóstico.",
  },
  {
    id: "h2", data: "2025-04-21", empresaId: "mira", empresaNome: "Studio Mira",
    projeto: "Estruturação de RH", entregavel: "Política de cargos",
    horas: 1.75, tipo: "manual", consultorId: "ct", consultorNome: "Camila Torres",
    justificativa: "Revisão de matriz salarial — solicitada fora do horário comercial.",
    observacao: "Cliente pediu prazo apertado para apresentar à reunião de sócios.",
  },
  {
    id: "h3", data: "2025-04-22", empresaId: "maverick", empresaNome: "Grupo Maverick",
    projeto: "Hunting — Analista MKT", entregavel: "Triagem",
    horas: 3, tipo: "timer", consultorId: "rm", consultorNome: "Rafael Moura",
    observacao: "Triagem de 24 currículos enviados pelo portal.",
  },
  {
    id: "h4", data: "2025-04-22", empresaId: "kentaki", empresaNome: "Kentaki Foods",
    projeto: "Hunting — Gerente TI", entregavel: "Entrevistas",
    horas: 1.5, tipo: "manual", consultorId: "ab", consultorNome: "Ana Beatriz",
    justificativa: "Entrevista presencial fora do horário padrão a pedido do candidato.",
  },
  {
    id: "h5", data: "2025-04-23", empresaId: "techplural", empresaNome: "Tech Plural",
    projeto: "Hunting — Dev Full Stack", entregavel: "Triagem técnica",
    horas: 2.25, tipo: "timer", consultorId: "ab", consultorNome: "Ana Beatriz",
    observacao: "Live coding com 3 candidatos finalistas.",
  },
  {
    id: "h6", data: "2025-04-23", empresaId: "alvo", empresaNome: "Alvo Digital",
    projeto: "Go to Market", entregavel: "Plano comercial",
    horas: 4, tipo: "manual", consultorId: "rm", consultorNome: "Rafael Moura",
    justificativa: "Sessão de trabalho extensa com a CEO para fechar plano comercial.",
    observacao: "Documento entregue por e-mail no final do dia.",
  },
  {
    id: "h7", data: "2025-04-24", empresaId: "mira", empresaNome: "Studio Mira",
    projeto: "Estruturação de RH", entregavel: "Treinamento líderes",
    horas: 2, tipo: "timer", consultorId: "ct", consultorNome: "Camila Torres",
    observacao: "Sessão 2 de 4 do programa de capacitação de líderes.",
  },
];

// Lista plana de tarefas para os Selects e para deep-link via ?task_id=
type Tarefa = {
  id: string;            // ex: "kentaki::Mapeamento de Cargos::Diagnóstico inicial"
  empresaId: string;
  empresaNome: string;
  projeto: string;
  entregavel: string;
  label: string;         // texto exibido no select
};

const tarefasFlat: Tarefa[] = (() => {
  const arr: Tarefa[] = [];
  for (const [empresaId, projetos] of Object.entries(projetosPorEmpresa)) {
    const empresaNome = empresas.find((e) => e.id === empresaId)?.nome ?? empresaId;
    for (const p of projetos) {
      for (const ent of p.entregaveis) {
        arr.push({
          id: `${empresaId}::${p.projeto}::${ent}`,
          empresaId,
          empresaNome,
          projeto: p.projeto,
          entregavel: ent,
          label: `${p.projeto} — ${ent}`,
        });
      }
    }
  }
  return arr;
})();

// Regra: timer só pode ser iniciado entre 08h e 18h, segunda a sábado.
function isHorarioPermitido(now: Date = new Date()): {
  permitido: boolean;
  motivo?: string;
} {
  const dia = now.getDay(); // 0=dom, 6=sáb
  const hora = now.getHours();
  if (dia === 0) return { permitido: false, motivo: "Timer indisponível aos domingos." };
  if (hora < 8) return { permitido: false, motivo: "Timer disponível a partir das 08h." };
  if (hora >= 18) return { permitido: false, motivo: "Horário encerrado — disponível das 08h às 18h." };
  return { permitido: true };
}

// ────────────────────────────────────────────────────────────────────
// Componente principal
// ────────────────────────────────────────────────────────────────────

export default function HorasPage() {
  const { usuario } = useAuth();
  const isAdmin = usuario?.role === "admin";
  const timerCtx = useTimerGlobal();

  // Lista do extrato
  const [lancamentos, setLancamentos] = useState<Lancamento[]>(lancamentosIniciais);
  const [proximoRequerRevisao, setProximoRequerRevisao] = useState(false);

  // ── Timer global ────────────────────────────────────────────────
  // Re-mount via key permite "encerrar programaticamente" sem alterar o componente Timer.
  const [timerKey, setTimerKey] = useState(0);
  const [timerAtivo, setTimerAtivo] = useState(false);
  const [confirmStartOpen, setConfirmStartOpen] = useState(false);
  const [confirmStopOpen, setConfirmStopOpen] = useState(false);
  const [segundosParaGravar, setSegundosParaGravar] = useState(0);
  const [etapaOpen, setEtapaOpen] = useState(false);
  const [etapaSelecionada, setEtapaSelecionada] = useState<string>("");
  const [segundosTimer, setSegundosTimer] = useState(0);
  const [manualAberto, setManualAberto] = useState<string>("");

  // Tarefa selecionada para o timer (empresa → projeto/entregável)
  const [tEmpresa, setTEmpresa] = useState<string>("");
  const [tTarefaId, setTTarefaId] = useState<string>("");
  const tarefasDaEmpresa = useMemo(
    () => tarefasFlat.filter((t) => t.empresaId === tEmpresa),
    [tEmpresa]
  );
  const tarefaAtiva = useMemo(
    () => tarefasFlat.find((t) => t.id === tTarefaId) ?? null,
    [tTarefaId]
  );

  // Deep-link: /app/horas?task_id=XXX ou ?taskId=XXX → pré-seleciona empresa + tarefa.
  // Aceita também o código do entregável (ENT-YYYY-XXXX) como fallback.
  const [searchParams] = useSearchParams();
  useEffect(() => {
    const taskId = searchParams.get("task_id") ?? searchParams.get("taskId");
    const entNome = searchParams.get("entregavel");
    const codigo = searchParams.get("codigo");

    if (taskId) {
      const tarefa =
        tarefasFlat.find((t) => t.id === taskId) ??
        tarefasFlat.find((t) => t.entregavel === taskId) ??
        tarefasFlat.find((t) => t.id.endsWith(`::${taskId}`));
      if (tarefa) {
        setTEmpresa(tarefa.empresaId);
        setTTarefaId(tarefa.id);
        toast.info(`Tarefa pré-selecionada: ${tarefa.label}`);
        return;
      }
      toast.error("Tarefa não encontrada para o link informado.");
      return;
    }

    if (entNome) {
      const decoded = decodeURIComponent(entNome);
      const tarefa = tarefasFlat.find((t) => t.entregavel === decoded);
      if (tarefa) {
        setTEmpresa(tarefa.empresaId);
        setTTarefaId(tarefa.id);
        toast.info(`Tarefa pré-selecionada: ${tarefa.label}`);
        return;
      }
      if (codigo) {
        toast.info(`Aberto para ${decoded} (${codigo}). Selecione a empresa manualmente.`);
      } else {
        toast.error("Tarefa não encontrada. Selecione manualmente.");
      }
    }
  }, [searchParams]);

  // Recalcula permissão de horário a cada minuto (botão Play habilita/desabilita sozinho)
  const [horarioCheck, setHorarioCheck] = useState(() => isHorarioPermitido());
  useEffect(() => {
    const i = window.setInterval(() => setHorarioCheck(isHorarioPermitido()), 60_000);
    return () => window.clearInterval(i);
  }, []);

  // Encerramento automático às 18h
  useEffect(() => {
    if (!timerAtivo) return;
    const interval = window.setInterval(() => {
      const agora = new Date();
      if (agora.getHours() >= 18) {
        encerrarAutomaticamente();
      }
    }, 30_000); // checa a cada 30s
    return () => window.clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timerAtivo]);

  function encerrarAutomaticamente() {
    if (segundosTimer > 0) {
      handleTimerStop(segundosTimer);
    }
    setTimerAtivo(false);
    setTimerKey((k) => k + 1);
    setSegundosTimer(0);
    setProximoRequerRevisao(true);
    if (tarefaAtiva) {
      setMEmpresa(tarefaAtiva.empresaId);
      setMProjeto(`${tarefaAtiva.projeto}::${tarefaAtiva.entregavel}`);
    }
    setManualAberto("manual");
    toast.warning("Timer encerrado automaticamente às 18h.", {
      description: "As horas foram registradas. Deseja ajustar?",
      action: {
        label: "Ajustar horas",
        onClick: () => {
          if (tarefaAtiva) {
            setMEmpresa(tarefaAtiva.empresaId);
            setMProjeto(`${tarefaAtiva.projeto}::${tarefaAtiva.entregavel}`);
          }
          setManualAberto("manual");
          window.scrollTo({ top: 400, behavior: "smooth" });
        },
      },
    });
  }

  function isVaga(tarefa: Tarefa | null): boolean {
    if (!tarefa) return false;
    const p = tarefa.projeto.toLowerCase();
    return p.includes("hunting") || p.includes("vaga") || p.includes("recolocação");
  }

  function handleIniciarTimer() {
    if (!horarioCheck.permitido) {
      toast.error(horarioCheck.motivo ?? "Fora do horário permitido.");
      return;
    }
    if (!tarefaAtiva) {
      toast.error("Selecione uma tarefa antes de iniciar o timer.");
      return;
    }
    if (timerAtivo) {
      // Regra: 1 timer ativo por consultor → confirmar encerramento do anterior
      setConfirmStartOpen(true);
      return;
    }
    if (isVaga(tarefaAtiva)) {
      setEtapaSelecionada("");
      setEtapaOpen(true);
      return;
    }
    setTimerAtivo(true);
  }

  function confirmarEtapaEIniciar() {
    if (!etapaSelecionada) {
      toast.error("Selecione a etapa antes de iniciar.");
      return;
    }
    setEtapaOpen(false);
    setTimerAtivo(true);
  }

  function confirmarEncerrarEReiniciar() {
    setConfirmStartOpen(false);
    setTimerKey((k) => k + 1); // re-monta zerando o anterior
    setTimerAtivo(true);
    toast.info("Timer anterior encerrado. Novo registro iniciado.");
  }

  function handleTimerStop(seconds: number) {
    setTimerAtivo(false);
    if (seconds > 0 && tarefaAtiva) {
      const horasReg = Number((seconds / 3600).toFixed(2));
      const novo: Lancamento = {
        id: `h${Date.now()}`,
        data: format(new Date(), "yyyy-MM-dd"),
        empresaId: tarefaAtiva.empresaId,
        empresaNome: tarefaAtiva.empresaNome,
        projeto: tarefaAtiva.projeto,
        entregavel: tarefaAtiva.entregavel,
        horas: horasReg,
        tipo: "timer",
        consultorId: "ab",
        consultorNome: "Ana Beatriz",
        requerRevisao: proximoRequerRevisao,
        etapaVaga: isVaga(tarefaAtiva) ? (etapaSelecionada as EtapaVaga) : undefined,
      };
      setLancamentos((prev) => [novo, ...prev]);
      setProximoRequerRevisao(false);
      setEtapaSelecionada("");
      toast.success(`Timer encerrado: ${horasReg.toFixed(2)}h registradas.`);
    } else if (seconds > 0) {
      toast.success(`Timer encerrado: ${(seconds / 3600).toFixed(2)}h registradas.`);
    }
  }

  // ── Lançamento manual ───────────────────────────────────────────
  const [mData, setMData] = useState<Date | undefined>(undefined);
  const [mEmpresa, setMEmpresa] = useState<string>("");
  const [mProjeto, setMProjeto] = useState<string>("");
  const [mInicio, setMInicio] = useState<string>("");   // "HH:mm"
  const [mFim, setMFim] = useState<string>("");          // "HH:mm"
  const [mJustificativa, setMJustificativa] = useState<string>("");

  // ── Interações externas ────────────────────────────────────────
  const [interacoes, setInteracoes] = useState<Interacao[]>([]);
  const [interacaoAberta, setInteracaoAberta] = useState<string>("");
  const [iCanal, setICanal] = useState<CanalInteracao>("WhatsApp");
  const [iEmpresa, setIEmpresa] = useState<string>("");
  const [iEntregavel, setIEntregavel] = useState<string>("");
  const [iData, setIData] = useState<Date | undefined>(undefined);
  const [iDuracao, setIDuracao] = useState<string>("");
  const [iDescricao, setIDescricao] = useState<string>("");

  function salvarInteracao(e: React.FormEvent) {
    e.preventDefault();
    if (!iCanal || !iEmpresa || !iData || !iDuracao || !iDescricao.trim()) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }
    const empresa = empresas.find((emp) => emp.id === iEmpresa);
    const nova: Interacao = {
      id: `int_${Date.now()}`,
      data: format(iData, "yyyy-MM-dd"),
      canal: iCanal,
      empresaId: iEmpresa,
      empresaNome: empresa?.nome ?? iEmpresa,
      entregavel: iEntregavel || undefined,
      duracaoMin: Number(iDuracao),
      descricao: iDescricao.trim(),
      consultorId: "ab",
      consultorNome: "Ana Beatriz",
    };
    setInteracoes((prev) => [nova, ...prev]);
    toast.success(`Interação via ${iCanal} registrada.`);
    setInteracaoAberta("");
    setICanal("WhatsApp"); setIEmpresa(""); setIEntregavel("");
    setIData(undefined); setIDuracao(""); setIDescricao("");
  }

  const projetosDisponiveis = useMemo(
    () => (mEmpresa ? projetosPorEmpresa[mEmpresa] ?? [] : []),
    [mEmpresa]
  );

  // Calcula duração em horas (decimal) a partir de "HH:mm" → "HH:mm".
  // Retorna null se inválido. Não cruza meia-noite (não permitido nesta versão).
  function calcularDuracao(inicio: string, fim: string): number | null {
    const [hi, mi] = inicio.split(":").map(Number);
    const [hf, mf] = fim.split(":").map(Number);
    if ([hi, mi, hf, mf].some((n) => !Number.isFinite(n))) return null;
    const minInicio = hi * 60 + mi;
    const minFim = hf * 60 + mf;
    if (minFim <= minInicio) return null;
    return Number(((minFim - minInicio) / 60).toFixed(2));
  }

  function handleSalvarManual(e: React.FormEvent) {
    e.preventDefault();
    if (!mData || !mEmpresa || !mProjeto || !mInicio || !mFim || !mJustificativa.trim()) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }
    const horasNum = calcularDuracao(mInicio, mFim);
    if (horasNum === null) {
      toast.error("A hora de fim deve ser maior que a hora de início.");
      return;
    }
    const empresa = empresas.find((e) => e.id === mEmpresa);
    const [projetoNome, entregavel] = mProjeto.split("::");
    const novo: Lancamento = {
      id: `h${Date.now()}`,
      data: format(mData, "yyyy-MM-dd"),
      empresaId: mEmpresa,
      empresaNome: empresa?.nome ?? mEmpresa,
      projeto: projetoNome,
      entregavel: entregavel ?? "—",
      horas: horasNum,
      tipo: "manual",
      consultorId: "ab",
      consultorNome: "Ana Beatriz",
      justificativa: mJustificativa.trim(),
      observacao: `Início ${mInicio} · Fim ${mFim}`,
    };
    setLancamentos((prev) => [novo, ...prev]);
    toast.success(`Lançamento manual registrado (${horasNum.toFixed(2)}h).`);
    // reset
    setMData(undefined);
    setMEmpresa("");
    setMProjeto("");
    setMInicio("");
    setMFim("");
    setMJustificativa("");
  }

  // ── Filtros do extrato ──────────────────────────────────────────
  const [fEmpresa, setFEmpresa] = useState<string>("todas");
  const [fConsultor, setFConsultor] = useState<string>("todos");
  const [fPeriodoInicio, setFPeriodoInicio] = useState<Date | undefined>();
  const [fPeriodoFim, setFPeriodoFim] = useState<Date | undefined>();

  const filtrados = useMemo(() => {
    return lancamentos.filter((l) => {
      if (!isAdmin && l.consultorId !== (usuario?.id ?? "ab")) return false;
      if (fEmpresa !== "todas" && l.empresaId !== fEmpresa) return false;
      if (fConsultor !== "todos" && l.consultorId !== fConsultor) return false;
      const d = new Date(l.data);
      if (fPeriodoInicio && d < fPeriodoInicio) return false;
      if (fPeriodoFim && d > fPeriodoFim) return false;
      return true;
    });
  }, [lancamentos, fEmpresa, fConsultor, fPeriodoInicio, fPeriodoFim, isAdmin, usuario]);

  const totalHoras = filtrados.reduce((acc, l) => acc + l.horas, 0);
  const totalTimer = filtrados.filter((l) => l.tipo === "timer").reduce((a, l) => a + l.horas, 0);
  const totalManual = filtrados.filter((l) => l.tipo === "manual").reduce((a, l) => a + l.horas, 0);

  // Linha expansível
  const [expandido, setExpandido] = useState<string | null>(null);

  function exportar() {
    toast.info("Exportação disponível na versão completa.");
  }

  return (
    <div>
      <PageHeader
        title="Horas"
        subtitle="Timer global, lançamento manual e extrato consolidado"
        actions={<StatusBadge status="andamento">Período em curso</StatusBadge>}
      />

      {/* ───────── 1. Timer Global ───────── */}
      <section className="bg-card border border-border rounded-xl p-5 mb-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <TimerIcon className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-sm">Timer global</h3>
              <p className="text-[11px] text-muted-foreground">
                Apenas 1 timer ativo por consultor · disponível 08h–18h, seg-sáb
              </p>
            </div>
          </div>
          {timerAtivo && (
            <span className="inline-flex items-center gap-1.5 text-[11px] text-success font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-success animate-soft-pulse" />
              Registrando agora
            </span>
          )}
        </div>

        {/* Seleção de tarefa para o timer (empresa → tarefa) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Empresa</Label>
            <Select
              value={tEmpresa}
              onValueChange={(v) => { setTEmpresa(v); setTTarefaId(""); }}
              disabled={timerAtivo}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Selecione a empresa" />
              </SelectTrigger>
              <SelectContent>
                {empresas
                  .filter((e) => projetosPorEmpresa[e.id])
                  .map((e) => (
                    <SelectItem key={e.id} value={e.id}>{e.nome}</SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Projeto / Entregável</Label>
            <Select
              value={tTarefaId}
              onValueChange={setTTarefaId}
              disabled={!tEmpresa || timerAtivo}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder={tEmpresa ? "Selecione a tarefa" : "Escolha a empresa primeiro"} />
              </SelectTrigger>
              <SelectContent>
                {tarefasDaEmpresa.map((t) => (
                  <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {timerAtivo ? (
          <div className="rounded-lg border border-border bg-background/40 p-4 flex items-center gap-4 flex-wrap">
            <Timer key={timerKey} onStop={handleTimerStop} onTick={(s) => setSegundosTimer(s)} />
            <div className="flex-1 min-w-[200px]">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Tarefa ativa</div>
              {tarefaAtiva ? (
                <div className="text-sm font-medium flex items-center gap-1.5">
                  <Briefcase className="h-3.5 w-3.5 text-primary" />
                  <span className="truncate">{tarefaAtiva.empresaNome} · {tarefaAtiva.label}</span>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground italic">Sem tarefa selecionada</div>
              )}
            </div>
            <span className="text-xs text-muted-foreground">
              Consultor: <span className="text-foreground font-medium">Ana Beatriz</span>
            </span>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-border bg-background/30 p-5 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-muted text-muted-foreground flex items-center justify-center">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-medium">Nenhum timer ativo</div>
                <div className="text-[11px] text-muted-foreground">
                  {tarefaAtiva
                    ? `Pronto para registrar: ${tarefaAtiva.label}`
                    : "Selecione uma empresa e uma tarefa para iniciar."}
                </div>
              </div>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span tabIndex={0}>
                    <Button
                      onClick={handleIniciarTimer}
                      disabled={!horarioCheck.permitido || !tarefaAtiva}
                      className="gap-1.5"
                    >
                      <Play className="h-4 w-4" /> Iniciar
                    </Button>
                  </span>
                </TooltipTrigger>
                {(!horarioCheck.permitido || !tarefaAtiva) && (
                  <TooltipContent>
                    {!horarioCheck.permitido
                      ? horarioCheck.motivo
                      : "Selecione uma tarefa antes de iniciar o timer."}
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
      </section>

      {/* ───────── 2. Lançamento Manual ───────── */}
      <section className="bg-card border border-border rounded-xl mb-6 overflow-hidden">
        <Accordion type="single" collapsible value={manualAberto} onValueChange={setManualAberto}>
          <AccordionItem value="manual" className="border-none">
            <AccordionTrigger className="px-5 py-4 hover:no-underline">
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-lg bg-warning/15 text-warning flex items-center justify-center">
                  <PenSquare className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <h3 className="font-display font-semibold text-sm">Lançamento manual</h3>
                  <p className="text-[11px] text-muted-foreground font-normal">
                    Para horas trabalhadas fora do timer
                  </p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-5 pb-5">
              <form onSubmit={handleSalvarManual} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Data */}
                <div className="space-y-1.5">
                  <Label htmlFor="m-data">Data <span className="text-destructive">*</span></Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="m-data"
                        variant="outline"
                        type="button"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !mData && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {mData ? format(mData, "dd 'de' MMMM yyyy", { locale: ptBR }) : "Selecione uma data"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={mData}
                        onSelect={setMData}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Empresa */}
                <div className="space-y-1.5">
                  <Label>Empresa <span className="text-destructive">*</span></Label>
                  <Select value={mEmpresa} onValueChange={(v) => { setMEmpresa(v); setMProjeto(""); }}>
                    <SelectTrigger><SelectValue placeholder="Selecione a empresa" /></SelectTrigger>
                    <SelectContent>
                      {empresas.filter((e) => projetosPorEmpresa[e.id]).map((e) => (
                        <SelectItem key={e.id} value={e.id}>{e.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Projeto / Entregável */}
                <div className="space-y-1.5 md:col-span-2">
                  <Label>Projeto / Entregável <span className="text-destructive">*</span></Label>
                  <Select value={mProjeto} onValueChange={setMProjeto} disabled={!mEmpresa}>
                    <SelectTrigger>
                      <SelectValue placeholder={mEmpresa ? "Selecione um entregável" : "Escolha a empresa primeiro"} />
                    </SelectTrigger>
                    <SelectContent>
                      {projetosDisponiveis.map((p) =>
                        p.entregaveis.map((ent) => (
                          <SelectItem key={`${p.projeto}::${ent}`} value={`${p.projeto}::${ent}`}>
                            {p.projeto} — {ent}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Hora início / Hora fim — cálculo automático da duração */}
                <div className="space-y-1.5">
                  <Label htmlFor="m-inicio">Hora início <span className="text-destructive">*</span></Label>
                  <Input
                    id="m-inicio"
                    type="time"
                    value={mInicio}
                    onChange={(e) => setMInicio(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="m-fim">Hora fim <span className="text-destructive">*</span></Label>
                  <Input
                    id="m-fim"
                    type="time"
                    value={mFim}
                    onChange={(e) => setMFim(e.target.value)}
                  />
                  {mInicio && mFim && (
                    (() => {
                      const dur = calcularDuracao(mInicio, mFim);
                      return dur === null ? (
                        <p className="text-[10px] text-destructive">A hora de fim deve ser maior que a de início.</p>
                      ) : (
                        <p className="text-[10px] text-muted-foreground">Duração calculada: <span className="text-foreground font-data">{dur.toFixed(2)}h</span></p>
                      );
                    })()
                  )}
                </div>

                {/* Justificativa (oculta do cliente) */}
                <div className="space-y-1.5 md:col-span-2">
                  <Label htmlFor="m-just">
                    Justificativa interna <span className="text-destructive">*</span>
                    <span className="ml-1 text-[10px] font-normal text-muted-foreground">(não visível ao cliente)</span>
                  </Label>
                  <Textarea
                    id="m-just"
                    rows={3}
                    placeholder="Descreva o motivo do lançamento manual…"
                    value={mJustificativa}
                    onChange={(e) => setMJustificativa(e.target.value)}
                  />
                </div>

                <div className="md:col-span-2 flex items-center justify-end gap-2">
                  <Button type="submit">Salvar lançamento</Button>
                </div>
              </form>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>

      {/* ───────── 2b. Interações externas ───────── */}
      <section className="bg-card border border-border rounded-xl mb-6 overflow-hidden">
        <Accordion type="single" collapsible value={interacaoAberta} onValueChange={setInteracaoAberta}>
          <AccordionItem value="interacao" className="border-none">
            <AccordionTrigger className="px-5 py-4 hover:no-underline">
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-lg bg-info/15 text-info flex items-center justify-center">
                  <MessageSquare className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <h3 className="font-display font-semibold text-sm">Registrar interação externa</h3>
                  <p className="text-[11px] text-muted-foreground font-normal">
                    WhatsApp, e-mail, ligação, visita presencial
                  </p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-5 pb-5">
              <form onSubmit={salvarInteracao} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Canal */}
                <div className="space-y-1.5 md:col-span-2">
                  <Label>Canal <span className="text-destructive">*</span></Label>
                  <div className="flex flex-wrap gap-2">
                    {(["WhatsApp","E-mail","Ligação","Visita presencial","Outro"] as CanalInteracao[]).map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setICanal(c)}
                        className={cn(
                          "px-3 py-1.5 rounded-full border text-xs transition-colors",
                          iCanal === c
                            ? "border-primary bg-primary/10 text-primary font-medium"
                            : "border-border hover:bg-secondary/50"
                        )}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Data */}
                <div className="space-y-1.5">
                  <Label>Data <span className="text-destructive">*</span></Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        type="button"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !iData && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {iData ? format(iData, "dd 'de' MMMM yyyy", { locale: ptBR }) : "Selecione uma data"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={iData}
                        onSelect={setIData}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Empresa */}
                <div className="space-y-1.5">
                  <Label>Empresa <span className="text-destructive">*</span></Label>
                  <Select value={iEmpresa} onValueChange={setIEmpresa}>
                    <SelectTrigger><SelectValue placeholder="Selecione a empresa" /></SelectTrigger>
                    <SelectContent>
                      {empresas.filter((e) => projetosPorEmpresa[e.id]).map((e) => (
                        <SelectItem key={e.id} value={e.id}>{e.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Duração estimada */}
                <div className="space-y-1.5">
                  <Label>Duração estimada (min) <span className="text-destructive">*</span></Label>
                  <Input
                    type="number"
                    min={1}
                    value={iDuracao}
                    onChange={(e) => setIDuracao(e.target.value)}
                    placeholder="Ex: 15"
                  />
                  {iDuracao && Number(iDuracao) > 0 && (
                    <p className="text-[10px] text-muted-foreground">
                      {Math.floor(Number(iDuracao) / 60) > 0
                        ? `${Math.floor(Number(iDuracao) / 60)}h `
                        : ""}
                      {Number(iDuracao) % 60}min
                    </p>
                  )}
                </div>

                {/* Entregável relacionado (opcional) */}
                <div className="space-y-1.5">
                  <Label>
                    Entregável relacionado
                    <span className="ml-1 text-[10px] font-normal text-muted-foreground">(opcional)</span>
                  </Label>
                  <Input
                    value={iEntregavel}
                    onChange={(e) => setIEntregavel(e.target.value)}
                    placeholder="Nome do entregável (se aplicável)"
                  />
                </div>

                {/* Descrição */}
                <div className="space-y-1.5 md:col-span-2">
                  <Label>Descrição breve <span className="text-destructive">*</span></Label>
                  <Textarea
                    rows={3}
                    value={iDescricao}
                    onChange={(e) => setIDescricao(e.target.value)}
                    placeholder="Resumo da interação…"
                  />
                </div>

                <div className="md:col-span-2 flex justify-end">
                  <Button type="submit">Registrar interação</Button>
                </div>
              </form>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>

      {/* ───────── 3. Extrato de Horas ───────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        <KpiCard label="Total no período" value={`${totalHoras.toFixed(2)}h`} icon={Clock} />
        <KpiCard label="Via timer" value={`${totalTimer.toFixed(2)}h`} icon={TimerIcon} hint={`${filtrados.filter(l => l.tipo === "timer").length} entradas`} />
        <KpiCard label="Manuais" value={`${totalManual.toFixed(2)}h`} icon={PenSquare} hint={`${filtrados.filter(l => l.tipo === "manual").length} entradas`} />
      </div>

      <section className="bg-card border border-border rounded-xl overflow-hidden">
        {/* Filtros */}
        <div className="p-4 border-b border-border flex items-center gap-3 flex-wrap">
          <Filter className="h-4 w-4 text-muted-foreground" />

          <Select value={fEmpresa} onValueChange={setFEmpresa}>
            <SelectTrigger className="h-9 w-[180px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas as empresas</SelectItem>
              {empresas.map((e) => (
                <SelectItem key={e.id} value={e.id}>{e.nome}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {isAdmin && (
            <Select value={fConsultor} onValueChange={setFConsultor}>
              <SelectTrigger className="h-9 w-[180px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os consultores</SelectItem>
                {consultores.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 font-normal">
                <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                {fPeriodoInicio
                  ? format(fPeriodoInicio, "dd/MM/yy", { locale: ptBR })
                  : "Início"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={fPeriodoInicio} onSelect={setFPeriodoInicio} initialFocus className={cn("p-3 pointer-events-auto")} />
            </PopoverContent>
          </Popover>

          <span className="text-xs text-muted-foreground">→</span>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 font-normal">
                <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                {fPeriodoFim
                  ? format(fPeriodoFim, "dd/MM/yy", { locale: ptBR })
                  : "Fim"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={fPeriodoFim} onSelect={setFPeriodoFim} initialFocus className={cn("p-3 pointer-events-auto")} />
            </PopoverContent>
          </Popover>

          {(fEmpresa !== "todas" || fConsultor !== "todos" || fPeriodoInicio || fPeriodoFim) && (
            <button
              type="button"
              onClick={() => { setFEmpresa("todas"); setFConsultor("todos"); setFPeriodoInicio(undefined); setFPeriodoFim(undefined); }}
              className="text-xs text-primary hover:underline"
            >
              Limpar
            </button>
          )}

          <Button variant="outline" size="sm" onClick={exportar} className="ml-auto h-9">
            <Download className="mr-2 h-3.5 w-3.5" /> Exportar
          </Button>
        </div>

        {/* Tabela */}
        {filtrados.length === 0 ? (
          <EmptyState
            icon={Clock}
            title="Nenhum lançamento no período"
            description="Ajuste os filtros ou registre um novo lançamento manual."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary/40 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="w-8" />
                  <th className="text-left font-medium px-4 py-3">Data</th>
                  <th className="text-left font-medium px-4 py-3">Empresa</th>
                  <th className="text-left font-medium px-4 py-3">Projeto</th>
                  <th className="text-left font-medium px-4 py-3">Entregável</th>
                  <th className="text-right font-medium px-4 py-3">Horas</th>
                  <th className="text-left font-medium px-4 py-3">Tipo</th>
                  <th className="text-left font-medium px-4 py-3">Consultor</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map((l) => {
                  const isOpen = expandido === l.id;
                  const obsVisivel = Boolean(l.observacao && !l.observacao.startsWith("Início"));
                  const hasDetalhe = Boolean(l.justificativa || obsVisivel);
                  return (
                    <>
                      <tr
                        key={l.id}
                        onClick={() => hasDetalhe && setExpandido(isOpen ? null : l.id)}
                        className={cn(
                          "border-t border-border transition-colors",
                          hasDetalhe ? "cursor-pointer hover:bg-secondary/30" : ""
                        )}
                      >
                        <td className="px-2 py-3 text-muted-foreground">
                          {hasDetalhe ? (
                            isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
                          ) : null}
                        </td>
                        <td className="px-4 py-3 font-data text-xs">
                          {format(new Date(l.data), "dd/MM/yy", { locale: ptBR })}
                        </td>
                        <td className="px-4 py-3 font-medium">{l.empresaNome}</td>
                        <td className="px-4 py-3 text-muted-foreground">{l.projeto}</td>
                        <td className="px-4 py-3 text-muted-foreground">
                          <div>{l.entregavel}</div>
                          {l.etapaVaga && (
                            <div className="text-[10px] text-primary mt-0.5">Etapa: {l.etapaVaga}</div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right font-data tabular-nums">{l.horas.toFixed(2)}h</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {l.tipo === "timer" ? (
                              <span className="badge-pill bg-info/15 text-info border-info/30">
                                <TimerIcon className="h-3 w-3" /> Timer
                              </span>
                            ) : (
                              <span className="badge-pill bg-warning/15 text-warning border-warning/30">
                                <PenSquare className="h-3 w-3" /> Manual
                              </span>
                            )}
                            {l.requerRevisao && (
                              <span className="badge-pill bg-destructive/15 text-destructive border-destructive/30">
                                <AlertTriangle className="h-3 w-3" /> Revisar
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs">{l.consultorNome}</td>
                      </tr>
                      {isOpen && hasDetalhe && (
                        <tr key={`${l.id}-det`} className="bg-secondary/20 border-t border-border">
                          <td />
                          <td colSpan={7} className="px-4 py-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                              {l.justificativa && (
                                <div>
                                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1">
                                    <AlertTriangle className="h-3 w-3" /> Justificativa interna
                                  </div>
                                  <p className="text-foreground">{l.justificativa}</p>
                                </div>
                              )}
                              {l.observacao && !l.observacao.startsWith("Início") && (
                                <div>
                                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                                    Observação adicional
                                  </div>
                                  <p className="text-foreground">{l.observacao}</p>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {interacoes.length > 0 && (
          <div className="mt-4 border-t border-border pt-4">
            <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground px-4 mb-2">
              Interações externas registradas
            </h4>
            <table className="w-full text-sm">
              <thead className="bg-secondary/40 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="text-left font-medium px-4 py-2">Data</th>
                  <th className="text-left font-medium px-4 py-2">Canal</th>
                  <th className="text-left font-medium px-4 py-2">Empresa</th>
                  <th className="text-left font-medium px-4 py-2">Descrição</th>
                  <th className="text-right font-medium px-4 py-2">Duração</th>
                </tr>
              </thead>
              <tbody>
                {interacoes.map((int) => (
                  <tr key={int.id} className="border-t border-border hover:bg-secondary/20">
                    <td className="px-4 py-2 font-data text-xs">
                      {format(new Date(int.data), "dd/MM/yy", { locale: ptBR })}
                    </td>
                    <td className="px-4 py-2">
                      <span className="badge-pill bg-info/15 text-info border-info/30">
                        {int.canal}
                      </span>
                    </td>
                    <td className="px-4 py-2">{int.empresaNome}</td>
                    <td className="px-4 py-2 text-muted-foreground text-xs max-w-[200px] truncate">
                      {int.descricao}
                    </td>
                    <td className="px-4 py-2 text-right font-data text-xs">
                      {Math.floor(int.duracaoMin / 60) > 0
                        ? `${Math.floor(int.duracaoMin / 60)}h `
                        : ""}
                      {int.duracaoMin % 60}min
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Dialog: bloqueio de segundo timer simultâneo */}
      <Dialog open={confirmStartOpen} onOpenChange={setConfirmStartOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Não é possível iniciar dois timers ao mesmo tempo</DialogTitle>
            <DialogDescription>
              Já existe um timer ativo para outra tarefa. A regra da Azumi permite apenas
              um timer ativo por consultor para garantir o registro correto das horas.
              <br />
              <br />
              Para iniciar este novo registro, é necessário encerrar o timer atual primeiro.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmStartOpen(false)}>
              Manter timer atual
            </Button>
            <Button onClick={confirmarEncerrarEReiniciar}>
              Encerrar atual e iniciar novo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: seleção de etapa para timer de vaga */}
      <Dialog open={etapaOpen} onOpenChange={(o) => !o && setEtapaOpen(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Em qual etapa você está trabalhando?</DialogTitle>
            <DialogDescription>
              {tarefaAtiva?.label} — selecione a etapa para registrar
              as horas corretamente no relatório da vaga.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            {ETAPAS_VAGA.map((etapa) => (
              <button
                key={etapa}
                type="button"
                onClick={() => setEtapaSelecionada(etapa)}
                className={cn(
                  "w-full text-left px-4 py-2.5 rounded-lg border text-sm transition-colors",
                  etapaSelecionada === etapa
                    ? "border-primary bg-primary/10 text-primary font-medium"
                    : "border-border hover:bg-secondary/50"
                )}
              >
                {etapa}
              </button>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEtapaOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={confirmarEtapaEIniciar} disabled={!etapaSelecionada}>
              Iniciar timer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
