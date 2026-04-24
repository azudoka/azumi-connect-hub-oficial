import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { SectionDivider } from "@/components/SectionDivider";
import { SlaBar } from "@/components/SlaBar";
import { DiscBars } from "@/components/DiscBars";
import { Link, useParams } from "react-router-dom";
import {
  vagas, candidatos, etapasVaga, comentariosVaga,
  beneficiosLabels, getEtapaStyle,
} from "@/data/mock";
import {
  ArrowLeft, Lock, Send, AlertTriangle, CheckCircle2,
  PauseCircle, XCircle, FileText, Info, Star, Loader2, Gift, ShieldCheck,
  FileSignature,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { toast } from "sonner";

// B01: chave do localStorage para persistir ciência assinada por vaga
const CIENCIAS_KEY = "azumi_ciencias";
type CienciaRecord = { assinado: true; data: string };
type CienciasMap = Record<string, CienciaRecord>;

function lerCiencias(): CienciasMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(CIENCIAS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? (parsed as CienciasMap) : {};
  } catch {
    return {};
  }
}

function salvarCiencia(vagaId: string): CienciaRecord {
  const atual = lerCiencias();
  const registro: CienciaRecord = { assinado: true, data: new Date().toISOString() };
  const novo: CienciasMap = { ...atual, [vagaId]: registro };
  try {
    window.localStorage.setItem(CIENCIAS_KEY, JSON.stringify(novo));
  } catch {
    // silencia falhas de storage (modo privado, quota, etc.)
  }
  return registro;
}

type DecisaoTipo = "aprovar" | "standby" | "reprovar";
type CandidatoStatus = "novo" | "em_analise" | "aprovado" | "standby" | "reprovado" | "contratado";

