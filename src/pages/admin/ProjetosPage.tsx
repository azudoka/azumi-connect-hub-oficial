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
import { KpiCard } from "@/components/KpiCard";
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
// Regra de visibilidade — perfil + consultor logado (simulado).
// Nota: o AuthContext atual só conhece "admin" | "cliente". Para validar
// a regra "consultor vê apenas os atribuídos a ele" sem alterar arquivos
// fora do escopo, simulamos via estas constantes. Ajuste manualmente para
// testar (ex.: PERFIL_DEMO = "consultor"; CONSULTOR_LOGADO_ID = "ab").
// ────────────────────────────────────────────────────────────────────

type PerfilDemo = "admin" | "consultor";
const PERFIL_DEMO: PerfilDemo = "admin";
const CONSULTOR_LOGADO_ID = "ab";

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
  const [view, setView] = useState<"lista" | "kanban">(() => {
    if (typeof window === "undefined") return "lista";
    return (localStorage.getItem(VIEW_KEY) as "lista" | "kanban") ?? "lista";
  });
  useEffect(() => {
    localStorage.setItem(VIEW_KEY, view);
  }, [view]);

  // Filtros
  const [fEmpresa, setFEmpresa] = useState("todas");
  const [fConsultor, setFConsultor] = useState("todos");
  const [fStatus, setFStatus] = useState<"todos" | ProjetoStatus>("todos");
  const [fFrente, setFFrente] = useState<"todas" | FrenteAtuacao>("todas");

  // Visibilidade por perfil: admin vê tudo; consultor vê só os atribuídos a ele.
  const projetosVisiveis = useMemo(() => {
    if (PERFIL_DEMO === "consultor") {
      return projetos.filter((p) => p.assignedConsultorId === CONSULTOR_LOGADO_ID);
    }
    return projetos;
  }, [projetos]);

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

  // ─── Aprovação de entregável + NPS ──────────────────────────────
  const [npsOpen, setNpsOpen] = useState(false);
  const [npsEmpresaNome, setNpsEmpresaNome] = useState<string>("");

  function aprovarEntregavel(projeto: Projeto) {
    toast.success("Entregável aprovado! NPS enviado ao cliente.");
    setNpsEmpresaNome(projeto.empresaNome);
    setNpsOpen(true);
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
        subtitle="Cronogramas, projetos vigentes e encerrados"
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

      {PERFIL_DEMO === "consultor" && (
        <div className="mb-5 rounded-xl border border-info/30 bg-info/10 px-4 py-3 flex items-start gap-3">
          <Briefcase className="h-4 w-4 text-info shrink-0 mt-0.5" />
          <div>
            <div className="text-sm font-medium text-info">Visão de consultor</div>
            <div className="text-xs text-info/80 mt-0.5">
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
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard label="Total de projetos" value={kpis.total} icon={Briefcase} />
            <KpiCard label="Em andamento" value={kpis.andamento} icon={Clock} />
            <KpiCard label="Aguardando cliente" value={kpis.aguardando} icon={PauseCircle} />
            <KpiCard label="Ajuste solicitado" value={kpis.ajuste} icon={AlertTriangle} />
          </div>

          {/* Filtros + toggle */}
          <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3 flex-wrap">
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
            <div className="ml-auto inline-flex rounded-lg border border-border p-0.5 bg-secondary/40">
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
                  <div key={p.id} className="bg-card border border-border rounded-xl p-5 card-hover">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="min-w-0">
                        <div className="text-[10px] font-data text-muted-foreground uppercase tracking-wider">{p.codigo}</div>
                        <h3 className="font-display font-semibold mt-0.5 truncate">{p.titulo}</h3>
                        <p className="text-xs text-muted-foreground">{p.empresaNome} · {p.filial}</p>
                      </div>
                      <StatusBadge status={statusToBadge[p.status]}>{statusLabels[p.status]}</StatusBadge>
                    </div>

                    <div className="mt-3 flex items-center gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <div className="h-6 w-6 rounded-full bg-gradient-brand flex items-center justify-center text-[9px] font-semibold text-white">
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
                        <span className="font-data tabular-nums font-semibold">{p.conclusao}%</span>
                      </div>
                      <Progress value={p.conclusao} className="h-2" />
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <div className={cn(
                        "text-xs flex items-center gap-1.5 font-data",
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

                    <div className="mt-3 pt-3 border-t border-border flex justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5"
                        onClick={() => aprovarEntregavel(p)}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                        Aprovar entregável
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {colunasKanban.map((col) => {
                const itens = filtrados.filter((p) => p.status === col.status);
                return (
                  <div key={col.status} className="bg-card border border-border rounded-xl p-3 min-h-[200px]">
                    <div className="flex items-center justify-between px-1 mb-3">
                      <div className="inline-flex items-center gap-1.5">
                        <col.icon className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          {col.label}
                        </span>
                      </div>
                      <span className="font-data text-xs text-muted-foreground">{itens.length}</span>
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
                                className="block bg-background/60 border border-border rounded-lg p-3 hover:border-primary/40 transition-colors"
                              >
                                <div className="text-[10px] font-data text-muted-foreground uppercase">{p.codigo}</div>
                                <div className="text-sm font-medium truncate mt-0.5">{p.empresaNome}</div>
                                <div className="text-[11px] text-muted-foreground truncate">{p.titulo}</div>
                                <div className="mt-2 flex items-center justify-between">
                                  <div className="flex items-center gap-1.5">
                                    <div className="h-5 w-5 rounded-full bg-gradient-brand flex items-center justify-center text-[8px] font-semibold text-white">
                                      {p.consultorIniciais}
                                    </div>
                                    <span className="text-[10px] text-muted-foreground">{p.consultorNome}</span>
                                  </div>
                                  <span className={cn(
                                    "text-[10px] font-data",
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
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-secondary/40 text-xs uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="text-left font-medium px-4 py-3">Código</th>
                      <th className="text-left font-medium px-4 py-3">Empresa</th>
                      <th className="text-left font-medium px-4 py-3">Consultor</th>
                      <th className="text-left font-medium px-4 py-3">Status</th>
                      <th className="text-left font-medium px-4 py-3">Criado em</th>
                      <th className="text-right font-medium px-4 py-3">Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cronogramas.map((cr) => (
                      <tr key={cr.id} className="border-t border-border hover:bg-secondary/30 transition-colors">
                        <td className="px-4 py-3 font-data text-xs">{cr.codigo}</td>
                        <td className="px-4 py-3 font-medium">{cr.empresaNome}</td>
                        <td className="px-4 py-3">{cr.consultorNome}</td>
                        <td className="px-4 py-3">
                          {cr.status === "rascunho" ? (
                            <StatusBadge status="bloqueada">Rascunho</StatusBadge>
                          ) : cr.status === "aguardando_aprovacao_interna" ? (
                            <StatusBadge status="analise">Aguardando aprovação interna</StatusBadge>
                          ) : (
                            <StatusBadge status="aguardando">Aguardando aprovação cliente</StatusBadge>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs font-data text-muted-foreground">
                          {format(new Date(cr.criadoEm), "dd/MM/yyyy", { locale: ptBR })}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button asChild size="sm" variant="outline">
                            <Link to={`/app/projetos/${cr.id}`}>
                              Revisar <ArrowRight className="ml-1 h-3 w-3" />
                            </Link>
                          </Button>
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
            <ul className="space-y-2">
              {projetosEncerrados.map((p) => (
                <li
                  key={p.id}
                  className="bg-card border border-border rounded-xl p-4 flex items-center gap-4 flex-wrap"
                >
                  <div className="h-10 w-10 rounded-lg bg-success/15 text-success flex items-center justify-center shrink-0">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] font-data text-muted-foreground uppercase tracking-wider">{p.codigo}</div>
                    <div className="text-sm font-medium truncate">{p.titulo}</div>
                    <div className="text-xs text-muted-foreground">
                      {p.empresaNome} · {p.consultorNome}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Encerrado em</div>
                    <div className="text-xs font-data font-medium">
                      {p.encerradoEm ? format(new Date(p.encerradoEm), "dd/MM/yyyy", { locale: ptBR }) : "—"}
                    </div>
                  </div>
                  <div className="text-right min-w-[80px]">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Conclusão</div>
                    <div className="text-xs font-data font-semibold text-success">{p.conclusao}%</div>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link to={`/app/projetos/${p.id}`}>
                      Ver projeto <ArrowRight className="ml-1 h-3 w-3" />
                    </Link>
                  </Button>
                </li>
              ))}
            </ul>
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
      {/* ─────────── Dialog: NPS disparado ─────────── */}
      <Dialog open={npsOpen} onOpenChange={setNpsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-success/15 text-success flex items-center justify-center shrink-0">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <DialogTitle>NPS disparado</DialogTitle>
            </div>
            <DialogDescription className="pt-2">
              O cliente <strong className="text-foreground">{npsEmpresaNome}</strong> foi notificado para
              avaliar a entrega. A resposta ficará disponível em Analytics.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setNpsOpen(false)}>Ok, entendido</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
