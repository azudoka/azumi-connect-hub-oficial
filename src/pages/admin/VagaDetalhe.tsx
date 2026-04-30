import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { SectionDivider } from "@/components/SectionDivider";
import { SlaBar } from "@/components/SlaBar";
import { DiscBars } from "@/components/DiscBars";
import { Timer } from "@/components/Timer";
import { useParams, Link, useNavigate } from "react-router-dom";
import { vagas, candidatos, etapasVaga, comentariosVaga, getGestorDaVaga, type JanelaDisponibilidade } from "@/data/mock";
import { getParecerCliente, getFeedback1aLeva } from "@/data/atracaoClienteStore";
import {
  criarAgendamento,
  enviarParaCandidatoConfirmar,
  candidatoConfirmar,
  getAgendamentoDoCandidato,
  listarAgendamentosDaVaga,
  formatarSugestao,
  statusAgendamentoLabel,
  subscribeEntrevistaGestor,
  getParecerGestor,
  getRealinhamento,
  type SugestaoHorario,
  type ModoEntrevista,
  type AgendamentoEntrevistaGestor,
} from "@/data/entrevistaGestorStore";
import {
  criarProposta,
  getPropostaAtiva,
  aceitarProposta,
  recusarProposta,
  expirarProposta,
  contratadosNaVaga,
  registrarFeedback,
  jaTemFeedback,
  subscribePropostas,
  isExpiradaPorTempo,
  msRestantes,
  statusPropostaLabel,
  jaGerouRelatorioFinal,
  type PropostaCandidato,
  type TipoProposta,
  type CanalProposta,
  type FeedbackCanal,
} from "@/data/propostaStore";

const BENEFICIO_LABEL: Record<string, string> = {
  vale_transporte: "Vale-transporte",
  vale_alimentacao: "Vale-alimentação",
  vale_refeicao: "Vale-refeição",
  plano_saude: "Plano de saúde",
  plano_odontologico: "Plano odontológico",
  gympass: "Gympass",
  home_office: "Home office",
  bonus: "Bônus",
  participacao_lucros: "PLR",
  seguro_vida: "Seguro de vida",
  auxilio_creche: "Auxílio-creche",
  auxilio_educacao: "Auxílio-educação",
  stock_options: "Stock options",
  ppr: "PPR",
};
import {
  ArrowLeft, Building2, MapPin, Send, MessageSquare, CheckCircle2, Clock,
  Users, FileQuestion, History, Filter, Loader2, AlertTriangle, Bot, User,
  MoreVertical, Eye, StickyNote, ChevronRight, UserX, Play, UserPlus, Link2,
  Copy, FileText, MessageCircle, Download, ListChecks, ThumbsDown, CalendarPlus,
  CalendarDays, Globe, Paperclip, X as XIcon, Plus, Mail, Phone, Briefcase, Circle,
  Pencil, Trash2, GripVertical,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useScrollLock } from "@/hooks/use-scroll-lock";

const tabs = [
  { key: "candidatos", label: "Candidatos", icon: Users },
  { key: "perfis", label: "Perfis enviados", icon: Send },
  { key: "questionarios", label: "Questionários", icon: FileQuestion },
  { key: "agenda", label: "Agenda", icon: CalendarDays },
  { key: "historico", label: "Histórico", icon: History },
  { key: "chat", label: "Conversas", icon: MessageSquare },
] as const;

// ────────────────────────────────────────────────────────────────────
// Tipos locais (mock — não persiste em backend)
// ────────────────────────────────────────────────────────────────────

type PublicacaoStatus = "nao_publicada" | "em_revisao" | "publicada";

interface CandidatoExtra {
  id: string;
  nome: string;
  email?: string;
  telefone?: string;
  cargo: string;
  origem: "manual" | "convite" | "site";
  declinio?: { motivo: string; quem: "candidato" | "azumi" };
}

type TipoPergunta = "texto_livre" | "multipla_escolha" | "escala_1_5";

interface PerguntaQuestionario {
  id: string;
  ordem: number;
  texto: string;
  tipo: TipoPergunta;
  obrigatoria: boolean;
  opcoes?: string[]; // múltipla escolha
}

interface AvaliacaoQuestao {
  nota: 1 | 2 | 3 | 4 | 5;
  justificativa?: string;
}

interface RespostaCandidatoQuestionario {
  status: "pendente" | "respondido";
  enviadoEm?: string;       // dd/mm/aaaa
  respondidoEm?: string;    // dd/mm/aaaa
  link?: string;
  /** Respostas do candidato (preenchidas via mock no momento da resposta). */
  respostas?: Record<string, string>;
  /** Avaliação feita pelo consultor. */
  avaliacao?: {
    questoes: Record<string, AvaliacaoQuestao>;
    media: number;
    salvoComo: "rascunho" | "definitivo";
  };
  notaMedia?: number;
}

interface QuestionarioVaga {
  id: string;
  nome: string;
  descricao?: string;
  /** Compatibilidade legacy — deprecated, derive de `perguntas.length`. */
  tipo?: "Comportamental" | "Técnico" | "Cultural";
  perguntas: PerguntaQuestionario[];
  criadoPor: string;
  criadoEm: string;          // dd/mm/aaaa
  respostasPorCandidato: Record<string, RespostaCandidatoQuestionario>;
  /** Compat: deprecated; mantido para não quebrar leituras antigas. */
  questoes?: number;
  candidatosRespostas?: Record<string, "pendente" | "respondido">;
}

interface EventoEntrevista {
  id: string;
  candidatoId: string;
  candidatoNome: string;
  tipo: "Interno Azumi" | "Com gestor do cliente";
  data: string; // dd/mm/yyyy
  hora: string; // HH:mm
  local: string;
}

interface MensagemVaga {
  id: string;
  autor: string;
  iniciais: string;
  quando: string;
  texto: string;
  canal: "interno" | "cliente";
  anexo?: string;
}

interface RelatorioQuestaoNota {
  nota: number; // 1..5
  justificativa: string;
}

interface RelatorioCandidato {
  protocolo: string;
  data: string; // dd/mm/yyyy
  cidadeUf: string;
  cargoAtual: string;
  experienciaResumida: string;
  sintese: string;
  pontosPositivos: string;
  pontosAtencao: string;
  discResumo: string;
  questoes: Record<string, RelatorioQuestaoNota>;
  recomendacao: string;
  movimento: "Avançar" | "Stand by" | "Desclassificar" | "";
  consultorNome: string;
  consultorCargo: string;
  status: "rascunho" | "enviado";
}

const PESSOAS_MENCAO_VAGA = [
  "Ana Beatriz",
  "Rafael Moura",
  "Camila Torres",
  "RH Cliente",
  "Gestor — Mariana",
];

// Templates centralizados (Handoff): quando faltarem reais, usar esses placeholders.
const TEMPLATE_DISC_WHATSAPP = (nome: string) =>
  `Oi ${nome}! Aqui é da Azumi 👋 Para avançar no processo, pedimos que você responda ` +
  `nosso teste DISC (leva ~10 min). Acesse: https://azumi.app/disc/{token}. Qualquer dúvida, ` +
  `é só chamar por aqui!`;

const TEMPLATE_DECLINIO_CANDIDATO = (nome: string) =>
  `Olá ${nome}! Obrigada pelo seu interesse na vaga. Registramos seu declínio com cuidado e ` +
  `vamos manter seu perfil em nossa base para futuras oportunidades. Sucesso na sua trajetória! 🚀`;

function renderTextoComLinks(texto: string) {
  const partes = texto.split(/(https?:\/\/[^\s]+|@[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ\s]*?(?=\s|$|[.,!?]))/g);
  return partes.map((p, i) => {
    if (p?.startsWith("http")) {
      return (
        <a key={i} href={p} target="_blank" rel="noopener noreferrer"
           className="text-primary underline break-all">
          {p}
        </a>
      );
    }
    if (p?.startsWith("@")) {
      return <span key={i} className="text-primary font-medium">{p}</span>;
    }
    return <span key={i}>{p}</span>;
  });
}

