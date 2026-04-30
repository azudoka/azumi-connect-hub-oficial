import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { SectionDivider } from "@/components/SectionDivider";
import { SlaBar } from "@/components/SlaBar";
import { DiscBars } from "@/components/DiscBars";
import { Timer } from "@/components/Timer";
import { useParams, Link, useNavigate } from "react-router-dom";
import { vagas, candidatos, etapasVaga, comentariosVaga } from "@/data/mock";

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
  CalendarDays, Globe, Paperclip, X as XIcon, Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

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

interface QuestionarioVaga {
  id: string;
  nome: string;
  tipo: "Comportamental" | "Técnico" | "Cultural";
  questoes: number;
  candidatosRespostas: Record<string, "pendente" | "respondido">;
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
  const colunas = ["Triagem", "Quest.", "Entrevista", "Enviados", "Decisão"] as const;
  type Coluna = typeof colunas[number];

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
    { id: "q-disc", nome: "DISC padrão", tipo: "Comportamental", questoes: 24, candidatosRespostas: {} },
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
  const [novoQuestOpen, setNovoQuestOpen] = useState(false);
  const [resumoOpen, setResumoOpen] = useState<string | null>(null);
  const [discWhatsOpen, setDiscWhatsOpen] = useState<string | null>(null);
  const [associarQuestOpen, setAssociarQuestOpen] = useState<string | null>(null);
  const [declinarOpen, setDeclinarOpen] = useState<string | null>(null);
  const [agendarOpen, setAgendarOpen] = useState<string | null>(null);
  const [fichaCandidatoId, setFichaCandidatoId] = useState<string | null>(null);

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
    return false;
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
            <button
              onClick={() => setNovoQuestOpen(true)}
              className="h-8 px-3 rounded-lg border border-border text-xs flex items-center gap-1.5 hover:bg-secondary"
            >
              <FileQuestion className="h-3.5 w-3.5" /> Criar questionário
            </button>
            <span className="text-xs text-muted-foreground ml-auto">Arraste candidatos entre etapas</span>
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
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
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
                    "bg-card border rounded-xl p-3 min-h-[280px] transition-colors",
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
                            "relative bg-background/60 border border-border rounded-lg p-3 hover:border-primary/40 cursor-grab active:cursor-grabbing transition-colors",
                            draggingId === c.id && "opacity-50"
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-gradient-brand flex items-center justify-center text-[10px] font-semibold text-white">
                              {c.nome.split(" ").map(n => n[0]).join("").slice(0, 2)}
                            </div>
                            <div className="min-w-0 flex-1">
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); setFichaCandidatoId(c.id); }}
                                onMouseDown={(e) => e.stopPropagation()}
                                className="text-sm font-medium hover:text-primary truncate block text-left w-full"
                              >
                                {c.nome}
                              </button>
                              <div className="text-[10px] text-muted-foreground">DISC: {c.perfilDom} dominante</div>
                            </div>
                            {(() => {
                              const ev = eventos.find((e) => e.candidatoId === c.id);
                              return ev ? (
                                <span
                                  title={`Entrevista agendada em ${ev.data} às ${ev.hora}`}
                                  className="inline-flex items-center justify-center h-6 w-6 rounded-md bg-primary/10 text-primary border border-primary/20 shrink-0"
                                >
                                  <CalendarDays className="h-3.5 w-3.5" />
                                </span>
                              ) : null;
                            })()}
                            {colunasEstado[c.id] === "Entrevista" && (
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); setAgendarOpen(c.id); }}
                                onMouseDown={(e) => e.stopPropagation()}
                                title="Agendar entrevista"
                                className="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:bg-secondary hover:text-foreground shrink-0"
                              >
                                <CalendarPlus className="h-4 w-4" />
                              </button>
                            )}
                            <button
                              type="button"
                              aria-label="Mais ações"
                              onMouseDown={(e) => e.stopPropagation()}
                              onClick={(e) => {
                                e.stopPropagation();
                                setMenuAbertoId(menuAberto ? null : c.id);
                              }}
                              className="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:bg-secondary hover:text-foreground shrink-0"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="mt-2">
                            <DiscBars values={c.disc} compact />
                          </div>

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
                      <div className="text-sm font-medium truncate">{c.nome}</div>
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
                    <Link
                      to={`/app/candidatos/${c.id}`}
                      className="inline-flex items-center gap-1 h-7 px-2 rounded-md border border-border text-[11px] font-medium hover:bg-secondary"
                    >
                      <FileText className="h-3 w-3" /> Ver relatório
                    </Link>
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
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold">Entrevistas agendadas</h3>
            <span className="text-xs text-muted-foreground">{eventos.length} evento(s)</span>
          </div>
          {eventos.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground py-8">
              Nenhuma entrevista agendada. Use o botão{" "}
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
            <h3 className="font-display font-semibold">Questionários da vaga</h3>
            <button
              onClick={() => setNovoQuestOpen(true)}
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
            <ul className="space-y-2">
              {questionariosVaga.map((q) => {
                const respondidos = Object.values(q.candidatosRespostas).filter((s) => s === "respondido").length;
                const total = Object.keys(q.candidatosRespostas).length;
                return (
                  <li key={q.id} className="border border-border rounded-lg px-3 py-2 flex items-center gap-3 bg-background/40">
                    <div className="h-9 w-9 rounded-md bg-secondary flex items-center justify-center">
                      <FileQuestion className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium">{q.nome}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {q.tipo} · {q.questoes} questões · {respondidos}/{total} respondido(s)
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
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

      {/* ── Modal: Novo questionário ─────────────────────────────── */}
      {novoQuestOpen && (
        <ModalShell title="Novo questionário" onClose={() => setNovoQuestOpen(false)}>
          <NovoQuestionarioForm
            onCancel={() => setNovoQuestOpen(false)}
            onSave={(q) => {
              setQuestionariosVaga((prev) => [...prev, q]);
              setNovoQuestOpen(false);
              toast.success(`Questionário "${q.nome}" criado.`);
            }}
          />
        </ModalShell>
      )}

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
          <ModalShell title="Associar questionário" onClose={() => setAssociarQuestOpen(null)}>
            <div className="text-sm space-y-3">
              <p>Selecione um questionário para <strong>{c?.nome}</strong>:</p>
              <ul className="space-y-2">
                {questionariosVaga.map((q) => (
                  <li key={q.id}>
                    <button
                      onClick={() => {
                        setQuestionariosVaga((prev) => prev.map((x) =>
                          x.id === q.id
                            ? { ...x, candidatosRespostas: { ...x.candidatosRespostas, [c?.id ?? ""]: "pendente" } }
                            : x
                        ));
                        setAssociarQuestOpen(null);
                        toast.success(`Questionário "${q.nome}" associado.`);
                      }}
                      className="w-full text-left px-3 py-2 rounded-md border border-border hover:bg-secondary text-sm"
                    >
                      <div className="font-medium">{q.nome}</div>
                      <div className="text-xs text-muted-foreground">{q.tipo} · {q.questoes} questões</div>
                    </button>
                  </li>
                ))}
              </ul>
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
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-card border border-border rounded-2xl shadow-elevated w-full max-w-md p-6 animate-scale-in">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="h-7 w-7 inline-flex items-center justify-center rounded-md hover:bg-secondary">
            <XIcon className="h-4 w-4" />
          </button>
        </div>
        {children}
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

function NovoQuestionarioForm({
  onCancel,
  onSave,
}: {
  onCancel: () => void;
  onSave: (q: QuestionarioVaga) => void;
}) {
  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState<QuestionarioVaga["tipo"]>("Comportamental");
  const [questoes, setQuestoes] = useState(10);

  return (
    <div className="space-y-3 text-sm">
      <Field label="Nome do questionário">
        <input value={nome} onChange={(e) => setNome(e.target.value)} className="w-full h-9 px-3 rounded-md border border-border bg-background text-sm" />
      </Field>
      <Field label="Tipo">
        <select value={tipo} onChange={(e) => setTipo(e.target.value as QuestionarioVaga["tipo"])} className="w-full h-9 px-3 rounded-md border border-border bg-background text-sm">
          <option value="Comportamental">Comportamental</option>
          <option value="Técnico">Técnico</option>
          <option value="Cultural">Cultural</option>
        </select>
      </Field>
      <Field label="Número de questões">
        <input type="number" min={1} value={questoes} onChange={(e) => setQuestoes(Number(e.target.value))} className="w-full h-9 px-3 rounded-md border border-border bg-background text-sm" />
      </Field>
      <div className="flex justify-end gap-2 pt-2">
        <button onClick={onCancel} className="h-9 px-4 rounded-lg border border-border hover:bg-secondary text-sm">Cancelar</button>
        <button
          disabled={!nome.trim()}
          onClick={() => onSave({ id: `q-${Date.now()}`, nome: nome.trim(), tipo, questoes, candidatosRespostas: {} })}
          className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium inline-flex items-center gap-1.5 disabled:opacity-50"
        >
          <Plus className="h-3.5 w-3.5" /> Criar
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

