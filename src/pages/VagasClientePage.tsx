import { useMemo, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DiscBars } from "@/components/DiscBars";
import {
  Briefcase,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  Inbox,
  Users,
  UserPlus,
  Target,
  ThumbsUp,
  AlertCircle,
  ThumbsDown,
  FileText,
  ArrowRight,
  
} from "lucide-react";
import { toast } from "sonner";
import { candidatosComRelatorioPorVaga } from "@/data/atracaoClienteStore";
import { vagasDemo } from "@/data/mockDemoData";

import { useAuth, type Plano } from "@/context/AuthContext";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

// ---------- Candidatos enviados (mock por vaga) ----------
type FeedbackAcao = "aprovado" | "ajuste" | "reprovado";

interface CandidatoEnviado {
  id: string;
  vagaId: string;
  nome: string;
  cargo: string;
  parecer: string;
  enviado: boolean;
  disc: { D: number; I: number; S: number; C: number };
}

const CANDIDATOS_MOCK: CandidatoEnviado[] = [
  { id: "ca-01", vagaId: "v-01", nome: "Marina Souza", cargo: "Gerente de TI", parecer: "Liderança técnica sólida em times de infra. Perfil executivo, comunica bem com áreas de negócio.", enviado: true, disc: { D: 78, I: 52, S: 38, C: 64 } },
  { id: "ca-02", vagaId: "v-01", nome: "Rafael Tavares", cargo: "Gerente de TI", parecer: "Background em arquitetura cloud e governança. Forte em planejamento estratégico de TI.", enviado: true, disc: { D: 62, I: 44, S: 55, C: 82 } },
  { id: "ca-03", vagaId: "v-01", nome: "Juliana Pires", cargo: "Gerente de TI", parecer: "Experiência em multinacionais com squads multidisciplinares. Excelente articuladora.", enviado: true, disc: { D: 55, I: 72, S: 60, C: 50 } },
  { id: "ca-04", vagaId: "v-02", nome: "Patrícia Lima", cargo: "Analista de Marketing", parecer: "Contratada — campanhas de performance e branding integrado.", enviado: true, disc: { D: 48, I: 80, S: 58, C: 45 } },
];

const FEEDBACK_LABEL: Record<FeedbackAcao, string> = {
  aprovado: "Aprovado",
  ajuste: "Ajuste",
  reprovado: "Reprovado",
};

const FEEDBACK_BADGE: Record<FeedbackAcao, string> = {
  aprovado: "bg-success/15 text-success border-success/30",
  ajuste: "bg-warning/15 text-warning border-warning/30",
  reprovado: "bg-destructive/15 text-destructive border-destructive/30",
};

// ---------- Types ----------
type StatusVaga =
  | "em_andamento"
  | "aguardando_cliente"
  | "finalizada"
  | "cancelada"
  | "aberta";

interface VagaMock {
  id: string;
  cargo: string;
  departamento: string;
  status: StatusVaga;
  totalCandidatos: number;
  aprovados: number;
  criadaEm: string;
  empresaId: string;
}

const STATUS_LABEL: Record<StatusVaga, string> = {
  em_andamento: "Em andamento",
  aguardando_cliente: "Aguardando cliente",
  finalizada: "Finalizada",
  cancelada: "Cancelada",
  aberta: "Aberta",
};

const STATUS_ORDEM: StatusVaga[] = [
  "em_andamento",
  "aguardando_cliente",
  "finalizada",
  "cancelada",
  "aberta",
];

const STATUS_ORDER: Record<string, number> = {
  em_andamento: 0,
  aguardando_cliente: 1,
  aberta: 2,
  finalizada: 3,
  cancelada: 4,
};

const MOCK: VagaMock[] = [
  { id: "v-01", cargo: "Gerente de TI", departamento: "Tecnologia", status: "em_andamento", totalCandidatos: 18, aprovados: 3, criadaEm: "2026-04-10T09:00:00Z", empresaId: "kentaki" },
  { id: "v-02", cargo: "Analista de Marketing", departamento: "Marketing", status: "finalizada", totalCandidatos: 11, aprovados: 1, criadaEm: "2026-02-15T14:45:00Z", empresaId: "kentaki" },
];

function statusClasses(s: StatusVaga) {
  if (s === "em_andamento") return "bg-success/15 text-success border-success/30";
  if (s === "aguardando_cliente") return "bg-warning/15 text-warning border-warning/30";
  if (s === "aberta") return "bg-info/15 text-info border-info/30";
  if (s === "cancelada") return "bg-muted text-muted-foreground border-border line-through";
  return "bg-muted text-muted-foreground border-border";
}

const PILL_BASE =
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap";