export default function VagaDetalheAdmin() {
  const { id } = useParams();
  const vaga = vagas.find((v) => v.id === id) ?? vagas[0];
  const [tab, setTab] = useState<typeof tabs[number]["key"]>("candidatos");

  // B09: estado do Dialog "Enviar para o cliente"
  const [enviarOpen, setEnviarOpen] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [justificativaExcesso, setJustificativaExcesso] = useState("");
  const [excedeuOpen, setExcedeuOpen] = useState(false);

  const funil = [
    { etapa: "Currículos", n: vaga.candidatosTotal },
    { etapa: "Triagem", n: vaga.candidatosTriagem },
    { etapa: "Entrevista", n: vaga.candidatosEntrevista },
    { etapa: "Enviados", n: vaga.candidatosEnviados },
    { etapa: "Contratados", n: vaga.candidatosContratados },
  ];
  const max = Math.max(...funil.map((f) => f.n), 1);

  const candidatosVaga = candidatos.filter((c) => c.vagaId === vaga.id);
  const colunas = ["Triagem", "Quest.", "Entrevista", "Enviados", "Decisão", "Proposta", "Reprovados"] as const;
  type Coluna = typeof colunas[number];

  // Posições da vaga (Doc Mestre — Etapa 6: bloquear contratações além do total).
  const posicoesVaga: number = (vaga as unknown as { posicoes?: number }).posicoes ?? 1;

  // Estado do Kanban: candidato -> coluna (todos começam em "Triagem")
  const [colunasEstado, setColunasEstado] = useState<Record<string, Coluna>>(
    () => Object.fromEntries(candidatosVaga.map((c) => [c.id, "Triagem" as Coluna]))
  );
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<Coluna | null>(null);

  const navigate = useNavigate();

  // Menu "···" por card
  const [menuAbertoId, setMenuAbertoId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!menuAbertoId) return;
    function onDocClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuAbertoId(null);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [menuAbertoId]);

  // Observação rápida inline por card
  const [obsAbertaId, setObsAbertaId] = useState<string | null>(null);
  const [obsTexto, setObsTexto] = useState<Record<string, string>>({});

  // Candidatos desclassificados (somem do Kanban)
  const [desclassificados, setDesclassificados] = useState<Set<string>>(new Set());

  // Confirmação de desclassificação
  const [confirmarDesclId, setConfirmarDesclId] = useState<string | null>(null);

  // Confirmação de envio ao cliente (coluna "Enviados") via Kanban
  const [confirmarEnviadosId, setConfirmarEnviadosId] = useState<string | null>(null);

  // Decisão final (coluna "Decisão") via Kanban
  type OpcaoDecisao = "Contratado" | "Reprovado pelo cliente" | "Em negociação";
  const [confirmarDecisaoId, setConfirmarDecisaoId] = useState<string | null>(null);
  const [opcaoDecisao, setOpcaoDecisao] = useState<OpcaoDecisao | null>(null);

  // ── Estado adicional (mock) — publicação, candidatos extras, eventos, chat
  const [publicacao, setPublicacao] = useState<PublicacaoStatus>("nao_publicada");
  const [candidatosExtras, setCandidatosExtras] = useState<CandidatoExtra[]>([]);
  const [questionariosVaga, setQuestionariosVaga] = useState<QuestionarioVaga[]>([
    {
      id: "q-disc",
      nome: "Avaliação técnica padrão",
      descricao: "Perguntas básicas de fit técnico para a vaga.",
      perguntas: [
        { id: "p1", ordem: 1, texto: "Conte uma situação em que você liderou uma mudança importante.", tipo: "texto_livre", obrigatoria: true },
        { id: "p2", ordem: 2, texto: "Como você lida com prazos apertados?", tipo: "escala_1_5", obrigatoria: true },
        { id: "p3", ordem: 3, texto: "Modelo de trabalho preferido?", tipo: "multipla_escolha", obrigatoria: false, opcoes: ["Presencial", "Híbrido", "Remoto"] },
      ],
      criadoPor: "Patricia Lima",
      criadoEm: new Date().toLocaleDateString("pt-BR"),
      respostasPorCandidato: {},
    },
  ]);
  const [eventos, setEventos] = useState<EventoEntrevista[]>([]);
  const [mensagens, setMensagens] = useState<MensagemVaga[]>([
    { id: "mv1", autor: "Ana Beatriz", iniciais: "AB", quando: "06/04 14:20",
      texto: "Iniciamos a triagem com 48 currículos. Foco em perfil executivo.", canal: "interno" },
    { id: "mv2", autor: "RH Cliente", iniciais: "RH", quando: "07/04 09:10",
      texto: "Podemos priorizar quem tenha vivência em multinacional?", canal: "cliente" },
    { id: "mv3", autor: "Ana Beatriz", iniciais: "AB", quando: "07/04 09:42",
      texto: "Anotado @RH Cliente — vou sinalizar essa prioridade no parecer. https://azumi.app/vaga/v1",
      canal: "cliente" },
  ]);
  const [declinios, setDeclinios] = useState<Record<string, { motivo: string; quem: "candidato" | "azumi" }>>({});

  // ── Modais novos ─────────────────────────────────────────────────
  const [novoCandOpen, setNovoCandOpen] = useState(false);
  const [convidarOpen, setConvidarOpen] = useState(false);
  // (legado removido — substituído por editorQuestId)
  /** Quando aberto: id do questionário a editar; "novo" → criar do zero. */
  const [editorQuestId, setEditorQuestId] = useState<string | "novo" | null>(null);
  /** Confirmação de exclusão de questionário. */
  const [excluirQuestId, setExcluirQuestId] = useState<string | null>(null);
  /** Modal de envio de questionário ao mover para coluna Quest. */
  const [enviarQuestParaCand, setEnviarQuestParaCand] = useState<string | null>(null);
  /** Modal "Enviar via WhatsApp" — guarda candidatoId + questionarioId (opcional). */
  const [whatsTemplateOpen, setWhatsTemplateOpen] = useState<{ candidatoId: string; questionarioId?: string } | null>(null);
  const [resumoOpen, setResumoOpen] = useState<string | null>(null);
  const [discWhatsOpen, setDiscWhatsOpen] = useState<string | null>(null);
  const [associarQuestOpen, setAssociarQuestOpen] = useState<string | null>(null);
  const [declinarOpen, setDeclinarOpen] = useState<string | null>(null);
  const [agendarOpen, setAgendarOpen] = useState<string | null>(null);
  /** Modal específico de Entrevista com Gestor (Etapa 5 — Doc Mestre). */
  const [agendarGestorOpen, setAgendarGestorOpen] = useState<string | null>(null);
  const [fichaCandidatoId, setFichaCandidatoId] = useState<string | null>(null);
  const [relatorioOpenId, setRelatorioOpenId] = useState<string | null>(null);
  const [relatoriosPorCandidato, setRelatoriosPorCandidato] = useState<Record<string, RelatorioCandidato>>({});

  // ── Etapa 6 — Proposta ─────────────────────────────────────────
  /** Quando aberto: id do candidato p/ enviar proposta. */
  const [enviarPropostaPara, setEnviarPropostaPara] = useState<string | null>(null);
  /** Sub p/ rerender quando o store de propostas mudar. */
  const [propostaTick, setPropostaTick] = useState(0);
  useEffect(() => {
    const off = subscribePropostas(() => setPropostaTick((v) => v + 1));
    return () => { off(); };
  }, []);
  // Cron leve: a cada 30s, se houver proposta enviada com tempo expirado, marca como expirada.
  useEffect(() => {
    const id = window.setInterval(() => {
      candidatosVaga.forEach((c) => {
        const p = getPropostaAtiva(c.id);
        if (p && isExpiradaPorTempo(p)) expirarProposta(p.id);
      });
    }, 30000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vaga.id]);

  // ── Etapa 7 — Feedback de reprovados ──────────────────────────
  const [enviarFeedbackPara, setEnviarFeedbackPara] = useState<string | null>(null);

  // Lista de contratados (proposta aceita) — para regra de bloqueio
  const idsContratados = useMemo(
    () => contratadosNaVaga(vaga.id),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [vaga.id, propostaTick]
  );
  const posicoesPreenchidas = idsContratados.length;
  const vagaEncerrada = posicoesPreenchidas >= posicoesVaga;

  // Pop-up automático: "Deseja gerar o Relatório Final?" quando todas as
  // posições forem preenchidas (apenas 1x por vaga — verifica store).
  const [relatorioFinalPromptOpen, setRelatorioFinalPromptOpen] = useState(false);
  useEffect(() => {
    if (vagaEncerrada && !jaGerouRelatorioFinal(vaga.id)) {
      setRelatorioFinalPromptOpen(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vagaEncerrada, vaga.id]);

  // Re-render quando o store de Entrevista com Gestor muda (cliente / rota pública).
  const [storeVersao, setStoreVersao] = useState(0);
  useEffect(() => subscribeEntrevistaGestor(() => setStoreVersao((v) => v + 1)), []);
  const agendamentosDaVaga = useMemo(
    () => listarAgendamentosDaVaga(vaga.id),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [vaga.id, storeVersao]
  );

  // Link público da vaga (mock)
  const linkPublico = `https://azumi.jobs/vaga/${vaga.id}`;

  function moverCandidato(candId: string, coluna: Coluna) {
    const cand = candidatosVaga.find((c) => c.id === candId);
    setColunasEstado((prev) =>
      prev[candId] === coluna ? prev : { ...prev, [candId]: coluna }
    );
    if (cand && colunasEstado[candId] !== coluna) {
      toast.info(`${cand.nome} movido para ${coluna}`);
    }
  }

  function tentarMover(candId: string, coluna: Coluna): boolean {
    if (colunasEstado[candId] === coluna) return false;
    if (coluna === "Enviados") {
      setConfirmarEnviadosId(candId);
      return true;
    }
    if (coluna === "Decisão") {
      setOpcaoDecisao(null);
      setConfirmarDecisaoId(candId);
      return true;
    }
    if (coluna === "Quest.") {
      // Move + abre modal de envio de questionário (não bloqueia movimento).
      setColunasEstado((prev) => ({ ...prev, [candId]: coluna }));
      setEnviarQuestParaCand(candId);
      return true;
    }
    if (coluna === "Entrevista") {
      // Move + abre modal de Entrevista com Gestor (Etapa 5 — Doc Mestre).
      // Apenas dispara se ainda não houver agendamento ativo p/ este candidato.
      setColunasEstado((prev) => ({ ...prev, [candId]: coluna }));
      const existente = getAgendamentoDoCandidato(candId);
      if (!existente) {
        setAgendarGestorOpen(candId);
      }
      return true;
    }
    if (coluna === "Proposta") {
      // Etapa 6 — Doc Mestre: exige aprovação do gestor (parecer "prosseguir").
      const parecer = getParecerGestor(candId);
      if (!parecer || parecer.decisao !== "prosseguir") {
        toast.error(
          "Este candidato ainda não foi aprovado pelo gestor. Registre o parecer antes de enviar proposta.",
        );
        return true; // bloqueia o movimento
      }
      // Bloqueia se todas as posições da vaga já foram preenchidas.
      if (vagaEncerrada && !idsContratados.includes(candId)) {
        toast.error(
          `Limite de posições preenchido (${posicoesPreenchidas}/${posicoesVaga}). Vaga encerrada para novas contratações.`,
        );
        return true;
      }
      // Move + abre modal de envio de proposta.
      setColunasEstado((prev) => ({ ...prev, [candId]: coluna }));
      const propostaExistente = getPropostaAtiva(candId);
      if (!propostaExistente || propostaExistente.status === "expirada") {
        setEnviarPropostaPara(candId);
      }
      return true;
    }
    if (coluna === "Reprovados") {
      // Etapa 7 — Doc Mestre: simples movimento; botão "Enviar feedback" aparece no card.
      setColunasEstado((prev) => ({ ...prev, [candId]: coluna }));
      return true;
    }
    return false;
  }

  /** Gera link público (mock) para o candidato responder o questionário. */
  function gerarLinkQuestionario(questionarioId: string, candidatoId: string) {
    return `https://azumi.jobs/questionario/${questionarioId}?cand=${candidatoId}&vaga=${vaga.id}`;
  }

  function enviarQuestionarioParaCandidato(questionarioId: string, candidatoId: string) {
    const link = gerarLinkQuestionario(questionarioId, candidatoId);
    const hoje = new Date().toLocaleDateString("pt-BR");
    setQuestionariosVaga((prev) =>
      prev.map((q) =>
        q.id === questionarioId
          ? {
              ...q,
              respostasPorCandidato: {
                ...q.respostasPorCandidato,
                [candidatoId]: { status: "pendente", enviadoEm: hoje, link },
              },
            }
          : q,
      ),
    );
    toast.success("Link do questionário gerado. Você pode enviar por WhatsApp ou copiar o link.");
    return link;
  }

  function salvarAvaliacaoQuestionario(
    questionarioId: string,
    candidatoId: string,
    questoes: Record<string, AvaliacaoQuestao>,
    salvoComo: "rascunho" | "definitivo",
  ) {
    const notas = Object.values(questoes).map((a) => a.nota);
    const media = notas.length ? notas.reduce((a, b) => a + b, 0) / notas.length : 0;
    setQuestionariosVaga((prev) =>
      prev.map((q) => {
        if (q.id !== questionarioId) return q;
        const atual = q.respostasPorCandidato[candidatoId] ?? { status: "respondido" as const };
        return {
          ...q,
          respostasPorCandidato: {
            ...q.respostasPorCandidato,
            [candidatoId]: {
              ...atual,
              status: "respondido",
              respondidoEm: atual.respondidoEm ?? new Date().toLocaleDateString("pt-BR"),
              avaliacao: { questoes, media, salvoComo },
              notaMedia: salvoComo === "definitivo" ? media : atual.notaMedia,
            },
          },
        };
      }),
    );
    if (salvoComo === "definitivo") {
      toast.success(`Avaliação salva — média ${media.toFixed(1)}/5.`);
    } else {
      toast.info("Rascunho da avaliação salvo.");
    }
  }

  function avancarEtapa(candId: string) {
    const cand = candidatosVaga.find((c) => c.id === candId);
    if (!cand) return;
    const atual = colunasEstado[candId];
    const idx = colunas.indexOf(atual);
    if (idx < 0 || idx >= colunas.length - 1) {
      toast.info(`${cand.nome} já está na última etapa.`);
      return;
    }
    const proxima = colunas[idx + 1];
    if (tentarMover(candId, proxima)) return;
    setColunasEstado((prev) => ({ ...prev, [candId]: proxima }));
    toast.info(`${cand.nome} avançado para ${proxima}.`);
  }

  function salvarObservacao(candId: string) {
    const cand = candidatosVaga.find((c) => c.id === candId);
    const txt = (obsTexto[candId] ?? "").trim();
    if (!cand || !txt) {
      toast.error("Digite uma observação antes de salvar.");
      return;
    }
    setObsAbertaId(null);
    toast.success(`Observação salva para ${cand.nome}.`);
  }

  function confirmarDesclassificacao() {
    if (!confirmarDesclId) return;
    const cand = candidatosVaga.find((c) => c.id === confirmarDesclId);
    setDesclassificados((prev) => new Set(prev).add(confirmarDesclId));
    setConfirmarDesclId(null);
    if (cand) toast.warning(`${cand.nome} desclassificado.`);
  }

  function handleDrop(coluna: Coluna) {
    if (!draggingId) return;
    const id = draggingId;
    setDraggingId(null);
    setDragOverCol(null);
    if (tentarMover(id, coluna)) return;
    const cand = candidatosVaga.find((c) => c.id === id);
    setColunasEstado((prev) =>
      prev[id] === coluna ? prev : { ...prev, [id]: coluna }
    );
    if (cand && colunasEstado[id] !== coluna) {
      toast.info(`${cand.nome} movido para ${coluna}`);
    }
  }

  function handleCliqueEnviar() {
    const total = candidatosVaga.filter(c => c.enviado).length;
    if (total > 3) {
      setExcedeuOpen(true);
    } else {
      setEnviarOpen(true);
    }
  }

  return (
    <div>
      <Link to="/app/atracao" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-3">
        <ArrowLeft className="h-3.5 w-3.5" /> Voltar para vagas
      </Link>

      <PageHeader
        title={vaga.titulo}
        subtitle={
          <span className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1"><Building2 className="h-3.5 w-3.5" /> {vaga.empresa}</span>
            <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {vaga.filial}</span>
          </span> as any
        }
        actions={
          <>
            <StatusBadge status={vaga.status} />
            <Timer compact />
          </>
        }
      />

      {/* ─── Publicação no site de vagas Azumi ───
          TODO: aqui será plugada a automação real com o site de vagas / APIs.
          Hoje é só mock em memória. */}
      <div className="mb-4 rounded-xl border border-border bg-card px-4 py-3 flex items-center gap-3 flex-wrap">
        <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
        <div className="text-xs">
          <span className="text-muted-foreground">Publicação:</span>{" "}
          {publicacao === "publicada" ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-success/30 bg-success/10 px-2 py-0.5 text-success font-medium">
              <CheckCircle2 className="h-3 w-3" /> Publicada no site da Azumi
            </span>
          ) : publicacao === "em_revisao" ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-warning/30 bg-warning/10 px-2 py-0.5 text-warning font-medium">
              <Clock className="h-3 w-3" /> Em revisão
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary px-2 py-0.5 text-muted-foreground font-medium">
              Não publicada
            </span>
          )}
        </div>
        <div className="ml-auto flex items-center gap-2">
          {publicacao !== "publicada" && (
            <button
              type="button"
              onClick={() => {
                setPublicacao("em_revisao");
                setTimeout(() => {
                  setPublicacao("publicada");
                  toast.success("Vaga marcada como publicada no site da Azumi (mock).");
                }, 600);
                toast.info("Enviando para revisão antes de publicar…");
              }}
              className="h-8 px-3 rounded-md bg-primary text-primary-foreground text-xs font-medium inline-flex items-center gap-1.5"
            >
              <Globe className="h-3.5 w-3.5" /> Publicar no site
            </button>
          )}
          {publicacao === "publicada" && (
            <button
              type="button"
              onClick={() => {
                setPublicacao("nao_publicada");
                toast.info("Vaga despublicada do site (mock).");
              }}
              className="h-8 px-3 rounded-md border border-border hover:bg-secondary text-xs font-medium"
            >
              Despublicar
            </button>
          )}
          <a
            href={linkPublico}
            onClick={(e) => {
              e.preventDefault();
              navigator.clipboard?.writeText(linkPublico);
              toast.success("Link público copiado!");
            }}
            className="h-8 px-3 rounded-md border border-border hover:bg-secondary text-xs font-medium inline-flex items-center gap-1.5"
          >
            <Link2 className="h-3.5 w-3.5" /> Copiar link
          </a>
        </div>
      </div>

      {vaga.beneficios && vaga.beneficios.length > 0 && (
        <div className="mb-5 flex flex-wrap items-center gap-2">
          <span className="text-xs uppercase tracking-wider text-muted-foreground mr-1">Benefícios</span>
          {vaga.beneficios.map((b) => (
            <span
              key={b}
              className="inline-flex items-center rounded-full border border-border bg-secondary px-2.5 py-0.5 text-xs font-medium text-foreground"
            >
              {BENEFICIO_LABEL[b] ?? b}
            </span>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Timeline */}
        <div className="lg:col-span-3 bg-card border border-border rounded-xl p-5 card-hover">
          <h3 className="font-display font-semibold mb-4">Timeline da vaga</h3>
          <ol className="relative grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {etapasVaga.map((e, idx) => {
              const done = e.status === "concluida";
              const active = e.status === "andamento";
              return (
                <li key={idx} className="relative">
                  <div className={cn(
                    "h-8 w-8 rounded-full flex items-center justify-center font-data text-xs",
                    done && "bg-success text-success-foreground",
                    active && "bg-primary text-primary-foreground animate-soft-pulse",
                    !done && !active && "bg-muted text-muted-foreground"
                  )}>
                    {done ? <CheckCircle2 className="h-4 w-4" /> : idx + 1}
                  </div>
                  <div className="mt-2">
                    <div className="text-sm font-medium leading-tight">{e.nome}</div>
                    <div className="text-[11px] text-muted-foreground font-data mt-0.5">
                      {e.inicio} → {e.fim}
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
          <div className="mt-5">
            <SlaBar percent={vaga.sla} label={`SLA da vaga · ${vaga.diasAbertos}/${vaga.diasPrevistos} dias`} />
          </div>
        </div>

        {/* Funil */}
        <div className="bg-card border border-border rounded-xl p-5 card-hover">
          <h3 className="font-display font-semibold mb-4">Funil</h3>
          <ul className="space-y-3">
            {funil.map((f, i) => {
              const w = (f.n / max) * 100;
              const intensity = 1 - i * 0.15;
              return (
                <li key={f.etapa}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">{f.etapa}</span>
                    <span className="font-data tabular-nums">{f.n}</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${w}%`, opacity: intensity }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <SectionDivider />

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-border mb-5 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "px-4 py-2.5 text-sm font-medium flex items-center gap-2 border-b-2 -mb-px transition-colors whitespace-nowrap",
              tab === t.key
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </div>

      {tab === "candidatos" && (
        <div>
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <button className="h-8 px-3 rounded-lg border border-border text-xs flex items-center gap-1.5 hover:bg-secondary">
              <Filter className="h-3.5 w-3.5" /> Filtrar
            </button>
            <button
              onClick={() => setNovoCandOpen(true)}
              className="h-8 px-3 rounded-lg border border-border text-xs flex items-center gap-1.5 hover:bg-secondary"
            >
              <UserPlus className="h-3.5 w-3.5" /> Adicionar candidato
            </button>
            <button
              onClick={() => setConvidarOpen(true)}
              className="h-8 px-3 rounded-lg border border-border text-xs flex items-center gap-1.5 hover:bg-secondary"
            >
              <Link2 className="h-3.5 w-3.5" /> Convidar candidato
            </button>
            {/* "Criar questionário" foi movido para a aba Questionários */}
            <span className="text-xs text-muted-foreground ml-auto inline-flex items-center gap-2">
              <span className={cn(
                "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border",
                vagaEncerrada
                  ? "bg-success/15 text-success border-success/30"
                  : "bg-muted text-muted-foreground border-border"
              )}>
                <Briefcase className="h-3 w-3" />
                Posições: {posicoesPreenchidas}/{posicoesVaga}
                {vagaEncerrada && " — encerrada"}
              </span>
              <span>Arraste candidatos entre etapas</span>
            </span>
          </div>

          {/* Candidatos adicionados manualmente / convidados (mock — não entram no kanban ainda) */}
          {candidatosExtras.length > 0 && (
            <div className="mb-4 rounded-lg border border-dashed border-border bg-card p-3">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Adicionados recentemente ({candidatosExtras.length})
              </div>
              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {candidatosExtras.map((c) => (
                  <li
                    key={c.id}
                    onClick={() => setFichaCandidatoId(c.id)}
                    className="border border-border rounded-md p-2 flex items-center gap-2 bg-background/40 cursor-pointer hover:border-primary/50 hover:bg-secondary/40 transition-colors"
                  >
                    <div className="h-7 w-7 rounded-full bg-gradient-brand flex items-center justify-center text-[10px] font-semibold text-white">
                      {c.nome.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-medium truncate">{c.nome}</div>
                      <div className="text-[10px] text-muted-foreground truncate">
                        {c.cargo} · {c.origem === "manual" ? "Adicionado manualmente" : c.origem === "convite" ? "Convidado" : "Site"}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="-mx-2 overflow-x-auto pb-3 kanban-scroll">
            <div className="flex gap-3 px-2 min-w-max">
              {colunas.map((col) => {
                const candidatosNaColuna = candidatosVaga.filter(
                  (c) => colunasEstado[c.id] === col && !desclassificados.has(c.id)
                );
                const isOver = dragOverCol === col;
                return (
                  <div
                    key={col}
                    onDragOver={(e) => {
                      e.preventDefault();
                      if (dragOverCol !== col) setDragOverCol(col);
                    }}
                    onDragLeave={() => {
                      if (dragOverCol === col) setDragOverCol(null);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      handleDrop(col);
                    }}
                    className={cn(
                      "bg-card border rounded-xl p-3 min-h-[280px] w-[300px] shrink-0 transition-colors",
                      isOver ? "border-primary bg-primary/5" : "border-border"
                    )}
                  >
                  <div className="flex items-center justify-between mb-3 px-1">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{col}</span>
                    <span className="font-data text-xs text-muted-foreground">{candidatosNaColuna.length}</span>
                  </div>
                  {candidatosNaColuna.length > 0 ? (
                    <ul className="space-y-2">
                      {candidatosNaColuna.map((c) => {
                        const menuAberto = menuAbertoId === c.id;
                        const obsAberta = obsAbertaId === c.id;
                        return (
                        <li
                          key={c.id}
                          draggable
                          onDragStart={(e) => {
                            setDraggingId(c.id);
                            e.dataTransfer.effectAllowed = "move";
                            e.dataTransfer.setData("text/plain", c.id);
                          }}
                          onDragEnd={() => {
                            setDraggingId(null);
                            setDragOverCol(null);
                          }}
                          className={cn(
                            "relative bg-background/60 border border-border rounded-lg overflow-hidden hover:border-primary/40 cursor-grab active:cursor-grabbing transition-colors",
                            draggingId === c.id && "opacity-50"
                          )}
                        >
                          {/* Corpo principal do card */}
                          <div className="p-3 space-y-2">
                            {/* Linha 1: Avatar + Nome + Mais ações */}
                            <div className="flex items-start gap-2.5">
                              <div className="h-10 w-10 shrink-0 rounded-full bg-gradient-brand flex items-center justify-center text-xs font-semibold text-white">
                                {c.nome.split(" ").map(n => n[0]).join("").slice(0, 2)}
                              </div>
                              <div className="min-w-0 flex-1">
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); setFichaCandidatoId(c.id); }}
                                  onMouseDown={(e) => e.stopPropagation()}
                                  className="text-[15px] font-semibold leading-tight hover:text-primary block text-left w-full line-clamp-2"
                                  title={c.nome}
                                >
                                  {c.nome}
                                </button>
                                <div className="text-xs text-muted-foreground truncate mt-0.5" title={c.cargo}>
                                  {c.cargo}
                                </div>
                              </div>
                              <button
                                type="button"
                                aria-label="Mais ações"
                                onMouseDown={(e) => e.stopPropagation()}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setMenuAbertoId(menuAberto ? null : c.id);
                                }}
                                className="h-7 w-7 -mr-1 rounded-md flex items-center justify-center text-muted-foreground hover:bg-secondary hover:text-foreground shrink-0"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </button>
                            </div>

                            {/* Linha 3: Tags (DISC) */}
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border bg-primary/10 text-primary border-primary/20">
                                DISC: {c.perfilDom}
                              </span>
                            </div>

                            {/* DISC bars */}
                            <DiscBars values={c.disc} compact />

                            {/* Linha 4: Ações rápidas */}
                            <div className="flex items-center gap-1 pt-0.5">
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); setFichaCandidatoId(c.id); }}
                                onMouseDown={(e) => e.stopPropagation()}
                                title="Ver ficha"
                                className="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:bg-secondary hover:text-foreground"
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); setRelatorioOpenId(c.id); }}
                                onMouseDown={(e) => e.stopPropagation()}
                                title="Relatório"
                                className="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:bg-secondary hover:text-foreground"
                              >
                                <FileText className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); setDiscWhatsOpen(c.id); }}
                                onMouseDown={(e) => e.stopPropagation()}
                                title="WhatsApp"
                                className="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:bg-secondary hover:text-foreground"
                              >
                                <MessageCircle className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); setObsAbertaId(c.id); }}
                                onMouseDown={(e) => e.stopPropagation()}
                                title="Observação rápida"
                                className="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:bg-secondary hover:text-foreground"
                              >
                                <StickyNote className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Bloco inferior: agendamento (separado, com fundo diferente) */}
                          {(() => {
                            const ev = eventos.find((e) => e.candidatoId === c.id);
                            const podeAgendar = colunasEstado[c.id] === "Entrevista";
                            if (!ev && !podeAgendar) return null;
                            return (
                              <div className="border-t border-border bg-muted/40 px-3 py-2 flex items-center gap-2 text-[11px]">
                                {ev ? (
                                  <>
                                    <CalendarDays className="h-3.5 w-3.5 text-primary shrink-0" />
                                    <span className="truncate">
                                      Entrevista <span className="font-medium">{ev.data}</span> às <span className="font-medium">{ev.hora}</span>
                                    </span>
                                  </>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); setAgendarOpen(c.id); }}
                                    onMouseDown={(e) => e.stopPropagation()}
                                    className="inline-flex items-center gap-1.5 text-primary hover:underline font-medium"
                                  >
                                    <CalendarPlus className="h-3.5 w-3.5" /> Agendar entrevista
                                  </button>
                                )}
                              </div>
                            );
                          })()}

                          {/* Etapa 6 — badge de proposta no card */}
                          {colunasEstado[c.id] === "Proposta" && (() => {
                            const p = getPropostaAtiva(c.id);
                            if (!p) return null;
                            const cls = p.status === "aceita"
                              ? "bg-success/15 text-success border-success/30"
                              : p.status === "recusada"
                              ? "bg-destructive/15 text-destructive border-destructive/30"
                              : p.status === "expirada"
                              ? "bg-muted text-muted-foreground border-border"
                              : "bg-warning/15 text-warning border-warning/30";
                            return (
                              <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border max-w-full truncate" title={statusPropostaLabel(p.status)}>
                                <span className={cn("inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full border truncate", cls)}>
                                  <Send className="h-2.5 w-2.5" /> {statusPropostaLabel(p.status)}
                                </span>
                              </div>
                            );
                          })()}

                          {/* Etapa 7 — botão Enviar feedback no card de Reprovados */}
                          {colunasEstado[c.id] === "Reprovados" && (
                            <div className="mt-2 flex items-center gap-1.5">
                              {jaTemFeedback(c.id) ? (
                                <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                                  <CheckCircle2 className="h-3 w-3 text-success" /> Feedback enviado
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); setEnviarFeedbackPara(c.id); }}
                                  onMouseDown={(e) => e.stopPropagation()}
                                  className="inline-flex items-center gap-1 h-6 px-2 rounded-md border border-border hover:bg-secondary text-[10px] font-medium"
                                >
                                  <MessageCircle className="h-3 w-3" /> Enviar feedback
                                </button>
                              )}
                            </div>
                          )}

                          {obsAberta && (
                            <div
                              className="mt-2 space-y-2"
                              onMouseDown={(e) => e.stopPropagation()}
                              draggable={false}
                              onDragStart={(e) => e.preventDefault()}
                            >
                              <textarea
                                value={obsTexto[c.id] ?? ""}
                                onChange={(e) =>
                                  setObsTexto((prev) => ({ ...prev, [c.id]: e.target.value }))
                                }
                                placeholder="Observação rápida sobre o candidato…"
                                className="w-full h-20 p-2 rounded-md bg-secondary border border-input focus:border-primary outline-none text-xs resize-none"
                              />
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => setObsAbertaId(null)}
                                  className="h-7 px-2.5 rounded-md border border-border text-[11px] hover:bg-secondary"
                                >
                                  Cancelar
                                </button>
                                <button
                                  type="button"
                                  onClick={() => salvarObservacao(c.id)}
                                  className="h-7 px-2.5 rounded-md bg-primary text-primary-foreground text-[11px] font-medium"
                                >
                                  Salvar
                                </button>
                              </div>
                            </div>
                          )}

                          {menuAberto && (
                            <div
                              ref={menuRef}
                              className="absolute right-2 top-10 z-30 w-48 max-w-[calc(100vw-1rem)] rounded-lg border border-border bg-popover shadow-elevated py-1 text-sm"
                              onMouseDown={(e) => e.stopPropagation()}
                            >
                              <button
                                type="button"
                                onClick={() => { setMenuAbertoId(null); setFichaCandidatoId(c.id); }}
                                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-secondary text-left"
                              >
                                <Eye className="h-3.5 w-3.5 text-muted-foreground" /> Ver ficha
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setMenuAbertoId(null);
                                  setObsAbertaId(c.id);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-secondary text-left"
                              >
                                <StickyNote className="h-3.5 w-3.5 text-muted-foreground" /> Observação rápida
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setMenuAbertoId(null);
                                  avancarEtapa(c.id);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-secondary text-left"
                              >
                                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" /> Mover para próxima etapa
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setMenuAbertoId(null);
                                  setConfirmarDesclId(c.id);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-secondary text-left text-destructive"
                              >
                                <UserX className="h-3.5 w-3.5" /> Desclassificar
                              </button>
                            </div>
                          )}
                        </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <div className="flex items-center justify-center h-32 text-xs text-muted-foreground">—</div>
                  )}
                </div>
              );
            })}
            </div>
          </div>
        </div>
      )}

      {tab === "chat" && (
        <ChatVagaPanel
          mensagens={mensagens}
          onSend={(m) => setMensagens((prev) => [...prev, m])}
        />
      )}

      {tab === "perfis" && (
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div>
              <h3 className="font-display font-semibold">Perfis selecionados para envio</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {candidatosVaga.filter(c => c.enviado).length} candidato(s) prontos para apresentação ao cliente
              </p>
            </div>
            <button
              onClick={handleCliqueEnviar}
              disabled={candidatosVaga.filter(c => c.enviado).length === 0}
              className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium flex items-center gap-1.5 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-4 w-4" /> Enviar para o cliente
            </button>
          </div>

          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {candidatosVaga.filter(c => c.enviado).map((c) => {
              const declinio = declinios[c.id];
              return (
                <li key={c.id} className="border border-border rounded-lg p-3 bg-background/40">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-gradient-brand flex items-center justify-center text-[10px] font-semibold text-white">
                      {c.nome.split(" ").map(n => n[0]).join("").slice(0, 2)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <button
                        type="button"
                        onClick={() => setFichaCandidatoId(c.id)}
                        className="text-sm font-medium truncate text-left hover:text-primary"
                      >
                        {c.nome}
                      </button>
                      <div className="text-[11px] text-muted-foreground">DISC: {c.perfilDom} dominante</div>
                    </div>
                    {declinio ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-destructive/15 text-destructive border border-destructive/30">
                        Declinou
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-success/15 text-success border border-success/30">
                        Pronto
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground line-clamp-2">{c.parecer}</p>

                  {/* Ações por candidato */}
                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setFichaCandidatoId(c.id)}
                      className="inline-flex items-center gap-1 h-7 px-2 rounded-md border border-border text-[11px] font-medium hover:bg-secondary"
                    >
                      <FileText className="h-3 w-3" /> Ver ficha
                    </button>
                    <button
                      type="button"
                      onClick={() => setResumoOpen(c.id)}
                      className="inline-flex items-center gap-1 h-7 px-2 rounded-md border border-border text-[11px] font-medium hover:bg-secondary"
                    >
                      <Eye className="h-3 w-3" /> Resumo p/ cliente
                    </button>
                    <button
                      type="button"
                      onClick={() => setDiscWhatsOpen(c.id)}
                      className="inline-flex items-center gap-1 h-7 px-2 rounded-md border border-border text-[11px] font-medium hover:bg-secondary"
                    >
                      <MessageCircle className="h-3 w-3" /> Solicitar DISC
                    </button>
                    <button
                      type="button"
                      onClick={() => toast.info(`PDF DISC de ${c.nome} (mock).`)}
                      className="inline-flex items-center gap-1 h-7 px-2 rounded-md border border-border text-[11px] font-medium hover:bg-secondary"
                    >
                      <Download className="h-3 w-3" /> PDF DISC
                    </button>
                    <button
                      type="button"
                      onClick={() => setAssociarQuestOpen(c.id)}
                      className="inline-flex items-center gap-1 h-7 px-2 rounded-md border border-border text-[11px] font-medium hover:bg-secondary"
                    >
                      <ListChecks className="h-3 w-3" /> Questionário
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeclinarOpen(c.id)}
                      className="inline-flex items-center gap-1 h-7 px-2 rounded-md border border-destructive/30 text-destructive text-[11px] font-medium hover:bg-destructive/10"
                    >
                      <ThumbsDown className="h-3 w-3" /> Registrar declínio
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate(`/app/horas?task_id=${c.id}&vaga=${vaga.id}`)}
                      className="inline-flex items-center gap-1 h-7 px-2 rounded-md border border-border text-[11px] font-medium hover:bg-secondary ml-auto"
                    >
                      <Play className="h-3 w-3" /> Play
                    </button>
                  </div>

                  {declinio && (
                    <div className="mt-2 text-[11px] text-muted-foreground italic border-t border-border pt-2">
                      Declínio ({declinio.quem}): {declinio.motivo}
                    </div>
                  )}
                </li>
              );
            })}
            {candidatosVaga.filter(c => c.enviado).length === 0 && (
              <li className="col-span-full text-center text-xs text-muted-foreground py-8">
                Nenhum candidato marcado para envio ainda.
              </li>
            )}
          </ul>
        </div>
      )}

      {tab === "agenda" && (
        <div className="space-y-5">
          {/* Bloco novo: agendamentos com gestor (Etapa 5) */}
          <AgendamentoGestorPanel
            vagaId={vaga.id}
            agendamentos={agendamentosDaVaga}
            empresaNome={vaga.empresa}
          />

          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold">Outras entrevistas / eventos</h3>
              <span className="text-xs text-muted-foreground">{eventos.length} evento(s)</span>
            </div>
            {eventos.length === 0 ? (
              <div className="text-center text-sm text-muted-foreground py-8">
                Nenhuma entrevista interna agendada. Use o botão{" "}
                <CalendarPlus className="inline h-3.5 w-3.5" /> nos cards de candidatos em "Entrevista".
              </div>
            ) : (
              <ul className="space-y-2">
                {eventos.map((ev) => (
                  <li key={ev.id} className="flex items-center gap-3 border border-border rounded-lg px-3 py-2 bg-background/40">
                    <div className="h-9 w-9 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                      <CalendarDays className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium">{ev.candidatoNome}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {ev.tipo} · {ev.data} às {ev.hora} · {ev.local || "—"}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEventos((p) => p.filter((e) => e.id !== ev.id))}
                      className="h-7 w-7 rounded-md hover:bg-secondary text-muted-foreground"
                      aria-label="Remover"
                    >
                      <XIcon className="h-3.5 w-3.5 mx-auto" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {tab === "historico" && (
        <div className="bg-card border border-border rounded-xl p-5 max-w-3xl">
          <h3 className="font-display font-semibold mb-4">Histórico da vaga</h3>
          <ol className="relative space-y-4 before:absolute before:left-4 before:top-2 before:bottom-2 before:w-px before:bg-border">
            {comentariosVaga.map((c) => {
              const isSistema = !c.autor || /sistema|automátic/i.test(c.role);
              return (
                <li key={c.id} className="relative flex gap-3 pl-0">
                  <div className={cn(
                    "h-8 w-8 rounded-full flex items-center justify-center text-[10px] font-semibold shrink-0 z-10 border",
                    isSistema ? "bg-muted text-muted-foreground border-border"
                      : c.azumi ? "bg-gradient-brand text-white border-transparent"
                      : "bg-secondary text-foreground border-border"
                  )}>
                    {isSistema ? <Bot className="h-4 w-4" /> : c.autor.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                      {isSistema ? <Bot className="h-3 w-3" /> : <User className="h-3 w-3" />}
                      <span className="font-medium text-foreground">{c.autor}</span>
                      <span>· {c.role} ·</span>
                      <span className="font-data">{c.quando}</span>
                    </div>
                    <div className={cn(
                      "rounded-xl px-3 py-2 text-sm border",
                      isSistema ? "bg-muted/50 border-border italic"
                        : c.azumi ? "bg-primary/10 border-primary/20" : "bg-secondary border-border"
                    )}>
                      {c.texto}
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      )}

      {tab === "questionarios" && (
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold">Gestão de questionários</h3>
            <button
              onClick={() => setEditorQuestId("novo")}
              className="h-8 px-3 rounded-md bg-primary text-primary-foreground text-xs font-medium inline-flex items-center gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" /> Novo questionário
            </button>
          </div>
          {questionariosVaga.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground py-6">
              Nenhum questionário criado.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead className="bg-secondary/40 text-[11px] uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="text-left px-3 py-2 font-semibold">Título</th>
                    <th className="text-left px-3 py-2 font-semibold">Perguntas</th>
                    <th className="text-left px-3 py-2 font-semibold">Respostas</th>
                    <th className="text-left px-3 py-2 font-semibold">Criado por</th>
                    <th className="text-left px-3 py-2 font-semibold">Data</th>
                    <th className="text-right px-3 py-2 font-semibold">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {questionariosVaga.map((q) => {
                    const respondidos = Object.values(q.respostasPorCandidato).filter((r) => r.status === "respondido").length;
                    const total = Object.keys(q.respostasPorCandidato).length;
                    return (
                      <tr
                        key={q.id}
                        className="border-t border-border hover:bg-secondary/20 cursor-pointer"
                        onClick={() => setEditorQuestId(q.id)}
                      >
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-2">
                            <FileQuestion className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="font-medium">{q.nome}</div>
                              {q.descricao && (
                                <div className="text-[11px] text-muted-foreground line-clamp-1">{q.descricao}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-2.5 font-data">{q.perguntas.length}</td>
                        <td className="px-3 py-2.5 font-data">{respondidos}/{total || 0}</td>
                        <td className="px-3 py-2.5">{q.criadoPor}</td>
                        <td className="px-3 py-2.5 font-data text-muted-foreground">{q.criadoEm}</td>
                        <td className="px-3 py-2.5">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); setEditorQuestId(q.id); }}
                              className="h-7 w-7 inline-flex items-center justify-center rounded-md hover:bg-secondary text-muted-foreground"
                              aria-label="Editar"
                              title="Editar"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); setExcluirQuestId(q.id); }}
                              className="h-7 w-7 inline-flex items-center justify-center rounded-md hover:bg-destructive/10 text-destructive"
                              aria-label="Excluir"
                              title="Excluir"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* B09: Dialog de confirmação para envio ao cliente */}
      {enviarOpen && (
        <div className="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-card border border-border rounded-2xl shadow-elevated w-full max-w-md p-6 animate-scale-in">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-warning/15 text-warning flex items-center justify-center shrink-0">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-display text-lg font-semibold">Confirmar envio ao cliente?</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Você está prestes a enviar{" "}
                  <strong className="text-foreground">{candidatosVaga.filter(c => c.enviado).length} perfil(is)</strong>{" "}
                  para <strong className="text-foreground">{vaga.empresa}</strong>. Esta ação dispara
                  notificação ao cliente e inicia a contagem de SLA do parecer.
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-lg border border-border bg-background/40 p-3 space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Vaga</span>
                <span className="font-medium">{vaga.titulo}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Empresa</span>
                <span className="font-medium">{vaga.empresa}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Filial</span>
                <span className="font-medium">{vaga.filial}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">SLA do parecer</span>
                <span className="font-medium font-data">48h após envio</span>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                onClick={() => setEnviarOpen(false)}
                disabled={enviando}
                className="h-9 px-4 rounded-lg border border-border hover:bg-secondary text-sm disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={async () => {
                  setEnviando(true);
                  await new Promise((r) => setTimeout(r, 800));
                  setEnviando(false);
                  setEnviarOpen(false);
                  toast.success(`${candidatosVaga.filter(c => c.enviado).length} perfil(is) enviado(s) para ${vaga.empresa}.`, {
                    description: "O cliente foi notificado e tem 48h para emitir parecer.",
                  });
                }}
                disabled={enviando}
                className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium inline-flex items-center gap-1.5 disabled:opacity-50"
              >
                {enviando ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                {enviando ? "Enviando…" : "Confirmar envio"}
              </button>
            </div>
          </div>
        </div>
      )}

      {excedeuOpen && (
        <div className="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-card border border-border rounded-2xl shadow-elevated w-full max-w-md p-6 animate-scale-in">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-destructive/15 text-destructive flex items-center justify-center shrink-0">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display text-lg font-semibold">Limite de perfis excedido</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  O contrato permite o envio de no máximo 3 perfis por rodada. Você selecionou{" "}
                  <strong>{candidatosVaga.filter(c => c.enviado).length} perfis</strong>.
                  Para prosseguir, justifique o motivo abaixo.
                </p>
              </div>
            </div>
            <textarea
              value={justificativaExcesso}
              onChange={(e) => setJustificativaExcesso(e.target.value)}
              placeholder="Justificativa obrigatória para envio acima do limite contratual…"
              className="mt-4 w-full h-24 p-3 rounded-lg bg-secondary border border-input focus:border-primary outline-none text-sm resize-none"
            />
            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                onClick={() => { setExcedeuOpen(false); setJustificativaExcesso(""); }}
                className="h-9 px-4 rounded-lg border border-border hover:bg-secondary text-sm"
              >
                Cancelar
              </button>
              <button
                disabled={!justificativaExcesso.trim()}
                onClick={() => {
                  setExcedeuOpen(false);
                  setEnviarOpen(true);
                }}
                className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50"
              >
                Prosseguir com envio
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmarDesclId && (() => {
        const cand = candidatosVaga.find((c) => c.id === confirmarDesclId);
        return (
          <div className="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-card border border-border rounded-2xl shadow-elevated w-full max-w-md p-6 animate-scale-in">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-destructive/15 text-destructive flex items-center justify-center shrink-0">
                  <UserX className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display text-lg font-semibold">Desclassificar candidato?</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Tem certeza? <strong className="text-foreground">{cand?.nome}</strong> será marcado como desclassificado.
                  </p>
                </div>
              </div>
              <div className="mt-5 flex items-center justify-end gap-2">
                <button
                  onClick={() => setConfirmarDesclId(null)}
                  className="h-9 px-4 rounded-lg border border-border hover:bg-secondary text-sm"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmarDesclassificacao}
                  className="h-9 px-4 rounded-lg bg-destructive text-destructive-foreground text-sm font-medium inline-flex items-center gap-1.5"
                >
                  <UserX className="h-3.5 w-3.5" /> Desclassificar
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Confirmação: Mover para "Enviados" (apresentação ao cliente) */}
      {confirmarEnviadosId && (() => {
        const cand = candidatosVaga.find((c) => c.id === confirmarEnviadosId);
        return (
          <div className="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-card border border-border rounded-2xl shadow-elevated w-full max-w-md p-6 animate-scale-in">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/15 text-primary flex items-center justify-center shrink-0">
                  <Send className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display text-lg font-semibold">Enviar para avaliação do cliente?</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    O perfil de <strong className="text-foreground">{cand?.nome}</strong> será apresentado ao cliente{" "}
                    <strong className="text-foreground">{vaga.empresa}</strong>. O cliente tem 48h para emitir parecer.
                  </p>
                </div>
              </div>
              <div className="mt-5 flex items-center justify-end gap-2">
                <button
                  onClick={() => setConfirmarEnviadosId(null)}
                  className="h-9 px-4 rounded-lg border border-border hover:bg-secondary text-sm"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    const id = confirmarEnviadosId;
                    setConfirmarEnviadosId(null);
                    if (id) moverCandidato(id, "Enviados");
                  }}
                  className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium inline-flex items-center gap-1.5"
                >
                  <Send className="h-3.5 w-3.5" /> Confirmar
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Confirmação: Mover para "Decisão" final */}
      {confirmarDecisaoId && (() => {
        const cand = candidatosVaga.find((c) => c.id === confirmarDecisaoId);
        const opcoes: OpcaoDecisao[] = ["Contratado", "Reprovado pelo cliente", "Em negociação"];
        return (
          <div className="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-card border border-border rounded-2xl shadow-elevated w-full max-w-md p-6 animate-scale-in">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-success/15 text-success flex items-center justify-center shrink-0">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display text-lg font-semibold">Mover para Decisão Final</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Selecione o desfecho para <strong className="text-foreground">{cand?.nome}</strong>:
                  </p>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                {opcoes.map((op) => (
                  <label
                    key={op}
                    className={cn(
                      "flex items-center gap-2.5 px-3 py-2.5 rounded-lg border cursor-pointer transition-colors",
                      opcaoDecisao === op
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-secondary"
                    )}
                  >
                    <input
                      type="radio"
                      name="decisao-final"
                      value={op}
                      checked={opcaoDecisao === op}
                      onChange={() => setOpcaoDecisao(op)}
                      className="h-4 w-4 accent-primary"
                    />
                    <span className="text-sm font-medium">{op}</span>
                  </label>
                ))}
              </div>
              <div className="mt-5 flex items-center justify-end gap-2">
                <button
                  onClick={() => { setConfirmarDecisaoId(null); setOpcaoDecisao(null); }}
                  className="h-9 px-4 rounded-lg border border-border hover:bg-secondary text-sm"
                >
                  Cancelar
                </button>
                <button
                  disabled={!opcaoDecisao}
                  onClick={() => {
                    const id = confirmarDecisaoId;
                    const op = opcaoDecisao;
                    const nome = cand?.nome ?? "Candidato";
                    setConfirmarDecisaoId(null);
                    setOpcaoDecisao(null);
                    if (id && op) {
                      moverCandidato(id, "Decisão");
                      toast.success(`${nome} — ${op}`);
                    }
                  }}
                  className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium inline-flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" /> Confirmar
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Modal: Novo candidato (manual) ───────────────────────── */}
      {novoCandOpen && (
        <ModalShell title="Adicionar candidato" onClose={() => setNovoCandOpen(false)}>
          <NovoCandidatoForm
            onCancel={() => setNovoCandOpen(false)}
            onSave={(c) => {
              setCandidatosExtras((prev) => [...prev, c]);
              setNovoCandOpen(false);
              toast.success(`${c.nome} adicionado à vaga.`);
            }}
          />
        </ModalShell>
      )}

      {/* ── Modal: Convidar candidato por link ───────────────────── */}
      {convidarOpen && (
        <ModalShell title="Convidar candidato" onClose={() => setConvidarOpen(false)}>
          <ConvidarLinkForm vagaId={vaga.id} onClose={() => setConvidarOpen(false)} />
        </ModalShell>
      )}

      {/* ── Modal: Editor de questionário (criar / editar) ───────── */}
      {editorQuestId && (
        <QuestionarioEditorModal
          existing={editorQuestId !== "novo" ? questionariosVaga.find((q) => q.id === editorQuestId) ?? null : null}
          onClose={() => setEditorQuestId(null)}
          onSave={(q) => {
            setQuestionariosVaga((prev) => {
              const idx = prev.findIndex((x) => x.id === q.id);
              if (idx >= 0) {
                const copia = [...prev];
                copia[idx] = { ...prev[idx], ...q, respostasPorCandidato: prev[idx].respostasPorCandidato };
                return copia;
              }
              return [...prev, q];
            });
            setEditorQuestId(null);
            toast.success(`Questionário "${q.nome}" salvo.`);
          }}
        />
      )}

      {/* ── Confirmação: Excluir questionário ─────────────────────── */}
      {excluirQuestId && (() => {
        const q = questionariosVaga.find((x) => x.id === excluirQuestId);
        return (
          <ModalShell title="Excluir questionário" onClose={() => setExcluirQuestId(null)}>
            <div className="space-y-3 text-sm">
              <p>Tem certeza que deseja excluir <strong>{q?.nome}</strong>? Essa ação não pode ser desfeita.</p>
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setExcluirQuestId(null)} className="h-9 px-4 rounded-lg border border-border hover:bg-secondary text-sm">Cancelar</button>
                <button
                  onClick={() => {
                    setQuestionariosVaga((prev) => prev.filter((x) => x.id !== excluirQuestId));
                    setExcluirQuestId(null);
                    toast.warning("Questionário excluído.");
                  }}
                  className="h-9 px-4 rounded-lg bg-destructive text-destructive-foreground text-sm font-medium inline-flex items-center gap-1.5"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Excluir
                </button>
              </div>
            </div>
          </ModalShell>
        );
      })()}

      {/* ── Modal: Enviar questionário ao mover candidato p/ Quest. ── */}
      {enviarQuestParaCand && (() => {
        const c = candidatosVaga.find((x) => x.id === enviarQuestParaCand)
          ?? (() => {
            const ex = candidatosExtras.find((x) => x.id === enviarQuestParaCand);
            return ex ? { id: ex.id, nome: ex.nome } : null;
          })();
        return (
          <ModalShell title="Enviar questionário" onClose={() => setEnviarQuestParaCand(null)}>
            <EnviarQuestionarioForm
              candidatoNome={c?.nome ?? "Candidato"}
              questionarios={questionariosVaga}
              onCancel={() => setEnviarQuestParaCand(null)}
              onConfirm={(qId) => {
                if (!enviarQuestParaCand) return;
                enviarQuestionarioParaCandidato(qId, enviarQuestParaCand);
                setEnviarQuestParaCand(null);
              }}
            />
          </ModalShell>
        );
      })()}

      {/* ── Modal: Enviar via WhatsApp (templates) ───────────────── */}
      {whatsTemplateOpen && (() => {
        const cBase = candidatosVaga.find((x) => x.id === whatsTemplateOpen.candidatoId);
        const cExtra = candidatosExtras.find((x) => x.id === whatsTemplateOpen.candidatoId);
        const nome = cBase?.nome ?? cExtra?.nome ?? "Candidato";
        const telefone = cExtra?.telefone ?? DADOS_EXTRA_MOCK[whatsTemplateOpen.candidatoId]?.telefone ?? "";
        const quest = whatsTemplateOpen.questionarioId
          ? questionariosVaga.find((q) => q.id === whatsTemplateOpen.questionarioId)
          : undefined;
        const linkQuest = quest
          ? quest.respostasPorCandidato[whatsTemplateOpen.candidatoId]?.link
            ?? gerarLinkQuestionario(quest.id, whatsTemplateOpen.candidatoId)
          : undefined;
        return (
          <ModalShell title="Enviar via WhatsApp" onClose={() => setWhatsTemplateOpen(null)}>
            <WhatsTemplateForm
              candidatoNome={nome}
              vagaTitulo={vaga.titulo}
              telefone={telefone}
              linkQuestionario={linkQuest}
              onCancel={() => setWhatsTemplateOpen(null)}
              onConfirm={(mensagem) => {
                const numero = telefone.replace(/\D/g, "");
                const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;
                window.open(url, "_blank", "noopener,noreferrer");
                toast.success("WhatsApp Web aberto com mensagem (mock).");
                setWhatsTemplateOpen(null);
              }}
            />
          </ModalShell>
        );
      })()}

      {/* ── Modal: Resumo para o cliente ─────────────────────────── */}
      {resumoOpen && (() => {
        const c = candidatosVaga.find((x) => x.id === resumoOpen);
        return (
          <ModalShell title="Resumo para o cliente" onClose={() => setResumoOpen(null)}>
            <div className="text-sm text-foreground space-y-3">
              <p><strong>{c?.nome ?? "Candidato"}</strong> — versão resumida sem dados sensíveis.</p>
              <div className="bg-muted/40 border border-border rounded-md p-3 text-xs text-muted-foreground">
                Pré-visualização do PDF que será enviado ao cliente. Inclui experiência,
                fit cultural e DISC. Não inclui contato direto.
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setResumoOpen(null)}
                  className="h-9 px-4 rounded-lg border border-border hover:bg-secondary text-sm"
                >
                  Fechar
                </button>
                <button
                  onClick={() => { toast.success("Resumo enviado ao cliente."); setResumoOpen(null); }}
                  className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium inline-flex items-center gap-1.5"
                >
                  <Send className="h-3.5 w-3.5" /> Enviar ao cliente
                </button>
              </div>
            </div>
          </ModalShell>
        );
      })()}

      {/* ── Modal: Solicitar DISC via WhatsApp ───────────────────── */}
      {discWhatsOpen && (() => {
        const c = candidatosVaga.find((x) => x.id === discWhatsOpen);
        return (
          <ModalShell title="Solicitar DISC via WhatsApp" onClose={() => setDiscWhatsOpen(null)}>
            <div className="text-sm space-y-3">
              <p>Enviar link do questionário DISC para <strong>{c?.nome}</strong>.</p>
              <textarea
                defaultValue={`Olá ${c?.nome ?? ""}, segue o link para o teste DISC: https://azumi.app/disc/${c?.id ?? ""}`}
                rows={3}
                className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setDiscWhatsOpen(null)}
                  className="h-9 px-4 rounded-lg border border-border hover:bg-secondary text-sm"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => { toast.success("Convite DISC enviado."); setDiscWhatsOpen(null); }}
                  className="h-9 px-4 rounded-lg bg-success text-success-foreground text-sm font-medium inline-flex items-center gap-1.5"
                >
                  <MessageCircle className="h-3.5 w-3.5" /> Enviar WhatsApp
                </button>
              </div>
            </div>
          </ModalShell>
        );
      })()}

      {/* ── Modal: Associar questionário a candidato ─────────────── */}
      {associarQuestOpen && (() => {
        const c = candidatosVaga.find((x) => x.id === associarQuestOpen);
        return (
          <ModalShell title="Associar / enviar questionário" onClose={() => setAssociarQuestOpen(null)}>
            <div className="text-sm space-y-3">
              <p>Selecione um questionário para enviar a <strong>{c?.nome}</strong>:</p>
              {questionariosVaga.length === 0 ? (
                <div className="text-xs text-muted-foreground">Nenhum questionário criado ainda.</div>
              ) : (
                <ul className="space-y-2">
                  {questionariosVaga.map((q) => (
                    <li key={q.id}>
                      <button
                        onClick={() => {
                          if (!associarQuestOpen) return;
                          enviarQuestionarioParaCandidato(q.id, associarQuestOpen);
                          setAssociarQuestOpen(null);
                        }}
                        className="w-full text-left px-3 py-2 rounded-md border border-border hover:bg-secondary text-sm"
                      >
                        <div className="font-medium">{q.nome}</div>
                        <div className="text-xs text-muted-foreground">{q.perguntas.length} pergunta(s) · criado por {q.criadoPor}</div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </ModalShell>
        );
      })()}

      {/* ── Modal: Registrar declínio ────────────────────────────── */}
      {declinarOpen && (() => {
        const c = candidatosVaga.find((x) => x.id === declinarOpen);
        return (
          <ModalShell title="Registrar declínio" onClose={() => setDeclinarOpen(null)}>
            <DeclinarForm
              nome={c?.nome ?? "Candidato"}
              onCancel={() => setDeclinarOpen(null)}
              onSave={(quem, motivo) => {
                if (declinarOpen) {
                  setDeclinios((prev) => ({ ...prev, [declinarOpen]: { quem, motivo } }));
                  toast.success("Declínio registrado.");
                }
                setDeclinarOpen(null);
              }}
            />
          </ModalShell>
        );
      })()}

      {/* ── Modal: Agendar entrevista ────────────────────────────── */}
      {agendarOpen && (() => {
        const c = candidatosVaga.find((x) => x.id === agendarOpen);
        return (
          <ModalShell title="Agendar entrevista" onClose={() => setAgendarOpen(null)}>
            <AgendarEntrevistaForm
              candidatoNome={c?.nome ?? "Candidato"}
              onCancel={() => setAgendarOpen(null)}
              onSave={(ev) => {
                if (agendarOpen && c) {
                  setEventos((prev) => [...prev, { ...ev, id: `ev-${Date.now()}`, candidatoId: c.id, candidatoNome: c.nome }]);
                  toast.success(`Entrevista agendada para ${ev.data} ${ev.hora}.`);
                }
                setAgendarOpen(null);
              }}
            />
          </ModalShell>
        );
      })()}

      {/* ── Modal: Agendar Entrevista com Gestor (Etapa 5 — Doc Mestre) ── */}
      {agendarGestorOpen && (() => {
        const c = candidatosVaga.find((x) => x.id === agendarGestorOpen);
        const gestor = getGestorDaVaga(vaga.id);
        if (!c || !gestor) return null;
        return (
          <AgendarEntrevistaGestorModal
            vagaId={vaga.id}
            empresaNome={vaga.empresa}
            candidatoId={c.id}
            candidatoNome={c.nome}
            candidatoEmail={`${c.nome.toLowerCase().replace(/\s+/g, ".")}@email.com`}
            gestor={gestor}
            onClose={() => setAgendarGestorOpen(null)}
            onSaved={() => {
              setAgendarGestorOpen(null);
              toast.success(`Sugestões enviadas ao gestor ${gestor.nome}.`);
            }}
          />
        );
      })()}

      {/* ── Ficha completa do candidato (painel lateral) ─────────── */}
      <CandidatoDetailSheet
        open={!!fichaCandidatoId}
        candidato={candidatosVaga.find((c) => c.id === fichaCandidatoId) ?? null}
        candidatoExtra={candidatosExtras.find((c) => c.id === fichaCandidatoId) ?? null}
        tituloVaga={vaga.titulo}
        etapaAtual={fichaCandidatoId ? colunasEstado[fichaCandidatoId] : undefined}
        eventos={eventos.filter((e) => e.candidatoId === fichaCandidatoId)}
        declinio={fichaCandidatoId ? declinios[fichaCandidatoId] : undefined}
        questionariosVaga={questionariosVaga}
        mensagensVaga={mensagens}
        onClose={() => setFichaCandidatoId(null)}
        onSolicitarDisc={(id) => setDiscWhatsOpen(id)}
        onVerResumo={(id) => setResumoOpen(id)}
        onAssociarQuestionario={(id) => setAssociarQuestOpen(id)}
        onDeclinar={(id) => setDeclinarOpen(id)}
        onAgendar={(id) => setAgendarOpen(id)}
        onAbrirRelatorio={(id) => setRelatorioOpenId(id)}
        relatorioStatus={fichaCandidatoId ? relatoriosPorCandidato[fichaCandidatoId]?.status : undefined}
        onEnviarWhatsQuestionario={(candidatoId, questionarioId) => setWhatsTemplateOpen({ candidatoId, questionarioId })}
        onSalvarAvaliacao={salvarAvaliacaoQuestionario}
      />

      {/* ── Editor de relatório do candidato (modal grande) ─────── */}
      {relatorioOpenId && (() => {
        const cand = candidatosVaga.find((c) => c.id === relatorioOpenId)
          ?? (() => {
            const ex = candidatosExtras.find((c) => c.id === relatorioOpenId);
            return ex ? { id: ex.id, nome: ex.nome, cargo: ex.cargo, status: "novo" as const, disc: undefined, perfilDom: undefined } as CandidatoBase : null;
          })();
        if (!cand) return null;
        return (
          <RelatorioCandidatoModal
            candidato={cand}
            vagaTitulo={vaga.titulo}
            empresa={vaga.empresa}
            questionariosVaga={questionariosVaga}
            draft={relatoriosPorCandidato[relatorioOpenId]}
            onClose={() => setRelatorioOpenId(null)}
            onSaveDraft={(data) => {
              setRelatoriosPorCandidato((prev) => ({
                ...prev,
                [cand.id]: { ...data, status: prev[cand.id]?.status === "enviado" ? "enviado" : "rascunho" },
              }));
              toast.success("Rascunho do relatório salvo.");
            }}
            onMarkSent={(data) => {
              setRelatoriosPorCandidato((prev) => ({ ...prev, [cand.id]: { ...data, status: "enviado" } }));
              toast.success(`Relatório de ${cand.nome} enviado ao cliente (mock).`);
              setRelatorioOpenId(null);
            }}
          />
        );
      })()}

      {/* ── Etapa 6 — Modal de envio de proposta ─────────────────── */}
      {enviarPropostaPara && (() => {
        const c = candidatosVaga.find((x) => x.id === enviarPropostaPara);
        if (!c) return null;
        return (
          <ModalShell title="Enviar proposta" onClose={() => setEnviarPropostaPara(null)} size="lg">
            <EnviarPropostaForm
              candidatoNome={c.nome}
              vagaTitulo={vaga.titulo}
              empresaNome={vaga.empresa}
              onCancel={() => setEnviarPropostaPara(null)}
              onConfirm={(dados) => {
                criarProposta({
                  candidatoId: c.id,
                  vagaId: vaga.id,
                  ...dados,
                });
                setEnviarPropostaPara(null);
                toast.success(`Proposta enviada a ${c.nome}. Prazo de 24h para resposta.`);
              }}
            />
          </ModalShell>
        );
      })()}

      {/* ── Etapa 7 — Modal de envio de feedback p/ reprovado ────── */}
      {enviarFeedbackPara && (() => {
        const c = candidatosVaga.find((x) => x.id === enviarFeedbackPara);
        if (!c) return null;
        const dadosExtra = DADOS_EXTRA_MOCK[c.id];
        return (
          <ModalShell title="Enviar feedback" onClose={() => setEnviarFeedbackPara(null)} size="lg">
            <EnviarFeedbackForm
              candidatoNome={c.nome}
              vagaTitulo={vaga.titulo}
              telefone={dadosExtra?.telefone ?? ""}
              email={dadosExtra?.email ?? ""}
              onCancel={() => setEnviarFeedbackPara(null)}
              onConfirm={({ canal, templateKey, mensagem }) => {
                registrarFeedback({
                  candidatoId: c.id,
                  vagaId: vaga.id,
                  canal,
                  templateKey,
                  mensagem,
                });
                if (canal === "whatsapp" || canal === "ambos") {
                  const tel = (dadosExtra?.telefone ?? "").replace(/\D/g, "");
                  if (tel) window.open(`https://wa.me/55${tel}?text=${encodeURIComponent(mensagem)}`, "_blank");
                }
                setEnviarFeedbackPara(null);
                toast.success(`Feedback enviado a ${c.nome} via ${canal === "ambos" ? "e-mail e WhatsApp" : canal}.`);
              }}
            />
          </ModalShell>
        );
      })()}

      {/* ── Pop-up: vaga encerrada → relatório final ─────────────── */}
      {relatorioFinalPromptOpen && (
        <ModalShell title="Vaga encerrada 🎉" onClose={() => setRelatorioFinalPromptOpen(false)}>
          <div className="space-y-4 text-sm">
            <div className="rounded-md border border-success/30 bg-success/10 p-3 text-success text-xs">
              Todas as <strong>{posicoesVaga}</strong> posição(ões) desta vaga foram preenchidas.
            </div>
            <p>
              Deseja gerar agora o <strong>Relatório Final de Encerramento da vaga</strong>?
              Ele reúne contratados, cronologia, tempo médio por etapa e o NPS do cliente.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setRelatorioFinalPromptOpen(false)}
                className="h-9 px-4 rounded-lg border border-border hover:bg-secondary text-sm"
              >
                Mais tarde
              </button>
              <button
                onClick={() => {
                  setRelatorioFinalPromptOpen(false);
                  navigate(`/app/atracao/${vaga.id}/relatorio-final`);
                }}
                className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-semibold inline-flex items-center gap-1.5"
              >
                <FileText className="h-3.5 w-3.5" /> Abrir relatório final
              </button>
            </div>
          </div>
        </ModalShell>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────
// ModalShell — wrapper visual padrão
// ────────────────────────────────────────────────────────────────────
function ModalShell({
  title,
  children,
  onClose,
  size = "md",
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  size?: "md" | "lg" | "xl";
}) {
  useScrollLock(true);
  const maxW = size === "xl" ? "max-w-3xl" : size === "lg" ? "max-w-xl" : "max-w-md";
  return (
    <div className="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className={cn("bg-card border border-border rounded-2xl shadow-elevated w-full max-h-[92vh] flex flex-col animate-scale-in overflow-hidden", maxW)}>
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-border">
          <h3 className="font-display text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="h-7 w-7 inline-flex items-center justify-center rounded-md hover:bg-secondary">
            <XIcon className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────
// Formulários internos dos modais
// ────────────────────────────────────────────────────────────────────
function NovoCandidatoForm({
  onCancel,
  onSave,
}: {
  onCancel: () => void;
  onSave: (c: CandidatoExtra) => void;
}) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cargo, setCargo] = useState("");

  return (
    <div className="space-y-3 text-sm">
      <Field label="Nome">
        <input value={nome} onChange={(e) => setNome(e.target.value)} className="w-full h-9 px-3 rounded-md border border-border bg-background text-sm" />
      </Field>
      <Field label="E-mail">
        <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full h-9 px-3 rounded-md border border-border bg-background text-sm" />
      </Field>
      <Field label="Telefone">
        <input value={telefone} onChange={(e) => setTelefone(e.target.value)} className="w-full h-9 px-3 rounded-md border border-border bg-background text-sm" />
      </Field>
      <Field label="Cargo / observação">
        <input value={cargo} onChange={(e) => setCargo(e.target.value)} className="w-full h-9 px-3 rounded-md border border-border bg-background text-sm" />
      </Field>
      <div className="flex justify-end gap-2 pt-2">
        <button onClick={onCancel} className="h-9 px-4 rounded-lg border border-border hover:bg-secondary text-sm">Cancelar</button>
        <button
          disabled={!nome.trim()}
          onClick={() => onSave({ id: `cx-${Date.now()}`, nome: nome.trim(), email, telefone, cargo, origem: "manual" })}
          className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium inline-flex items-center gap-1.5 disabled:opacity-50"
        >
          <UserPlus className="h-3.5 w-3.5" /> Adicionar
        </button>
      </div>
    </div>
  );
}

function ConvidarLinkForm({ vagaId, onClose }: { vagaId: string; onClose: () => void }) {
  const link = `https://azumi.jobs/aplicar/${vagaId}?ref=convite`;
  return (
    <div className="space-y-3 text-sm">
      <p>Compartilhe o link abaixo com o candidato para se inscrever diretamente na vaga.</p>
      <div className="flex gap-2">
        <input readOnly value={link} className="flex-1 h-9 px-3 rounded-md border border-border bg-background text-xs" />
        <button
          onClick={() => { navigator.clipboard?.writeText(link); toast.success("Link copiado."); }}
          className="h-9 px-3 rounded-md border border-border hover:bg-secondary text-xs inline-flex items-center gap-1.5"
        >
          <Copy className="h-3.5 w-3.5" /> Copiar
        </button>
      </div>
      <div className="flex justify-end pt-2">
        <button onClick={onClose} className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium">Fechar</button>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────
// QuestionarioEditorModal — builder real (criar / editar)
// ────────────────────────────────────────────────────────────────────
function QuestionarioEditorModal({
  existing,
  onClose,
  onSave,
}: {
  existing: QuestionarioVaga | null;
  onClose: () => void;
  onSave: (q: QuestionarioVaga) => void;
}) {
  useScrollLock(true);
  const [nome, setNome] = useState(existing?.nome ?? "");
  const [descricao, setDescricao] = useState(existing?.descricao ?? "");
  const [perguntas, setPerguntas] = useState<PerguntaQuestionario[]>(
    existing?.perguntas?.length
      ? existing.perguntas
      : [{ id: `p-${Date.now()}`, ordem: 1, texto: "", tipo: "texto_livre", obrigatoria: true }],
  );

  function addPergunta() {
    setPerguntas((prev) => [
      ...prev,
      { id: `p-${Date.now()}`, ordem: prev.length + 1, texto: "", tipo: "texto_livre", obrigatoria: false },
    ]);
  }
  function removePergunta(id: string) {
    setPerguntas((prev) => prev.filter((p) => p.id !== id).map((p, i) => ({ ...p, ordem: i + 1 })));
  }
  function patchPergunta(id: string, patch: Partial<PerguntaQuestionario>) {
    setPerguntas((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }

  function handleSalvar() {
    if (!nome.trim()) {
      toast.error("Informe o título do questionário.");
      return;
    }
    if (perguntas.length === 0) {
      toast.error("Adicione pelo menos uma pergunta.");
      return;
    }
    for (const p of perguntas) {
      if (!p.texto.trim()) {
        toast.error(`Pergunta ${p.ordem} está sem texto.`);
        return;
      }
      if (p.tipo === "multipla_escolha" && (p.opcoes?.filter((o) => o.trim()).length ?? 0) < 2) {
        toast.error(`Pergunta ${p.ordem} (múltipla escolha) precisa de pelo menos 2 opções.`);
        return;
      }
    }
    const q: QuestionarioVaga = {
      id: existing?.id ?? `q-${Date.now()}`,
      nome: nome.trim(),
      descricao: descricao.trim() || undefined,
      perguntas,
      criadoPor: existing?.criadoPor ?? "Patricia Lima",
      criadoEm: existing?.criadoEm ?? new Date().toLocaleDateString("pt-BR"),
      respostasPorCandidato: existing?.respostasPorCandidato ?? {},
    };
    onSave(q);
  }

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-card border border-border rounded-2xl shadow-elevated w-full max-w-3xl max-h-[92vh] flex flex-col animate-scale-in overflow-hidden">
        <header className="px-6 py-4 border-b border-border flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-display text-lg font-semibold">
              {existing ? "Editar questionário" : "Novo questionário"}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Defina título, descrição e perguntas. Aceita texto livre, múltipla escolha e escala 1–5.
            </p>
          </div>
          <button onClick={onClose} aria-label="Fechar" className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-secondary">
            <XIcon className="h-4 w-4" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <Field label="Título do questionário *">
            <input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex.: Avaliação técnica — Gerente de TI"
              className="w-full h-9 px-3 rounded-md border border-border bg-background text-sm"
            />
          </Field>
          <Field label="Descrição (opcional)">
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              rows={2}
              placeholder="Contexto exibido para o candidato e para o consultor."
              className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm resize-y"
            />
          </Field>

          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                Perguntas ({perguntas.length})
              </h4>
              <button
                type="button"
                onClick={addPergunta}
                className="h-8 px-3 rounded-md border border-border hover:bg-secondary text-xs font-medium inline-flex items-center gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" /> Adicionar pergunta
              </button>
            </div>

            <ol className="space-y-3">
              {perguntas.map((p) => (
                <li key={p.id} className="rounded-lg border border-border bg-background/40 p-3">
                  <div className="flex items-start gap-2">
                    <div className="h-7 w-7 rounded-md bg-secondary flex items-center justify-center text-xs font-semibold shrink-0">
                      {p.ordem}
                    </div>
                    <div className="flex-1 min-w-0 space-y-2">
                      <input
                        value={p.texto}
                        onChange={(e) => patchPergunta(p.id, { texto: e.target.value })}
                        placeholder="Texto da pergunta"
                        className="w-full h-9 px-3 rounded-md border border-border bg-card text-sm"
                      />
                      <div className="grid sm:grid-cols-[180px_auto_1fr] gap-2 items-center">
                        <select
                          value={p.tipo}
                          onChange={(e) => patchPergunta(p.id, {
                            tipo: e.target.value as TipoPergunta,
                            opcoes: e.target.value === "multipla_escolha" ? (p.opcoes ?? ["", ""]) : undefined,
                          })}
                          className="h-9 px-2 rounded-md border border-border bg-card text-xs"
                        >
                          <option value="texto_livre">Texto livre</option>
                          <option value="multipla_escolha">Múltipla escolha</option>
                          <option value="escala_1_5">Escala 1–5</option>
                        </select>
                        <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                          <input
                            type="checkbox"
                            checked={p.obrigatoria}
                            onChange={(e) => patchPergunta(p.id, { obrigatoria: e.target.checked })}
                          />
                          Obrigatória
                        </label>
                        <div className="flex justify-end">
                          {perguntas.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removePergunta(p.id)}
                              className="h-7 w-7 inline-flex items-center justify-center rounded-md hover:bg-destructive/10 text-destructive"
                              aria-label="Remover pergunta"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {p.tipo === "multipla_escolha" && (
                        <div className="space-y-1.5 pt-1">
                          {(p.opcoes ?? []).map((op, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <Circle className="h-3 w-3 text-muted-foreground shrink-0" />
                              <input
                                value={op}
                                onChange={(e) => {
                                  const novas = [...(p.opcoes ?? [])];
                                  novas[i] = e.target.value;
                                  patchPergunta(p.id, { opcoes: novas });
                                }}
                                placeholder={`Opção ${i + 1}`}
                                className="flex-1 h-8 px-2 rounded-md border border-border bg-card text-xs"
                              />
                              <button
                                type="button"
                                onClick={() => patchPergunta(p.id, { opcoes: (p.opcoes ?? []).filter((_, j) => j !== i) })}
                                disabled={(p.opcoes?.length ?? 0) <= 2}
                                className="h-7 w-7 inline-flex items-center justify-center rounded-md hover:bg-destructive/10 text-destructive disabled:opacity-30 disabled:cursor-not-allowed"
                                aria-label="Remover opção"
                              >
                                <XIcon className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => patchPergunta(p.id, { opcoes: [...(p.opcoes ?? []), ""] })}
                            className="h-7 px-2 rounded-md border border-dashed border-border text-xs text-muted-foreground hover:bg-secondary inline-flex items-center gap-1"
                          >
                            <Plus className="h-3 w-3" /> Adicionar opção
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <footer className="px-6 py-3 border-t border-border flex items-center justify-end gap-2">
          <button onClick={onClose} className="h-9 px-4 rounded-lg border border-border hover:bg-secondary text-sm">
            Cancelar
          </button>
          <button
            onClick={handleSalvar}
            className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-semibold inline-flex items-center gap-1.5"
          >
            <CheckCircle2 className="h-3.5 w-3.5" /> Salvar questionário
          </button>
        </footer>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────
// EnviarQuestionarioForm — usado quando candidato é movido p/ Quest.
// ────────────────────────────────────────────────────────────────────
function EnviarQuestionarioForm({
  candidatoNome,
  questionarios,
  onCancel,
  onConfirm,
}: {
  candidatoNome: string;
  questionarios: QuestionarioVaga[];
  onCancel: () => void;
  onConfirm: (questionarioId: string) => void;
}) {
  const [sel, setSel] = useState<string>(questionarios[0]?.id ?? "");
  return (
    <div className="space-y-3 text-sm">
      <p>Deseja enviar um questionário para <strong>{candidatoNome}</strong> agora?</p>
      {questionarios.length === 0 ? (
        <div className="rounded-md border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
          Nenhum questionário disponível. Crie um na aba Questionários.
        </div>
      ) : (
        <Field label="Questionário">
          <select value={sel} onChange={(e) => setSel(e.target.value)} className="w-full h-9 px-3 rounded-md border border-border bg-background text-sm">
            {questionarios.map((q) => (
              <option key={q.id} value={q.id}>{q.nome} ({q.perguntas.length} perguntas)</option>
            ))}
          </select>
        </Field>
      )}
      <div className="flex justify-end gap-2 pt-2">
        <button onClick={onCancel} className="h-9 px-4 rounded-lg border border-border hover:bg-secondary text-sm">Cancelar</button>
        <button
          disabled={!sel}
          onClick={() => onConfirm(sel)}
          className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium inline-flex items-center gap-1.5 disabled:opacity-50"
        >
          <Send className="h-3.5 w-3.5" /> Enviar
        </button>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────
// WhatsTemplateForm — escolhe template, preview editável, abre wa.me
// ────────────────────────────────────────────────────────────────────
type WhatsTemplateKey =
  | "questionario_enviado"
  | "avancou_entrevista_azumi"
  | "avancou_teste_tecnico"
  | "avancou_entrevista_gestor"
  | "proposta"
  | "contratado"
  | "nao_selecionado"
  | "personalizada";

function WhatsTemplateForm({
  candidatoNome,
  vagaTitulo,
  telefone,
  linkQuestionario,
  onCancel,
  onConfirm,
}: {
  candidatoNome: string;
  vagaTitulo: string;
  telefone: string;
  linkQuestionario?: string;
  onCancel: () => void;
  onConfirm: (mensagem: string) => void;
}) {
  const TEMPLATES: { value: WhatsTemplateKey; label: string; build: () => string }[] = [
    {
      value: "questionario_enviado", label: "Questionário enviado",
      build: () => `Olá ${candidatoNome}! 👋 Aqui é da Azumi. Para avançarmos no processo da vaga ${vagaTitulo}, ` +
        `pedimos que você responda nosso questionário rápido: ${linkQuestionario ?? "<link>"}. Qualquer dúvida, é só chamar!`,
    },
    {
      value: "avancou_entrevista_azumi", label: "Avançou para entrevista Azumi",
      build: () => `Olá ${candidatoNome}! Tenho uma boa notícia: você avançou para a entrevista interna Azumi referente à vaga ${vagaTitulo}. Em breve te chamamos para combinar dia e hora. 🚀`,
    },
    {
      value: "avancou_teste_tecnico", label: "Avançou para teste técnico",
      build: () => `Olá ${candidatoNome}! Você avançou para a etapa de teste técnico da vaga ${vagaTitulo}. Em breve enviamos as instruções por aqui.`,
    },
    {
      value: "avancou_entrevista_gestor", label: "Avançou para entrevista com gestor",
      build: () => `Olá ${candidatoNome}! Você foi selecionado(a) para a entrevista com o gestor da vaga ${vagaTitulo}. Vamos combinar a melhor data?`,
    },
    {
      value: "proposta", label: "Proposta em andamento",
      build: () => `Olá ${candidatoNome}! Estamos alinhando a proposta para a vaga ${vagaTitulo}. Em breve te enviamos os detalhes.`,
    },
    {
      value: "contratado", label: "Contratado(a)!",
      build: () => `🎉 Parabéns ${candidatoNome}! Você foi aprovado(a) na vaga ${vagaTitulo}. Em breve te passamos os próximos passos. Bem-vindo(a) ao time!`,
    },
    {
      value: "nao_selecionado", label: "Não selecionado(a)",
      build: () => `Olá ${candidatoNome}, agradecemos sua participação no processo da vaga ${vagaTitulo}. Desta vez, optamos por seguir com outro perfil, mas vamos manter o seu currículo na nossa base. Sucesso! 🙌`,
    },
    {
      value: "personalizada", label: "Mensagem personalizada",
      build: () => "",
    },
  ];

  const [tplKey, setTplKey] = useState<WhatsTemplateKey>(linkQuestionario ? "questionario_enviado" : "avancou_entrevista_azumi");
  const [mensagem, setMensagem] = useState(TEMPLATES.find((t) => t.value === tplKey)!.build());

  function selecionar(k: WhatsTemplateKey) {
    setTplKey(k);
    const tpl = TEMPLATES.find((t) => t.value === k)!;
    setMensagem(tpl.build());
  }

  return (
    <div className="space-y-3 text-sm">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Telefone">
          <input readOnly value={telefone || "— sem telefone —"} className="w-full h-9 px-3 rounded-md border border-border bg-secondary/40 text-sm" />
        </Field>
        <Field label="Template">
          <select value={tplKey} onChange={(e) => selecionar(e.target.value as WhatsTemplateKey)} className="w-full h-9 px-3 rounded-md border border-border bg-background text-sm">
            {TEMPLATES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </Field>
      </div>
      <Field label="Mensagem">
        <textarea
          value={mensagem}
          onChange={(e) => setMensagem(e.target.value)}
          rows={6}
          className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm resize-y"
        />
      </Field>
      <div className="flex justify-end gap-2 pt-2">
        <button onClick={onCancel} className="h-9 px-4 rounded-lg border border-border hover:bg-secondary text-sm">Cancelar</button>
        <button
          disabled={!mensagem.trim() || !telefone}
          onClick={() => onConfirm(mensagem.trim())}
          className="h-9 px-4 rounded-lg bg-success text-success-foreground text-sm font-semibold inline-flex items-center gap-1.5 disabled:opacity-50"
        >
          <MessageCircle className="h-3.5 w-3.5" /> Abrir WhatsApp Web →
        </button>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────
// Etapa 6 — Envio de proposta (Doc Mestre)
// ────────────────────────────────────────────────────────────────────
function EnviarPropostaForm({
  candidatoNome,
  vagaTitulo,
  empresaNome,
  onCancel,
  onConfirm,
}: {
  candidatoNome: string;
  vagaTitulo: string;
  empresaNome: string;
  onCancel: () => void;
  onConfirm: (dados: {
    tipo: TipoProposta;
    remuneracao: string;
    beneficios: string;
    dataInicio: string;
    canal: CanalProposta;
    mensagem: string;
  }) => void;
}) {
  const [tipo, setTipo] = useState<TipoProposta>("CLT");
  const [remuneracao, setRemuneracao] = useState("");
  const [beneficios, setBeneficios] = useState("VR + VT + Plano de saúde");
  const [dataInicio, setDataInicio] = useState("");
  const [canal, setCanal] = useState<CanalProposta>("ambos");

  const buildMsg = (rem: string, dt: string) =>
    `Olá ${candidatoNome}! 🎉\n\nTemos uma ótima notícia: gostaríamos de oficializar a proposta para a vaga ${vagaTitulo} na ${empresaNome}.\n\n` +
    `• Modalidade: ${tipo}\n` +
    `• Remuneração: ${rem || "[a definir]"}\n` +
    `• Benefícios: ${beneficios}\n` +
    `• Data de início sugerida: ${dt || "[a definir]"}\n\n` +
    `Você tem até 24 horas para aceitar ou recusar a proposta. Qualquer dúvida, é só nos chamar!\n\nTime Azumi`;
  const [mensagem, setMensagem] = useState(buildMsg("", ""));
  const [tocouMsg, setTocouMsg] = useState(false);
  useEffect(() => {
    if (!tocouMsg) setMensagem(buildMsg(remuneracao, dataInicio));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remuneracao, dataInicio, tipo, beneficios]);

  const valido = remuneracao.trim() && dataInicio.trim() && mensagem.trim();

  return (
    <div className="space-y-3 text-sm">
      <div className="rounded-md border border-border bg-muted/30 p-3 text-xs">
        <div><strong>Candidato:</strong> {candidatoNome}</div>
        <div><strong>Vaga:</strong> {vagaTitulo} — {empresaNome}</div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Tipo de proposta">
          <select value={tipo} onChange={(e) => setTipo(e.target.value as TipoProposta)} className="w-full h-9 px-3 rounded-md border border-border bg-background text-sm">
            <option value="CLT">CLT</option>
            <option value="PJ">PJ</option>
            <option value="Estagio">Estágio</option>
          </select>
        </Field>
        <Field label="Remuneração">
          <input value={remuneracao} onChange={(e) => setRemuneracao(e.target.value)} placeholder="R$ 0.000,00" className="w-full h-9 px-3 rounded-md border border-border bg-background text-sm" />
        </Field>
      </div>
      <Field label="Benefícios">
        <textarea rows={2} value={beneficios} onChange={(e) => setBeneficios(e.target.value)} className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm resize-y" />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Data de início sugerida">
          <input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} className="w-full h-9 px-3 rounded-md border border-border bg-background text-sm" />
        </Field>
        <Field label="Canal de envio">
          <select value={canal} onChange={(e) => setCanal(e.target.value as CanalProposta)} className="w-full h-9 px-3 rounded-md border border-border bg-background text-sm">
            <option value="whatsapp">WhatsApp</option>
            <option value="email">E-mail</option>
            <option value="ambos">WhatsApp + E-mail</option>
          </select>
        </Field>
      </div>
      <Field label="Mensagem (template editável)">
        <textarea
          rows={8}
          value={mensagem}
          onChange={(e) => { setMensagem(e.target.value); setTocouMsg(true); }}
          className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm resize-y font-data"
        />
      </Field>
      <div className="text-[11px] text-muted-foreground rounded-md border border-info/30 bg-info/10 p-2">
        ⏱ Após o envio, o candidato terá <strong>24 horas</strong> para aceitar ou recusar a proposta.
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button onClick={onCancel} className="h-9 px-4 rounded-lg border border-border hover:bg-secondary text-sm">Cancelar</button>
        <button
          disabled={!valido}
          onClick={() => onConfirm({ tipo, remuneracao, beneficios, dataInicio, canal, mensagem })}
          className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-semibold inline-flex items-center gap-1.5 disabled:opacity-50"
        >
          <Send className="h-3.5 w-3.5" /> Enviar proposta
        </button>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────
// Etapa 7 — Feedback de reprovados (Doc Mestre)
// ────────────────────────────────────────────────────────────────────
function EnviarFeedbackForm({
  candidatoNome,
  vagaTitulo,
  telefone,
  email,
  onCancel,
  onConfirm,
}: {
  candidatoNome: string;
  vagaTitulo: string;
  telefone: string;
  email: string;
  onCancel: () => void;
  onConfirm: (dados: { canal: FeedbackCanal; templateKey: string; mensagem: string }) => void;
}) {
  const TEMPLATES = useMemo(() => [
    {
      key: "pos_entrevista",
      label: "Não aprovado após entrevista",
      build: () => `Olá ${candidatoNome}, tudo bem?\n\nAgradecemos muito sua participação no processo seletivo da vaga ${vagaTitulo}. ` +
        `Após a entrevista, decidimos seguir com outro perfil que se mostrou mais aderente neste momento.\n\n` +
        `Foi um prazer conhecer sua trajetória — vamos manter seu currículo na nossa base para futuras oportunidades.\n\nUm abraço,\nTime Azumi`,
    },
    {
      key: "pos_tecnica",
      label: "Não aprovado após análise técnica",
      build: () => `Olá ${candidatoNome},\n\nAgradecemos pelo tempo dedicado à análise técnica da vaga ${vagaTitulo}. ` +
        `Após avaliação, decidimos seguir com outro candidato cujo perfil técnico se mostrou mais alinhado neste momento.\n\n` +
        `Continuamos com seu cadastro para próximas oportunidades.\n\nAbraço,\nTime Azumi`,
    },
    {
      key: "alinhamento_vaga",
      label: "Não aprovado por alinhamento com a vaga",
      build: () => `Olá ${candidatoNome},\n\nObrigado pelo interesse na vaga ${vagaTitulo}. ` +
        `Após análise cuidadosa, identificamos que outras experiências se aproximam mais do escopo solicitado pelo cliente nesta posição.\n\n` +
        `Esperamos te apresentar oportunidades melhor alinhadas em breve.\n\nAbraço,\nTime Azumi`,
    },
    {
      key: "nao_compareceu",
      label: "Não aprovado por não comparecimento",
      build: () => `Olá ${candidatoNome},\n\nNotamos que não foi possível comparecer à etapa agendada para a vaga ${vagaTitulo}. ` +
        `Por essa razão, encerramos sua participação neste processo.\n\n` +
        `Caso queira retomar a conversa em uma próxima oportunidade, é só nos chamar.\n\nAbraço,\nTime Azumi`,
    },
    {
      key: "personalizada",
      label: "Mensagem personalizada",
      build: () => "",
    },
  ], [candidatoNome, vagaTitulo]);

  const [templateKey, setTemplateKey] = useState(TEMPLATES[0].key);
  const [mensagem, setMensagem] = useState(TEMPLATES[0].build());
  const [canal, setCanal] = useState<FeedbackCanal>("email");

  function trocarTemplate(k: string) {
    setTemplateKey(k);
    const t = TEMPLATES.find((x) => x.key === k);
    if (t) setMensagem(t.build());
  }

  const podeEnviar = !!mensagem.trim() && (
    canal === "email" ? !!email :
    canal === "whatsapp" ? !!telefone :
    !!email && !!telefone
  );

  return (
    <div className="space-y-3 text-sm">
      <div className="rounded-md border border-border bg-muted/30 p-3 text-xs">
        <div><strong>Candidato:</strong> {candidatoNome}</div>
        <div className="text-muted-foreground">
          {email || "—"} • {telefone || "—"}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Modelo de mensagem">
          <select value={templateKey} onChange={(e) => trocarTemplate(e.target.value)} className="w-full h-9 px-3 rounded-md border border-border bg-background text-sm">
            {TEMPLATES.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
          </select>
        </Field>
        <Field label="Canal de envio">
          <select value={canal} onChange={(e) => setCanal(e.target.value as FeedbackCanal)} className="w-full h-9 px-3 rounded-md border border-border bg-background text-sm">
            <option value="email">E-mail</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="ambos">E-mail + WhatsApp</option>
          </select>
        </Field>
      </div>
      <Field label="Mensagem">
        <textarea
          rows={9}
          value={mensagem}
          onChange={(e) => setMensagem(e.target.value)}
          className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm resize-y"
        />
      </Field>
      <div className="text-[11px] text-muted-foreground">
        Mensagens curtas e respeitosas mantêm o relacionamento com o talento para futuras oportunidades.
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button onClick={onCancel} className="h-9 px-4 rounded-lg border border-border hover:bg-secondary text-sm">Cancelar</button>
        <button
          disabled={!podeEnviar}
          onClick={() => onConfirm({ canal, templateKey, mensagem })}
          className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-semibold inline-flex items-center gap-1.5 disabled:opacity-50"
        >
          <MessageCircle className="h-3.5 w-3.5" /> Enviar feedback
        </button>
      </div>
    </div>
  );
}

function DeclinarForm({
  nome,
  onCancel,
  onSave,
}: {
  nome: string;
  onCancel: () => void;
  onSave: (quem: "candidato" | "azumi", motivo: string) => void;
}) {
  const TIPOS = [
    { value: "candidato_recusou", label: "Candidato recusou", quem: "candidato" as const },
    { value: "cliente_recusou",   label: "Cliente recusou",   quem: "azumi"     as const },
    { value: "nao_compareceu",    label: "Não compareceu",    quem: "candidato" as const },
    { value: "reprovado_azumi",   label: "Reprovado pela Azumi", quem: "azumi"  as const },
  ];
  const [tipo, setTipo] = useState(TIPOS[0].value);
  const [motivo, setMotivo] = useState("");
  const [verTemplate, setVerTemplate] = useState(false);

  const tipoSel = TIPOS.find((t) => t.value === tipo)!;
  const isCandidatoRecusou = tipo === "candidato_recusou";
  const templateWhats = `Olá ${nome}, tudo bem? Recebemos sua decisão e respeitamos. Caso queira retomar a conversa no futuro, é só nos chamar por aqui. Desejamos sucesso! — Time Azumi`;

  return (
    <div className="space-y-3 text-sm">
      <p>Registrar declínio de <strong>{nome}</strong>.</p>
      <Field label="Tipo de declínio">
        <select value={tipo} onChange={(e) => setTipo(e.target.value)} className="w-full h-9 px-3 rounded-md border border-border bg-background text-sm">
          {TIPOS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </Field>
      <Field label="Motivo / observação">
        <textarea rows={3} value={motivo} onChange={(e) => setMotivo(e.target.value)} className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm" />
      </Field>

      {isCandidatoRecusou && (
        <div className="rounded-md border border-border bg-muted/30 p-3 text-xs">
          <button
            type="button"
            onClick={() => setVerTemplate((v) => !v)}
            className="text-primary font-medium inline-flex items-center gap-1.5"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            {verTemplate ? "Ocultar mensagem sugerida" : "Ver mensagem de WhatsApp sugerida"}
          </button>
          {verTemplate && (
            <div className="mt-2 space-y-2">
              <div className="rounded bg-background border border-border p-2 whitespace-pre-wrap">{templateWhats}</div>
              <button
                type="button"
                onClick={() => { navigator.clipboard?.writeText(templateWhats); toast.success("Mensagem copiada."); }}
                className="h-7 px-2 rounded border border-border hover:bg-secondary text-xs inline-flex items-center gap-1.5"
              >
                <Copy className="h-3 w-3" /> Copiar mensagem
              </button>
            </div>
          )}
        </div>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <button onClick={onCancel} className="h-9 px-4 rounded-lg border border-border hover:bg-secondary text-sm">Cancelar</button>
        <button
          disabled={!motivo.trim()}
          onClick={() => onSave(tipoSel.quem, `[${tipoSel.label}] ${motivo.trim()}`)}
          className="h-9 px-4 rounded-lg bg-destructive text-destructive-foreground text-sm font-medium inline-flex items-center gap-1.5 disabled:opacity-50"
        >
          <ThumbsDown className="h-3.5 w-3.5" /> Registrar
        </button>
      </div>
    </div>
  );
}

function AgendarEntrevistaForm({
  candidatoNome,
  onCancel,
  onSave,
}: {
  candidatoNome: string;
  onCancel: () => void;
  onSave: (ev: Omit<EventoEntrevista, "id" | "candidatoId" | "candidatoNome">) => void;
}) {
  const [tipo, setTipo] = useState<EventoEntrevista["tipo"]>("Interno Azumi");
  const [data, setData] = useState("");
  const [hora, setHora] = useState("");
  const [canal, setCanal] = useState<"Google Meet" | "Microsoft Teams" | "Presencial">("Google Meet");
  const [endereco, setEndereco] = useState("");

  return (
    <div className="space-y-3 text-sm">
      <p>Entrevista com <strong>{candidatoNome}</strong>.</p>
      <Field label="Tipo">
        <select value={tipo} onChange={(e) => setTipo(e.target.value as EventoEntrevista["tipo"])} className="w-full h-9 px-3 rounded-md border border-border bg-background text-sm">
          <option value="Interno Azumi">Interno Azumi</option>
          <option value="Com gestor do cliente">Com gestor do cliente</option>
        </select>
      </Field>
      <div className="grid grid-cols-2 gap-2">
        <Field label="Data">
          <input type="date" value={data} onChange={(e) => setData(e.target.value)} className="w-full h-9 px-3 rounded-md border border-border bg-background text-sm" />
        </Field>
        <Field label="Hora">
          <input type="time" value={hora} onChange={(e) => setHora(e.target.value)} className="w-full h-9 px-3 rounded-md border border-border bg-background text-sm" />
        </Field>
      </div>
      <Field label="Canal">
        <select value={canal} onChange={(e) => setCanal(e.target.value as typeof canal)} className="w-full h-9 px-3 rounded-md border border-border bg-background text-sm">
          <option value="Google Meet">Google Meet</option>
          <option value="Microsoft Teams">Microsoft Teams</option>
          <option value="Presencial">Presencial</option>
        </select>
      </Field>
      {canal === "Presencial" && (
        <Field label="Endereço">
          <input value={endereco} onChange={(e) => setEndereco(e.target.value)} placeholder="Rua, nº, sala" className="w-full h-9 px-3 rounded-md border border-border bg-background text-sm" />
        </Field>
      )}
      <div className="flex justify-end gap-2 pt-2">
        <button onClick={onCancel} className="h-9 px-4 rounded-lg border border-border hover:bg-secondary text-sm">Cancelar</button>
        <button
          disabled={!data || !hora || (canal === "Presencial" && !endereco.trim())}
          onClick={() => {
            const [y, m, d] = data.split("-");
            const local = canal === "Presencial" ? `Presencial — ${endereco}` : canal;
            onSave({ tipo, data: `${d}/${m}/${y}`, hora, local });
          }}
          className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium inline-flex items-center gap-1.5 disabled:opacity-50"
        >
          <CalendarPlus className="h-3.5 w-3.5" /> Agendar
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs text-muted-foreground mb-1 block">{label}</span>
      {children}
    </label>
  );
}

// ────────────────────────────────────────────────────────────────────
// ChatVagaPanel — chat simples com abas Interno / Cliente
// ────────────────────────────────────────────────────────────────────
function ChatVagaPanel({
  mensagens,
  onSend,
}: {
  mensagens: MensagemVaga[];
  onSend: (m: MensagemVaga) => void;
}) {
  const [canal, setCanal] = useState<"interno" | "cliente">("interno");
  const [texto, setTexto] = useState("");
  const [anexoNome, setAnexoNome] = useState<string | null>(null);
  const [mencaoOpen, setMencaoOpen] = useState(false);
  const [mencaoQuery, setMencaoQuery] = useState("");
  const taRef = useRef<HTMLTextAreaElement>(null);

  const filtradas = mensagens.filter((m) => m.canal === canal);

  const sugestoesMencao = useMemo(
    () =>
      PESSOAS_MENCAO_VAGA.filter((p) =>
        p.toLowerCase().includes(mencaoQuery.toLowerCase()),
      ).slice(0, 5),
    [mencaoQuery],
  );

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const val = e.target.value;
    setTexto(val);
    const cursor = e.target.selectionStart ?? val.length;
    const trecho = val.slice(0, cursor);
    const m = trecho.match(/@([\wÀ-ÿ ]*)$/);
    if (m) {
      setMencaoQuery(m[1]);
      setMencaoOpen(true);
    } else {
      setMencaoOpen(false);
    }
  }

  function inserirMencao(nome: string) {
    setTexto((prev) => prev.replace(/@([\wÀ-ÿ ]*)$/, `@${nome} `));
    setMencaoOpen(false);
    taRef.current?.focus();
  }

  function enviar() {
    const t = texto.trim();
    if (!t && !anexoNome) return;
    onSend({
      id: `mv-${Date.now()}`,
      autor: "Você",
      iniciais: "VC",
      quando: new Date().toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }),
      texto: t || (anexoNome ? `📎 ${anexoNome}` : ""),
      canal,
      anexo: anexoNome ?? undefined,
    });
    setTexto("");
    setAnexoNome(null);
    setMencaoOpen(false);
  }

  return (
    <div className="bg-card border border-border rounded-xl p-5 max-w-3xl">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h3 className="font-display font-semibold">Conversas sobre esta vaga</h3>
        <div className="inline-flex rounded-md border border-border overflow-hidden text-xs">
          <button
            onClick={() => setCanal("interno")}
            className={cn("px-3 h-7", canal === "interno" ? "bg-primary text-primary-foreground" : "bg-card hover:bg-secondary")}
          >
            Interno (Azumi)
          </button>
          <button
            onClick={() => setCanal("cliente")}
            className={cn("px-3 h-7", canal === "cliente" ? "bg-primary text-primary-foreground" : "bg-card hover:bg-secondary")}
          >
            Com cliente
          </button>
        </div>
      </div>

      <div
        className={cn(
          "text-xs rounded-md px-3 py-2 mb-3 border inline-flex items-center gap-1.5",
          canal === "interno"
            ? "bg-muted/40 border-border text-muted-foreground"
            : "bg-warning/10 border-warning/30 text-warning",
        )}
      >
        {canal === "interno" ? (
          <><Eye className="h-3 w-3" /> Não visível para o cliente</>
        ) : (
          <><AlertTriangle className="h-3 w-3" /> Mensagens aqui aparecem para o cliente</>
        )}
      </div>

      <div className="space-y-3 max-h-80 overflow-y-auto mb-3 pr-1">
        {filtradas.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground py-6">Sem mensagens ainda.</div>
        ) : (
          filtradas.map((m) => (
            <div key={m.id} className="flex gap-3">
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-semibold shrink-0">
                {m.iniciais}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-medium">{m.autor}</span>
                  <span className="text-xs text-muted-foreground">{m.quando}</span>
                </div>
                <p className="text-sm text-foreground whitespace-pre-wrap break-words">
                  {renderMensagemFormatada(m.texto)}
                </p>
                {m.anexo && (
                  <div className="mt-1.5 inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/40 px-2 py-1 text-xs">
                    <Paperclip className="h-3 w-3" />
                    <span className="truncate max-w-[220px]">{m.anexo}</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {anexoNome && (
        <div className="mb-2 inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/40 px-2 py-1 text-xs">
          <Paperclip className="h-3 w-3" />
          <span className="truncate max-w-[220px]">{anexoNome}</span>
          <button onClick={() => setAnexoNome(null)} className="ml-1 hover:text-destructive">
            <XIcon className="h-3 w-3" />
          </button>
        </div>
      )}

      <div className="relative">
        <textarea
          ref={taRef}
          value={texto}
          onChange={handleChange}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && !mencaoOpen) {
              e.preventDefault();
              enviar();
            }
            if (e.key === "Escape") setMencaoOpen(false);
          }}
          rows={2}
          placeholder={
            canal === "interno"
              ? "Mensagem interna… use @ para mencionar"
              : "Mensagem para o cliente… use @ para mencionar"
          }
          className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm resize-none"
        />
        {mencaoOpen && sugestoesMencao.length > 0 && (
          <div className="absolute bottom-full left-0 mb-1 w-64 bg-popover border border-border rounded-md shadow-elevated z-10 overflow-hidden">
            {sugestoesMencao.map((p) => (
              <button
                key={p}
                onMouseDown={(e) => { e.preventDefault(); inserirMencao(p); }}
                className="w-full text-left px-3 py-1.5 text-xs hover:bg-secondary"
              >
                @{p}
              </button>
            ))}
          </div>
        )}
        <div className="flex items-center justify-between mt-2 gap-2">
          <button
            onClick={() => {
              const nomes = ["briefing.pdf", "curriculo.pdf", "parecer.docx", "anotacoes.txt"];
              setAnexoNome(nomes[Math.floor(Math.random() * nomes.length)]);
              toast.info("Anexo selecionado (mock).");
            }}
            className="h-8 px-3 rounded-md border border-border hover:bg-secondary text-xs inline-flex items-center gap-1.5"
          >
            <Paperclip className="h-3.5 w-3.5" /> Anexar
          </button>
          <button
            onClick={enviar}
            className="h-8 px-3 rounded-md bg-primary text-primary-foreground text-xs font-medium inline-flex items-center gap-1.5"
          >
            <Send className="h-3.5 w-3.5" /> Enviar
          </button>
        </div>
      </div>
    </div>
  );
}

// Renderiza texto com links http(s) clicáveis e @menções destacadas
function renderMensagemFormatada(texto: string) {
  const partes = texto.split(/(\s+)/);
  return partes.map((parte, i) => {
    if (/^https?:\/\/\S+$/i.test(parte)) {
      return (
        <a
          key={i}
          href={parte}
          target="_blank"
          rel="noreferrer"
          className="text-primary underline underline-offset-2 break-all"
        >
          {parte}
        </a>
      );
    }
    const mencao = parte.match(/^@([\wÀ-ÿ]+(?: [\wÀ-ÿ]+)?)/);
    if (mencao) {
      const resto = parte.slice(mencao[0].length);
      return (
        <span key={i}>
          <span className="rounded bg-primary/10 text-primary px-1 font-medium">@{mencao[1]}</span>
          {resto}
        </span>
      );
    }
    return <span key={i}>{parte}</span>;
  });
}

// ────────────────────────────────────────────────────────────────────
// CandidatoDetailSheet — ficha completa do candidato (painel lateral)
// Reutiliza modais existentes via callbacks; não duplica lógica.
// ────────────────────────────────────────────────────────────────────
type CandidatoBase = {
  id: string;
  nome: string;
  cargo: string;
  disc?: { D: number; I: number; S: number; C: number };
  perfilDom?: string;
  parecer?: string;
  status?: string;
  enviado?: boolean;
};

const STATUS_LABEL: Record<string, string> = {
  novo: "Novo",
  em_analise: "Em análise",
  aprovado: "Aprovado",
  standby: "Standby",
  reprovado: "Reprovado",
  contratado: "Contratado",
};

// Dados complementares mock (no futuro virão do backend)
const DADOS_EXTRA_MOCK: Record<string, {
  email: string; telefone: string; cidade: string; origem: string; pretensao: string;
  resumo: string; experiencias: { empresa: string; cargo: string; periodo: string }[];
  discStatus: "nao_solicitado" | "solicitado" | "concluido";
}> = {
  c1: {
    email: "pedro.alves@email.com", telefone: "(11) 99876-1122", cidade: "São Paulo / SP",
    origem: "LinkedIn", pretensao: "R$ 18.000",
    resumo: "Gerente de TI com 12 anos de experiência em transformação digital e liderança de squads multidisciplinares.",
    experiencias: [
      { empresa: "TechCorp", cargo: "Gerente de TI", periodo: "2021 — atual" },
      { empresa: "InovaSoft", cargo: "Coordenador de Sistemas", periodo: "2018 — 2021" },
      { empresa: "DataPlus", cargo: "Analista Sênior", periodo: "2014 — 2018" },
    ],
    discStatus: "concluido",
  },
};

function CandidatoDetailSheet({
  open,
  candidato,
  candidatoExtra,
  tituloVaga,
  etapaAtual,
  eventos,
  declinio,
  questionariosVaga,
  mensagensVaga,
  onClose,
  onSolicitarDisc,
  onVerResumo,
  onAssociarQuestionario,
  onDeclinar,
  onAgendar,
  onAbrirRelatorio,
  relatorioStatus,
  onEnviarWhatsQuestionario,
  onSalvarAvaliacao,
}: {
  open: boolean;
  candidato: CandidatoBase | null;
  candidatoExtra: CandidatoExtra | null;
  tituloVaga: string;
  etapaAtual?: string;
  eventos: EventoEntrevista[];
  declinio?: { motivo: string; quem: "candidato" | "azumi" };
  questionariosVaga: QuestionarioVaga[];
  mensagensVaga: MensagemVaga[];
  onClose: () => void;
  onSolicitarDisc: (id: string) => void;
  onVerResumo: (id: string) => void;
  onAssociarQuestionario: (id: string) => void;
  onDeclinar: (id: string) => void;
  onAgendar: (id: string) => void;
  onAbrirRelatorio: (id: string) => void;
  relatorioStatus?: "rascunho" | "enviado";
  onEnviarWhatsQuestionario?: (candidatoId: string, questionarioId: string) => void;
  onSalvarAvaliacao?: (questionarioId: string, candidatoId: string, questoes: Record<string, AvaliacaoQuestao>, salvoComo: "rascunho" | "definitivo") => void;
}) {
  useScrollLock(open);
  const { id: vagaIdParam } = useParams();
  if (!open) return null;

  // Aceita tanto candidato "oficial" quanto extra (manual/convidado)
  const cand: CandidatoBase | null =
    candidato ??
    (candidatoExtra
      ? { id: candidatoExtra.id, nome: candidatoExtra.nome, cargo: candidatoExtra.cargo, status: "novo" }
      : null);
  if (!cand) return null;

  const iniciais = cand.nome.split(" ").map((n) => n[0]).join("").slice(0, 2);
  const dados = DADOS_EXTRA_MOCK[cand.id] ?? {
    email: candidatoExtra?.email ?? "—",
    telefone: candidatoExtra?.telefone ?? "—",
    cidade: "—",
    origem: candidatoExtra?.origem === "manual" ? "Adicionado manualmente"
          : candidatoExtra?.origem === "convite" ? "Convite por link" : "—",
    pretensao: "—",
    resumo: cand.parecer ?? "Sem resumo disponível.",
    experiencias: [],
    discStatus: "nao_solicitado" as const,
  };

  const etapaPodeAgendar = etapaAtual === "Entrevista" || etapaAtual === "Quest/Entrevista";
  const ultimasMensagens = mensagensVaga.slice(-2);
  const questsDoCandidato = questionariosVaga.map((q) => {
    const resp = q.respostasPorCandidato[cand.id];
    return {
      ...q,
      resposta: resp,
      statusCand: resp?.status ?? "nao_associado" as const,
    };
  });

  // Timeline simulada por etapa
  const ETAPAS_TL = ["Triagem", "Quest/Entrevista", "Entrevista", "Perfis enviados", "Decisão"];

  return (
    <>
      {/* Backdrop — z-30 para ficar abaixo dos modais (z-50) */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-30 bg-background/60 backdrop-blur-sm animate-fade-in"
      />

      {/* Sheet — z-40 (modais flutuantes z-50 ficam acima) */}
      <aside
        className="fixed top-2 right-2 bottom-2 z-40 w-[min(640px,calc(100vw-1rem))] bg-card border border-border rounded-2xl shadow-elevated flex flex-col animate-scale-in overflow-hidden"
        role="dialog"
        aria-label={`Ficha de ${cand.nome}`}
      >
        {/* Header fixo */}
        <header className="px-5 pt-5 pb-4 border-b border-border bg-card">
          <div className="flex items-start gap-3">
            <div className="h-12 w-12 rounded-full bg-gradient-brand flex items-center justify-center text-sm font-semibold text-white shrink-0">
              {iniciais}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-display text-xl font-semibold truncate">{cand.nome}</h2>
                {etapaAtual && (
                  <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                    {etapaAtual}
                  </span>
                )}
                {cand.status && STATUS_LABEL[cand.status] && (
                  <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-secondary text-foreground/70 border border-border">
                    {STATUS_LABEL[cand.status]}
                  </span>
                )}
                {declinio && (
                  <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-destructive/10 text-destructive border border-destructive/30">
                    Declinado
                  </span>
                )}
                {relatorioStatus && (
                  <span className={cn(
                    "text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full border",
                    relatorioStatus === "enviado"
                      ? "bg-success/10 text-success border-success/30"
                      : "bg-info/10 text-info border-info/30",
                  )}>
                    {relatorioStatus === "enviado" ? "Relatório enviado" : "Relatório em rascunho"}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                Candidato para <strong className="text-foreground/80">{tituloVaga}</strong>
              </p>
            </div>
            <button
              onClick={onClose}
              aria-label="Fechar ficha"
              className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-secondary shrink-0"
            >
              <XIcon className="h-4 w-4" />
            </button>
          </div>

          {/* Ações principais */}
          <div className="mt-4 flex flex-wrap gap-1.5">
            <button
              onClick={() => onSolicitarDisc(cand.id)}
              className="inline-flex items-center gap-1 h-8 px-3 rounded-md border border-border hover:bg-secondary text-xs font-medium"
            >
              <MessageCircle className="h-3.5 w-3.5" /> Solicitar DISC
            </button>
            <button
              onClick={() => onVerResumo(cand.id)}
              className="inline-flex items-center gap-1 h-8 px-3 rounded-md border border-border hover:bg-secondary text-xs font-medium"
            >
              <FileText className="h-3.5 w-3.5" /> Ver resumo
            </button>
            <button
              onClick={() => onAbrirRelatorio(cand.id)}
              className="inline-flex items-center gap-1 h-8 px-3 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-medium"
            >
              <FileText className="h-3.5 w-3.5" /> Relatório para cliente
            </button>
            {etapaPodeAgendar && (
              <button
                onClick={() => onAgendar(cand.id)}
                className="inline-flex items-center gap-1 h-8 px-3 rounded-md border border-border hover:bg-secondary text-xs font-medium"
              >
                <CalendarPlus className="h-3.5 w-3.5" /> Agendar entrevista
              </button>
            )}
            <button
              onClick={() => onDeclinar(cand.id)}
              className="inline-flex items-center gap-1 h-8 px-3 rounded-md border border-destructive/30 text-destructive hover:bg-destructive/10 text-xs font-medium ml-auto"
            >
              <ThumbsDown className="h-3.5 w-3.5" /> Registrar declínio
            </button>
          </div>
        </header>

        {/* Conteúdo com scroll */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
          {/* Bloco: Dados */}
          <section>
            <h3 className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-3">Dados do candidato</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <DadoLinha icon={<Mail className="h-3.5 w-3.5" />} label="E-mail" value={dados.email} />
              <DadoLinha icon={<Phone className="h-3.5 w-3.5" />} label="Telefone" value={dados.telefone} />
              <DadoLinha icon={<MapPin className="h-3.5 w-3.5" />} label="Cidade / UF" value={dados.cidade} />
              <DadoLinha icon={<Briefcase className="h-3.5 w-3.5" />} label="Cargo pretendido" value={cand.cargo} />
              <DadoLinha icon={<Users className="h-3.5 w-3.5" />} label="Origem" value={dados.origem} />
              <DadoLinha icon={<Globe className="h-3.5 w-3.5" />} label="Pretensão salarial" value={dados.pretensao} />
            </div>
          </section>

          {/* Bloco: Resumo e experiência */}
          <section>
            <h3 className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-3">Resumo e experiência</h3>
            <p className="text-sm text-foreground/90 leading-relaxed mb-3">{dados.resumo}</p>
            {dados.experiencias.length > 0 && (
              <ul className="space-y-2">
                {dados.experiencias.slice(0, 3).map((e, i) => (
                  <li key={i} className="rounded-md border border-border bg-background/40 px-3 py-2">
                    <div className="text-sm font-medium">{e.cargo} <span className="text-muted-foreground font-normal">— {e.empresa}</span></div>
                    <div className="text-[11px] text-muted-foreground font-data">{e.periodo}</div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Bloco: DISC e questionários */}
          <section>
            <h3 className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-3">DISC e questionários</h3>

            <div className="rounded-lg border border-border p-3 mb-3">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="text-sm font-medium">DISC</div>
                  <div className="text-[11px] text-muted-foreground">
                    Status: {dados.discStatus === "concluido" ? "Concluído"
                          : dados.discStatus === "solicitado" ? "Solicitado"
                          : "Não solicitado"}
                    {cand.perfilDom && ` · Perfil dominante: ${cand.perfilDom}`}
                  </div>
                </div>
              </div>
              {cand.disc && <DiscBars values={cand.disc} compact />}
              <div className="mt-3 flex flex-wrap gap-1.5">
                <button
                  onClick={() => onSolicitarDisc(cand.id)}
                  className="inline-flex items-center gap-1 h-7 px-2 rounded-md border border-border text-[11px] font-medium hover:bg-secondary"
                >
                  <MessageCircle className="h-3 w-3" /> Solicitar DISC via WhatsApp
                </button>
                <button
                  onClick={() => toast.info(`PDF DISC de ${cand.nome} (mock).`)}
                  disabled={dados.discStatus !== "concluido"}
                  className="inline-flex items-center gap-1 h-7 px-2 rounded-md border border-border text-[11px] font-medium hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="h-3 w-3" /> Baixar PDF DISC
                </button>
              </div>
            </div>

            <div className="rounded-lg border border-border p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium">Questionários da vaga</div>
                <button
                  onClick={() => onAssociarQuestionario(cand.id)}
                  className="inline-flex items-center gap-1 h-7 px-2 rounded-md border border-border text-[11px] font-medium hover:bg-secondary"
                >
                  <ListChecks className="h-3 w-3" /> Enviar
                </button>
              </div>
              {questsDoCandidato.length === 0 ? (
                <div className="text-xs text-muted-foreground py-2">Nenhum questionário criado para esta vaga.</div>
              ) : (
                <ul className="space-y-2">
                  {questsDoCandidato.map((q) => (
                    <li key={q.id} className="rounded-md border border-border bg-background/40 p-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <div className="text-xs font-medium truncate">{q.nome}</div>
                          <div className="text-[10px] text-muted-foreground">
                            {q.perguntas.length} pergunta(s)
                            {q.resposta?.enviadoEm && ` · enviado em ${q.resposta.enviadoEm}`}
                            {q.resposta?.respondidoEm && ` · respondido em ${q.resposta.respondidoEm}`}
                          </div>
                        </div>
                        <span className={cn(
                          "px-2 py-0.5 rounded-full text-[10px] font-medium border shrink-0",
                          q.statusCand === "respondido" && "bg-success/10 text-success border-success/30",
                          q.statusCand === "pendente" && "bg-warning/10 text-warning border-warning/30",
                          q.statusCand === "nao_associado" && "bg-secondary text-muted-foreground border-border",
                        )}>
                          {q.statusCand === "respondido" ? "Respondido"
                            : q.statusCand === "pendente" ? "Pendente"
                            : "Não associado"}
                        </span>
                      </div>

                      {q.statusCand === "pendente" && q.resposta?.link && (
                        <div className="mt-2 flex items-center gap-1.5">
                          <input
                            readOnly
                            value={q.resposta.link}
                            className="flex-1 h-7 px-2 rounded-md border border-border bg-card text-[10px] font-data"
                          />
                          <button
                            onClick={() => { navigator.clipboard?.writeText(q.resposta!.link!); toast.success("Link copiado."); }}
                            className="h-7 w-7 inline-flex items-center justify-center rounded-md border border-border hover:bg-secondary"
                            title="Copiar link"
                          >
                            <Copy className="h-3 w-3" />
                          </button>
                          {onEnviarWhatsQuestionario && (
                            <button
                              onClick={() => onEnviarWhatsQuestionario(cand.id, q.id)}
                              className="h-7 px-2 rounded-md bg-success text-success-foreground text-[10px] font-medium inline-flex items-center gap-1"
                              title="Enviar via WhatsApp"
                            >
                              <MessageCircle className="h-3 w-3" /> WhatsApp
                            </button>
                          )}
                        </div>
                      )}

                      {q.statusCand === "respondido" && q.resposta && (
                        <CorrigirQuestionarioInline
                          perguntas={q.perguntas}
                          respostas={q.resposta.respostas ?? {}}
                          avaliacaoInicial={q.resposta.avaliacao?.questoes ?? {}}
                          mediaSalva={q.resposta.avaliacao?.media}
                          salvoComo={q.resposta.avaliacao?.salvoComo}
                          onSalvar={(quests, modo) => onSalvarAvaliacao?.(q.id, cand.id, quests, modo)}
                        />
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          {/* Bloco: Linha do tempo no processo */}
          <section>
            <h3 className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-3">Linha do tempo no processo</h3>
            <ol className="relative border-l border-border pl-5 space-y-3">
              {ETAPAS_TL.map((et) => {
                const atual = et === etapaAtual;
                const idxAtual = ETAPAS_TL.indexOf(etapaAtual ?? "");
                const idxEt = ETAPAS_TL.indexOf(et);
                const passada = idxAtual >= 0 && idxEt < idxAtual;
                return (
                  <li key={et} className="relative">
                    <span className={cn(
                      "absolute -left-[27px] top-1 h-3 w-3 rounded-full border-2",
                      atual ? "bg-primary border-primary" : passada ? "bg-success border-success" : "bg-card border-border",
                    )} />
                    <div className="flex items-center justify-between gap-2">
                      <span className={cn("text-sm", atual ? "font-semibold text-foreground" : passada ? "text-foreground/80" : "text-muted-foreground")}>
                        {et}
                      </span>
                      <span className="text-[11px] text-muted-foreground font-data">
                        {atual ? "Em andamento" : passada ? "Concluído" : "—"}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>

          {/* Bloco: Proposta (Etapa 6 — Doc Mestre) */}
          <PropostaPanel candidatoId={cand.id} candidatoNome={cand.nome} />

          {/* Bloco: Parecer do cliente (lido do store compartilhado) */}
          {(() => {
            const parecer = getParecerCliente(cand.id);
            const fb1aLeva = vagaIdParam ? getFeedback1aLeva(vagaIdParam) : null;
            if (!parecer && !fb1aLeva) return null;
            return (
              <section>
                <h3 className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-3">
                  Parecer do cliente
                </h3>
                {parecer ? (
                  <div className="rounded-lg border border-border bg-background/40 p-3 space-y-2 text-xs">
                    <div className="flex items-center gap-2 flex-wrap">
                      {!parecer.compareceu ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border bg-muted text-muted-foreground border-border">
                          Não compareceu
                        </span>
                      ) : parecer.decisao === "avancar" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border bg-success/15 text-success border-success/30">
                          Avançar
                        </span>
                      ) : parecer.decisao === "standby" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border bg-warning/15 text-warning border-warning/30">
                          Stand by
                        </span>
                      ) : parecer.decisao === "reprovar" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border bg-destructive/15 text-destructive border-destructive/30">
                          Reprovado
                        </span>
                      ) : null}
                      <span className="text-[10px] text-muted-foreground font-data">
                        {new Date(parecer.criadoEm).toLocaleString("pt-BR")}
                      </span>
                    </div>
                    {!parecer.compareceu && (
                      <div className="text-muted-foreground">
                        {parecer.remarcar ? "Cliente solicitou remarcação." : "Sem remarcação."}
                        {parecer.justificativaNaoCompareceu && (
                          <div className="italic mt-1">"{parecer.justificativaNaoCompareceu}"</div>
                        )}
                      </div>
                    )}
                    {parecer.compareceu && (
                      <>
                        {parecer.pontosPositivos && (
                          <div>
                            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Positivos</div>
                            <div>{parecer.pontosPositivos}</div>
                          </div>
                        )}
                        {parecer.pontosAtencao && (
                          <div>
                            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Atenção</div>
                            <div>{parecer.pontosAtencao}</div>
                          </div>
                        )}
                        {parecer.proximaFasePlanejada && (
                          <div>
                            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Próxima fase</div>
                            <div>{parecer.proximaFasePlanejada}</div>
                          </div>
                        )}
                        {parecer.decisao === "reprovar" && parecer.motivoReprovacao && (
                          <div>
                            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Motivo da reprovação</div>
                            <div>{parecer.motivoReprovacao}</div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ) : null}
                {fb1aLeva && (
                  <div className="mt-2 rounded-lg border border-warning/30 bg-warning/10 p-3 text-xs space-y-1">
                    <div className="font-medium text-warning">
                      Cliente reprovou os 3 perfis da 1ª leva
                    </div>
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Motivo:</span>{" "}
                      {fb1aLeva.motivoPrincipal}
                    </div>
                    {fb1aLeva.direcionamentos && (
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Direcionamentos:</span>{" "}
                        {fb1aLeva.direcionamentos}
                      </div>
                    )}
                  </div>
                )}
              </section>
            );
          })()}

          {/* Bloco: Histórico de interações */}
          <section>
            <h3 className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-3">Histórico de interações</h3>
            {(() => {
              type Interacao = { quando: string; icon: React.ReactNode; texto: string };
              const itens: Interacao[] = [];
              eventos.forEach((ev) => itens.push({
                quando: `${ev.data} ${ev.hora}`,
                icon: <CalendarDays className="h-3.5 w-3.5 text-primary" />,
                texto: `${ev.tipo} agendada para ${ev.data} às ${ev.hora} (${ev.local}).`,
              }));
              if (declinio) itens.push({
                quando: "Recente",
                icon: <ThumbsDown className="h-3.5 w-3.5 text-destructive" />,
                texto: `Declínio registrado (${declinio.quem}): ${declinio.motivo}`,
              });
              if (cand.enviado) itens.push({
                quando: "—",
                icon: <CheckCircle2 className="h-3.5 w-3.5 text-success" />,
                texto: "Perfil enviado ao cliente.",
              });
              if (relatorioStatus === "enviado") itens.push({
                quando: new Date().toLocaleDateString("pt-BR"),
                icon: <FileText className="h-3.5 w-3.5 text-primary" />,
                texto: "Relatório enviado ao cliente.",
              });
              if (itens.length === 0) {
                return <div className="text-xs text-muted-foreground py-2">Sem interações registradas ainda.</div>;
              }
              return (
                <ul className="space-y-2">
                  {itens.map((it, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs rounded-md border border-border bg-background/40 px-3 py-2">
                      <span className="mt-0.5 shrink-0">{it.icon}</span>
                      <div className="min-w-0 flex-1">
                        <div className="text-foreground">{it.texto}</div>
                        <div className="text-[10px] text-muted-foreground font-data">{it.quando}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              );
            })()}
          </section>

          {/* Bloco: Conversas (link p/ chat da vaga) */}
          <section>
            <h3 className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-3">Conversas da vaga</h3>
            {/* TODO: numa próxima fase, filtrar histórico de chat por candidato. */}
            {ultimasMensagens.length === 0 ? (
              <div className="text-xs text-muted-foreground py-2">Sem mensagens ainda na vaga.</div>
            ) : (
              <ul className="space-y-2 mb-2">
                {ultimasMensagens.map((m) => (
                  <li key={m.id} className="rounded-md border border-border bg-background/40 px-3 py-2 text-xs">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-medium">{m.autor}</span>
                      <span className="text-[10px] text-muted-foreground">{m.quando}</span>
                      <span className={cn(
                        "ml-auto text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded border",
                        m.canal === "interno"
                          ? "bg-muted/40 text-muted-foreground border-border"
                          : "bg-warning/10 text-warning border-warning/30",
                      )}>
                        {m.canal === "interno" ? "Interno" : "Cliente"}
                      </span>
                    </div>
                    <p className="text-foreground/80 line-clamp-2">{m.texto}</p>
                  </li>
                ))}
              </ul>
            )}
            <button
              onClick={() => {
                onClose();
                setTimeout(() => {
                  document.querySelector('[data-vaga-chat]')?.scrollIntoView({ behavior: "smooth" });
                }, 200);
              }}
              className="text-xs text-primary font-medium inline-flex items-center gap-1 hover:underline"
            >
              <MessageSquare className="h-3.5 w-3.5" /> Ver todas as conversas da vaga
            </button>
          </section>
        </div>
      </aside>
    </>
  );
}

function CorrigirQuestionarioInline({
  perguntas,
  respostas,
  avaliacaoInicial,
  mediaSalva,
  salvoComo,
  onSalvar,
}: {
  perguntas: PerguntaQuestionario[];
  respostas: Record<string, string>;
  avaliacaoInicial: Record<string, AvaliacaoQuestao>;
  mediaSalva?: number;
  salvoComo?: "rascunho" | "definitivo";
  onSalvar: (q: Record<string, AvaliacaoQuestao>, modo: "rascunho" | "definitivo") => void;
}) {
  const [estado, setEstado] = useState<Record<string, AvaliacaoQuestao>>(avaliacaoInicial);
  function setNota(pid: string, nota: 1 | 2 | 3 | 4 | 5) {
    setEstado((p) => ({ ...p, [pid]: { ...(p[pid] ?? { nota: 3 }), nota } }));
  }
  function setJust(pid: string, justificativa: string) {
    setEstado((p) => ({ ...p, [pid]: { ...(p[pid] ?? { nota: 3 }), justificativa } }));
  }
  return (
    <div className="mt-3 space-y-2">
      {mediaSalva !== undefined && (
        <div className="text-[11px] text-muted-foreground">
          Média atual: <strong className="text-foreground">{mediaSalva.toFixed(1)}/5</strong>
          {salvoComo && ` · ${salvoComo === "definitivo" ? "Salvo" : "Rascunho"}`}
        </div>
      )}
      <ul className="space-y-2">
        {perguntas.map((p) => {
          const av = estado[p.id] ?? { nota: 3 as const };
          return (
            <li key={p.id} className="rounded border border-border bg-card p-2">
              <div className="text-[11px] font-medium">{p.ordem}. {p.texto}</div>
              <div className="text-[10px] text-foreground/70 bg-secondary/40 rounded px-2 py-1 mt-1">
                <span className="text-muted-foreground mr-1">Resposta:</span>
                {respostas[p.id] ?? <em className="text-muted-foreground">— sem resposta —</em>}
              </div>
              <div className="flex items-center gap-1 mt-1.5">
                <span className="text-[10px] text-muted-foreground mr-1">Nota:</span>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setNota(p.id, n as 1 | 2 | 3 | 4 | 5)}
                    className={cn(
                      "h-6 w-6 rounded border text-[10px] font-semibold",
                      av.nota === n ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-secondary",
                    )}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <input
                value={av.justificativa ?? ""}
                onChange={(e) => setJust(p.id, e.target.value)}
                placeholder="Nota interna / justificativa"
                className="mt-1.5 w-full h-7 px-2 rounded-md border border-border bg-card text-[10px]"
              />
            </li>
          );
        })}
      </ul>
      <div className="flex justify-end gap-1.5">
        <button
          onClick={() => onSalvar(estado, "rascunho")}
          className="h-7 px-2 rounded-md border border-border hover:bg-secondary text-[10px] font-medium"
        >
          Salvar rascunho
        </button>
        <button
          onClick={() => onSalvar(estado, "definitivo")}
          className="h-7 px-2 rounded-md bg-primary text-primary-foreground text-[10px] font-semibold"
        >
          Salvar avaliação
        </button>
      </div>
    </div>
  );
}

function DadoLinha({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2 rounded-md border border-border bg-background/40 px-3 py-2">
      <span className="text-muted-foreground mt-0.5">{icon}</span>
      <div className="min-w-0 flex-1">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="text-sm truncate">{value}</div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────
// RelatorioCandidatoModal — editor de relatório para envio ao cliente
// (z-50 → garante render acima da CandidatoDetailSheet em z-40)
// ────────────────────────────────────────────────────────────────────
function RelatorioCandidatoModal({
  candidato,
  vagaTitulo,
  empresa,
  questionariosVaga,
  draft,
  onClose,
  onSaveDraft,
  onMarkSent,
}: {
  candidato: CandidatoBase;
  vagaTitulo: string;
  empresa: string;
  questionariosVaga: QuestionarioVaga[];
  draft?: RelatorioCandidato;
  onClose: () => void;
  onSaveDraft: (data: RelatorioCandidato) => void;
  onMarkSent: (data: RelatorioCandidato) => void;
}) {
  useScrollLock(true);
  const protocoloAuto = useMemo(
    () => `REL-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
    [candidato.id],
  );
  const hojeBR = new Date().toLocaleDateString("pt-BR");

  // Mock de questões da primeira questionário associado (fonte do conteúdo no relatório)
  const questoesMock = useMemo(() => {
    const q = questionariosVaga[0];
    if (!q) return [] as { id: string; pergunta: string; resposta: string }[];
    return Array.from({ length: Math.min(q.questoes, 4) }).map((_, i) => ({
      id: `${q.id}-q${i + 1}`,
      pergunta: `Pergunta ${i + 1} — ${q.tipo} (${q.nome})`,
      resposta: `Resposta do candidato à pergunta ${i + 1} (mock).`,
    }));
  }, [questionariosVaga]);

  const [form, setForm] = useState<RelatorioCandidato>(() => draft ?? {
    protocolo: protocoloAuto,
    data: hojeBR,
    cidadeUf: "—",
    cargoAtual: candidato.cargo,
    experienciaResumida: "",
    sintese: candidato.parecer ?? "",
    pontosPositivos: "",
    pontosAtencao: "",
    discResumo: candidato.perfilDom
      ? `Perfil dominante ${candidato.perfilDom}.`
      : "Perfil DISC ainda não disponível.",
    questoes: Object.fromEntries(questoesMock.map((q) => [q.id, { nota: 3, justificativa: "" }])),
    recomendacao: "",
    movimento: "",
    consultorNome: "Ana Beatriz",
    consultorCargo: "Consultora Sênior — Azumi",
    status: "rascunho",
  });

  const [preview, setPreview] = useState(false);

  const upd = <K extends keyof RelatorioCandidato>(k: K, v: RelatorioCandidato[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  const updQuestao = (id: string, patch: Partial<RelatorioQuestaoNota>) =>
    setForm((p) => ({
      ...p,
      questoes: { ...p.questoes, [id]: { ...(p.questoes[id] ?? { nota: 3, justificativa: "" }), ...patch } },
    }));

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-card border border-border rounded-2xl shadow-elevated w-full max-w-5xl max-h-[92vh] flex flex-col animate-scale-in overflow-hidden">
        {/* Header */}
        <header className="px-6 py-4 border-b border-border flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-display text-lg font-semibold">Relatório do candidato</h3>
              <span className={cn(
                "text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full border",
                form.status === "enviado"
                  ? "bg-success/10 text-success border-success/30"
                  : "bg-info/10 text-info border-info/30",
              )}>
                {form.status === "enviado" ? "Enviado" : "Rascunho"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Versão preparada para envio ao cliente · <span className="font-data">{form.protocolo}</span> · {form.data}
            </p>
          </div>
          <button
            onClick={() => setPreview((p) => !p)}
            className="inline-flex items-center gap-1 h-8 px-3 rounded-md border border-border hover:bg-secondary text-xs font-medium"
          >
            <Eye className="h-3.5 w-3.5" /> {preview ? "Editar" : "Pré-visualizar"}
          </button>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-secondary"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </header>

        {/* Corpo */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {preview ? (
            <RelatorioPreview form={form} candidato={candidato} vagaTitulo={vagaTitulo} empresa={empresa} questoesMock={questoesMock} />
          ) : (
            <div className="space-y-6">
              {/* Cabeçalho */}
              <SecaoEditor titulo="Cabeçalho">
                <div className="grid sm:grid-cols-2 gap-3 text-sm">
                  <CampoTexto label="Protocolo" value={form.protocolo} onChange={(v) => upd("protocolo", v)} />
                  <CampoTexto label="Data" value={form.data} onChange={(v) => upd("data", v)} />
                  <div className="text-xs text-muted-foreground sm:col-span-2">
                    Candidato: <strong className="text-foreground">{candidato.nome}</strong> · Vaga: <strong className="text-foreground">{vagaTitulo}</strong> · Empresa: <strong className="text-foreground">{empresa}</strong>
                  </div>
                </div>
              </SecaoEditor>

              {/* Dados essenciais (sem contatos) */}
              <SecaoEditor titulo="Dados essenciais (versão cliente — sem contatos)">
                <div className="grid sm:grid-cols-2 gap-3 text-sm">
                  <CampoTexto label="Cidade / UF" value={form.cidadeUf} onChange={(v) => upd("cidadeUf", v)} />
                  <CampoTexto label="Cargo atual / último cargo" value={form.cargoAtual} onChange={(v) => upd("cargoAtual", v)} />
                </div>
                <CampoTextarea label="Experiência resumida" value={form.experienciaResumida} onChange={(v) => upd("experienciaResumida", v)} rows={3} />
              </SecaoEditor>

              <SecaoEditor titulo="Síntese do currículo">
                <CampoTextarea label="Resumo profissional" value={form.sintese} onChange={(v) => upd("sintese", v)} rows={4} />
              </SecaoEditor>

              <div className="grid md:grid-cols-2 gap-4">
                <SecaoEditor titulo="Pontos positivos">
                  <CampoTextarea label="Forças e conquistas" value={form.pontosPositivos} onChange={(v) => upd("pontosPositivos", v)} rows={5} />
                </SecaoEditor>
                <SecaoEditor titulo="Pontos de atenção">
                  <CampoTextarea label="Riscos / gaps" value={form.pontosAtencao} onChange={(v) => upd("pontosAtencao", v)} rows={5} />
                </SecaoEditor>
              </div>

              <SecaoEditor titulo="DISC / Perfil comportamental">
                {candidato.disc && <div className="mb-3"><DiscBars values={candidato.disc} compact /></div>}
                <CampoTextarea label="Resumo DISC (texto curto que vai ao cliente)" value={form.discResumo} onChange={(v) => upd("discResumo", v)} rows={3} />
              </SecaoEditor>

              <SecaoEditor titulo="Questionário — respostas e notas">
                {questoesMock.length === 0 ? (
                  <div className="text-xs text-muted-foreground">Nenhum questionário associado a esta vaga.</div>
                ) : (
                  <ul className="space-y-3">
                    {questoesMock.map((q) => {
                      const nota = form.questoes[q.id]?.nota ?? 3;
                      const just = form.questoes[q.id]?.justificativa ?? "";
                      return (
                        <li key={q.id} className="rounded-md border border-border p-3">
                          <div className="text-sm font-medium">{q.pergunta}</div>
                          <div className="text-xs text-foreground/80 bg-secondary/40 rounded px-2 py-1 mt-1.5">
                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground mr-1">Resposta:</span>
                            {q.resposta}
                          </div>
                          <div className="grid sm:grid-cols-[140px_1fr] gap-3 mt-3">
                            <div>
                              <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Nota (1–5)</label>
                              <div className="flex items-center gap-1 mt-1">
                                {[1, 2, 3, 4, 5].map((n) => (
                                  <button
                                    key={n}
                                    type="button"
                                    onClick={() => updQuestao(q.id, { nota: n })}
                                    className={cn(
                                      "h-7 w-7 rounded-md border text-xs font-semibold",
                                      nota === n
                                        ? "bg-primary text-primary-foreground border-primary"
                                        : "border-border hover:bg-secondary",
                                    )}
                                  >
                                    {n}
                                  </button>
                                ))}
                              </div>
                            </div>
                            <CampoTextarea
                              label="Justificativa curta"
                              value={just}
                              onChange={(v) => updQuestao(q.id, { justificativa: v })}
                              rows={2}
                            />
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </SecaoEditor>

              <SecaoEditor titulo="Recomendação do consultor">
                <CampoTextarea label="Recomendação" value={form.recomendacao} onChange={(v) => upd("recomendacao", v)} rows={3} />
              </SecaoEditor>

              <SecaoEditor titulo="Movimento proposto">
                <div className="flex flex-wrap gap-2">
                  {(["Avançar", "Stand by", "Desclassificar"] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => upd("movimento", m)}
                      className={cn(
                        "h-8 px-3 rounded-md border text-xs font-medium",
                        form.movimento === m
                          ? m === "Avançar"
                            ? "bg-success text-success-foreground border-success"
                            : m === "Stand by"
                            ? "bg-warning text-warning-foreground border-warning"
                            : "bg-destructive text-destructive-foreground border-destructive"
                          : "border-border hover:bg-secondary",
                      )}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </SecaoEditor>

              <SecaoEditor titulo="Assinatura">
                <div className="grid sm:grid-cols-2 gap-3 text-sm">
                  <CampoTexto label="Consultor" value={form.consultorNome} onChange={(v) => upd("consultorNome", v)} />
                  <CampoTexto label="Cargo" value={form.consultorCargo} onChange={(v) => upd("consultorCargo", v)} />
                </div>
                <p className="text-[11px] text-muted-foreground mt-2">
                  Azumi Connect · Protocolo {form.protocolo} · Emitido em {form.data}
                </p>
              </SecaoEditor>
            </div>
          )}
        </div>

        {/* Rodapé */}
        <footer className="px-6 py-3 border-t border-border flex items-center justify-end gap-2">
          <button
            onClick={() => onSaveDraft(form)}
            className="inline-flex items-center gap-1 h-9 px-3 rounded-md border border-border hover:bg-secondary text-xs font-medium"
          >
            <FileText className="h-3.5 w-3.5" /> Salvar rascunho
          </button>
          <button
            onClick={() => toast.success("PDF gerado (mock).")}
            className="inline-flex items-center gap-1 h-9 px-3 rounded-md border border-border hover:bg-secondary text-xs font-medium"
          >
            <Download className="h-3.5 w-3.5" /> Gerar PDF
          </button>
          <button
            onClick={() => onMarkSent(form)}
            className="inline-flex items-center gap-1 h-9 px-4 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold"
          >
            <Send className="h-3.5 w-3.5" /> Enviar para cliente
          </button>
        </footer>
      </div>
    </div>
  );
}

function SecaoEditor({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-border p-4 bg-background/40">
      <h4 className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-3">{titulo}</h4>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function CampoTexto({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full h-9 px-3 rounded-md border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
      />
    </label>
  );
}

function CampoTextarea({
  label, value, onChange, rows = 3,
}: { label: string; value: string; onChange: (v: string) => void; rows?: number }) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="mt-1 w-full px-3 py-2 rounded-md border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-y"
      />
    </label>
  );
}

function RelatorioPreview({
  form, candidato, vagaTitulo, empresa, questoesMock,
}: {
  form: RelatorioCandidato;
  candidato: CandidatoBase;
  vagaTitulo: string;
  empresa: string;
  questoesMock: { id: string; pergunta: string; resposta: string }[];
}) {
  return (
    <article className="mx-auto max-w-3xl bg-card border border-border rounded-lg p-8 shadow-sm">
      <header className="border-b border-border pb-4 mb-5">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-semibold">Relatório do Candidato</h2>
          <span className="text-xs text-muted-foreground font-data">{form.protocolo}</span>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {candidato.nome} · {vagaTitulo} · {empresa} · {form.data}
        </p>
      </header>

      <BlocoPreview titulo="Dados essenciais">
        <p><strong>Cargo:</strong> {form.cargoAtual}</p>
        <p><strong>Cidade / UF:</strong> {form.cidadeUf}</p>
        <p className="mt-2">{form.experienciaResumida || <em className="text-muted-foreground">— sem experiência preenchida —</em>}</p>
      </BlocoPreview>

      <BlocoPreview titulo="Síntese do currículo">
        <p>{form.sintese || <em className="text-muted-foreground">— sem síntese preenchida —</em>}</p>
      </BlocoPreview>

      <div className="grid md:grid-cols-2 gap-4">
        <BlocoPreview titulo="Pontos positivos">
          <p className="whitespace-pre-line">{form.pontosPositivos || <em className="text-muted-foreground">—</em>}</p>
        </BlocoPreview>
        <BlocoPreview titulo="Pontos de atenção">
          <p className="whitespace-pre-line">{form.pontosAtencao || <em className="text-muted-foreground">—</em>}</p>
        </BlocoPreview>
      </div>

      <BlocoPreview titulo="Perfil comportamental (DISC)">
        {candidato.disc && <div className="mb-2"><DiscBars values={candidato.disc} compact /></div>}
        <p>{form.discResumo}</p>
      </BlocoPreview>

      {questoesMock.length > 0 && (
        <BlocoPreview titulo="Questionário — respostas e notas">
          <ul className="space-y-3">
            {questoesMock.map((q) => {
              const nota = form.questoes[q.id]?.nota ?? "—";
              const just = form.questoes[q.id]?.justificativa ?? "";
              return (
                <li key={q.id} className="rounded border border-border p-3">
                  <p className="font-medium">{q.pergunta}</p>
                  <p className="text-foreground/80 mt-1"><span className="text-[10px] uppercase tracking-wider text-muted-foreground mr-1">Resposta:</span>{q.resposta}</p>
                  <p className="text-xs mt-1"><strong>Nota:</strong> {nota}/5 {just && <>· <em>{just}</em></>}</p>
                </li>
              );
            })}
          </ul>
        </BlocoPreview>
      )}

      <BlocoPreview titulo="Recomendação do consultor">
        <p>{form.recomendacao || <em className="text-muted-foreground">—</em>}</p>
      </BlocoPreview>

      {form.movimento && (
        <BlocoPreview titulo="Movimento proposto">
          <span className={cn(
            "inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold",
            form.movimento === "Avançar" && "bg-success/10 text-success border border-success/30",
            form.movimento === "Stand by" && "bg-warning/10 text-warning border border-warning/30",
            form.movimento === "Desclassificar" && "bg-destructive/10 text-destructive border border-destructive/30",
          )}>
            {form.movimento}
          </span>
        </BlocoPreview>
      )}

      <footer className="border-t border-border pt-4 mt-6 text-sm">
        <p className="font-medium">{form.consultorNome}</p>
        <p className="text-muted-foreground text-xs">{form.consultorCargo}</p>
        <p className="text-[11px] text-muted-foreground font-data mt-2">Azumi Connect · {form.protocolo} · {form.data}</p>
      </footer>
    </article>
  );
}

function BlocoPreview({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="mb-5">
      <h3 className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-2">{titulo}</h3>
      <div className="text-sm text-foreground/90 leading-relaxed">{children}</div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────────────
// Entrevista com Gestor — Modal de agendamento (Etapa 5 — Doc Mestre)
// ────────────────────────────────────────────────────────────────────

function janelaResumo(j: JanelaDisponibilidade): string {
  const dias = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
  const diasTxt = j.diasSemana.map((d) => dias[d]).join(", ");
  const blocosTxt = j.blocos.map((b) => `${b.inicio}–${b.fim}`).join(" e ");
  return `${diasTxt} · ${blocosTxt}`;
}

function diaPermitido(dataIso: string, j: JanelaDisponibilidade): boolean {
  if (!dataIso) return false;
  const d = new Date(`${dataIso}T00:00:00`);
  return j.diasSemana.includes(d.getDay());
}

function horaDentroJanela(hora: string, j: JanelaDisponibilidade): boolean {
  if (!hora) return false;
  return j.blocos.some((b) => hora >= b.inicio && hora <= b.fim);
}

function AgendarEntrevistaGestorModal({
  vagaId,
  empresaNome,
  candidatoId,
  candidatoNome,
  candidatoEmail,
  gestor,
  onClose,
  onSaved,
}: {
  vagaId: string;
  empresaNome: string;
  candidatoId: string;
  candidatoNome: string;
  candidatoEmail: string;
  gestor: { id: string; nome: string; cargo: string; janela: JanelaDisponibilidade };
  onClose: () => void;
  onSaved: () => void;
}) {
  useScrollLock(true);
  const [s1, setS1] = useState<SugestaoHorario>({ data: "", hora: "", modo: "remoto", localOuLink: "" });
  const [s2, setS2] = useState<SugestaoHorario>({ data: "", hora: "", modo: "remoto", localOuLink: "" });

  const s1Valida = s1.data && s1.hora && diaPermitido(s1.data, gestor.janela) && horaDentroJanela(s1.hora, gestor.janela);
  const s2Valida = s2.data && s2.hora && diaPermitido(s2.data, gestor.janela) && horaDentroJanela(s2.hora, gestor.janela);
  const podeEnviar = s1Valida && s2Valida;

  function handleEnviar() {
    if (!podeEnviar) return;
    criarAgendamento({
      vagaId,
      candidatoId,
      candidatoNome,
      candidatoEmail,
      gestorId: gestor.id,
      gestorNome: gestor.nome,
      empresaNome,
      sugestoes: [s1, s2],
    });
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div className="relative w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-start justify-between gap-3 p-5 border-b border-border">
          <div className="min-w-0">
            <h3 className="font-display font-semibold text-base">Agendar entrevista com o gestor</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {candidatoNome} · Gestor {gestor.nome} ({gestor.cargo})
            </p>
            <p className="text-[11px] text-muted-foreground mt-1">
              Janela disponível: <span className="font-data">{janelaResumo(gestor.janela)}</span>
            </p>
          </div>
          <button onClick={onClose} className="h-8 w-8 rounded-lg hover:bg-secondary flex items-center justify-center text-muted-foreground" aria-label="Fechar">
            <XIcon className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <p className="text-xs text-muted-foreground">
            Escolha duas sugestões de data/horário dentro da janela do gestor. Ambas serão enviadas ao gestor para escolha.
          </p>
          <SugestaoForm titulo="Sugestão 1" valor={s1} onChange={setS1} valida={!!s1Valida} janela={gestor.janela} />
          <SugestaoForm titulo="Sugestão 2" valor={s2} onChange={setS2} valida={!!s2Valida} janela={gestor.janela} />
        </div>
        <div className="border-t border-border p-4 flex flex-wrap items-center justify-end gap-2">
          <button onClick={onClose} className="h-9 px-4 rounded-lg border border-border text-sm font-medium hover:bg-secondary">
            Cancelar
          </button>
          <button onClick={handleEnviar} disabled={!podeEnviar}
            className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed">
            Enviar sugestões ao gestor
          </button>
        </div>
      </div>
    </div>
  );
}

function SugestaoForm({
  titulo,
  valor,
  onChange,
  valida,
  janela,
}: {
  titulo: string;
  valor: SugestaoHorario;
  onChange: (v: SugestaoHorario) => void;
  valida: boolean;
  janela: JanelaDisponibilidade;
}) {
  const set = (patch: Partial<SugestaoHorario>) => onChange({ ...valor, ...patch });
  const erroData = valor.data && !diaPermitido(valor.data, janela);
  const erroHora = valor.hora && !horaDentroJanela(valor.hora, janela);
  return (
    <div className={cn("rounded-xl border p-4", valida ? "border-success/30 bg-success/5" : "border-border bg-background/40")}>
      <div className="text-xs font-medium mb-3">{titulo}</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-[11px] text-muted-foreground block mb-1">Data</label>
          <input type="date" value={valor.data} onChange={(e) => set({ data: e.target.value })}
            className="w-full h-9 rounded-md border border-input bg-background px-2 text-sm" />
          {erroData && <p className="text-[10px] text-destructive mt-1">Dia fora da janela do gestor.</p>}
        </div>
        <div>
          <label className="text-[11px] text-muted-foreground block mb-1">Hora</label>
          <input type="time" value={valor.hora} onChange={(e) => set({ hora: e.target.value })}
            className="w-full h-9 rounded-md border border-input bg-background px-2 text-sm" />
          {erroHora && <p className="text-[10px] text-destructive mt-1">Horário fora da janela do gestor.</p>}
        </div>
        <div>
          <label className="text-[11px] text-muted-foreground block mb-1">Formato</label>
          <select value={valor.modo} onChange={(e) => set({ modo: e.target.value as ModoEntrevista })}
            className="w-full h-9 rounded-md border border-input bg-background px-2 text-sm">
            <option value="remoto">Remoto</option>
            <option value="presencial">Presencial</option>
          </select>
        </div>
        <div>
          <label className="text-[11px] text-muted-foreground block mb-1">
            {valor.modo === "remoto" ? "Link da reunião" : "Endereço"}
          </label>
          <input value={valor.localOuLink} onChange={(e) => set({ localOuLink: e.target.value })}
            placeholder={valor.modo === "remoto" ? "https://meet.google.com/…" : "Av. Paulista 1000, sala 12"}
            className="w-full h-9 rounded-md border border-input bg-background px-2 text-sm" />
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────
// Painel de acompanhamento (aba Agenda)
// ────────────────────────────────────────────────────────────────────

function AgendamentoGestorPanel({
  vagaId,
  agendamentos,
  empresaNome,
}: {
  vagaId: string;
  agendamentos: AgendamentoEntrevistaGestor[];
  empresaNome: string;
}) {
  const origem = typeof window !== "undefined" ? window.location.origin : "https://azumi.jobs";
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display font-semibold">Entrevistas com gestor</h3>
          <p className="text-[11px] text-muted-foreground">
            Etapa 5 — sugestões enviadas → gestor escolhe → candidato confirma via link com CPF.
          </p>
        </div>
        <span className="text-xs text-muted-foreground">{agendamentos.length} agendamento(s)</span>
      </div>
      {agendamentos.length === 0 ? (
        <div className="text-center text-sm text-muted-foreground py-6">
          Nenhuma entrevista com gestor ainda. Mova um candidato para a coluna <strong>Entrevista</strong> no Kanban para iniciar.
          <p className="text-[11px] mt-1">Empresa: {empresaNome}</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {agendamentos.map((ag) => {
            const link = ag.linkConfirmacao ?? `${origem}/confirmar-entrevista/${ag.id}?cand=${ag.candidatoId}`;
            const podeEnviarLink = ag.status === "aprovado_gestor" || ag.status === "nova_sugestao_gestor";
            const podeSimularConfirmar = ag.status === "aguardando_confirmacao_candidato";
            return (
              <li key={ag.id} className="rounded-lg border border-border bg-background/40 p-3 space-y-2">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="min-w-0">
                    <div className="text-sm font-medium">{ag.candidatoNome}</div>
                    <div className="text-[11px] text-muted-foreground">
                      Gestor: {ag.gestorNome}
                    </div>
                  </div>
                  <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border border-border bg-muted text-muted-foreground">
                    {statusAgendamentoLabel(ag.status)}
                  </span>
                </div>
                <div className="text-xs space-y-1">
                  {ag.sugestoes.map((s, i) => (
                    <div key={i} className="text-muted-foreground">
                      <span className="font-data">#{i + 1}</span> {formatarSugestao(s)}
                      {s.localOuLink && <span> · {s.localOuLink}</span>}
                    </div>
                  ))}
                  {ag.escolhido && (
                    <div className="text-success text-xs mt-1">
                      ✓ Escolhido: {formatarSugestao(ag.escolhido)}
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {podeEnviarLink && (
                    <button
                      onClick={() => {
                        enviarParaCandidatoConfirmar(ag.id, origem);
                        toast.success("Link de confirmação enviado ao candidato.");
                      }}
                      className="h-8 px-3 rounded-md bg-primary text-primary-foreground text-xs font-medium"
                    >
                      Enviar para candidato confirmar
                    </button>
                  )}
                  {ag.linkConfirmacao && (
                    <a
                      href={ag.linkConfirmacao}
                      target="_blank"
                      rel="noreferrer"
                      className="h-8 px-3 rounded-md border border-border text-xs font-medium inline-flex items-center gap-1 hover:bg-secondary"
                    >
                      <Link2 className="h-3 w-3" /> Abrir link público
                    </a>
                  )}
                  {podeSimularConfirmar && (
                    <button
                      onClick={() => {
                        candidatoConfirmar(ag.id);
                        toast.success("Confirmação do candidato simulada.");
                      }}
                      className="h-8 px-3 rounded-md border border-success/40 text-success text-xs font-medium hover:bg-success/10"
                      title="Atalho de demo — equivale ao candidato abrir o link"
                    >
                      Simular confirmação do candidato (dev)
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
      {/* Suprime warnings de imports caso ainda não usados */}
      <span className="hidden">{vagaId}</span>
    </div>
  );
}

// Suprime warnings de imports usados apenas em fluxos opcionais
void getParecerGestor;
void getRealinhamento;

// ────────────────────────────────────────────────────────────────────
// Etapa 6 — Painel de proposta na ficha do candidato (com countdown
// de 24h e botões de simulação Aceitar/Recusar/Expirar).
// ────────────────────────────────────────────────────────────────────
function PropostaPanel({ candidatoId, candidatoNome }: { candidatoId: string; candidatoNome: string }) {
  const [tick, setTick] = useState(0);
  // re-render a cada 1s (countdown) + assinar mudanças do store
  useEffect(() => {
    const off = subscribePropostas(() => setTick((v) => v + 1));
    const id = window.setInterval(() => setTick((v) => v + 1), 1000);
    return () => { off(); window.clearInterval(id); };
  }, []);
  // tick is intentionally read to force renders
  void tick;

  const proposta = getPropostaAtiva(candidatoId);
  if (!proposta) return null;

  const restantes = msRestantes(proposta);
  const expiradaPorTempo = isExpiradaPorTempo(proposta);
  function fmtRestante(ms: number) {
    if (ms <= 0) return "expirou";
    const totalSec = Math.floor(ms / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return `${h}h ${m.toString().padStart(2, "0")}m ${s.toString().padStart(2, "0")}s`;
  }
  const statusCls =
    proposta.status === "aceita" ? "bg-success/15 text-success border-success/30" :
    proposta.status === "recusada" ? "bg-destructive/15 text-destructive border-destructive/30" :
    proposta.status === "expirada" || expiradaPorTempo ? "bg-muted text-muted-foreground border-border" :
    "bg-warning/15 text-warning border-warning/30";

  return (
    <section>
      <h3 className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-3">
        Proposta (Etapa 6)
      </h3>
      <div className="rounded-lg border border-border bg-background/40 p-3 space-y-2 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border", statusCls)}>
            <Send className="h-3 w-3" /> {expiradaPorTempo && proposta.status === "enviada" ? "Expirada (sem resposta)" : statusPropostaLabel(proposta.status)}
          </span>
          <span className="text-[10px] text-muted-foreground font-data">
            Enviada em {new Date(proposta.enviadaEm).toLocaleString("pt-BR")}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <div><span className="text-muted-foreground">Tipo:</span> {proposta.tipo}</div>
          <div><span className="text-muted-foreground">Remuneração:</span> {proposta.remuneracao}</div>
          <div><span className="text-muted-foreground">Início:</span> {proposta.dataInicio}</div>
          <div><span className="text-muted-foreground">Canal:</span> {proposta.canal}</div>
        </div>

        {proposta.status === "enviada" && (
          <div className={cn(
            "rounded-md border p-2 text-[11px] inline-flex items-center gap-1.5",
            restantes > 0
              ? "border-warning/30 bg-warning/10 text-warning"
              : "border-destructive/30 bg-destructive/10 text-destructive"
          )}>
            <Clock className="h-3 w-3" />
            Prazo: até {new Date(proposta.expiraEm).toLocaleString("pt-BR")} —{" "}
            <strong className="font-data">{fmtRestante(restantes)}</strong>
          </div>
        )}

        {proposta.respostaEm && (
          <div className="text-[11px] text-muted-foreground">
            Resposta registrada em {new Date(proposta.respostaEm).toLocaleString("pt-BR")}
            {proposta.motivoRecusa && <> — motivo: "{proposta.motivoRecusa}"</>}
          </div>
        )}

        {/* Atalhos de simulação para demo (mock) */}
        {proposta.status === "enviada" && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            <button
              type="button"
              onClick={() => { aceitarProposta(proposta.id); toast.success(`${candidatoNome} aceitou a proposta — agora contratado(a).`); }}
              className="h-7 px-2.5 rounded-md bg-success text-success-foreground text-[11px] font-medium inline-flex items-center gap-1"
            >
              <CheckCircle2 className="h-3 w-3" /> Simular aceita
            </button>
            <button
              type="button"
              onClick={() => {
                const motivo = window.prompt("Motivo da recusa (opcional):") ?? undefined;
                recusarProposta(proposta.id, motivo);
                toast.warning(`${candidatoNome} recusou a proposta.`);
              }}
              className="h-7 px-2.5 rounded-md border border-destructive/40 text-destructive text-[11px] font-medium inline-flex items-center gap-1 hover:bg-destructive/10"
            >
              <UserX className="h-3 w-3" /> Simular recusa
            </button>
            <button
              type="button"
              onClick={() => { expirarProposta(proposta.id); toast.info("Proposta marcada como expirada."); }}
              className="h-7 px-2.5 rounded-md border border-border text-[11px] font-medium inline-flex items-center gap-1 hover:bg-secondary"
            >
              <Clock className="h-3 w-3" /> Forçar expiração
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
