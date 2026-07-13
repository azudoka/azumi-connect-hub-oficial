import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Briefcase, Plus, LayoutGrid, List as ListIcon, Filter,
  CalendarIcon, ArrowRight, AlertTriangle, CheckCircle2, Clock, PauseCircle,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/PageHeader";
import { ConnectStatCard } from "@/components/ConnectStatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

import { empresas, consultores } from "@/data/mock";
import { useAuth } from "@/context/AuthContext";

// ────────────────────────────────────────────────────────────────────
// Tipos / mocks locais
// ────────────────────────────────────────────────────────────────────

type ProjetoStatus = "em_andamento" | "aguardando_cliente" | "ajuste_solicitado" | "encerrado";
type FrenteAtuacao = "atracao" | "consultoria" | "dp" | "juridico" | "estrategia";

interface Projeto {
  id: string;
  codigo: string;
  titulo: string;
  empresaId: string;
  empresaNome: string;
  filial: string;
  consultorId: string;
  consultorNome: string;
  consultorIniciais: string;
  /** ID do consultor atribuído (regra de visibilidade — perfil consultor só vê seus). */
  assignedConsultorId: string;
  frente: FrenteAtuacao;
  status: ProjetoStatus;
  conclusao: number;
  prazoFinal: string;     // yyyy-MM-dd
  encerradoEm?: string;
}

interface CronogramaPendente {
  id: string;
  codigo: string;
  empresaNome: string;
  consultorNome: string;
  /** B03: "rascunho" passa a existir e é o estado para o qual qualquer
      edição de cronograma já aprovado é forçada antes de reenviar. */
  status: "rascunho" | "aguardando_aprovacao_interna" | "aguardando_aprovacao_cliente";
  criadoEm: string;
}

const frenteLabels: Record<FrenteAtuacao, string> = {
  atracao: "Atração & Hunting",
  consultoria: "Consultoria de RH",
  dp: "Departamento Pessoal",
  juridico: "Jurídico",
  estrategia: "Estratégia",
};

const statusLabels: Record<ProjetoStatus, string> = {
  em_andamento: "Em andamento",
  aguardando_cliente: "Aguardando cliente",
  ajuste_solicitado: "Ajuste solicitado",
  encerrado: "Encerrado",
};

const statusToBadge: Record<ProjetoStatus, "andamento" | "aguardando" | "atrasada" | "concluida"> = {
  em_andamento: "andamento",
  aguardando_cliente: "aguardando",
  ajuste_solicitado: "atrasada",
  encerrado: "concluida",
};

const projetosIniciais: Projeto[] = [
  {
    id: "p1", codigo: "PROJ-2026-0001", titulo: "Mapeamento de Cargos",
    empresaId: "kentaki", empresaNome: "Kentaki Foods", filial: "São Paulo — Matriz",
    consultorId: "ab", consultorNome: "Ana Beatriz", consultorIniciais: "AB",
    assignedConsultorId: "ab",
    frente: "consultoria", status: "em_andamento", conclusao: 62, prazoFinal: "2026-05-30",
  },
  {
    id: "p2", codigo: "PROJ-2026-0002", titulo: "Hunting — Gerente TI",
    empresaId: "kentaki", empresaNome: "Kentaki Foods", filial: "São Paulo — Matriz",
    consultorId: "ab", consultorNome: "Ana Beatriz", consultorIniciais: "AB",
    assignedConsultorId: "ab",
    frente: "atracao", status: "em_andamento", conclusao: 45, prazoFinal: "2026-04-15",
  },
  {
    id: "p3", codigo: "PROJ-2026-0003", titulo: "Estruturação de RH",
    empresaId: "mira", empresaNome: "Studio Mira", filial: "Curitiba",
    consultorId: "ct", consultorNome: "Camila Torres", consultorIniciais: "CT",
    assignedConsultorId: "ct",
    frente: "consultoria", status: "em_andamento", conclusao: 78, prazoFinal: "2026-06-20",
  },
  {
    id: "p4", codigo: "PROJ-2026-0004", titulo: "Go to Market",
    empresaId: "alvo", empresaNome: "Alvo Digital", filial: "São Paulo",
    consultorId: "rm", consultorNome: "Rafael Moura", consultorIniciais: "RM",
    assignedConsultorId: "rm",
    frente: "estrategia", status: "aguardando_cliente", conclusao: 35, prazoFinal: "2026-07-10",
  },
  {
    id: "p5", codigo: "PROJ-2026-0005", titulo: "Implantação de PDP",
    empresaId: "maverick", empresaNome: "Grupo Maverick", filial: "Curitiba",
    consultorId: "rm", consultorNome: "Rafael Moura", consultorIniciais: "RM",
    assignedConsultorId: "rm",
    frente: "dp", status: "aguardando_cliente", conclusao: 20, prazoFinal: "2026-08-01",
  },
  {
    id: "p6", codigo: "PROJ-2026-0006", titulo: "Revisão de políticas internas",
    empresaId: "techplural", empresaNome: "Tech Plural", filial: "Remoto",
    consultorId: "ab", consultorNome: "Ana Beatriz", consultorIniciais: "AB",
    assignedConsultorId: "ab",
    frente: "juridico", status: "ajuste_solicitado", conclusao: 55, prazoFinal: "2026-04-30",
  },
  {
    id: "p7", codigo: "PROJ-2025-0042", titulo: "Programa de liderança 2025",
    empresaId: "mira", empresaNome: "Studio Mira", filial: "Curitiba",
    consultorId: "ct", consultorNome: "Camila Torres", consultorIniciais: "CT",
    assignedConsultorId: "ct",
    frente: "consultoria", status: "encerrado", conclusao: 100, prazoFinal: "2025-12-15",
    encerradoEm: "2025-12-12",
  },
  {
    id: "p8", codigo: "PROJ-2025-0043", titulo: "Reestruturação comercial",
    empresaId: "alvo", empresaNome: "Alvo Digital", filial: "São Paulo",
    consultorId: "rm", consultorNome: "Rafael Moura", consultorIniciais: "RM",
    assignedConsultorId: "rm",
    frente: "estrategia", status: "encerrado", conclusao: 82, prazoFinal: "2025-11-30",
    encerradoEm: "2025-12-05",
  },
];