// ---------- Pacote / cota Atração ----------
type PacoteKey = "start" | "ongoing" | "growth";
function planoToPacote(p?: Plano | null): PacoteKey {
  if (p === "ongoing") return "ongoing";
  if (p === "growth") return "growth";
  return "start";
}
const PACOTE_LABEL: Record<PacoteKey, string> = { start: "START", ongoing: "ONGOING", growth: "GROWTH" };
const ATRACAO_COTA: Record<PacoteKey, number> = { start: 1, ongoing: 2, growth: 4 };
const ATRACAO_BULLETS: Record<PacoteKey, string[]> = {
  start: ["Até 1 vaga por mês", "Acompanhamento conforme SLA do seu pacote", "Shortlist de candidatos qualificados"],
  ongoing: ["Até 2 vagas por mês", "Acompanhamento conforme SLA do seu pacote", "Shortlist de até 3 candidatos por etapa"],
  growth: ["Até 4 vagas por mês", "Acompanhamento prioritário conforme SLA", "Shortlist de até 3 candidatos por etapa"],
};

const WHATSAPP_CONSULTOR = "https://wa.me/5541999999999";

// ---------- Form types ----------
// ---------- Form types (mesmo modelo do admin /app/atracao) ----------
type SolicitacaoTipo = "atracao" | "hunting";
type TipoVaga = "operacional" | "tatico" | "gestao" | "hunting";

const TIPOS_VAGA: { value: TipoVaga; label: string }[] = [
  { value: "operacional", label: "Operacional" },
  { value: "tatico", label: "Tático" },
  { value: "gestao", label: "Gestão" },
  { value: "hunting", label: "Hunt Executivo" },
];

const MODALIDADES = [
  { value: "presencial", label: "Presencial" },
  { value: "hibrido", label: "Híbrido" },
  { value: "remoto", label: "Remoto" },
] as const;

const BENEFICIOS_OPCOES = [
  { value: "vale_transporte", label: "Vale-transporte" },
  { value: "vale_alimentacao", label: "Vale-alimentação" },
  { value: "plano_saude", label: "Plano de saúde" },
  { value: "plano_odontologico", label: "Plano odontológico" },
  { value: "gympass", label: "Gympass" },
  { value: "home_office", label: "Home office" },
  { value: "bonus", label: "Bônus" },
  { value: "seguro_vida", label: "Seguro de vida" },
] as const;

interface FormState {
  titulo: string;
  empresa: string;
  filial: string;
  tipo: TipoVaga;
  modalidade: string;
  posicoes: string;
  beneficios: string[];
  descricao: string;
  ciente: boolean;
  // Publicação no site
  pubAberto: boolean;
  pubPublicar: boolean;
  pubConfidencial: boolean;
  pubLocal: string;
  pubModalidade: string;
  pubNivel: string;
  pubTurno: string;
  pubContrato: string;
  pubCarga: string;
  pubSalDe: string;
  pubSalAte: string;
  pubACombinar: boolean;
  pubDescricao: string;
}
const FORM_INIT: FormState = {
  titulo: "",
  empresa: "",
  filial: "",
  tipo: "operacional",
  modalidade: "presencial",
  posicoes: "1",
  beneficios: [],
  descricao: "",
  ciente: false,
  pubAberto: false,
  pubPublicar: false,
  pubConfidencial: false,
  pubLocal: "",
  pubModalidade: "presencial",
  pubNivel: "pleno",
  pubTurno: "integral",
  pubContrato: "clt",
  pubCarga: "",
  pubSalDe: "",
  pubSalAte: "",
  pubACombinar: false,
  pubDescricao: "",
};


