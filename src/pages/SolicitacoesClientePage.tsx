import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import {
  Inbox,
  ChevronDown,
  MessageSquare,
  Clock,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Send,
  Pencil,
  Trash2,
  CalendarClock,
  Users,
  // UserSearch removido junto com tipo Hunting
  GraduationCap,
  Compass,
  Palette,
  MapPin,
  UserPlus,
  HelpCircle,
  ShieldCheck,
  Timer as TimerIcon,
  Sparkles,
} from "lucide-react";

import { useAuth, type Plano } from "@/context/AuthContext";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

// ============================================================================
// Tipos
// ============================================================================
type TipoSolicitacao =
  | "reuniao"
  | "hunting"
  | "treinamento"
  | "programa_lideres"
  | "endomarketing"
  | "visita"
  | "novo_usuario"
  | "duvida"
  | "nr_compliance";

type Urgencia = "alta" | "media" | "baixa";
type StatusSolicitacao =
  | "aberta" | "andamento" | "aguardando_cliente" | "finalizada" | "cancelada";

interface MensagemHistorico {
  autor: string; texto: string; data: string;
  enviadoEm?: number; editadoEm?: string;
  anexo?: { nome: string; tipo: "arquivo" | "link"; url?: string };
}

interface Solicitacao {
  id: string;
  codigo: string;
  tipo: TipoSolicitacao;
  titulo: string;
  descricao: string;
  urgencia: Urgencia;
  status: StatusSolicitacao;
  empresaId: string;
  consultor?: string;
  criadaEm: string;
  temCustoAdicional?: boolean;
  payload?: Record<string, unknown>;
  historico?: MensagemHistorico[];
}

type PacoteKey = "start" | "ongoing" | "growth";

function planoToPacote(p?: Plano | null): PacoteKey {
  if (p === "ongoing") return "ongoing";
  if (p === "growth") return "growth";
  return "start"; // start, trial e null caem como start
}

const PACOTE_LABEL: Record<PacoteKey, string> = {
  start: "START", ongoing: "ONGOING", growth: "GROWTH",
};

// ============================================================================
// Config por tipo de solicitação
// ============================================================================
interface TipoConfig {
  key: TipoSolicitacao;
  nome: string;
  descricao: string;
  icon: typeof MessageSquare;
  /** -1 = ilimitado, 0 = não incluso */
  cota: Record<PacoteKey, number>;
  /** Termo obrigatório sempre, mesmo dentro da cota */
  termoSempre?: { texto: string; link?: string };
  /** Termo obrigatório apenas quando gera custo extra (fora da cota / não incluso) */
  termoExtra?: { texto: string };
  /** Nunca incluso: sempre gera custo */
  sempreExtra?: boolean;
}

const TIPOS: TipoConfig[] = [
  {
    key: "reuniao",
    nome: "Reunião de Alinhamento",
    descricao: "Agendar conversa com sua consultora",
    icon: CalendarClock,
    cota: { start: 1, ongoing: 2, growth: -1 },
  },
  // Hunting removido — agora vive no módulo Atração.

  {
    key: "treinamento",
    nome: "Treinamento In Company",
    descricao: "Workshop ou capacitação pontual",
    icon: GraduationCap,
    cota: { start: 0, ongoing: 0, growth: 0 },
    sempreExtra: true,
    termoSempre: {
      texto:
        "Estou ciente de que Treinamentos In Company não estão inclusos no meu pacote e que esta solicitação gerará uma proposta comercial específica com custo adicional. A execução só ocorrerá após aprovação formal da proposta.",
    },
  },
  {
    key: "programa_lideres",
    nome: "Programa de Líderes",
    descricao: "Trilha estruturada e contínua de desenvolvimento",
    icon: Compass,
    cota: { start: 0, ongoing: 0, growth: -1 },
    termoExtra: {
      texto:
        "Estou ciente de que o Programa de Líderes não está incluso no meu pacote atual e que esta solicitação gerará uma proposta comercial com custo adicional.",
    },
  },
  {
    key: "endomarketing",
    nome: "Material de Endomarketing",
    descricao: "Produção de cartaz, folder, apresentação, post",
    icon: Palette,
    cota: { start: 0, ongoing: 0, growth: 0 },
    sempreExtra: true,
    termoSempre: {
      texto:
        "Estou ciente de que materiais de design não estão inclusos no meu pacote e que esta solicitação gerará uma proposta comercial com custo adicional.",
    },
  },
  {
    key: "visita",
    nome: "Visita Presencial",
    descricao: "Visita técnica em Curitiba/RMC",
    icon: MapPin,
    cota: { start: 0, ongoing: 1, growth: 2 },
    termoExtra: {
      texto:
        "Estou ciente de que esta visita excede o incluso no meu pacote e/ou pode gerar custos de logística (fora de Curitiba/RMC).",
    },
  },
  {
    key: "novo_usuario",
    nome: "Novo Usuário",
    descricao: "Adicionar acesso à plataforma",
    icon: UserPlus,
    cota: { start: 2, ongoing: 3, growth: 4 },
    termoExtra: {
      texto:
        "Estou ciente de que meu pacote inclui um limite de acessos e que este usuário adicional gerará cobrança conforme tabela vigente. A Azumi entrará em contato para formalizar o aditivo.",
    },
  },
  {
    key: "duvida",
    nome: "Dúvida / Suporte",
    descricao: "Tirar dúvidas ou abrir chamado de suporte",
    icon: HelpCircle,
    cota: { start: -1, ongoing: -1, growth: -1 },
  },
  {
    key: "nr_compliance",
    nome: "NR / Conformidade",
    descricao: "Conformidade trabalhista e normas regulamentadoras",
    icon: ShieldCheck,
    cota: { start: -1, ongoing: -1, growth: -1 },
  },
];

const TIPO_BY_KEY: Record<TipoSolicitacao, TipoConfig> = TIPOS.reduce(
  (acc, t) => ({ ...acc, [t.key]: t }),
  {} as Record<TipoSolicitacao, TipoConfig>,
);

// ============================================================================
// SLA
// ============================================================================
function slaTexto(pacote: PacoteKey, urgencia: Urgencia): string {
  if (pacote === "growth") return urgencia === "alta" ? "2h úteis" : "12h úteis";
  if (pacote === "ongoing") return urgencia === "alta" ? "4h úteis" : "24h úteis";
  return urgencia === "alta" ? "Avaliação caso a caso" : "48h úteis";
}

// ============================================================================
// Status / labels
// ============================================================================
const URGENCIA_LABEL: Record<Urgencia, string> = { alta: "Alta", media: "Média", baixa: "Baixa" };
const STATUS_LABEL: Record<StatusSolicitacao, string> = {
  aberta: "Aberta", andamento: "Em andamento",
  aguardando_cliente: "Aguardando você", finalizada: "Finalizada", cancelada: "Cancelada",
};

type CardKey = "aberta" | "andamento" | "aguardando_cliente" | "finalizada";
const CHIPS: { key: CardKey; label: string; icon: typeof MessageSquare; cls: string }[] = [
  { key: "aberta", label: "Abertas", icon: MessageSquare, cls: "bg-info/10 text-info border-info/30" },
  { key: "andamento", label: "Em andamento", icon: Clock, cls: "bg-success/10 text-success border-success/30" },
  { key: "aguardando_cliente", label: "Aguardando", icon: AlertCircle, cls: "bg-warning/10 text-warning border-warning/30" },
  { key: "finalizada", label: "Finalizadas", icon: CheckCircle2, cls: "bg-muted text-muted-foreground border-border" },
];

const PILL_BASE =
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap";