const cronogramasIniciais: CronogramaPendente[] = [
  {
    id: "cr1", codigo: "CRON-2026-0008", empresaNome: "Alvo Digital", consultorNome: "Rafael Moura",
    status: "aguardando_aprovacao_interna", criadoEm: "2026-04-18",
  },
  {
    id: "cr2", codigo: "CRON-2026-0009", empresaNome: "Tech Plural", consultorNome: "Ana Beatriz",
    status: "aguardando_aprovacao_cliente", criadoEm: "2026-04-20",
  },
  {
    id: "cr3", codigo: "CRON-2026-0010", empresaNome: "Kentaki Foods", consultorNome: "Ana Beatriz",
    status: "aguardando_aprovacao_cliente", criadoEm: "2026-04-22",
  },
];

const filiaisPorEmpresa: Record<string, string[]> = {
  kentaki: ["São Paulo — Matriz", "Campinas"],
  maverick: ["Curitiba", "São José dos Pinhais"],
  mira: ["Curitiba"],
  techplural: ["Remoto"],
  alvo: ["São Paulo"],
};

// ────────────────────────────────────────────────────────────────────
// Regra de visibilidade — perfil + consultor logado (via AuthContext).
// Admin vê tudo; consultor vê apenas projetos onde assignedConsultorId
// === usuario.id (mock atual usa "ab" | "ct" | "rm").
// ────────────────────────────────────────────────────────────────────


// ────────────────────────────────────────────────────────────────────
// Página
// ────────────────────────────────────────────────────────────────────

const VIEW_KEY = "projetos:view";