export default function VagaDetalheCliente() {
  const { id } = useParams();
  const vaga = vagas.find((v) => v.id === id) ?? vagas[0];
  const candidatosEnviados = candidatos.filter((c) => c.vagaId === vaga.id && c.enviado);

  // B05: estado local de status por candidato (carrega o status inicial do mock)
  const [candidatoStatus, setCandidatoStatus] = useState<Record<string, CandidatoStatus>>(
    () => Object.fromEntries(
      candidatosEnviados.map((c) => [c.id, ((c as any).status as CandidatoStatus) ?? "em_analise"])
    )
  );
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [decisao, setDecisao] = useState<{ open: boolean; tipo: DecisaoTipo | null; candidatoId: string | null }>({
    open: false, tipo: null, candidatoId: null,
  });
  const [justificativa, setJustificativa] = useState("");

  // B01: estado de ciência do relatório final (persistido em localStorage)
  const [ciencia, setCiencia] = useState<CienciaRecord | null>(null);
  const [cienciaOpen, setCienciaOpen] = useState(false);
  const [assinandoCiencia, setAssinandoCiencia] = useState(false);

  useEffect(() => {
    const todas = lerCiencias();
    setCiencia(todas[vaga.id] ?? null);
  }, [vaga.id]);

  // Apenas vagas concluídas exibem o botão de ciência do relatório final
  const podeAssinarCiencia = vaga.status === "concluida";

  async function handleAssinarCiencia() {
    setAssinandoCiencia(true);
    // simula latência da chamada à API
    await new Promise((r) => setTimeout(r, 500));
    const registro = salvarCiencia(vaga.id);
    setCiencia(registro);
    setAssinandoCiencia(false);
    setCienciaOpen(false);
    toast.success("Ciência assinada com sucesso.", {
      description: "O registro ficará disponível para consulta a qualquer momento.",
    });
  }

  const funilResumido = [
    { etapa: "Triagem", n: vaga.candidatosTriagem },
    { etapa: "Entrevista", n: vaga.candidatosEntrevista },
    { etapa: "Enviados", n: vaga.candidatosEnviados },
  ];
  const max = Math.max(...funilResumido.map(f => f.n), 1);
  const atrasado = vaga.sla > 90;

  // B06: benefícios da vaga (com fallback se não houver no mock)
  const beneficios: string[] = (vaga as any).beneficios ?? [];

  function abrirDecisao(candidatoId: string, tipo: DecisaoTipo) {
    // B05: bloqueia reprovação de candidato já contratado
    const statusAtual = candidatoStatus[candidatoId];
    if (tipo === "reprovar" && statusAtual === "contratado") {
      toast.error("Não é possível reprovar um candidato já contratado.", {
        description: "Para reverter uma contratação, fale com seu consultor Azumi.",
      });
      return;
    }
    setDecisao({ open: true, tipo, candidatoId });
  }

  async function confirmarDecisao() {
    if (!decisao.candidatoId || !decisao.tipo) return;
    const candidatoId = decisao.candidatoId;
    const tipo = decisao.tipo;
    const candidato = candidatosEnviados.find(c => c.id === candidatoId);

    setLoadingId(candidatoId);
    // simula chamada à API
    await new Promise((r) => setTimeout(r, 700));

    const novoStatus: CandidatoStatus =
      tipo === "aprovar" ? "aprovado" :
      tipo === "standby" ? "standby" : "reprovado";

    setCandidatoStatus((prev) => ({ ...prev, [candidatoId]: novoStatus }));
    setLoadingId(null);
    setDecisao({ open: false, tipo: null, candidatoId: null });
    setJustificativa("");

    const labelTipo = tipo === "aprovar" ? "aprovado" : tipo === "standby" ? "colocado em standby" : "reprovado";
    if (tipo === "aprovar") {
      toast.success(`${candidato?.nome ?? "Candidato"} foi ${labelTipo}.`, {
        description: "Seu consultor foi notificado e dará sequência ao processo.",
      });
    } else if (tipo === "reprovar") {
      toast.error(`${candidato?.nome ?? "Candidato"} foi ${labelTipo}.`, {
        description: "Justificativa registrada. Novos perfis serão enviados em breve.",
      });
    } else {
      toast.warning(`${candidato?.nome ?? "Candidato"} foi ${labelTipo}.`, {
        description: "O candidato permanece no pipeline aguardando definição.",
      });
    }
  }

  return (
    <div>
      <Link to="/cliente/atracao" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-3">
        <ArrowLeft className="h-3.5 w-3.5" /> Voltar para minhas vagas
      </Link>

      <PageHeader
        title={vaga.titulo}
        subtitle={`${vaga.empresa} · ${vaga.filial}` as any}
        actions={<StatusBadge status={vaga.status} />}
      />

      {atrasado && (
        <div className="mb-5 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
          <div>
            <div className="text-sm font-medium text-warning">Parecer pendente — prazo excedido</div>
            <div className="text-xs text-warning/80 mt-0.5">
              O parecer da última rodada está em atraso. O SLA da vaga foi atualizado.
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Timeline com mini-chat */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5">
          <h3 className="font-display font-semibold mb-4">Etapas da vaga</h3>
          <ol className="space-y-3">
            {etapasVaga.map((e, idx) => {
              // B04: usa getEtapaStyle com fallback seguro — nunca quebra
              const etapaStyle = getEtapaStyle(e.status);
              const { color: etapaColor, bg: etapaBg } = etapaStyle;
              const done = e.status === "concluida";
              const active = e.status === "andamento";
              return (
                <li key={idx} className="flex items-start gap-3 p-3 rounded-lg border border-border bg-background/40">
                  <div className={cn(
                    "h-8 w-8 rounded-full flex items-center justify-center font-data text-xs shrink-0 text-white",
                    etapaBg,
                    active && "animate-soft-pulse",
                  )}>
                    {done ? <CheckCircle2 className="h-4 w-4" /> : idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={cn("text-sm font-medium", etapaColor)}>{e.nome}</span>
                      <StatusBadge status={e.status} />
                    </div>
                    <div className="text-[11px] text-muted-foreground font-data mt-0.5">
                      {e.inicio} → {e.fim}
                    </div>
                    {active && (
                      <button className="mt-2 text-xs text-primary hover:underline inline-flex items-center gap-1">
                        <Send className="h-3 w-3" /> Comentar nesta etapa
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        {/* Funil resumido */}
        <div className="space-y-5">
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="font-display font-semibold mb-3">Funil (resumo)</h3>
            <ul className="space-y-3">
              {funilResumido.map((f) => {
                const w = (f.n / max) * 100;
                return (
                  <li key={f.etapa}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">{f.etapa}</span>
                      <span className="font-data">{f.n}</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${w}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>
            <SlaBar percent={vaga.sla} className="mt-4" label="SLA" />
          </div>

          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-info mt-0.5" />
              <div>
                <h4 className="font-display font-semibold text-sm">Informações importantes</h4>
                <ul className="mt-2 text-xs text-muted-foreground space-y-1.5 list-disc pl-4">
                  <li>É proibida a contratação direta de candidatos sem intermediação Azumi.</li>
                  <li>SLA padrão: 30 dias úteis para fechamento.</li>
                  <li>Após 3 reprovações consecutivas, será necessário realinhamento obrigatório.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* B06: Benefícios da vaga renderizados como badges com labels PT-BR */}
      {beneficios.length > 0 && (
        <>
          <SectionDivider>Benefícios oferecidos</SectionDivider>
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-start gap-3">
              <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Gift className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <h4 className="font-display font-semibold text-sm mb-3">Pacote de benefícios</h4>
                <ul className="flex flex-wrap gap-2">
                  {beneficios.map((b) => (
                    <li
                      key={b}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium"
                    >
                      <ShieldCheck className="h-3.5 w-3.5" />
                      {beneficiosLabels[b] ?? b.replace(/_/g, " ")}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </>
      )}

      <SectionDivider>Perfis apresentados</SectionDivider>

      {candidatosEnviados.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-10 text-center">
          <p className="text-muted-foreground text-sm">Nenhum perfil apresentado ainda. Você será notificado quando os candidatos forem enviados.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {candidatosEnviados.map((c) => {
            const status = candidatoStatus[c.id] ?? "em_analise";
            const isLoading = loadingId === c.id;
            const isContratado = status === "contratado";
            const isAprovado = status === "aprovado";
            const isStandby = status === "standby";
            const isReprovado = status === "reprovado";
            return (
              <div key={c.id} className="bg-card border border-border rounded-xl p-5 card-hover">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-brand flex items-center justify-center text-xs font-semibold text-white">
                    {c.nome.split(" ").map(n => n[0]).join("").slice(0, 2)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium truncate">{c.nome}</div>
                    <div className="text-[11px] text-muted-foreground">DISC: {c.perfilDom} dominante</div>
                  </div>
                  <Lock className="h-3.5 w-3.5 text-muted-foreground" aria-label="Contato bloqueado" />
                </div>

                {/* Badge do status atual da decisão */}
                {(isContratado || isAprovado || isStandby || isReprovado) && (
                  <div className="mt-3">
                    <span className={cn(
                      "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border",
                      isContratado && "bg-success/15 text-success border-success/30",
                      isAprovado && "bg-success/15 text-success border-success/30",
                      isStandby && "bg-warning/15 text-warning border-warning/30",
                      isReprovado && "bg-destructive/15 text-destructive border-destructive/30",
                    )}>
                      {isContratado && <><CheckCircle2 className="h-3 w-3" /> Contratado</>}
                      {isAprovado && <><CheckCircle2 className="h-3 w-3" /> Aprovado</>}
                      {isStandby && <><PauseCircle className="h-3 w-3" /> Em standby</>}
                      {isReprovado && <><XCircle className="h-3 w-3" /> Reprovado</>}
                    </span>
                  </div>
                )}

                <div className="mt-3">
                  <DiscBars values={c.disc} compact />
                </div>

                <p className="mt-3 text-xs text-muted-foreground line-clamp-2">{c.parecer}</p>

                <button className="mt-3 w-full h-8 rounded-lg border border-border hover:bg-secondary text-xs font-medium flex items-center justify-center gap-1.5">
                  <FileText className="h-3.5 w-3.5" /> Ver relatório completo
                </button>

                <div className="mt-3 grid grid-cols-3 gap-2">
                  <button
                    onClick={() => abrirDecisao(c.id, "aprovar")}
                    disabled={isLoading || isContratado}
                    className="h-8 rounded-lg bg-success/15 hover:bg-success/25 text-success text-xs font-medium flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                    Aprovar
                  </button>
                  <button
                    onClick={() => abrirDecisao(c.id, "standby")}
                    disabled={isLoading || isContratado}
                    className="h-8 rounded-lg bg-warning/15 hover:bg-warning/25 text-warning text-xs font-medium flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <PauseCircle className="h-3.5 w-3.5" />}
                    Standby
                  </button>
                  <button
                    onClick={() => abrirDecisao(c.id, "reprovar")}
                    disabled={isLoading || isContratado}
                    title={isContratado ? "Candidato já contratado — não pode ser reprovado" : undefined}
                    className="h-8 rounded-lg bg-destructive/15 hover:bg-destructive/25 text-destructive text-xs font-medium flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <XCircle className="h-3.5 w-3.5" />}
                    Reprovar
                  </button>
                </div>

                {isContratado && (
                  <p className="mt-2 text-[10px] text-muted-foreground italic">
                    Candidato contratado — ações de decisão bloqueadas.
                  </p>
                )}

                <div className="mt-3 pt-3 border-t border-border">
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5">Parecer do gestor</div>
                  <div className="flex items-center gap-1">
                    {[1,2,3,4,5].map((n) => (
                      <Star key={n} className="h-4 w-4 text-muted-foreground hover:text-warning hover:fill-warning cursor-pointer" />
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Mini-chat */}
      <SectionDivider>Conversa com o consultor</SectionDivider>
      <div className="bg-card border border-border rounded-xl p-5 max-w-3xl">
        <ul className="space-y-3 mb-4">
          {comentariosVaga.map((c) => (
            <li key={c.id} className={cn("flex gap-3", c.azumi ? "" : "flex-row-reverse")}>
              <div className={cn(
                "h-8 w-8 rounded-full flex items-center justify-center text-[10px] font-semibold shrink-0",
                c.azumi ? "bg-gradient-brand text-white" : "bg-secondary text-foreground"
              )}>
                {c.azumi ? "A" : "EU"}
              </div>
              <div className={cn("max-w-md", c.azumi ? "" : "text-right")}>
                <div className="text-[11px] text-muted-foreground mb-1">{c.autor} · <span className="font-data">{c.quando}</span></div>
                <div className={cn(
                  "rounded-xl px-3 py-2 text-sm border",
                  c.azumi ? "bg-primary/10 border-primary/20" : "bg-secondary border-border"
                )}>{c.texto}</div>
              </div>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-2">
          <input type="text" placeholder="Escreva uma mensagem para o consultor…" className="flex-1 h-10 px-3 rounded-lg bg-secondary border border-input focus:border-primary outline-none text-sm" />
          <button className="h-10 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium flex items-center gap-1.5">
            <Send className="h-4 w-4" /> Enviar
          </button>
        </div>
      </div>

      {/* Modal decisão */}
      {decisao.open && (
        <div className="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-card border border-border rounded-2xl shadow-elevated w-full max-w-md p-6 animate-scale-in">
            <h3 className="font-display text-lg font-semibold capitalize">
              {decisao.tipo === "aprovar" ? "Aprovar candidato" :
               decisao.tipo === "standby" ? "Colocar em standby" : "Reprovar candidato"}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Justifique brevemente sua decisão para que o consultor possa dar continuidade ao processo.
            </p>
            <textarea
              value={justificativa}
              onChange={(e) => setJustificativa(e.target.value)}
              placeholder="Sua justificativa…"
              className="mt-3 w-full h-28 p-3 rounded-lg bg-secondary border border-input focus:border-primary outline-none text-sm resize-none"
            />
            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                onClick={() => { setDecisao({ open: false, tipo: null, candidatoId: null }); setJustificativa(""); }}
                disabled={loadingId !== null}
                className="h-9 px-4 rounded-lg border border-border hover:bg-secondary text-sm disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                disabled={!justificativa.trim() || loadingId !== null}
                onClick={confirmarDecisao}
                className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50 inline-flex items-center gap-1.5"
              >
                {loadingId !== null && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {loadingId !== null ? "Registrando…" : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