function urgenciaPill(u: Urgencia) {
  if (u === "alta") return "bg-destructive/15 text-destructive border-destructive/30";
  if (u === "media") return "bg-warning/15 text-warning border-warning/30";
  return "bg-muted text-muted-foreground border-border";
}
function statusPill(s: StatusSolicitacao) {
  if (s === "aberta") return "bg-info/15 text-info border-info/30";
  if (s === "andamento") return "bg-success/15 text-success border-success/30";
  if (s === "aguardando_cliente") return "bg-warning/15 text-warning border-warning/30";
  if (s === "cancelada") return "bg-muted text-muted-foreground border-border line-through";
  return "bg-muted text-muted-foreground border-border";
}
const URGENCIA_DOT: Record<Urgencia, string> = {
  alta: "bg-destructive", media: "bg-warning", baixa: "bg-muted-foreground/40",
};

// ============================================================================
// Mock inicial
// ============================================================================
const MOCK: Solicitacao[] = [
  {
    id: "s-91", codigo: "SOL-2026-0091", tipo: "duvida",
    titulo: "Revisão de política de home office",
    descricao: "Atualizar dias permitidos e elegibilidade por área.",
    urgencia: "media", status: "andamento", empresaId: "kentaki",
    consultor: "Ana Beatriz", criadaEm: "2026-05-05T09:30:00Z",
    historico: [
      { autor: "Você", texto: "Oi Ana, precisamos atualizar a política. Tem o documento atual em anexo.", data: "2026-05-05T09:32:00Z", anexo: { nome: "politica-home-office-v1.pdf", tipo: "arquivo" } },
      { autor: "Ana Beatriz", texto: "Recebi! Vou revisar essa semana e te trago um draft.", data: "2026-05-05T14:10:00Z" },
      { autor: "Ana Beatriz", texto: "Olha esse benchmark que separei: ajuda a calibrar dias presenciais por área.", data: "2026-05-07T10:20:00Z", anexo: { nome: "Benchmark Home Office 2026", tipo: "link", url: "https://example.com/benchmark" } },
      { autor: "Ana Beatriz", texto: "Estou consolidando o draft atualizado para sua revisão.", data: "2026-05-08T14:10:00Z" },
    ],
  },
  {
    id: "s-82", codigo: "SOL-2026-0082", tipo: "duvida",
    titulo: "Mapeamento de cargos Q1",
    descricao: "Mapear cargos e responsabilidades das áreas Comercial e Operações.",
    urgencia: "media", status: "finalizada", empresaId: "kentaki",
    consultor: "Ana Beatriz", criadaEm: "2026-01-20T10:00:00Z",
    historico: [
      { autor: "Você", texto: "Boa, vamos começar pelo Comercial.", data: "2026-01-21T09:00:00Z" },
      { autor: "Ana Beatriz", texto: "Perfeito. Já agendei entrevistas com os líderes.", data: "2026-01-22T11:30:00Z" },
      { autor: "Ana Beatriz", texto: "Entregue. Documento disponível em Documentos.", data: "2026-03-30T16:45:00Z", anexo: { nome: "mapa-cargos-q1.pdf", tipo: "arquivo" } },
    ],
  },
  {
    id: "s-77", codigo: "SOL-2026-0077", tipo: "endomarketing",
    titulo: "Pesquisa de clima — pausada",
    descricao: "Pesquisa de clima Q2 cancelada a pedido do cliente.",
    urgencia: "baixa", status: "cancelada", empresaId: "kentaki",
    consultor: "Ana Beatriz", criadaEm: "2026-04-02T11:15:00Z",
    historico: [
      { autor: "Você", texto: "Vamos pausar e retomar no próximo trimestre.", data: "2026-04-10T09:00:00Z" },
      { autor: "Ana Beatriz", texto: "Sem problema, deixo arquivada por aqui.", data: "2026-04-10T09:20:00Z" },
    ],
  },
  {
    id: "s-val-1", codigo: "SOL-2026-VAL01", tipo: "duvida",
    titulo: "Suporte para entrevista — Analista RH",
    descricao: "Suporte da consultora na próxima entrevista.",
    urgencia: "media", status: "andamento", empresaId: "valore",
    consultor: "Rafael Moura", criadaEm: "2026-05-10T09:30:00Z",
    historico: [
      { autor: "Você", texto: "Rafael, consegue participar da entrevista de quinta?", data: "2026-05-10T09:35:00Z" },
      { autor: "Rafael Moura", texto: "Posso sim. Me manda o roteiro que você costuma usar.", data: "2026-05-10T11:00:00Z" },
      { autor: "Você", texto: "Aqui vai.", data: "2026-05-10T15:00:00Z", anexo: { nome: "roteiro-entrevista.docx", tipo: "arquivo" } },
    ],
  },
  {
    id: "s-val-2", codigo: "SOL-2026-VAL02", tipo: "duvida",
    titulo: "Modelo de avaliação de desempenho",
    descricao: "Modelo entregue e aprovado.",
    urgencia: "baixa", status: "finalizada", empresaId: "valore",
    consultor: "Rafael Moura", criadaEm: "2026-03-15T10:00:00Z",
    historico: [
      { autor: "Rafael Moura", texto: "Segue modelo final. Pode aplicar a partir do próximo ciclo.", data: "2026-03-28T17:00:00Z", anexo: { nome: "avaliacao-desempenho-v3.pdf", tipo: "arquivo" } },
      { autor: "Você", texto: "Aprovado, obrigada!", data: "2026-03-29T09:10:00Z" },
    ],
  },
  // ───── Construtora Horizonte ─────
  {
    id: "s-hz-1", codigo: "SOL-2026-HZ01", tipo: "duvida",
    titulo: "Modelo de avaliação de obra",
    descricao: "Suporte para estruturar avaliação de produtividade em canteiro.",
    urgencia: "media", status: "aberta", empresaId: "horizonte",
    consultor: "Rafael Moura", criadaEm: "2026-05-15T11:20:00Z",
    historico: [
      { autor: "Você", texto: "Rafael, precisamos de um modelo de avaliação para canteiro. Pode ajudar?", data: "2026-05-15T11:22:00Z" },
      { autor: "Rafael Moura", texto: "Claro! Te trago uma proposta inicial até quinta.", data: "2026-05-15T14:00:00Z" },
    ],
  },
  {
    id: "s-hz-2", codigo: "SOL-2026-HZ02", tipo: "reuniao",
    titulo: "Reunião de alinhamento — Maio",
    descricao: "Alinhamento mensal sobre andamento do projeto.",
    urgencia: "baixa", status: "andamento", empresaId: "horizonte",
    consultor: "Rafael Moura", criadaEm: "2026-05-08T14:00:00Z",
    historico: [
      { autor: "Rafael Moura", texto: "Te mando o convite agora. Sugiro pauta abaixo.", data: "2026-05-08T15:00:00Z", anexo: { nome: "Convite Google Meet", tipo: "link", url: "https://meet.example.com/xyz" } },
      { autor: "Você", texto: "Confirmado.", data: "2026-05-08T15:20:00Z" },
    ],
  },
  {
    id: "s-hz-3", codigo: "SOL-2026-HZ03", tipo: "duvida",
    titulo: "Suporte com NR-18",
    descricao: "Esclarecimento sobre adequação de cronograma à NR-18.",
    urgencia: "alta", status: "finalizada", empresaId: "horizonte",
    consultor: "Rafael Moura", criadaEm: "2026-04-20T09:00:00Z",
    historico: [
      { autor: "Rafael Moura", texto: "Segue parecer técnico. Resumo: cronograma OK com 2 pontos de atenção.", data: "2026-04-25T10:00:00Z", anexo: { nome: "parecer-nr18.pdf", tipo: "arquivo" } },
      { autor: "Você", texto: "Perfeito, vamos implementar.", data: "2026-04-25T16:00:00Z" },
    ],
  },
  // ───── Clínica Vita Saúde ─────
  {
    id: "s-vt-1", codigo: "SOL-2026-VT01", tipo: "nr_compliance",
    titulo: "Treinamento NR-32",
    descricao: "Planejar capacitação NR-32 para 3 unidades.",
    urgencia: "alta", status: "andamento", empresaId: "vita",
    consultor: "Juliana Costa", criadaEm: "2026-05-09T10:30:00Z",
    historico: [
      { autor: "Juliana Costa", texto: "Levantei datas possíveis para as 3 unidades. Confere?", data: "2026-05-10T09:00:00Z", anexo: { nome: "cronograma-nr32.xlsx", tipo: "arquivo" } },
      { autor: "Você", texto: "Sim, podemos seguir.", data: "2026-05-10T11:00:00Z" },
    ],
  },
  {
    id: "s-vt-2", codigo: "SOL-2026-VT02", tipo: "endomarketing",
    titulo: "Material endomarketing — Maio",
    descricao: "Campanha de cuidado e bem-estar para colaboradores.",
    urgencia: "media", status: "aguardando_cliente", empresaId: "vita",
    consultor: "Juliana Costa", criadaEm: "2026-05-12T15:00:00Z",
    temCustoAdicional: true,
    historico: [
      { autor: "Juliana Costa", texto: "Mandei as 3 propostas de layout. Qual ressoa mais?", data: "2026-05-14T16:00:00Z", anexo: { nome: "propostas-layout.pdf", tipo: "arquivo" } },
    ],
  },
  {
    id: "s-vt-3", codigo: "SOL-2026-VT03", tipo: "visita",
    titulo: "Visita técnica — Unidade Sul",
    descricao: "Visita presencial para mapear processos da Unidade Sul.",
    urgencia: "media", status: "aberta", empresaId: "vita",
    consultor: "Juliana Costa", criadaEm: "2026-05-17T08:45:00Z",
    historico: [
      { autor: "Você", texto: "Podemos agendar para a próxima semana?", data: "2026-05-17T08:50:00Z" },
    ],
  },
  {
    id: "s-vt-4", codigo: "SOL-2026-VT04", tipo: "duvida",
    titulo: "Pesquisa de clima Q1",
    descricao: "Relatório consolidado e plano de ação entregues.",
    urgencia: "baixa", status: "finalizada", empresaId: "vita",
    consultor: "Juliana Costa", criadaEm: "2026-02-22T13:00:00Z",
    historico: [
      { autor: "Juliana Costa", texto: "Relatório final + plano de ação. Disponível em Documentos também.", data: "2026-03-05T17:00:00Z", anexo: { nome: "clima-q1-relatorio.pdf", tipo: "arquivo" } },
    ],
  },
];