export default function ProjetosPage() {
  const [projetos, setProjetos] = useState<Projeto[]>(projetosIniciais);
  const [cronogramas, setCronogramas] = useState<CronogramaPendente[]>(cronogramasIniciais);

  // ─── B03 ─────────────────────────────────────────────────────────
  // Toda edição de cronograma com status diferente de "rascunho" precisa
  // forçar status = "rascunho" antes de persistir, e notificar o consultor
  // para que ele reenvie. Esta função fica disponível para qualquer fluxo
  // futuro de edição (UI ainda não existe).
  function atualizarCronograma(id: string, patch: Partial<CronogramaPendente>) {
    setCronogramas((prev) =>
      prev.map((cr) => {
        if (cr.id !== id) return cr;
        const merged = { ...cr, ...patch };
        if (cr.status !== "rascunho") {
          // Edição em cronograma já enviado → volta a rascunho e avisa o consultor.
          merged.status = "rascunho";
          toast.info(
            `Cronograma ${cr.codigo} voltou para rascunho.`,
            { description: `Reenvie para aprovação. Notificação enviada a ${cr.consultorNome}.` }
          );
        }
        return merged;
      })
    );
  }
  // Exposto via ref de módulo — evita o lint "no-unused-vars" enquanto não
  // há UI de edição. Remova esta linha quando a UI consumir a função.
  void atualizarCronograma;

  // Toggle Lista/Kanban com persistência
  const [view, setView] = useState<"lista" | "tabela" | "kanban">(() => {
    if (typeof window === "undefined") return "lista";
    return (localStorage.getItem(VIEW_KEY) as "lista" | "tabela" | "kanban") ?? "lista";
  });
  useEffect(() => {
    localStorage.setItem(VIEW_KEY, view);
  }, [view]);

  // Filtros
  const [fEmpresa, setFEmpresa] = useState("todas");
  const [fConsultor, setFConsultor] = useState("todos");
  const [fStatus, setFStatus] = useState<"todos" | ProjetoStatus>("todos");
  const [fFrente, setFFrente] = useState<"todas" | FrenteAtuacao>("todas");

  // Perfil + ID do consultor logado (via AuthContext)
  const { usuario } = useAuth();
  const isConsultor = usuario?.role === "consultor";
  const consultorLogadoId = usuario?.id ?? "";

  // Visibilidade por perfil: admin vê tudo; consultor vê só os atribuídos a ele.
  const projetosVisiveis = useMemo(() => {
    if (isConsultor) {
      return projetos.filter((p) => p.assignedConsultorId === consultorLogadoId);
    }
    return projetos;
  }, [projetos, isConsultor, consultorLogadoId]);

  const projetosVigentes = useMemo(
    () => projetosVisiveis.filter((p) => p.status !== "encerrado"),
    [projetosVisiveis]
  );
  const projetosEncerrados = useMemo(
    () => projetosVisiveis.filter((p) => p.status === "encerrado"),
    [projetosVisiveis]
  );

  const filtrados = useMemo(() => {
    return projetosVigentes.filter((p) => {
      if (fEmpresa !== "todas" && p.empresaId !== fEmpresa) return false;
      if (fConsultor !== "todos" && p.consultorId !== fConsultor) return false;
      if (fStatus !== "todos" && p.status !== fStatus) return false;
      if (fFrente !== "todas" && p.frente !== fFrente) return false;
      return true;
    });
  }, [projetosVigentes, fEmpresa, fConsultor, fStatus, fFrente]);

  const kpis = useMemo(() => ({
    total: projetosVigentes.length,
    andamento: projetosVigentes.filter((p) => p.status === "em_andamento").length,
    aguardando: projetosVigentes.filter((p) => p.status === "aguardando_cliente").length,
    ajuste: projetosVigentes.filter((p) => p.status === "ajuste_solicitado").length,
  }), [projetosVigentes]);

  // ─── Dialogs de criação ─────────────────────────────────────────
  const [cronOpen, setCronOpen] = useState(false);
  const [cEmpresa, setCEmpresa] = useState("");
  const [cFilial, setCFilial] = useState("");
  const [cConsultor, setCConsultor] = useState("");
  const [cTitulo, setCTitulo] = useState("");
  const [cInicio, setCInicio] = useState<Date | undefined>();
  const [cFim, setCFim] = useState<Date | undefined>();
  const filiaisDisp = cEmpresa ? filiaisPorEmpresa[cEmpresa] ?? [] : [];

  function resetCron() {
    setCEmpresa(""); setCFilial(""); setCConsultor("");
    setCTitulo(""); setCInicio(undefined); setCFim(undefined);
  }
  function salvarCronograma(e: React.FormEvent) {
    e.preventDefault();
    if (!cEmpresa || !cFilial || !cConsultor || !cTitulo.trim() || !cInicio || !cFim) {
      toast.error("Preencha todos os campos do cronograma.");
      return;
    }
    if (cFim < cInicio) {
      toast.error("A data de término deve ser posterior à data de início.");
      return;
    }
    const empresa = empresas.find((e) => e.id === cEmpresa);
    const consultor = consultores.find((c) => c.id === cConsultor);
    const novo: CronogramaPendente = {
      id: `cr${Date.now()}`,
      codigo: `CRON-2026-${String(cronogramas.length + 11).padStart(4, "0")}`,
      empresaNome: empresa?.nome ?? "—",
      consultorNome: consultor?.nome ?? "—",
      status: "aguardando_aprovacao_interna",
      criadoEm: format(new Date(), "yyyy-MM-dd"),
    };
    setCronogramas((prev) => [novo, ...prev]);
    toast.success("Cronograma criado. Aguardando aprovação interna.");
    resetCron();
    setCronOpen(false);
  }

  const [projOpen, setProjOpen] = useState(false);
  const [pEmpresa, setPEmpresa] = useState("");
  const [pTitulo, setPTitulo] = useState("");
  const [pConsultor, setPConsultor] = useState("");

  function resetProj() { setPEmpresa(""); setPTitulo(""); setPConsultor(""); }
  function salvarProjeto(e: React.FormEvent) {
    e.preventDefault();
    if (!pEmpresa || !pTitulo.trim() || !pConsultor) {
      toast.error("Preencha todos os campos do projeto.");
      return;
    }
    const empresa = empresas.find((e) => e.id === pEmpresa);
    const consultor = consultores.find((c) => c.id === pConsultor);
    const novo: Projeto = {
      id: `p${Date.now()}`,
      codigo: `PROJ-2026-${String(projetos.length + 8).padStart(4, "0")}`,
      titulo: pTitulo.trim(),
      empresaId: pEmpresa,
      empresaNome: empresa?.nome ?? "—",
      filial: filiaisPorEmpresa[pEmpresa]?.[0] ?? "—",
      consultorId: pConsultor,
      consultorNome: consultor?.nome ?? "—",
      consultorIniciais: consultor?.iniciais ?? "??",
      assignedConsultorId: pConsultor,
      frente: "consultoria",
      status: "em_andamento",
      conclusao: 0,
      prazoFinal: format(new Date(Date.now() + 60 * 24 * 3600 * 1000), "yyyy-MM-dd"),
    };
    setProjetos((prev) => [novo, ...prev]);
    toast.success("Projeto criado com sucesso.");
    resetProj();
    setProjOpen(false);
  }

  // ─── Encerramento de projeto ─────────────────────────────────────
  const [encerrarOpen, setEncerrarOpen] = useState(false);
  const [projetoParaEncerrar, setProjetoParaEncerrar] = useState<Projeto | null>(null);

  const [enviarCronOpen, setEnviarCronOpen] = useState(false);
  const [cronParaEnviar, setCronParaEnviar] = useState<CronogramaPendente | null>(null);

  function confirmarEncerramento() {
    if (!projetoParaEncerrar) return;
    setProjetos((prev) =>
      prev.map((p) =>
        p.id === projetoParaEncerrar.id
          ? {
              ...p,
              status: "encerrado" as ProjetoStatus,
              encerradoEm: format(new Date(), "yyyy-MM-dd"),
            }
          : p
      )
    );
    toast.success(`Projeto "${projetoParaEncerrar.titulo}" encerrado.`, {
      description: "Movido para a aba Encerrados.",
    });
    setEncerrarOpen(false);
    setProjetoParaEncerrar(null);
  }

  // ─── Helpers ────────────────────────────────────────────────────
  const hoje = new Date();
  function isAtrasado(p: Projeto) {
    return new Date(p.prazoFinal) < hoje && p.status !== "encerrado";
  }

  const colunasKanban: { status: ProjetoStatus; label: string; icon: typeof Clock }[] = [
    { status: "em_andamento",       label: "Em andamento",       icon: Clock },
    { status: "aguardando_cliente", label: "Aguardando cliente", icon: PauseCircle },
    { status: "ajuste_solicitado",  label: "Ajuste solicitado",  icon: AlertTriangle },
  ];

  return (
    <div>
      <PageHeader
        title="Projetos"
        subtitle={isConsultor ? "Projetos que você conduz na Azumi." : "Cronogramas, projetos vigentes e encerrados"}
        actions={
          <>
            <Button variant="outline" onClick={() => setCronOpen(true)} className="gap-1.5">
              <Plus className="h-4 w-4" /> Novo Cronograma
            </Button>
            <Button onClick={() => setProjOpen(true)} className="gap-1.5">
              <Plus className="h-4 w-4" /> Novo Projeto
            </Button>
          </>
        }
      />

      {isConsultor && (
        <div className="mb-5 rounded-xl border border-[hsl(var(--info)/0.3)] bg-[hsl(var(--info)/0.1)] px-4 py-3 flex items-start gap-3">
          <Briefcase className="h-4 w-4 text-info shrink-0 mt-0.5" />
          <div>
            <div className="text-sm font-medium text-info">Visão de consultor</div>
            <div className="text-xs text-[hsl(var(--info)/0.8)] mt-0.5">
              Você está vendo apenas os projetos atribuídos a você.
            </div>
          </div>
        </div>
      )}

      <Tabs defaultValue="vigentes" className="w-full">
        <TabsList className="mb-5">
          <TabsTrigger value="vigentes">Projetos Vigentes</TabsTrigger>
          <TabsTrigger value="cronogramas">Cronogramas Pendentes</TabsTrigger>
          <TabsTrigger value="encerrados">Encerrados</TabsTrigger>
        </TabsList>

        {/* ───────── Projetos Vigentes ───────── */}
        <TabsContent value="vigentes" className="mt-0 space-y-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 items-start">
            <ConnectStatCard variant="stat" icon="solar:folder-bold-duotone" tone="blue" label="Total de projetos" value={kpis.total} />
            <ConnectStatCard
              variant="radial"
              label="Em andamento"
              percent={kpis.total > 0 ? (kpis.andamento / kpis.total) * 100 : 0}
              contextLabel={`${kpis.andamento} de ${kpis.total} projetos`}
            />
            <ConnectStatCard variant="stat" icon="solar:hourglass-bold-duotone" tone="amber" label="Aguardando cliente" value={kpis.aguardando} />
            <ConnectStatCard
              variant="list"
              label="Ajuste solicitado"
              items={projetosVigentes
                .filter((p) => p.status === "ajuste_solicitado")
                .slice(0, 3)
                .map((p) => ({ label: p.titulo, tone: "amber" as const }))}
              footer={`${kpis.ajuste} projeto${kpis.ajuste === 1 ? "" : "s"} no total`}
            />
          </div>

          {/* Filtros + toggle */}
          <div className="bg-card rounded-xl shadow-[0_1px_4px_rgba(133,146,173,0.2)] p-4 flex items-center gap-3 flex-wrap">
            <Filter className="h-4 w-4 text-muted-foreground" />

            <Select value={fEmpresa} onValueChange={setFEmpresa}>
              <SelectTrigger className="h-9 w-[170px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas as empresas</SelectItem>
                {empresas.map((e) => (
                  <SelectItem key={e.id} value={e.id}>{e.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={fConsultor} onValueChange={setFConsultor}>
              <SelectTrigger className="h-9 w-[180px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os consultores</SelectItem>
                {consultores.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={fStatus} onValueChange={(v) => setFStatus(v as typeof fStatus)}>
              <SelectTrigger className="h-9 w-[180px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os status</SelectItem>
                <SelectItem value="em_andamento">{statusLabels.em_andamento}</SelectItem>
                <SelectItem value="aguardando_cliente">{statusLabels.aguardando_cliente}</SelectItem>
                <SelectItem value="ajuste_solicitado">{statusLabels.ajuste_solicitado}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={fFrente} onValueChange={(v) => setFFrente(v as typeof fFrente)}>
              <SelectTrigger className="h-9 w-[180px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas as frentes</SelectItem>
                {(Object.keys(frenteLabels) as FrenteAtuacao[]).map((f) => (
                  <SelectItem key={f} value={f}>{frenteLabels[f]}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Toggle visualização */}
            <div className="ml-auto inline-flex rounded-full border border-border p-0.5 bg-[hsl(var(--secondary)/0.4)]">
              <button
                type="button"
                onClick={() => setView("lista")}
                className={cn(
                  "h-8 px-3 rounded-full text-xs font-medium inline-flex items-center gap-1.5 transition-colors",
                  view === "lista" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <ListIcon className="h-3.5 w-3.5" /> Lista
              </button>
              <button
                type="button"
                onClick={() => setView("tabela")}
                className={cn(
                  "h-8 px-3 rounded-full text-xs font-medium inline-flex items-center gap-1.5 transition-colors",
                  view === "tabela" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <ListIcon className="h-3.5 w-3.5" /> Tabela
              </button>
              <button
                type="button"
                onClick={() => setView("kanban")}
                className={cn(
                  "h-8 px-3 rounded-full text-xs font-medium inline-flex items-center gap-1.5 transition-colors",
                  view === "kanban" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <LayoutGrid className="h-3.5 w-3.5" /> Kanban
              </button>
            </div>
          </div>

          {/* Lista */}
          {filtrados.length === 0 ? (
            <EmptyState
              icon={Briefcase}
              title="Nenhum projeto encontrado"
              description="Ajuste os filtros ou crie um novo projeto para começar."
            />
          ) : view === "lista" ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filtrados.map((p) => {
                const atrasado = isAtrasado(p);
                return (
                  <div key={p.id} className="bg-card rounded-xl shadow-[0_1px_4px_rgba(133,146,173,0.2)] p-5 card-hover">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="min-w-0">
                        <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{p.codigo}</div>
                        <h3 className="font-display font-semibold mt-0.5 truncate">{p.titulo}</h3>
                        <p className="text-xs text-muted-foreground">{p.empresaNome} · {p.filial}</p>
                      </div>
                      <StatusBadge status={statusToBadge[p.status]}>{statusLabels[p.status]}</StatusBadge>
                    </div>

                    <div className="mt-3 flex items-center gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <div className="h-6 w-6 rounded-lg bg-[image:linear-gradient(135deg,hsl(var(--primary)),hsl(var(--primary-glow)))] flex items-center justify-center text-[9px] font-semibold text-white">
                          {p.consultorIniciais}
                        </div>
                        <span className="text-xs text-muted-foreground">{p.consultorNome}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">·</span>
                      <span className="badge-pill bg-secondary text-secondary-foreground border-border">
                        {frenteLabels[p.frente]}
                      </span>
                    </div>

                    <div className="mt-4">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-muted-foreground">Conclusão</span>
                        <span className="tabular-nums font-semibold">{p.conclusao}%</span>
                      </div>
                      <Progress value={p.conclusao} className="h-2" />
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <div className={cn(
                        "text-xs flex items-center gap-1.5",
                        atrasado ? "text-destructive font-semibold" : "text-muted-foreground"
                      )}>
                        <CalendarIcon className="h-3.5 w-3.5" />
                        {format(new Date(p.prazoFinal), "dd MMM yyyy", { locale: ptBR })}
                        {atrasado && <span className="ml-1">· atrasado</span>}
                      </div>
                      <Link
                        to={`/app/projetos/${p.id}`}
                        className="text-xs text-primary hover:underline font-medium inline-flex items-center gap-1"
                      >
                        Ver projeto <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>

                    <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                      {p.conclusao < 100 ? (
                        <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <AlertTriangle className="h-3.5 w-3.5 text-warning" />
                          {p.conclusao}% concluído — entregáveis em aberto
                        </span>
                      ) : (
                        <span className="text-xs text-success flex items-center gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Todos entregáveis aprovados
                        </span>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5"
                        disabled={p.conclusao < 100}
                        title={p.conclusao < 100
                          ? `Há entregáveis em aberto (${p.conclusao}%). Conclua todos antes de encerrar.`
                          : "Encerrar este projeto"}
                        onClick={() => {
                          setProjetoParaEncerrar(p);
                          setEncerrarOpen(true);
                        }}
                      >
                        <CheckCircle2 className={cn(
                          "h-3.5 w-3.5",
                          p.conclusao < 100 ? "text-muted-foreground" : "text-success"
                        )} />
                        Encerrar projeto
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : view === "tabela" ? (
            <div className="bg-card rounded-xl shadow-[0_1px_4px_rgba(133,146,173,0.2)] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left font-semibold px-4 py-4">Código</th>
                      <th className="text-left font-semibold px-4 py-4">Projeto</th>
                      <th className="text-left font-semibold px-4 py-4">Empresa</th>
                      <th className="text-left font-semibold px-4 py-4">Consultor</th>
                      <th className="text-left font-semibold px-4 py-4">Frente</th>
                      <th className="text-left font-semibold px-4 py-4 w-32">Conclusão</th>
                      <th className="text-left font-semibold px-4 py-4">Prazo</th>
                      <th className="text-left font-semibold px-4 py-4">Status</th>
                      <th className="text-right font-semibold px-4 py-4">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtrados.map((p) => {
                      const atrasado = isAtrasado(p);
                      return (
                        <tr
                          key={p.id}
                          className="border-b border-border last:border-0 hover:bg-muted/40 transition-colors"
                        >
                          <td className="px-4 py-3 text-xs text-muted-foreground">
                            {p.codigo}
                          </td>
                          <td className="px-4 py-3 font-medium max-w-[180px] truncate">
                            {p.titulo}
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">
                            {p.empresaNome}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5">
                              <div className="h-6 w-6 rounded-md bg-[image:linear-gradient(135deg,hsl(var(--primary)),hsl(var(--primary-glow)))] flex items-center justify-center text-[9px] font-semibold text-white shrink-0">
                                {p.consultorIniciais}
                              </div>
                              <span className="text-xs text-muted-foreground truncate">
                                {p.consultorNome}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="badge-pill bg-secondary text-secondary-foreground border-border text-[11px]">
                              {frenteLabels[p.frente]}
                            </span>
                          </td>
                          <td className="px-4 py-3 w-32">
                            <div className="flex items-center gap-2">
                              <Progress value={p.conclusao} className="h-1.5 flex-1" />
                              <span className="text-xs tabular-nums shrink-0">
                                {p.conclusao}%
                              </span>
                            </div>
                          </td>
                          <td className={cn(
                            "px-4 py-3 text-xs tabular-nums",
                            atrasado ? "text-destructive font-semibold" : "text-muted-foreground"
                          )}>
                            {format(new Date(p.prazoFinal), "dd/MM/yyyy", { locale: ptBR })}
                            {atrasado && <span className="block text-[10px]">atrasado</span>}
                          </td>
                          <td className="px-4 py-3">
                            <StatusBadge status={statusToBadge[p.status]}>
                              {statusLabels[p.status]}
                            </StatusBadge>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="inline-flex items-center gap-2 justify-end">
                              <Link
                                to={`/app/projetos/${p.id}`}
                                className="text-xs text-primary hover:underline font-medium"
                              >
                                Ver →
                              </Link>
                              <Button
                                size="sm"
                                variant="ghost"
                                disabled={p.conclusao < 100}
                                className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground"
                                onClick={() => {
                                  setProjetoParaEncerrar(p);
                                  setEncerrarOpen(true);
                                }}
                              >
                                Encerrar
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {colunasKanban.map((col) => {
                const itens = filtrados.filter((p) => p.status === col.status);
                return (
                  <div key={col.status} className="bg-card rounded-xl shadow-[0_1px_4px_rgba(133,146,173,0.2)] p-3 min-h-[200px]">
                    <div className="flex items-center justify-between px-1 mb-3">
                      <div className="inline-flex items-center gap-1.5">
                        <col.icon className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          {col.label}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">{itens.length}</span>
                    </div>

                    {itens.length === 0 ? (
                      <div className="flex items-center justify-center h-32 text-xs text-muted-foreground">—</div>
                    ) : (
                      <ul className="space-y-2">
                        {itens.map((p) => {
                          const atrasado = isAtrasado(p);
                          return (
                            <li key={p.id}>
                              <Link
                                to={`/app/projetos/${p.id}`}
                                className="block bg-[hsl(var(--background)/0.6)] border border-border rounded-lg p-3 hover:border-[hsl(var(--primary)/0.4)] transition-colors"
                              >
                                <div className="text-[10px] text-muted-foreground uppercase">{p.codigo}</div>
                                <div className="text-sm font-medium truncate mt-0.5">{p.empresaNome}</div>
                                <div className="text-[11px] text-muted-foreground truncate">{p.titulo}</div>
                                <div className="mt-2 flex items-center justify-between">
                                  <div className="flex items-center gap-1.5">
                                    <div className="h-5 w-5 rounded-lg bg-[image:linear-gradient(135deg,hsl(var(--primary)),hsl(var(--primary-glow)))] flex items-center justify-center text-[8px] font-semibold text-white">
                                      {p.consultorIniciais}
                                    </div>
                                    <span className="text-[10px] text-muted-foreground">{p.consultorNome}</span>
                                  </div>
                                  <span className={cn(
                                    "text-[10px]",
                                    atrasado ? "text-destructive font-semibold" : "text-muted-foreground"
                                  )}>
                                    {format(new Date(p.prazoFinal), "dd/MM", { locale: ptBR })}
                                  </span>
                                </div>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* ───────── Cronogramas Pendentes ───────── */}
        <TabsContent value="cronogramas" className="mt-0">
          {cronogramas.length === 0 ? (
            <EmptyState
              icon={Clock}
              title="Nenhum cronograma pendente"
              description="Cronogramas aguardando aprovação aparecerão aqui."
              action={
                <Button onClick={() => setCronOpen(true)} className="gap-1.5">
                  <Plus className="h-4 w-4" /> Novo Cronograma
                </Button>
              }
            />
          ) : (
            <div className="bg-card rounded-xl shadow-[0_1px_4px_rgba(133,146,173,0.2)] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left font-semibold px-4 py-4">Código</th>
                      <th className="text-left font-semibold px-4 py-4">Empresa</th>
                      <th className="text-left font-semibold px-4 py-4">Consultor</th>
                      <th className="text-left font-semibold px-4 py-4">Status</th>
                      <th className="text-left font-semibold px-4 py-4">Criado em</th>
                      <th className="text-right font-semibold px-4 py-4">Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cronogramas.map((cr) => (
                      <tr key={cr.id} className="border-b border-border last:border-0 hover:bg-muted/40 transition-colors">
                        <td className="px-4 py-3 text-xs">{cr.codigo}</td>
                        <td className="px-4 py-3 font-medium">{cr.empresaNome}</td>
                        <td className="px-4 py-3">{cr.consultorNome}</td>
                        <td className="px-4 py-3">
                          {cr.status === "rascunho" ? (
                            <StatusBadge status="bloqueada">Rascunho</StatusBadge>
                          ) : cr.status === "aguardando_aprovacao_interna" ? (
                            <StatusBadge status="analise">Aguardando aprovação interna</StatusBadge>
                          ) : (
                            <StatusBadge status="aguardando">Em aprovação pelo cliente</StatusBadge>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">
                          {format(new Date(cr.criadoEm), "dd/MM/yyyy", { locale: ptBR })}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="inline-flex items-center gap-2 justify-end">
                            {cr.status === "aguardando_aprovacao_interna" && (
                              <Button
                                size="sm"
                                onClick={() => {
                                  setCronParaEnviar(cr);
                                  setEnviarCronOpen(true);
                                }}
                              >
                                Enviar para cliente
                              </Button>
                            )}
                            <Button asChild size="sm" variant="outline">
                              <Link to={`/app/projetos/${cr.id}`}>
                                Revisar <ArrowRight className="ml-1 h-3 w-3" />
                              </Link>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </TabsContent>

        {/* ───────── Encerrados ───────── */}
        <TabsContent value="encerrados" className="mt-0">
          {projetosEncerrados.length === 0 ? (
            <EmptyState
              icon={CheckCircle2}
              title="Nenhum projeto encerrado"
              description="Projetos finalizados ficarão arquivados aqui."
            />
          ) : (
            <>
              {projetosEncerrados.some((p) => p.conclusao < 100) && (
                <div className="mb-4 rounded-xl border border-[hsl(var(--warning)/0.3)] bg-[hsl(var(--warning)/0.1)] px-4 py-3 flex items-start gap-3">
                  <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <div className="font-semibold text-warning">
                      Cronograma encerrado com entregáveis em andamento.
                    </div>
                    <div className="text-muted-foreground mt-0.5">
                      Os projetos abaixo estão marcados como encerrados, mas ainda há entregáveis
                      em andamento. Revise o status dos entregáveis antes de arquivar definitivamente.
                    </div>
                  </div>
                </div>
              )}
              <ul className="space-y-2">
              {projetosEncerrados.map((p) => (
                <li
                  key={p.id}
                  className="bg-card rounded-xl shadow-[0_1px_4px_rgba(133,146,173,0.2)] p-4 flex items-center gap-4 flex-wrap"
                >
                  <div className="h-10 w-10 rounded-lg bg-[hsl(var(--success)/0.15)] text-success flex items-center justify-center shrink-0">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{p.codigo}</div>
                    <div className="text-sm font-medium truncate">{p.titulo}</div>
                    <div className="text-xs text-muted-foreground">
                      {p.empresaNome} · {p.consultorNome}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Encerrado em</div>
                    <div className="text-xs font-medium">
                      {p.encerradoEm ? format(new Date(p.encerradoEm), "dd/MM/yyyy", { locale: ptBR }) : "—"}
                    </div>
                  </div>
                  <div className="text-right min-w-[80px]">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Conclusão</div>
                    <div className="text-xs font-semibold text-success">{p.conclusao}%</div>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link to={`/app/projetos/${p.id}`}>
                      Ver projeto <ArrowRight className="ml-1 h-3 w-3" />
                    </Link>
                  </Button>
                </li>
              ))}
            </ul>
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* ─────────── Dialog: Novo Cronograma ─────────── */}
      <Dialog open={cronOpen} onOpenChange={(o) => { setCronOpen(o); if (!o) resetCron(); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Novo cronograma</DialogTitle>
            <DialogDescription>
              Após salvar, o cronograma entra na fila de aprovação interna.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={salvarCronograma} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Empresa <span className="text-destructive">*</span></Label>
                <Select value={cEmpresa} onValueChange={(v) => { setCEmpresa(v); setCFilial(""); }}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {empresas.map((e) => (
                      <SelectItem key={e.id} value={e.id}>{e.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Filial <span className="text-destructive">*</span></Label>
                <Select value={cFilial} onValueChange={setCFilial} disabled={!cEmpresa}>
                  <SelectTrigger>
                    <SelectValue placeholder={cEmpresa ? "Selecione" : "Escolha a empresa"} />
                  </SelectTrigger>
                  <SelectContent>
                    {filiaisDisp.map((f) => (
                      <SelectItem key={f} value={f}>{f}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Consultor responsável <span className="text-destructive">*</span></Label>
              <Select value={cConsultor} onValueChange={setCConsultor}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {consultores.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="c-titulo">Título do cronograma <span className="text-destructive">*</span></Label>
              <Input
                id="c-titulo"
                value={cTitulo}
                onChange={(e) => setCTitulo(e.target.value)}
                placeholder="Ex: Cronograma Q3 — Hunting executivo"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Início <span className="text-destructive">*</span></Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" type="button" className={cn(
                      "w-full justify-start text-left font-normal",
                      !cInicio && "text-muted-foreground"
                    )}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {cInicio ? format(cInicio, "dd/MM/yyyy", { locale: ptBR }) : "Selecione"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={cInicio} onSelect={setCInicio} initialFocus className={cn("p-3 pointer-events-auto")} />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-1.5">
                <Label>Término previsto <span className="text-destructive">*</span></Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" type="button" className={cn(
                      "w-full justify-start text-left font-normal",
                      !cFim && "text-muted-foreground"
                    )}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {cFim ? format(cFim, "dd/MM/yyyy", { locale: ptBR }) : "Selecione"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={cFim} onSelect={setCFim} initialFocus className={cn("p-3 pointer-events-auto")} />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setCronOpen(false); resetCron(); }}>
                Cancelar
              </Button>
              <Button type="submit">Salvar cronograma</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ─────────── Dialog: Novo Projeto ─────────── */}
      <Dialog open={projOpen} onOpenChange={(o) => { setProjOpen(o); if (!o) resetProj(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo projeto</DialogTitle>
            <DialogDescription>
              Crie um projeto rapidamente. Detalhes podem ser preenchidos na página do projeto.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={salvarProjeto} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Empresa <span className="text-destructive">*</span></Label>
              <Select value={pEmpresa} onValueChange={setPEmpresa}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {empresas.map((e) => (
                    <SelectItem key={e.id} value={e.id}>{e.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="p-titulo">Título <span className="text-destructive">*</span></Label>
              <Input
                id="p-titulo"
                value={pTitulo}
                onChange={(e) => setPTitulo(e.target.value)}
                placeholder="Ex: Implantação de PDP"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Consultor <span className="text-destructive">*</span></Label>
              <Select value={pConsultor} onValueChange={setPConsultor}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {consultores.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setProjOpen(false); resetProj(); }}>
                Cancelar
              </Button>
              <Button type="submit">Criar projeto</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {/* ─────────── Dialog: Encerrar projeto ─────────── */}
      <Dialog
        open={encerrarOpen}
        onOpenChange={(o) => {
          if (!o) {
            setEncerrarOpen(false);
            setProjetoParaEncerrar(null);
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Encerrar projeto?
            </DialogTitle>
            <DialogDescription className="pt-1">
              Você está prestes a encerrar{" "}
              <strong className="text-foreground">
                {projetoParaEncerrar?.titulo}
              </strong>{" "}
              —{" "}
              <strong className="text-foreground">
                {projetoParaEncerrar?.empresaNome}
              </strong>
              . O projeto será movido para a aba Encerrados e não poderá
              ser reaberto pela interface. Tem certeza?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEncerrarOpen(false);
                setProjetoParaEncerrar(null);
              }}
            >
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmarEncerramento}>
              Sim, encerrar projeto
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─────────── Dialog: Confirmar envio de cronograma ─────────── */}
      <Dialog
        open={enviarCronOpen}
        onOpenChange={(o) => {
          if (!o) {
            setEnviarCronOpen(false);
            setCronParaEnviar(null);
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Enviar cronograma para o cliente?</DialogTitle>
            <DialogDescription className="pt-1">
              O cronograma{" "}
              <strong className="text-foreground">
                {cronParaEnviar?.codigo}
              </strong>{" "}
              será enviado para{" "}
              <strong className="text-foreground">
                {cronParaEnviar?.empresaNome}
              </strong>{" "}
              para aprovação. O cliente será notificado e esta ação
              não pode ser desfeita. Tem certeza?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEnviarCronOpen(false);
                setCronParaEnviar(null);
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={() => {
                if (!cronParaEnviar) return;
                setCronogramas((prev) =>
                  prev.map((c) =>
                    c.id === cronParaEnviar.id
                      ? { ...c, status: "aguardando_aprovacao_cliente" }
                      : c
                  )
                );
                toast.success("Cronograma enviado ao cliente para aprovação.");
                setEnviarCronOpen(false);
                setCronParaEnviar(null);
              }}
            >
              Sim, enviar para o cliente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