export default function VagasClientePage() {
  const { user, usuario } = useAuth();
  const empresaId = user?.empresaId ?? "";
  const pacote = planoToPacote(usuario?.plano);
  const isDemoUser = usuario?.role === "trial";

  const [vagas, setVagas] = useState<VagaMock[]>(() =>
    isDemoUser
      ? vagasDemo.map<VagaMock>((v) => ({
          id: v.id,
          cargo: v.titulo,
          departamento: "Empresa Demo",
          status: v.status === "andamento" ? "em_andamento" : "finalizada",
          totalCandidatos: v.perfisEnviados,
          aprovados: v.status === "finalizada" ? 1 : 0,
          criadaEm: new Date().toISOString(),
          empresaId: "empresa-demo",
        }))
      : MOCK.filter((v) => (empresaId ? v.empresaId === empresaId : true)),
  );
  const [filtro, setFiltro] = useState<StatusVaga | "todas">("todas");
  const [vagaSelecionadaId, setVagaSelecionadaId] = useState<string | null>(null);
  const [feedbacks, setFeedbacks] = useState<Record<string, FeedbackAcao>>({});
  const [confirmacao, setConfirmacao] = useState<{ candidatoId: string; nome: string; acao: FeedbackAcao } | null>(null);
  const [motivoTexto, setMotivoTexto] = useState("");

  // Fluxo solicitação: intro -> form
  const [introTipo, setIntroTipo] = useState<SolicitacaoTipo | null>(null);
  const [formTipo, setFormTipo] = useState<SolicitacaoTipo | null>(null);
  const [form, setForm] = useState<FormState>(FORM_INIT);

  const lista = useMemo(() => {
    const base = filtro === "todas" ? vagas : vagas.filter((v) => v.status === filtro);
    return [...base].sort((a, b) => {
      const ordemA = STATUS_ORDER[a.status] ?? 99;
      const ordemB = STATUS_ORDER[b.status] ?? 99;
      if (ordemA !== ordemB) return ordemA - ordemB;
      return new Date(b.criadaEm).getTime() - new Date(a.criadaEm).getTime();
    });
  }, [vagas, filtro]);

  const vagaSelecionada = useMemo(
    () => vagas.find((v) => v.id === vagaSelecionadaId) ?? null,
    [vagas, vagaSelecionadaId],
  );

  // Consumo Atração mês atual
  const consumoAtracaoMes = useMemo(() => {
    const ini = new Date();
    ini.setDate(1);
    ini.setHours(0, 0, 0, 0);
    return vagas.filter(
      (v) => new Date(v.criadaEm).getTime() >= ini.getTime() && v.status !== "cancelada",
    ).length;
  }, [vagas]);

  const cotaAtracao = ATRACAO_COTA[pacote];
  const atracaoRestante = Math.max(0, cotaAtracao - consumoAtracaoMes);
  const atracaoBadgeText =
    atracaoRestante > 0
      ? `${atracaoRestante} de ${cotaAtracao} disponíveis`
      : "Cota atingida";

  function abrirForm(tipo: SolicitacaoTipo) {
    setIntroTipo(null);
    setForm({
      ...FORM_INIT,
      empresa: usuario?.empresaNome ?? "",
      tipo: tipo === "hunting" ? "hunting" : "operacional",
    });
    setFormTipo(tipo);
  }

  function falarConsultor() {
    setIntroTipo(null);
    window.open(WHATSAPP_CONSULTOR, "_blank", "noopener,noreferrer");
  }

  function toggleBeneficio(v: string) {
    setForm((f) => ({
      ...f,
      beneficios: f.beneficios.includes(v)
        ? f.beneficios.filter((x) => x !== v)
        : [...f.beneficios, v],
    }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!formTipo) return;
    if (!form.titulo.trim()) {
      toast.error("Informe o título da vaga.");
      return;
    }
    if (!form.empresa.trim()) {
      toast.error("Informe a empresa.");
      return;
    }
    if (formTipo === "hunting" && !form.ciente) {
      toast.error("Você precisa confirmar o aviso sobre custo adicional.");
      return;
    }

    // Payload no mesmo modelo do admin /app/atracao
    // + pré-preenchidos do cliente: company_id, solicitado_por
    const payload = {
      company_id: empresaId || "kentaki",
      solicitado_por: "cliente" as const,
      tipo_vaga: formTipo === "hunting" ? "hunting" : form.tipo,
      titulo: form.titulo.trim(),
      empresa: form.empresa.trim(),
      filial: form.filial.trim(),
      modalidade: form.modalidade,
      posicoes: Number(form.posicoes) || 1,
      beneficios: form.beneficios,
      descricao: form.descricao.trim(),
      // TODO: conectar Supabase — colunas de publicação na vaga
      publicacao: form.pubPublicar
        ? {
            publicar: form.pubPublicar,
            confidencial: form.pubConfidencial,
            local: form.pubLocal.trim(),
            modalidade: form.pubModalidade,
            nivel: form.pubNivel,
            turno: form.pubTurno,
            contrato: form.pubContrato,
            carga_horaria: form.pubCarga.trim(),
            salario_a_combinar: form.pubACombinar,
            salario_de: form.pubACombinar ? null : Number(form.pubSalDe) || null,
            salario_ate: form.pubACombinar ? null : Number(form.pubSalAte) || null,
            descricao_site: form.pubDescricao.trim(),
            publicada: false, // só publica via botão "Publicar no site" na tela interna
          }
        : null,
    };

    const novaVaga: VagaMock = {
      id: `v-${Date.now()}`,
      cargo: payload.titulo,
      departamento: payload.filial || (formTipo === "hunting" ? "Hunting" : "—"),
      status: "aguardando_cliente",
      totalCandidatos: 0,
      aprovados: 0,
      criadaEm: new Date().toISOString(),
      empresaId: empresaId || "kentaki",
    };
    setVagas((prev) => [novaVaga, ...prev]);

    // eslint-disable-next-line no-console
    console.info("[solicitacao]", payload);

    setFormTipo(null);
    setForm(FORM_INIT);
    toast.success("Solicitação enviada! Nossa equipe entrará em contato em breve.");
  }


  // ---------- Modo detalhe (inalterado) ----------
  if (vagaSelecionada) {
    const v = vagaSelecionada;
    return (
      <div className="flex flex-col gap-4">
        <Button variant="ghost" size="sm" className="self-start gap-1.5" onClick={() => setVagaSelecionadaId(null)}>
          <ChevronLeft size={16} /> Voltar para vagas
        </Button>

        <PageHeader
          title={v.cargo}
          subtitle={v.departamento}
          actions={<span className={cn(PILL_BASE, statusClasses(v.status))}>{STATUS_LABEL[v.status]}</span>}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card/80 backdrop-blur border rounded-2xl p-5">
            <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider">
              <Users size={14} /> Candidatos
            </div>
            <div className="mt-2 text-2xl font-display font-semibold">{v.totalCandidatos}</div>
          </div>
          <div className="bg-card/80 backdrop-blur border rounded-2xl p-5">
            <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider">
              <CheckCircle2 size={14} /> Aprovados
            </div>
            <div className="mt-2 text-2xl font-display font-semibold">{v.aprovados}</div>
          </div>
          <div className="bg-card/80 backdrop-blur border rounded-2xl p-5">
            <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider">
              <Calendar size={14} /> Aberta em
            </div>
            <div className="mt-2 text-2xl font-display font-semibold">
              {format(new Date(v.criadaEm), "dd/MM/yyyy", { locale: ptBR })}
            </div>
          </div>
        </div>

        {(() => {
          const candidatosVaga = CANDIDATOS_MOCK.filter((c) => c.vagaId === v.id && c.enviado);
          if (candidatosVaga.length === 0) return null;
          return (
            <div className="bg-card/80 backdrop-blur border rounded-2xl p-5">
              <h3 className="font-display font-semibold mb-1">Perfis enviados pela Azumi</h3>
              <p className="text-xs text-muted-foreground mb-4">Avalie cada candidato apresentado para esta vaga.</p>
              <ul className="flex flex-col gap-3">
                {candidatosVaga.map((c) => {
                  const fb = feedbacks[c.id];
                  return (
                    <li key={c.id} className="border rounded-xl p-4 bg-background/40 flex flex-col gap-3">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div className="min-w-0">
                          <div className="font-medium text-sm">{c.nome}</div>
                          <div className="text-xs text-muted-foreground">{c.cargo}</div>
                          <p className="text-xs text-muted-foreground mt-1.5">{c.parecer}</p>
                        </div>
                        {fb && <span className={cn(PILL_BASE, FEEDBACK_BADGE[fb])}>{FEEDBACK_LABEL[fb]}</span>}
                      </div>
                      <div className="rounded-lg bg-secondary/40 p-3">
                        <DiscBars values={c.disc} compact />
                      </div>
                      <div className="flex flex-wrap gap-2 items-center">
                        <Button size="sm" variant="outline"
                          className="rounded-full gap-1.5"
                          onClick={() => setVagaSelecionadaId(v.id)}>
                          Ver candidato
                        </Button>
                        <span className="flex-1" />
                        <Button size="sm" variant="outline" disabled={!!fb}
                          className="rounded-full gap-1.5 border-success/40 text-success hover:bg-success/10 hover:text-success disabled:opacity-50"
                          onClick={() => setConfirmacao({ candidatoId: c.id, nome: c.nome, acao: "aprovado" })}>
                          <ThumbsUp size={14} /> Aprovado
                        </Button>
                        <Button size="sm" variant="outline" disabled={!!fb}
                          className="rounded-full gap-1.5 border-warning/40 text-warning hover:bg-warning/10 hover:text-warning disabled:opacity-50"
                          onClick={() => setConfirmacao({ candidatoId: c.id, nome: c.nome, acao: "ajuste" })}>
                          <AlertCircle size={14} /> Ajuste
                        </Button>
                        <Button size="sm" variant="outline" disabled={!!fb}
                          className="rounded-full gap-1.5 border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                          onClick={() => setConfirmacao({ candidatoId: c.id, nome: c.nome, acao: "reprovado" })}>
                          <ThumbsDown size={14} /> Reprovado
                        </Button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })()}

        <div className="bg-card/80 backdrop-blur border rounded-2xl p-5">
          <h3 className="font-display font-semibold mb-2">Sobre o processo</h3>
          <p className="text-sm text-muted-foreground">
            Acompanhe o andamento desta vaga junto à sua consultora. As decisões sobre candidatos e prazos ficam centralizadas pela equipe Azumi — entre em contato pelo canal de Solicitações para qualquer ajuste.
          </p>
        </div>

        <Dialog open={!!confirmacao} onOpenChange={(open) => { if (!open) { setConfirmacao(null); setMotivoTexto(""); } }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar feedback</DialogTitle>
              <DialogDescription>
                {confirmacao && `Confirmar feedback '${FEEDBACK_LABEL[confirmacao.acao]}' para ${confirmacao.nome}?`}
              </DialogDescription>
            </DialogHeader>
            {confirmacao?.acao === "reprovado" && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="motivo-reprovado">Motivo do reprovado <span className="text-destructive">*</span></Label>
                <Textarea id="motivo-reprovado" value={motivoTexto} onChange={(e) => setMotivoTexto(e.target.value)} placeholder="Descreva o motivo da reprovação…" rows={3} />
              </div>
            )}
            {confirmacao?.acao === "ajuste" && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="ajuste-sugerido">Qual ajuste você sugere? <span className="text-muted-foreground text-xs">(opcional)</span></Label>
                <Textarea id="ajuste-sugerido" value={motivoTexto} onChange={(e) => setMotivoTexto(e.target.value)} placeholder="Sugestão de ajuste…" rows={3} />
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => { setConfirmacao(null); setMotivoTexto(""); }}>Cancelar</Button>
              <Button
                disabled={confirmacao?.acao === "reprovado" && !motivoTexto.trim()}
                onClick={() => {
                  if (!confirmacao) return;
                  if (confirmacao.acao === "reprovado" && !motivoTexto.trim()) return;
                  setFeedbacks((prev) => ({ ...prev, [confirmacao.candidatoId]: confirmacao.acao }));
                  toast.success(`Feedback '${FEEDBACK_LABEL[confirmacao.acao]}' registrado para ${confirmacao.nome}.`);
                  toast.info("A consultora Azumi foi notificada do seu feedback.");
                  setConfirmacao(null);
                  setMotivoTexto("");
                }}
              >Confirmar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // ---------- Modo lista ----------
  return (
    <>
      <PageHeader title="Minhas Vagas" subtitle="Acompanhe o andamento dos seus processos seletivos." />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">
        {/* COLUNA PRINCIPAL */}
        <div className="min-w-0">
          {/* Chips compactos */}
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <button
              type="button"
              onClick={() => setFiltro("todas")}
              className={cn(
                PILL_BASE, "cursor-pointer",
                filtro === "todas"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card border-border hover:bg-muted/40",
              )}
            >
              Todas
            </button>
            {STATUS_ORDEM.map((s) => {
              const ativo = filtro === s;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setFiltro(s)}
                  className={cn(
                    PILL_BASE, "cursor-pointer",
                    ativo
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card border-border hover:bg-muted/40",
                  )}
                >
                  {STATUS_LABEL[s]}
                </button>
              );
            })}
          </div>

          {lista.length === 0 ? (
            <EmptyState
              icon={Inbox}
              title="Você ainda não tem vagas em andamento."
              description="Use os cards ao lado para solicitar um novo processo seletivo."
            />
          ) : (
            <>
              <DemoVagaDestaque />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {lista.map((v) => (
                  <article key={v.id} className="bg-card/80 backdrop-blur border rounded-2xl p-5 flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-semibold text-base leading-snug">{v.cargo}</h3>
                      <span className={cn(PILL_BASE, statusClasses(v.status))}>{STATUS_LABEL[v.status]}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Briefcase size={14} />
                      <span>{v.departamento}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5"><Users size={14} />{v.totalCandidatos} candidatos</span>
                      <span className="inline-flex items-center gap-1.5"><CheckCircle2 size={14} />{v.aprovados} aprovados</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Calendar size={14} />
                      {format(new Date(v.criadaEm), "dd/MM/yyyy", { locale: ptBR })}
                    </div>
                    <Button variant="outline" size="sm" className="w-full mt-1" onClick={() => setVagaSelecionadaId(v.id)}>
                      Ver processo
                    </Button>
                  </article>
                ))}
              </div>
            </>
          )}
        </div>

        {/* SIDEBAR DIREITA */}
        <aside className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 lg:sticky lg:top-4">
          {/* Card 1 — Atração */}
          <div
            className="rounded-2xl border p-5 flex flex-col gap-3"
            style={{ background: "#EEF2FF", borderColor: "#C7D2FE" }}
          >
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-lg flex items-center justify-center" style={{ background: "#E0E7FF", color: "#4F46E5" }}>
                <UserPlus size={18} />
              </div>
              <h3 className="font-semibold text-base" style={{ color: "#4F46E5" }}>Solicitar Vaga</h3>
            </div>
            <p className="text-xs text-slate-700">Inicie um novo processo seletivo com o suporte da Azumi.</p>
            <span
              className={cn(
                "inline-flex items-center self-start rounded-full px-2 py-0.5 text-[11px] font-medium border",
                atracaoRestante > 0
                  ? "bg-success/15 text-success border-success/30"
                  : "bg-warning/15 text-warning border-warning/30",
              )}
            >
              {atracaoBadgeText}
            </span>
            <Button
              className="w-full text-white"
              style={{ background: "#4F46E5" }}
              onClick={() => setIntroTipo("atracao")}
            >
              Solicitar agora <ArrowRight size={16} />
            </Button>
          </div>

          {/* Card 2 — Hunting */}
          <div
            className="rounded-2xl border p-5 flex flex-col gap-3"
            style={{ background: "#FFFBEB", borderColor: "#FDE68A" }}
          >
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-lg flex items-center justify-center" style={{ background: "#FEF3C7", color: "#D97706" }}>
                <Target size={18} />
              </div>
              <h3 className="font-semibold text-base" style={{ color: "#D97706" }}>Solicitar Hunting</h3>
            </div>
            <p className="text-xs text-slate-700">Para posições estratégicas e perfis especializados.</p>
            <span
              className="inline-flex items-center self-start rounded-full px-2 py-0.5 text-[11px] font-medium border"
              style={{ background: "#FEF3C7", color: "#92400E", borderColor: "#FDE68A" }}
            >
              Posição estratégica
            </span>
            <p className="text-[11px] text-slate-600">Processo dedicado com abordagem ativa de mercado.</p>
            <Button
              className="w-full text-white"
              style={{ background: "#D97706" }}
              onClick={() => setIntroTipo("hunting")}
            >
              Solicitar Hunting <ArrowRight size={16} />
            </Button>
          </div>
        </aside>
      </div>

      {/* ---------- Modal Intro ---------- */}
      <Dialog open={!!introTipo} onOpenChange={(o) => { if (!o) setIntroTipo(null); }}>
        <DialogContent className="max-w-lg">
          {introTipo === "atracao" && (
            <>
              <DialogHeader>
                <div className="mx-auto h-14 w-14 rounded-2xl flex items-center justify-center mb-2" style={{ background: "#EEF2FF", color: "#4F46E5" }}>
                  <Users size={26} />
                </div>
                <DialogTitle className="text-center">Processo Seletivo</DialogTitle>
                <DialogDescription className="text-center">
                  A Azumi conduz todo o processo seletivo por você: briefing, triagem, entrevistas e shortlist de candidatos qualificados. Você acompanha cada etapa aqui na plataforma.
                </DialogDescription>
              </DialogHeader>

              <div className="rounded-xl border bg-muted/30 p-4">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
                  O que está incluso no seu pacote {PACOTE_LABEL[pacote]}:
                </p>
                <ul className="flex flex-col gap-1.5 text-sm">
                  {ATRACAO_BULLETS[pacote].map((b) => (
                    <li key={b} className="flex items-start gap-2">
                      <CheckCircle2 size={16} className="text-success mt-0.5 shrink-0" /> {b}
                    </li>
                  ))}
                </ul>
              </div>

              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button variant="ghost" onClick={falarConsultor}>Falar com meu consultor</Button>
                <Button className="text-white" style={{ background: "#4F46E5" }} onClick={() => abrirForm("atracao")}>
                  Prosseguir com a solicitação
                </Button>
              </DialogFooter>
            </>
          )}

          {introTipo === "hunting" && (
            <>
              <DialogHeader>
                <div className="mx-auto h-14 w-14 rounded-2xl flex items-center justify-center mb-2" style={{ background: "#FFFBEB", color: "#D97706" }}>
                  <Target size={26} />
                </div>
                <DialogTitle className="text-center">Hunting — Recrutamento Estratégico</DialogTitle>
                <DialogDescription className="text-center">
                  Para posições de liderança, especialistas ou perfis difíceis de encontrar. Nossa equipe realiza abordagem ativa e mapeamento de mercado.
                </DialogDescription>
              </DialogHeader>

              <div className="rounded-xl border p-4 text-sm" style={{ background: "#FFFBEB", borderColor: "#FDE68A", color: "#92400E" }}>
                <strong>⚠ Atenção:</strong> O Hunting é um serviço especializado e pode gerar custo adicional conforme seu pacote. Nossa consultora entrará em contato para alinhar a proposta.
              </div>

              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button variant="ghost" onClick={falarConsultor}>Falar com meu consultor</Button>
                <Button className="text-white" style={{ background: "#D97706" }} onClick={() => abrirForm("hunting")}>
                  Prosseguir e enviar solicitação
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ---------- Modal Form ---------- */}
      <Dialog open={!!formTipo} onOpenChange={(o) => { if (!o) { setFormTipo(null); setForm(FORM_INIT); } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {formTipo === "hunting" ? "Nova solicitação de Hunting" : "Nova solicitação de Vaga"}
            </DialogTitle>
            <DialogDescription>
              Preencha os dados abaixo. Campos marcados com <span className="text-destructive">*</span> são obrigatórios.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Título */}
            <div className="space-y-2">
              <Label htmlFor="nTitulo">Título da vaga *</Label>
              <Input
                id="nTitulo"
                value={form.titulo}
                onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                placeholder="Ex.: Gerente de TI Sênior"
                required
              />
            </div>

            {/* Empresa e Filial */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="nEmpresa">Empresa *</Label>
                <Input
                  id="nEmpresa"
                  value={form.empresa}
                  readOnly
                  className="bg-muted/40"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nFilial">Filial</Label>
                <Input
                  id="nFilial"
                  value={form.filial}
                  onChange={(e) => setForm({ ...form, filial: e.target.value })}
                  placeholder="SP, RJ, BH..."
                />
              </div>
            </div>

            {/* Tipo + Modalidade */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Tipo *</Label>
                {formTipo === "hunting" ? (
                  <Input value="Hunt Executivo" readOnly className="bg-muted/40" />
                ) : (
                  <Select
                    value={form.tipo}
                    onValueChange={(v) => setForm({ ...form, tipo: v as TipoVaga })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {TIPOS_VAGA.filter((t) => t.value !== "hunting").map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              <div className="space-y-2">
                <Label>Modalidade</Label>
                <Select value={form.modalidade} onValueChange={(v) => setForm({ ...form, modalidade: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {MODALIDADES.map((m) => (
                      <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Posições */}
            <div className="space-y-2">
              <Label htmlFor="nPosicoes">Número de posições abertas</Label>
              <Input
                id="nPosicoes"
                type="number"
                min={1}
                value={form.posicoes}
                onChange={(e) => setForm({ ...form, posicoes: e.target.value })}
                className="w-24"
              />
            </div>

            {/* Benefícios */}
            <div className="space-y-2">
              <Label>Benefícios</Label>
              <div className="flex flex-wrap gap-2">
                {BENEFICIOS_OPCOES.map((b) => {
                  const sel = form.beneficios.includes(b.value);
                  return (
                    <button
                      key={b.value}
                      type="button"
                      onClick={() => toggleBeneficio(b.value)}
                      className={cn(
                        "rounded-full border px-3 py-1 text-xs transition-colors",
                        sel
                          ? "border-primary bg-primary/10 text-primary font-medium"
                          : "border-border hover:bg-muted/40",
                      )}
                    >
                      {b.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Descrição */}
            <div className="space-y-2">
              <Label htmlFor="nDescricao">Descrição e requisitos</Label>
              <Textarea
                id="nDescricao"
                value={form.descricao}
                onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                placeholder="Descreva o perfil desejado, requisitos obrigatórios e diferenciais."
              />
            </div>

            {/* Publicação no site */}
            <div className="rounded-lg border border-border">
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, pubAberto: !f.pubAberto }))}
                className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium hover:bg-muted/30"
              >
                <span>📢 Informações para publicação no site</span>
                <span className="text-xs text-muted-foreground">{form.pubAberto ? "Ocultar" : "Expandir"}</span>
              </button>
              {form.pubAberto && (
                <div className="space-y-4 border-t border-border px-4 py-4">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.pubPublicar}
                      onChange={(e) => setForm((f) => ({ ...f, pubPublicar: e.target.checked }))}
                      className="mt-0.5 h-4 w-4 rounded"
                    />
                    <div className="flex-1">
                      <span className="text-sm font-medium">Preparar para publicação</span>
                      <p className="text-xs text-muted-foreground">
                        Preencher estes campos NÃO publica automaticamente. A vaga só fica pública quando o consultor clicar em "Publicar no site" na tela interna.
                      </p>
                    </div>
                  </label>

                  {form.pubPublicar && (
                    <div className="space-y-4 border-l-2 border-primary/30 pl-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.pubConfidencial}
                          onChange={(e) => setForm((f) => ({ ...f, pubConfidencial: e.target.checked }))}
                          className="h-4 w-4 rounded"
                        />
                        <span className="text-sm">Vaga confidencial (oculta nome e logo da empresa)</span>
                      </label>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label>Local de trabalho</Label>
                          <Input
                            value={form.pubLocal}
                            onChange={(e) => setForm((f) => ({ ...f, pubLocal: e.target.value }))}
                            placeholder="Cidade, UF"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Modalidade</Label>
                          <Select value={form.pubModalidade} onValueChange={(v) => setForm((f) => ({ ...f, pubModalidade: v }))}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="presencial">Presencial</SelectItem>
                              <SelectItem value="hibrido">Híbrido</SelectItem>
                              <SelectItem value="remoto">Remoto</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label>Nível de senioridade</Label>
                          <Select value={form.pubNivel} onValueChange={(v) => setForm((f) => ({ ...f, pubNivel: v }))}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="estagio">Estágio</SelectItem>
                              <SelectItem value="junior">Júnior</SelectItem>
                              <SelectItem value="pleno">Pleno</SelectItem>
                              <SelectItem value="senior">Sênior</SelectItem>
                              <SelectItem value="especialista">Especialista</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Turno</Label>
                          <Select value={form.pubTurno} onValueChange={(v) => setForm((f) => ({ ...f, pubTurno: v }))}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="integral">Integral</SelectItem>
                              <SelectItem value="manha">Manhã</SelectItem>
                              <SelectItem value="tarde">Tarde</SelectItem>
                              <SelectItem value="noturno">Noturno</SelectItem>
                              <SelectItem value="a_combinar">A combinar</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label>Tipo de contrato</Label>
                          <Select value={form.pubContrato} onValueChange={(v) => setForm((f) => ({ ...f, pubContrato: v }))}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="clt">CLT</SelectItem>
                              <SelectItem value="pj">PJ</SelectItem>
                              <SelectItem value="estagio">Estágio</SelectItem>
                              <SelectItem value="temporario">Temporário</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Carga horária</Label>
                          <Input
                            value={form.pubCarga}
                            onChange={(e) => setForm((f) => ({ ...f, pubCarga: e.target.value }))}
                            placeholder="44h semanais"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Salário</Label>
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={form.pubACombinar}
                            onChange={(e) => setForm((f) => ({ ...f, pubACombinar: e.target.checked }))}
                            className="h-4 w-4 rounded"
                          />
                          A combinar
                        </label>
                        {!form.pubACombinar && (
                          <div className="grid grid-cols-2 gap-3">
                            <Input
                              type="number"
                              value={form.pubSalDe}
                              onChange={(e) => setForm((f) => ({ ...f, pubSalDe: e.target.value }))}
                              placeholder="De R$"
                            />
                            <Input
                              type="number"
                              value={form.pubSalAte}
                              onChange={(e) => setForm((f) => ({ ...f, pubSalAte: e.target.value }))}
                              placeholder="Até R$"
                            />
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label>Descrição da vaga para o site</Label>
                        <Textarea
                          value={form.pubDescricao}
                          onChange={(e) => setForm((f) => ({ ...f, pubDescricao: e.target.value }))}
                          placeholder="O que o candidato verá na página pública da vaga."
                          rows={4}
                        />
                      </div>

                      <div className="rounded-md bg-muted/40 border border-border px-3 py-2 text-xs text-muted-foreground">
                        ℹ️ Status inicial: <strong>Não publicada</strong>. A publicação só ocorre quando o consultor clicar em "Publicar no site" na tela interna da vaga.
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {formTipo === "hunting" && (
              <div className="flex items-start gap-2 rounded-lg border p-3" style={{ background: "#FFFBEB", borderColor: "#FDE68A" }}>
                <Checkbox id="ciente" checked={form.ciente} onCheckedChange={(c) => setForm({ ...form, ciente: !!c })} />
                <Label htmlFor="ciente" className="text-xs leading-relaxed cursor-pointer" style={{ color: "#92400E" }}>
                  Estou ciente de que o Hunting pode gerar custo adicional e que a Azumi entrará em contato para confirmar a proposta antes de iniciar.
                </Label>
              </div>
            )}


            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setFormTipo(null); setForm(FORM_INIT); }}>
                Cancelar
              </Button>
              <Button
                type="submit"
                className="text-white"
                style={{ background: formTipo === "hunting" ? "#D97706" : "#4F46E5" }}
              >
                Enviar solicitação
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

function DemoVagaDestaque() {
  const perfis = candidatosComRelatorioPorVaga("v1");
  if (perfis.length === 0) return null;
  return (
    <Link
      to="/cliente/atracao/v1"
      className="block mb-4 bg-card/80 backdrop-blur border border-primary/30 rounded-2xl p-5 hover:bg-card transition-colors"
    >
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-primary font-medium">
              <FileText size={12} /> Perfis enviados
            </span>
            <span className="text-[10px] text-muted-foreground">{perfis.length}/3</span>
          </div>
          <h3 className="font-semibold text-base mt-1">Gerente de TI</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Kentaki Foods — Consultora Camila Torres</p>
        </div>
        <span className="inline-flex items-center gap-1 text-xs text-primary font-medium">
          Ver candidatos enviados <ArrowRight size={14} />
        </span>
      </div>
    </Link>
  );
}