// Solicitações pré-carregadas para o perfil trial (Empresa Demo).
const MOCK_DEMO: Solicitacao[] = [
  {
    id: "demo-s1", codigo: "SOL-DEMO-001", tipo: "duvida",
    titulo: "Revisão de política de home office",
    descricao: "Atualizar regras e elegibilidade.",
    urgencia: "media", status: "andamento", empresaId: "empresa-demo",
    consultor: "Ana Beatriz", criadaEm: "2026-05-05T09:00:00Z",
    historico: [
      { autor: "Você", texto: "Ana, queremos revisar a política de home office.", data: "2026-05-05T09:05:00Z" },
      { autor: "Ana Beatriz", texto: "Show! Vou enviar um modelo base para você customizar.", data: "2026-05-05T11:00:00Z", anexo: { nome: "modelo-home-office.docx", tipo: "arquivo" } },
      { autor: "Ana Beatriz", texto: "Esse artigo também ajuda no enquadramento.", data: "2026-05-06T10:00:00Z", anexo: { nome: "Guia CLT — trabalho remoto", tipo: "link", url: "https://example.com/guia" } },
    ],
  },
  {
    id: "demo-s2", codigo: "SOL-DEMO-002", tipo: "duvida",
    titulo: "Mapeamento de cargos Q1",
    descricao: "Mapeamento concluído e entregue.",
    urgencia: "media", status: "finalizada", empresaId: "empresa-demo",
    consultor: "Ana Beatriz", criadaEm: "2026-01-20T10:00:00Z",
    historico: [
      { autor: "Ana Beatriz", texto: "Mapa de cargos consolidado. Já está em Documentos.", data: "2026-03-20T15:00:00Z", anexo: { nome: "mapa-cargos-demo.pdf", tipo: "arquivo" } },
      { autor: "Você", texto: "Obrigada!", data: "2026-03-21T09:00:00Z" },
    ],
  },
  {
    id: "demo-s3", codigo: "SOL-DEMO-003", tipo: "endomarketing",
    titulo: "Pesquisa de clima",
    descricao: "Pausada a pedido do cliente.",
    urgencia: "baixa", status: "cancelada", empresaId: "empresa-demo",
    consultor: "Ana Beatriz", criadaEm: "2026-04-02T11:15:00Z",
    historico: [
      { autor: "Você", texto: "Vamos pausar por ora.", data: "2026-04-02T11:20:00Z" },
    ],
  },
];





// ============================================================================
// Componente principal
// ============================================================================
const FORM_BASE = {
  titulo: "", descricao: "", urgencia: "media" as Urgencia,
  extras: {} as Record<string, string>,
};

