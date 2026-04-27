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
  MoreVertical, Eye, StickyNote, ChevronRight, UserX, Play,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const tabs = [
  { key: "candidatos", label: "Candidatos", icon: Users },
  { key: "perfis", label: "Perfis enviados", icon: Send },
  { key: "questionarios", label: "Questionários", icon: FileQuestion },
  { key: "historico", label: "Histórico", icon: History },
  { key: "chat", label: "Mini-chat", icon: MessageSquare },
] as const;

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
    const cand = candidatosVaga.find((c) => c.id === draggingId);
    setColunasEstado((prev) =>
      prev[draggingId] === coluna ? prev : { ...prev, [draggingId]: coluna }
    );
    if (cand && colunasEstado[draggingId] !== coluna) {
      toast.info(`${cand.nome} movido para ${coluna}`);
    }
    setDraggingId(null);
    setDragOverCol(null);
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
          <div className="flex items-center gap-2 mb-3">
            <button className="h-8 px-3 rounded-lg border border-border text-xs flex items-center gap-1.5 hover:bg-secondary">
              <Filter className="h-3.5 w-3.5" /> Filtrar
            </button>
            <span className="text-xs text-muted-foreground ml-auto">Arraste candidatos entre etapas</span>
          </div>
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
                              <Link to={`/app/candidatos/${c.id}`} className="text-sm font-medium hover:text-primary truncate block">{c.nome}</Link>
                              <div className="text-[10px] text-muted-foreground">DISC: {c.perfilDom} dominante</div>
                            </div>
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
                              <Link
                                to={`/app/candidatos/${c.id}`}
                                onClick={() => setMenuAbertoId(null)}
                                className="flex items-center gap-2 px-3 py-2 hover:bg-secondary"
                              >
                                <Eye className="h-3.5 w-3.5 text-muted-foreground" /> Ver perfil
                              </Link>
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
        <div className="bg-card border border-border rounded-xl p-5 max-w-3xl">
          <h3 className="font-display font-semibold mb-4">Mini-chat — Triagem</h3>
          <ul className="space-y-3 mb-4">
            {comentariosVaga.map((c) => (
              <li key={c.id} className={cn("flex gap-3", c.azumi ? "" : "flex-row-reverse")}>
                <div className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center text-[10px] font-semibold shrink-0",
                  c.azumi ? "bg-gradient-brand text-white" : "bg-secondary text-foreground"
                )}>
                  {c.azumi ? "A" : c.autor.split(" ").map(n => n[0]).join("").slice(0, 2)}
                </div>
                <div className={cn("max-w-md", c.azumi ? "" : "text-right")}>
                  <div className="text-xs text-muted-foreground mb-1">{c.autor} · {c.role} · <span className="font-data">{c.quando}</span></div>
                  <div className={cn(
                    "rounded-xl px-3 py-2 text-sm border",
                    c.azumi ? "bg-primary/10 border-primary/20" : "bg-secondary border-border"
                  )}>{c.texto}</div>
                </div>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Comente nesta etapa…"
              className="flex-1 h-10 px-3 rounded-lg bg-secondary border border-input focus:border-primary outline-none text-sm"
            />
            <button className="h-10 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium flex items-center gap-1.5">
              <Send className="h-4 w-4" /> Enviar
            </button>
          </div>
        </div>
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
            {/* B09: Botão dispara Dialog de confirmação antes do envio */}
            <button
              onClick={handleCliqueEnviar}
              disabled={candidatosVaga.filter(c => c.enviado).length === 0}
              className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium flex items-center gap-1.5 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-4 w-4" /> Enviar para o cliente
            </button>
          </div>

          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {candidatosVaga.filter(c => c.enviado).map((c) => (
              <li key={c.id} className="border border-border rounded-lg p-3 bg-background/40">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-gradient-brand flex items-center justify-center text-[10px] font-semibold text-white">
                    {c.nome.split(" ").map(n => n[0]).join("").slice(0, 2)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium truncate">{c.nome}</div>
                    <div className="text-[11px] text-muted-foreground">DISC: {c.perfilDom} dominante</div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-success/15 text-success border border-success/30">
                    Pronto
                  </span>
                  <button
                    type="button"
                    onClick={() => navigate(`/app/horas?task_id=${c.id}&vaga=${vaga.id}`)}
                    className="inline-flex items-center gap-1 h-7 px-2 rounded-md border border-border text-[11px] font-medium hover:bg-secondary hover:border-primary/40 transition-colors"
                    aria-label={`Iniciar timer para ${c.nome}`}
                    title="Iniciar timer para este candidato"
                  >
                    <Play className="h-3 w-3" /> Play
                  </button>
                </div>
                <p className="mt-2 text-xs text-muted-foreground line-clamp-2">{c.parecer}</p>
              </li>
            ))}
            {candidatosVaga.filter(c => c.enviado).length === 0 && (
              <li className="col-span-full text-center text-xs text-muted-foreground py-8">
                Nenhum candidato marcado para envio ainda.
              </li>
            )}
          </ul>
        </div>
      )}

      {tab === "historico" && (
        <div className="bg-card border border-border rounded-xl p-5 max-w-3xl">
          <h3 className="font-display font-semibold mb-4">Histórico da vaga</h3>
          <ol className="relative space-y-4 before:absolute before:left-4 before:top-2 before:bottom-2 before:w-px before:bg-border">
            {comentariosVaga.map((c) => {
              const isSistema = !c.autor || /sistema|automátic/i.test(c.role);
              const dataFmt = c.quando;
              return (
                <li key={c.id} className="relative flex gap-3 pl-0">
                  <div
                    className={cn(
                      "h-8 w-8 rounded-full flex items-center justify-center text-[10px] font-semibold shrink-0 z-10 border",
                      isSistema
                        ? "bg-muted text-muted-foreground border-border"
                        : c.azumi
                          ? "bg-gradient-brand text-white border-transparent"
                          : "bg-secondary text-foreground border-border"
                    )}
                  >
                    {isSistema ? (
                      <Bot className="h-4 w-4" />
                    ) : (
                      c.autor.split(" ").map((n) => n[0]).join("").slice(0, 2)
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                      {isSistema ? <Bot className="h-3 w-3" /> : <User className="h-3 w-3" />}
                      <span className="font-medium text-foreground">{c.autor}</span>
                      <span>· {c.role} ·</span>
                      <span className="font-data">{dataFmt}</span>
                    </div>
                    <div
                      className={cn(
                        "rounded-xl px-3 py-2 text-sm border",
                        isSistema
                          ? "bg-muted/50 border-border italic"
                          : c.azumi
                            ? "bg-primary/10 border-primary/20"
                            : "bg-secondary border-border"
                      )}
                    >
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
        <div className="bg-card border border-border rounded-xl p-8 text-center text-sm text-muted-foreground">
          Conteúdo da aba <strong className="text-foreground">Questionários</strong> em construção.
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
    </div>
  );
}