export default function SolicitacoesClientePage() {
  const { user, usuario } = useAuth();
  const empresaId = user?.empresaId ?? "";
  const isTrial = usuario?.role === "trial";
  const pacote = planoToPacote(usuario?.plano);

  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>(() => {
    if (isTrial) return MOCK_DEMO;
    return MOCK.filter((s) => (empresaId ? s.empresaId === empresaId : true));
  });
  const [filtro, setFiltro] = useState<"todos" | StatusSolicitacao>("todos");
  const [filtroTipo, setFiltroTipo] = useState<"todos" | TipoSolicitacao>("todos");
  const [expandidos, setExpandidos] = useState<Record<string, boolean>>({});
  const [conversaAberta, setConversaAberta] = useState<Solicitacao | null>(null);
  const [cancelarSol, setCancelarSol] = useState<Solicitacao | null>(null);

  // Fluxo: card -> aviso (intro) -> formulário -> (modal de custo) -> enviado
  const [tipoIntro, setTipoIntro] = useState<TipoSolicitacao | null>(null);
  const [tipoForm, setTipoForm] = useState<TipoSolicitacao | null>(null);
  const [form, setForm] = useState(FORM_BASE);
  const [confirmCusto, setConfirmCusto] = useState<null | {
    tipo: TipoSolicitacao;
    cienteCusto: boolean;
    payload: Solicitacao;
  }>(null);

  // ----- contagens de status -----
  const contagens = useMemo(() => {
    const m: Record<CardKey | "todos" | "cancelada", number> = {
      todos: solicitacoes.length, aberta: 0, andamento: 0,
      aguardando_cliente: 0, finalizada: 0, cancelada: 0,
    };
    for (const s of solicitacoes) m[s.status] += 1;
    return m;
  }, [solicitacoes]);

  // ----- consumo de cota por tipo no mês atual -----
  const consumoMes = useMemo(() => {
    const agora = new Date();
    const mesIni = new Date(agora.getFullYear(), agora.getMonth(), 1).getTime();
    const map: Partial<Record<TipoSolicitacao, number>> = {};
    for (const s of solicitacoes) {
      if (new Date(s.criadaEm).getTime() >= mesIni && s.status !== "cancelada") {
        map[s.tipo] = (map[s.tipo] ?? 0) + 1;
      }
    }
    return map;
  }, [solicitacoes]);

  // ----- lista filtrada -----
  const lista = useMemo(() => {
    let base = filtro === "todos" ? solicitacoes : solicitacoes.filter((s) => s.status === filtro);
    if (filtroTipo !== "todos") base = base.filter((s) => s.tipo === filtroTipo);
    return [...base].sort((a, b) => new Date(b.criadaEm).getTime() - new Date(a.criadaEm).getTime());
  }, [solicitacoes, filtro, filtroTipo]);

  function toggleExpand(id: string) {
    setExpandidos((p) => ({ ...p, [id]: !p[id] }));
  }

  function statusCota(tipo: TipoConfig): {
    label: string; tone: "ok" | "parcial" | "extra";
    geraCusto: boolean; cotaTotal: number; usados: number;
  } {
    const total = tipo.cota[pacote];
    const usados = consumoMes[tipo.key] ?? 0;
    if (tipo.sempreExtra || total === 0) {
      return { label: "Custo adicional", tone: "extra", geraCusto: true, cotaTotal: 0, usados };
    }
    if (total === -1) {
      return { label: "Incluso no seu pacote", tone: "ok", geraCusto: false, cotaTotal: -1, usados };
    }
    if (usados >= total) {
      return { label: "Cota atingida — custo adicional", tone: "extra", geraCusto: true, cotaTotal: total, usados };
    }
    if (usados > 0) {
      return { label: `${usados} de ${total} utilizados este mês`, tone: "parcial", geraCusto: false, cotaTotal: total, usados };
    }
    return { label: "Incluso no seu pacote", tone: "ok", geraCusto: false, cotaTotal: total, usados };
  }

  function abrirFormulario(key: TipoSolicitacao) {
    setForm(FORM_BASE);
    setTipoIntro(key);
  }

  function continuarParaFormulario() {
    if (!tipoIntro) return;
    const k = tipoIntro;
    setTipoIntro(null);
    setTipoForm(k);
  }

  function buildSolicitacao(tipo: TipoConfig, geraCusto: boolean): Solicitacao {
    const ano = new Date().getFullYear();
    const sufixo = String(Math.floor(Math.random() * 9000) + 1000);
    return {
      id: `s-${sufixo}-${Date.now()}`,
      codigo: `SOL-${ano}-${sufixo}`,
      tipo: tipo.key,
      titulo: form.titulo.trim() || tipo.nome,
      descricao: form.descricao.trim(),
      urgencia: form.urgencia,
      status: "aberta",
      empresaId: empresaId || "kentaki",
      criadaEm: new Date().toISOString(),
      temCustoAdicional: geraCusto,
      payload: { ...form.extras },
    };
  }

  function handleSubmitForm(e: FormEvent) {
    e.preventDefault();
    if (!tipoForm) return;
    const tipo = TIPO_BY_KEY[tipoForm];
    if (!form.descricao.trim()) {
      toast.error("Preencha a descrição / detalhes.");
      return;
    }
    const status = statusCota(tipo);
    const nova = buildSolicitacao(tipo, status.geraCusto);
    if (status.geraCusto) {
      setConfirmCusto({ tipo: tipoForm, cienteCusto: false, payload: nova });
    } else {
      setSolicitacoes((p) => [nova, ...p]);
      setTipoForm(null);
      setForm(FORM_BASE);
      toast.success(
        isTrial
          ? "Solicitação criada! (dados de demonstração)"
          : `Solicitação criada — protocolo ${nova.codigo}`,
      );
    }
  }

  function confirmarComCusto() {
    if (!confirmCusto || !confirmCusto.cienteCusto) return;
    setSolicitacoes((p) => [confirmCusto.payload, ...p]);
    toast.success(
      isTrial
        ? "Solicitação criada! (dados de demonstração)"
        : `Solicitação enviada — protocolo ${confirmCusto.payload.codigo}`,
      isTrial ? undefined : { description: "Você será contatado para alinhar o custo adicional." },
    );
    setConfirmCusto(null);
    setTipoForm(null);
    setForm(FORM_BASE);
  }

  return (
    <>
      <PageHeader
        title="Solicitações"
        subtitle="Faça uma nova solicitação ou acompanhe o status das existentes"
        actions={
          <span className={cn(PILL_BASE, "bg-primary/10 text-primary border-primary/30")}>
            <Sparkles className="h-3.5 w-3.5" /> Pacote {PACOTE_LABEL[pacote]}
          </span>
        }
      />

      {/* Chips compactos de status */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <button
          type="button"
          onClick={() => setFiltro("todos")}
          className={cn(
            PILL_BASE, "cursor-pointer",
            filtro === "todos"
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-card border-border hover:bg-muted/40",
          )}
        >
          Todas <span className="font-data tabular-nums">{contagens.todos}</span>
        </button>
        {CHIPS.map(({ key, label, icon: Icon, cls }) => {
          const ativo = filtro === key;
          return (
            <button
              key={key} type="button" onClick={() => setFiltro(key)}
              className={cn(
                PILL_BASE, "cursor-pointer",
                ativo ? "ring-2 ring-primary/40" : "",
                cls,
              )}
            >
              <Icon className="h-3.5 w-3.5" /> {label}
              <span className="font-data tabular-nums">{contagens[key]}</span>
            </button>
          );
        })}
      </div>

      {/* Cards de tipos de solicitação */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-foreground mb-3">
          Abrir nova solicitação
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {TIPOS.map((t) => {
            const Icon = t.icon;
            const s = statusCota(t);
            const toneBadge =
              s.tone === "ok"
                ? "bg-success/10 text-success border-success/30"
                : s.tone === "parcial"
                  ? "bg-warning/10 text-warning border-warning/30"
                  : "bg-orange-500/10 text-orange-600 border-orange-500/30 dark:text-orange-400";
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => abrirFormulario(t.key)}
                className={cn(
                  "group relative text-left rounded-2xl border bg-card p-4 transition-all",
                  "hover:-translate-y-0.5 hover:shadow-card hover:border-primary/40",
                  "focus:outline-none focus:ring-2 focus:ring-primary/40",
                )}
              >
                <div className="flex items-start gap-3">
                  <span className={cn(
                    "h-10 w-10 rounded-xl flex items-center justify-center shrink-0",
                    "bg-gradient-brand text-white transition-transform",
                    "group-hover:scale-110 group-hover:rotate-3",
                  )}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-sm leading-tight">{t.nome}</div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {t.descricao}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <span className={cn(PILL_BASE, toneBadge, "text-[10.5px]")}>{s.label}</span>
                  <span className="text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    Solicitar →
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Filtro de tipo + Lista */}
      <section>
        <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
          <h2 className="text-sm font-semibold text-foreground">Minhas solicitações</h2>
          <div className="flex items-center gap-2">
            <Label className="text-xs text-muted-foreground">Tipo:</Label>
            <Select value={filtroTipo} onValueChange={(v) => setFiltroTipo(v as typeof filtroTipo)}>
              <SelectTrigger className="h-8 w-[200px] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os tipos</SelectItem>
                {TIPOS.map((t) => (
                  <SelectItem key={t.key} value={t.key}>{t.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-3">
          {lista.length === 0 ? (
            <Card>
              <CardContent className="p-0">
                <EmptyState
                  icon={Inbox}
                  title="Nenhuma solicitação por aqui"
                  description="Use os cards acima para abrir um pedido para sua consultora."
                />
              </CardContent>
            </Card>
          ) : (
            lista.map((s) => {
              const aberto = !!expandidos[s.id];
              const cancelada = s.status === "cancelada";
              const ultimas = (s.historico ?? []).slice(-2);
              const cfg = TIPO_BY_KEY[s.tipo];
              return (
                <Card key={s.id} className={cn("transition-shadow", aberto ? "shadow-card" : "hover:shadow-card")}>
                  <CardContent className="p-0">
                    <button
                      type="button"
                      onClick={() => toggleExpand(s.id)}
                      className="w-full text-left p-4 flex items-start gap-3"
                      aria-expanded={aberto}
                    >
                      {cfg && (
                        <span className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                          <cfg.icon className="h-4 w-4" />
                        </span>
                      )}
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                          <span className="font-data text-xs text-muted-foreground">{s.codigo}</span>
                          <span className={cn("text-sm font-semibold truncate", cancelada && "line-through text-muted-foreground")}>
                            {s.titulo}
                          </span>
                          <span className={cn(PILL_BASE, statusPill(s.status))}>{STATUS_LABEL[s.status]}</span>
                          <span className={cn(PILL_BASE, urgenciaPill(s.urgencia))}>
                            <span className={cn("h-1.5 w-1.5 rounded-full", URGENCIA_DOT[s.urgencia])} />
                            {URGENCIA_LABEL[s.urgencia]}
                          </span>
                          {s.temCustoAdicional && (
                            <span className={cn(PILL_BASE, "bg-orange-500/10 text-orange-600 border-orange-500/30 dark:text-orange-400")}>
                              Custo adicional
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-2">
                          <span>{cfg?.nome ?? s.tipo}</span>
                          <span>·</span>
                          <span>{format(new Date(s.criadaEm), "dd/MM/yyyy", { locale: ptBR })}</span>
                        </div>
                      </div>
                      <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform shrink-0 mt-1", aberto && "rotate-180")} />
                    </button>

                    <div className={cn("overflow-hidden transition-all duration-200 ease-out", aberto ? "max-h-[28rem]" : "max-h-0")}>
                      <div className="px-4 pb-4 pt-0 border-t border-border/60 space-y-4">
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">Descrição</p>
                          <p className="text-sm text-foreground/90 whitespace-pre-line">{s.descricao}</p>
                        </div>
                        {s.consultor && (
                          <div className="text-xs text-muted-foreground">
                            Consultor responsável: <span className="text-foreground font-medium">{s.consultor}</span>
                          </div>
                        )}
                        {ultimas.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-2">Últimas mensagens</p>
                            <div className="space-y-2">
                              {ultimas.map((m, i) => {
                                const isMe = m.autor === "Você";
                                return (
                                  <div key={i} className={cn("flex gap-2 items-end", isMe && "flex-row-reverse")}>
                                    {!isMe && (
                                      <div className="h-6 w-6 rounded-md bg-gradient-brand flex items-center justify-center text-[9px] font-semibold text-white shrink-0">
                                        {m.autor.charAt(0)}
                                      </div>
                                    )}
                                    <div className={cn(
                                      "max-w-[80%] rounded-xl px-3 py-2 text-xs",
                                      isMe ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-muted text-foreground rounded-bl-sm",
                                    )}>
                                      {!isMe && <div className="font-semibold mb-0.5 opacity-70">{m.autor}</div>}
                                      <p>{m.texto}</p>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                        <div className="pt-1">
                          <Button
                            size="sm" variant="ghost"
                            className="rounded-full text-primary hover:text-primary"
                            onClick={(e) => { e.stopPropagation(); setConversaAberta(s); }}
                          >
                            Ver conversa completa <ArrowRight className="h-3.5 w-3.5" />
                          </Button>
                          {(s.status === "aberta" || s.status === "aguardando_cliente") && (
                            <Button
                              size="sm" variant="ghost"
                              className="rounded-full text-destructive hover:text-destructive hover:bg-destructive/10 ml-2"
                              onClick={(e) => { e.stopPropagation(); setCancelarSol(s); }}
                            >
                              Cancelar solicitação
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </section>

      {/* Dialog — Aviso/Intro antes de abrir o formulário */}
      <Dialog open={!!tipoIntro} onOpenChange={(o) => { if (!o) setTipoIntro(null); }}>
        <DialogContent className="max-w-md">
          {tipoIntro && (() => {
            const t = TIPO_BY_KEY[tipoIntro];
            const s = statusCota(t);
            const termo = t.termoSempre ?? (s.geraCusto ? t.termoExtra : undefined);
            const toneBox =
              s.tone === "ok"
                ? "bg-success/10 border-success/30 text-success"
                : s.tone === "parcial"
                  ? "bg-warning/10 border-warning/30 text-warning"
                  : "bg-orange-500/10 border-orange-500/30 text-orange-600 dark:text-orange-400";
            return (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <span className="h-9 w-9 rounded-lg bg-gradient-brand text-white flex items-center justify-center">
                      <t.icon className="h-4 w-4" />
                    </span>
                    {t.nome}
                  </DialogTitle>
                  <DialogDescription className="pt-1">{t.descricao}</DialogDescription>
                </DialogHeader>

                <div className={cn("rounded-lg border p-3 text-xs", toneBox)}>
                  <div className="font-semibold mb-1">
                    Pacote {PACOTE_LABEL[pacote]} — {s.label}
                  </div>
                  <div className="opacity-90">SLA estimado: {slaTexto(pacote, "media")} (urgência média)</div>
                </div>

                {termo && (
                  <div className="rounded-lg border border-border bg-muted/40 p-3 text-xs text-muted-foreground leading-relaxed">
                    <div className="font-semibold text-foreground mb-1 flex items-center gap-1.5">
                      <AlertCircle className="h-3.5 w-3.5" /> Antes de continuar
                    </div>
                    {termo.texto}
                  </div>
                )}

                <DialogFooter>
                  <Button variant="outline" onClick={() => setTipoIntro(null)}>Cancelar</Button>
                  <Button onClick={continuarParaFormulario}>
                    Continuar para o formulário <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </DialogFooter>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Sheet — Formulário dinâmico */}
      <Sheet open={!!tipoForm} onOpenChange={(o) => { if (!o) { setTipoForm(null); setForm(FORM_BASE); } }}>
        <SheetContent className="sm:max-w-lg w-full overflow-y-auto">
          {tipoForm && (
            <FormularioTipo
              tipo={TIPO_BY_KEY[tipoForm]}
              pacote={pacote}
              statusCota={statusCota(TIPO_BY_KEY[tipoForm])}
              form={form}
              setForm={setForm}
              onCancel={() => { setTipoForm(null); setForm(FORM_BASE); }}
              onSubmit={handleSubmitForm}
            />
          )}
        </SheetContent>
      </Sheet>

      {/* Dialog — Confirmação de custo adicional */}
      <Dialog open={!!confirmCusto} onOpenChange={(o) => { if (!o) setConfirmCusto(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
              <AlertCircle className="h-5 w-5" />
              Atenção — Esta solicitação gera custo adicional
            </DialogTitle>
            <DialogDescription className="pt-1">
              {confirmCusto && TIPO_BY_KEY[confirmCusto.tipo].termoSempre?.texto}
              {confirmCusto && !TIPO_BY_KEY[confirmCusto.tipo].termoSempre && TIPO_BY_KEY[confirmCusto.tipo].termoExtra?.texto}
            </DialogDescription>
          </DialogHeader>
          <label className="flex items-start gap-2 cursor-pointer text-sm">
            <Checkbox
              checked={confirmCusto?.cienteCusto ?? false}
              onCheckedChange={(v) =>
                setConfirmCusto((p) => (p ? { ...p, cienteCusto: v === true } : p))
              }
            />
            <span>Estou ciente e desejo prosseguir</span>
          </label>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmCusto(null)}>Cancelar</Button>
            <Button disabled={!confirmCusto?.cienteCusto} onClick={confirmarComCusto}>
              Confirmar e enviar solicitação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog — Cancelar solicitação */}
      <Dialog open={!!cancelarSol} onOpenChange={(o) => !o && setCancelarSol(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" /> Cancelar solicitação?
            </DialogTitle>
            <DialogDescription className="pt-1">
              Você está cancelando <strong className="text-foreground">{cancelarSol?.titulo}</strong>.
              As horas já trabalhadas não serão devolvidas ao seu pacote.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelarSol(null)}>Voltar</Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (!cancelarSol) return;
                setSolicitacoes((prev) =>
                  prev.map((s) => s.id === cancelarSol.id ? { ...s, status: "cancelada" as StatusSolicitacao } : s),
                );
                toast.warning("Solicitação cancelada.");
                setCancelarSol(null);
              }}
            >
              Confirmar cancelamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sheet — Conversa completa */}
      <Sheet open={!!conversaAberta} onOpenChange={(o) => !o && setConversaAberta(null)}>
        <SheetContent className="sm:max-w-md w-full flex flex-col">
          <SheetHeader>
            <SheetTitle>{conversaAberta?.titulo}</SheetTitle>
            <SheetDescription>
              {conversaAberta?.codigo} · {conversaAberta?.consultor ?? "Azumi RH"}
            </SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto space-y-2 py-4 pr-1">
            {(conversaAberta?.historico ?? []).length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6">Nenhuma mensagem ainda.</p>
            )}
            {(conversaAberta?.historico ?? []).map((m, i) => (
              <MensagemChatCliente
                key={i} mensagem={m} index={i}
                onEditar={(idx, texto, editadoEm) => {
                  const atualizado = (conversaAberta?.historico ?? []).map((msg, j) =>
                    j === idx ? { ...msg, texto, editadoEm } : msg);
                  setConversaAberta((prev) => prev ? { ...prev, historico: atualizado } : prev);
                  setSolicitacoes((prev) => prev.map((s) =>
                    s.id === conversaAberta?.id ? { ...s, historico: atualizado } : s));
                }}
                onExcluir={(idx) => {
                  const atualizado = (conversaAberta?.historico ?? []).filter((_, j) => j !== idx);
                  setConversaAberta((prev) => prev ? { ...prev, historico: atualizado } : prev);
                  setSolicitacoes((prev) => prev.map((s) =>
                    s.id === conversaAberta?.id ? { ...s, historico: atualizado } : s));
                }}
              />
            ))}
          </div>
          {conversaAberta && conversaAberta.status !== "finalizada" && conversaAberta.status !== "cancelada" && (
            <ClienteRespostaInput
              onEnviar={(texto) => {
                const nova: MensagemHistorico = {
                  autor: "Você", texto, data: new Date().toISOString(), enviadoEm: Date.now(),
                };
                setSolicitacoes((prev) => prev.map((s) =>
                  s.id === conversaAberta.id ? { ...s, historico: [...(s.historico ?? []), nova] } : s));
                setConversaAberta((prev) => prev ? { ...prev, historico: [...(prev.historico ?? []), nova] } : prev);
                toast.success("Mensagem enviada.");
              }}
            />
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}

// ============================================================================
// Formulário dinâmico por tipo
// ============================================================================
type FormState = typeof FORM_BASE;

function FormularioTipo({
  tipo, pacote, statusCota, form, setForm, onCancel, onSubmit,
}: {
  tipo: TipoConfig;
  pacote: PacoteKey;
  statusCota: { label: string; tone: "ok" | "parcial" | "extra"; geraCusto: boolean; cotaTotal: number; usados: number };
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
  onCancel: () => void;
  onSubmit: (e: FormEvent) => void;
}) {
  const [aceiteTermo, setAceiteTermo] = useState(false);
  const termo = tipo.termoSempre ?? (statusCota.geraCusto ? tipo.termoExtra : undefined);
  const precisaAceite = !!termo;
  

  function setExtra(k: string, v: string) {
    setForm((f) => ({ ...f, extras: { ...f.extras, [k]: v } }));
  }

  return (
    <form onSubmit={(e) => {
      if (precisaAceite && !aceiteTermo) {
        e.preventDefault();
        toast.error("É necessário aceitar o termo para prosseguir.");
        return;
      }
      onSubmit(e);
    }} className="flex flex-col h-full">
      <SheetHeader>
        <SheetTitle className="flex items-center gap-2">
          <span className="h-8 w-8 rounded-lg bg-gradient-brand text-white flex items-center justify-center">
            <tipo.icon className="h-4 w-4" />
          </span>
          {tipo.nome}
        </SheetTitle>
        <SheetDescription>{tipo.descricao}</SheetDescription>
      </SheetHeader>

      <div className="space-y-4 py-4 flex-1">
        {/* Aviso de cota */}
        <div className={cn(
          "rounded-lg border p-3 text-xs",
          statusCota.tone === "ok" && "bg-success/10 border-success/30 text-success",
          statusCota.tone === "parcial" && "bg-warning/10 border-warning/30 text-warning",
          statusCota.tone === "extra" && "bg-orange-500/10 border-orange-500/30 text-orange-600 dark:text-orange-400",
        )}>
          {statusCota.label}
        </div>

        {/* Campos por tipo */}
        <CamposPorTipo tipo={tipo} form={form} setForm={setForm} setExtra={setExtra} />

        {/* Campo padrão: descrição/observações se ainda não preenchido */}
        {!CAMPOS_SUBSTITUEM_DESC.has(tipo.key) && (
          <FieldText label="Descrição" required value={form.descricao}
            onChange={(v) => setForm((f) => ({ ...f, descricao: v }))}
            placeholder="Conte com detalhes o que você precisa." multiline rows={4} />
        )}

        {/* Urgência (oculto para tipos onde não faz sentido) */}
        {!SEM_URGENCIA.has(tipo.key) && (
          <div className="space-y-2">
            <Label>Urgência</Label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(URGENCIA_LABEL) as Urgencia[]).map((u) => {
                const ativo = form.urgencia === u;
                return (
                  <button key={u} type="button"
                    onClick={() => setForm((f) => ({ ...f, urgencia: u }))}
                    className={cn(
                      "rounded-full border px-3 py-2 flex items-center justify-center gap-2 text-sm transition-colors",
                      ativo ? "border-primary bg-primary/10" : "border-border hover:bg-muted/40",
                    )}
                  >
                    <span className={cn("h-2.5 w-2.5 rounded-full", URGENCIA_DOT[u])} />
                    {URGENCIA_LABEL[u]}
                  </button>
                );
              })}
            </div>
            <div className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              O tempo de resposta segue o SLA do seu pacote.
            </div>
          </div>
        )}

        {/* Avisos especiais */}
        {tipo.key === "visita" && (
          <div className="rounded-lg border border-warning/30 bg-warning/10 text-warning text-xs p-3">
            Visitas fora de Curitiba/RMC têm logística por conta da sua empresa.
          </div>
        )}
        {tipo.key === "nr_compliance" && (
          <div className="rounded-lg border border-info/30 bg-info/10 text-info text-xs p-3">
            Esta solicitação será avaliada pelo consultor. Dependendo da complexidade,
            pode gerar horas excedentes ou proposta específica.
          </div>
        )}

        {/* Termo de aceite */}
        {precisaAceite && termo && (
          <div className="rounded-lg border border-orange-500/30 bg-orange-500/5 p-3 space-y-2">
            <p className="text-xs text-foreground/90">{termo.texto}</p>
            <label className="flex items-start gap-2 cursor-pointer text-xs">
              <Checkbox checked={aceiteTermo} onCheckedChange={(v) => setAceiteTermo(v === true)} />
              <span>Li e concordo com os termos.</span>
            </label>
            {tipo.termoSempre?.link && (
              <a href={tipo.termoSempre.link} target="_blank" rel="noreferrer"
                className="text-xs text-primary hover:underline">
                Ver política de {tipo.nome}
              </a>
            )}
          </div>
        )}
      </div>

      <SheetFooter className="flex-row sm:justify-end gap-2 pt-2 border-t">
        <Button type="button" variant="outline" className="rounded-full" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" className="rounded-full" disabled={precisaAceite && !aceiteTermo}>
          {statusCota.geraCusto ? "Continuar" : "Enviar solicitação"}
        </Button>
      </SheetFooter>
    </form>
  );
}

// Tipos cujos campos já cobrem "descrição"
const CAMPOS_SUBSTITUEM_DESC = new Set<TipoSolicitacao>([
  "reuniao", "visita", "novo_usuario",
]);
const SEM_URGENCIA = new Set<TipoSolicitacao>(["reuniao", "visita", "novo_usuario"]);

function CamposPorTipo({
  tipo, form, setForm, setExtra,
}: {
  tipo: TipoConfig;
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
  setExtra: (k: string, v: string) => void;
}) {
  const t = tipo.key;
  const get = (k: string) => form.extras[k] ?? "";

  if (t === "reuniao") {
    return (
      <>
        <FieldText label="Assunto principal" required value={form.titulo}
          onChange={(v) => setForm((f) => ({ ...f, titulo: v }))} />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <FieldText label="Opção 1 (data/hora)" value={get("opc1")} onChange={(v) => setExtra("opc1", v)} placeholder="ex: 12/05 14h" />
          <FieldText label="Opção 2" value={get("opc2")} onChange={(v) => setExtra("opc2", v)} />
          <FieldText label="Opção 3" value={get("opc3")} onChange={(v) => setExtra("opc3", v)} />
        </div>
        <FieldText label="Pauta" required multiline rows={3} value={form.descricao}
          onChange={(v) => setForm((f) => ({ ...f, descricao: v }))} />
        <FieldText label="Observações" value={get("obs")} onChange={(v) => setExtra("obs", v)} multiline rows={2} />
      </>
    );
  }


  if (t === "hunting") {
    return (
      <>
        <FieldText label="Cargo" required value={form.titulo} onChange={(v) => setForm((f) => ({ ...f, titulo: v }))} />
        <div className="grid grid-cols-2 gap-2">
          <FieldText label="Área/Departamento" required value={get("area")} onChange={(v) => setExtra("area", v)} />
          <FieldSelect label="Nível" value={get("nivel")} onChange={(v) => setExtra("nivel", v)}
            options={["Pleno", "Sênior", "Especialista", "Liderança", "C-Level"]} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <FieldSelect label="Regime" value={get("regime")} onChange={(v) => setExtra("regime", v)} options={["CLT", "PJ"]} />
          <FieldText label="Qtd. vagas" value={get("qtd")} onChange={(v) => setExtra("qtd", v)} type="number" />
        </div>
        <FieldText label="Faixa salarial (opcional)" value={get("faixa")} onChange={(v) => setExtra("faixa", v)} />
        <FieldText label="Perfil desejado" required multiline rows={3} value={form.descricao}
          onChange={(v) => setForm((f) => ({ ...f, descricao: v }))} />
      </>
    );
  }

  if (t === "treinamento") {
    return (
      <>
        <FieldText label="Tema do treinamento" required value={form.titulo} onChange={(v) => setForm((f) => ({ ...f, titulo: v }))} />
        <div className="grid grid-cols-2 gap-2">
          <FieldText label="Público-alvo" required value={get("publico")} onChange={(v) => setExtra("publico", v)} />
          <FieldText label="Nº de participantes" value={get("qtd")} onChange={(v) => setExtra("qtd", v)} type="number" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <FieldSelect label="Modalidade" value={get("modalidade")} onChange={(v) => setExtra("modalidade", v)}
            options={["Presencial", "Remoto", "Híbrido"]} />
          <FieldText label="Duração (horas)" value={get("duracao")} onChange={(v) => setExtra("duracao", v)} type="number" />
        </div>
        <FieldText label="Data desejada (aproximada)" value={get("data")} onChange={(v) => setExtra("data", v)} placeholder="ex: 2ª quinzena de jun" />
        <FieldText label="Objetivo principal" required multiline rows={3} value={form.descricao}
          onChange={(v) => setForm((f) => ({ ...f, descricao: v }))} />
      </>
    );
  }

  if (t === "programa_lideres") {
    return (
      <>
        <FieldText label="Nº de líderes participantes" required value={get("qtd")} onChange={(v) => setExtra("qtd", v)} type="number" />
        <FieldText label="Níveis hierárquicos envolvidos" value={get("niveis")} onChange={(v) => setExtra("niveis", v)}
          placeholder="ex: Coordenadores, Gerentes" />
        <FieldText label="Objetivo principal do programa" required value={form.titulo} onChange={(v) => setForm((f) => ({ ...f, titulo: v }))} />
        <FieldText label="Desafios atuais de liderança" required multiline rows={3} value={form.descricao}
          onChange={(v) => setForm((f) => ({ ...f, descricao: v }))} />
        <div className="grid grid-cols-2 gap-2">
          <FieldSelect label="Modalidade preferida" value={get("modalidade")} onChange={(v) => setExtra("modalidade", v)}
            options={["Presencial", "Remoto", "Híbrido"]} />
          <FieldText label="Prazo para início" value={get("prazo")} onChange={(v) => setExtra("prazo", v)} />
        </div>
      </>
    );
  }

  if (t === "endomarketing") {
    return (
      <>
        <FieldSelect label="Tipo de material" required value={get("tipo_material")} onChange={(v) => setExtra("tipo_material", v)}
          options={["Cartaz", "Folder", "Apresentação", "Post para redes sociais", "Banner", "Botton", "Outro"]} />
        <FieldText label="Objetivo / ocasião" required value={form.titulo} onChange={(v) => setForm((f) => ({ ...f, titulo: v }))} />
        <div className="grid grid-cols-2 gap-2">
          <FieldSelect label="Formato" value={get("formato")} onChange={(v) => setExtra("formato", v)}
            options={["Digital", "Impresso", "Ambos"]} />
          <FieldText label="Data de entrega" value={get("entrega")} onChange={(v) => setExtra("entrega", v)} />
        </div>
        <FieldText label="Referências / briefing" required multiline rows={3} value={form.descricao}
          onChange={(v) => setForm((f) => ({ ...f, descricao: v }))} />
      </>
    );
  }

  if (t === "visita") {
    return (
      <>
        <FieldText label="Objetivo da visita" required value={form.titulo} onChange={(v) => setForm((f) => ({ ...f, titulo: v }))} />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <FieldText label="Data opção 1" value={get("opc1")} onChange={(v) => setExtra("opc1", v)} />
          <FieldText label="Data opção 2" value={get("opc2")} onChange={(v) => setExtra("opc2", v)} />
          <FieldText label="Data opção 3" value={get("opc3")} onChange={(v) => setExtra("opc3", v)} />
        </div>
        <FieldText label="Endereço / unidade" required value={get("endereco")} onChange={(v) => setExtra("endereco", v)} />
        <div className="grid grid-cols-2 gap-2">
          <FieldText label="Duração estimada (horas)" value={get("duracao")} onChange={(v) => setExtra("duracao", v)} type="number" />
          <FieldText label="Participantes esperados" value={get("participantes")} onChange={(v) => setExtra("participantes", v)} />
        </div>
        <FieldText label="Observações" multiline rows={3} value={form.descricao}
          onChange={(v) => setForm((f) => ({ ...f, descricao: v }))} />
      </>
    );
  }

  if (t === "novo_usuario") {
    return (
      <>
        <FieldText label="Nome completo" required value={form.titulo} onChange={(v) => setForm((f) => ({ ...f, titulo: v }))} />
        <div className="grid grid-cols-2 gap-2">
          <FieldText label="Cargo" required value={get("cargo")} onChange={(v) => setExtra("cargo", v)} />
          <FieldText label="E-mail corporativo" required type="email" value={get("email")} onChange={(v) => setExtra("email", v)} />
        </div>
        <FieldSelect label="Perfil de acesso" value={get("perfil")} onChange={(v) => setExtra("perfil", v)}
          options={["Cliente", "Cliente — leitura", "Outro"]} />
        <FieldText label="Observações" multiline rows={2} value={form.descricao}
          onChange={(v) => setForm((f) => ({ ...f, descricao: v }))} />
      </>
    );
  }

  if (t === "duvida") {
    return (
      <>
        <FieldSelect label="Categoria" required value={get("categoria")} onChange={(v) => setExtra("categoria", v)}
          options={[
            "RH Operacional", "Recrutamento e Seleção", "Gestão de Pessoas",
            "Plataforma Azumi Connect", "Contrato e Financeiro", "Outro",
          ]} />
        <FieldText label="Título / assunto" required value={form.titulo} onChange={(v) => setForm((f) => ({ ...f, titulo: v }))} />
      </>
    );
  }

  if (t === "nr_compliance") {
    return (
      <>
        <FieldText label="Tipo de NR ou tema" required value={form.titulo} onChange={(v) => setForm((f) => ({ ...f, titulo: v }))} />
        <div className="grid grid-cols-2 gap-2">
          <FieldText label="Colaboradores afetados" value={get("qtd")} onChange={(v) => setExtra("qtd", v)} type="number" />
          <FieldText label="Prazo necessário" value={get("prazo")} onChange={(v) => setExtra("prazo", v)} />
        </div>
        <FieldSelect label="Já existe processo iniciado?" value={get("iniciado")} onChange={(v) => setExtra("iniciado", v)}
          options={["Não", "Sim"]} />
      </>
    );
  }


  return null;
}

// ============================================================================
// Field helpers
// ============================================================================
function FieldText({
  label, value, onChange, placeholder, required, multiline, rows = 3, type = "text",
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; required?: boolean; multiline?: boolean; rows?: number; type?: string;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}{required && <span className="text-destructive ml-0.5">*</span>}</Label>
      {multiline ? (
        <Textarea rows={rows} className="resize-none" value={value}
          onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
      ) : (
        <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
      )}
    </div>
  );
}

function FieldSelect({
  label, value, onChange, options, required,
}: {
  label: string; value: string; onChange: (v: string) => void;
  options: string[]; required?: boolean;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}{required && <span className="text-destructive ml-0.5">*</span>}</Label>
      <Select value={value || undefined} onValueChange={onChange}>
        <SelectTrigger><SelectValue placeholder="Selecione…" /></SelectTrigger>
        <SelectContent>
          {options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}

// ============================================================================
// Conversa (mantido do arquivo anterior)
// ============================================================================
function ClienteRespostaInput({ onEnviar }: { onEnviar: (texto: string) => void }) {
  const [texto, setTexto] = useState("");
  return (
    <div className="flex gap-2 items-end border-t border-border pt-3">
      <Textarea rows={2} placeholder="Escreva uma mensagem…" value={texto}
        onChange={(e) => setTexto(e.target.value)}
        className="resize-none flex-1 text-sm rounded-xl"
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (texto.trim()) { onEnviar(texto.trim()); setTexto(""); }
          }
        }} />
      <Button size="sm" disabled={!texto.trim()} className="rounded-full gap-1.5 shrink-0"
        onClick={() => { if (texto.trim()) { onEnviar(texto.trim()); setTexto(""); } }}>
        <Send className="h-3.5 w-3.5" /> Enviar
      </Button>
    </div>
  );
}

function MensagemChatCliente({
  mensagem, index, onEditar, onExcluir,
}: {
  mensagem: MensagemHistorico; index: number;
  onEditar: (i: number, t: string, e: string) => void;
  onExcluir: (i: number) => void;
}) {
  const [editando, setEditando] = useState(false);
  const [textoEdit, setTextoEdit] = useState(mensagem.texto);
  const isMe = mensagem.autor === "Você";
  const podeExcluir = isMe && mensagem.enviadoEm !== undefined && Date.now() - mensagem.enviadoEm < 60_000;
  return (
    <div className={cn("flex gap-2 items-end group", isMe && "flex-row-reverse")}>
      {!isMe && (
        <div className="h-7 w-7 rounded-md bg-gradient-brand flex items-center justify-center text-[10px] font-semibold text-white shrink-0">
          {mensagem.autor.charAt(0)}
        </div>
      )}
      <div className="relative max-w-[80%]">
        {editando ? (
          <div className="space-y-1">
            <textarea className="text-sm rounded-xl px-3 py-2 bg-primary/10 border border-primary/30 resize-none w-full min-h-[60px] focus:outline-none"
              value={textoEdit} onChange={(e) => setTextoEdit(e.target.value)} autoFocus />
            <div className="flex gap-2 justify-end">
              <button type="button" className="text-xs text-muted-foreground hover:text-foreground"
                onClick={() => { setEditando(false); setTextoEdit(mensagem.texto); }}>Cancelar</button>
              <button type="button" className="text-xs text-primary font-medium"
                onClick={() => {
                  if (!textoEdit.trim()) return;
                  onEditar(index, textoEdit.trim(), format(new Date(), "HH:mm"));
                  setEditando(false);
                }}>Salvar</button>
            </div>
          </div>
        ) : (
          <div className={cn("rounded-2xl px-3 py-2 text-sm shadow-sm",
            isMe ? "bg-primary text-primary-foreground rounded-br-sm"
                 : "bg-secondary text-foreground rounded-bl-sm border border-border")}>
            {!isMe && <div className="text-[10px] font-semibold mb-0.5 text-primary">{mensagem.autor}</div>}
            <p className="break-words">{mensagem.texto}</p>
            {mensagem.anexo && (
              <div className={cn(
                "mt-2 inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs",
                isMe ? "bg-primary-foreground/15" : "bg-background border border-border",
              )}>
                {mensagem.anexo.tipo === "link" ? "🔗" : "📎"} {mensagem.anexo.nome}
              </div>
            )}
            {mensagem.editadoEm && <span className="text-[9px] opacity-60 ml-1">· editado {mensagem.editadoEm}</span>}
            <div className={cn("text-[10px] font-data mt-1 text-right",
              isMe ? "text-primary-foreground/70" : "text-muted-foreground")}>
              {format(new Date(mensagem.data), "dd/MM HH:mm", { locale: ptBR })}
            </div>
          </div>
        )}
        {isMe && !editando && (
          <div className="absolute -top-6 right-0 hidden group-hover:flex items-center gap-1 bg-background border border-border rounded-md px-1.5 py-0.5 shadow-sm">
            <button type="button" title="Editar" className="p-0.5 hover:text-primary"
              onClick={() => setEditando(true)}><Pencil className="h-3 w-3" /></button>
            {podeExcluir && (
              <button type="button" title="Excluir" className="p-0.5 hover:text-destructive"
                onClick={() => onExcluir(index)}><Trash2 className="h-3 w-3" /></button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
