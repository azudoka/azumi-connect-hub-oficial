import { PageHeader } from "@/components/PageHeader";
import { ConnectStatCard } from "@/components/ConnectStatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { SlaBar } from "@/components/SlaBar";
import { vagas as vagasMock, type StatusKey } from "@/data/mock";
import { criarVaga, publicarVaga, listarVagas, atualizarEtapa, type VagaSupabase } from "@/services/vagasService";
import { supabase } from "@/integrations/supabase/client";
import { Plus, LayoutGrid, List, Filter, Info, AlertTriangle, Users, ChevronDown, ChevronRight, Megaphone, MoreVertical } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell } from "recharts";

function supabaseToLocal(r: VagaSupabase): VagaLocal {
  return {
    id: r.id,
    titulo: r.titulo,
    empresa: r.empresa,
    empresaId: r.empresa_id ?? r.empresa.toLowerCase().replace(/\s+/g, "-"),
    filial: r.filial ?? "—",
    status: (r.status as StatusKey) ?? "ativa",
    etapa: r.etapa ?? "briefing",
    etapaFunil: (LEGACY_ETAPA_TO_FUNIL[r.etapa] ?? r.etapa ?? "briefing") as FunilEtapa,
    sla: 0,
    diasAbertos: Math.floor((Date.now() - new Date(r.criado_em).getTime()) / 86400000),
    diasPrevistos: r.sla_dias ?? 30,
    candidatosTotal: 0,
    candidatosTriagem: 0,
    candidatosEntrevista: 0,
    candidatosEnviados: 0,
    candidatosContratados: 0,
    consultor: r.consultor ?? "Não atribuído",
    modalidade: r.modalidade ?? "—",
    beneficios: r.beneficios ?? [],
    is_avulsa: r.is_avulsa,
    etapaAtualizadoEm: r.etapaAtualizadoEm,
  } as unknown as VagaLocal;
}
import BancoTalentosDrawer from "@/components/atracao/BancoTalentosDrawer";
import { Link, useSearchParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  FUNIL_ETAPAS,
  FUNIL_ETAPA_LABEL,
  LEGACY_ETAPA_TO_FUNIL,
  MAX_CANDIDATOS_POR_ENVIO,
  type FunilEtapa,
} from "@/constants/funil";
import { toast } from "sonner";
import { CategoryTag } from "@/components/CategoryTag";

// SLA crítico: > 80% de SLA consumido em "perfis_enviados" → badge de alerta no card
function isSlaCritico(etapa: FunilEtapa, sla: number) {
  return etapa === "perfis_enviados" && sla >= 80;
}

const STATUS_ORDEM: Record<string, number> = {
  em_processo: 0,
  briefing: 1,
  aberta: 2,
  aguardando_briefing: 2,
  finalizada: 3,
  cancelada: 4,
};

type VagaLocal = (typeof vagasMock)[number] & { etapaFunil: FunilEtapa; is_avulsa?: boolean; etapaAtualizadoEm?: string | null };

export default function AtracaoLista() {
  const [view, setView] = useState<"kanban" | "list">("kanban");
  const [searchParams, setSearchParams] = useSearchParams();

  const [vagas, setVagas] = useState<VagaLocal[]>([]);
  const [loadingVagas, setLoadingVagas] = useState(true);
  const [inativasOpen, setInativasOpen] = useState(false);

  async function recarregarVagas() {
    setLoadingVagas(true);
    try {
      const rows = await listarVagas();
      setVagas(rows.map(supabaseToLocal));
    } catch {/* silencia */}
    setLoadingVagas(false);
  }

  useEffect(() => { recarregarVagas(); }, []);

  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<FunilEtapa | null>(null);

  // Sheet de nova vaga
  const [novaVagaOpen, setNovaVagaOpen] = useState(false);
  const [bancoOpen, setBancoOpen] = useState(false);

  const TIPOS_VAGA = [
    { value: "operacional", label: "Operacional" },
    { value: "tatico", label: "Tático" },
    { value: "gestao", label: "Gestão" },
    { value: "hunting", label: "Hunt Executivo" },
  ] as const;
  type TipoVaga = typeof TIPOS_VAGA[number]["value"];

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

  // Estados do form
  const [consultoresVaga, setConsultoresVaga] = useState<{ id: string; full_name: string }[]>([]);
  const [nResponsavelId, setNResponsavelId] = useState("");
  const [tipoEmpresa, setTipoEmpresa] = useState<"avulsa" | "cadastrada">("avulsa");
  const [empresasCadastradas, setEmpresasCadastradas] = useState<{ id: string; name: string }[]>([]);
  const [empresaCadastradaId, setEmpresaCadastradaId] = useState("");
  const [nTitulo, setNTitulo] = useState("");
  const [nEmpresa, setNEmpresa] = useState("");
  const [nFilial, setNFilial] = useState("");
  const [nTipo, setNTipo] = useState("operacional");
  const [nModalidade, setNModalidade] = useState("presencial");
  const [nPosicoes, setNPosicoes] = useState("1");
  const [nBeneficios, setNBeneficios] = useState<string[]>([]);
  const [nOutrosBeneficios, setNOutrosBeneficios] = useState("");
  const [nDescricao, setNDescricao] = useState("");
  const [avulsaContatoNome, setAvulsaContatoNome] = useState("");
  const [avulsaContatoCargo, setAvulsaContatoCargo] = useState("");
  const [avulsaContatoTelefone, setAvulsaContatoTelefone] = useState("");
  const [avulsaContatoEmail, setAvulsaContatoEmail] = useState("");

  // ---- Publicação no site (mock — não publica automaticamente) ----
  const [pubAberto, setPubAberto] = useState(false);
  const [pubPublicar, setPubPublicar] = useState(false);
  const [pubConfidencial, setPubConfidencial] = useState(false);
  const [pubLocal, setPubLocal] = useState("");
  const [pubModalidade, setPubModalidade] = useState("presencial");
  const [pubNivel, setPubNivel] = useState("pleno");
  const [pubTurno, setPubTurno] = useState("integral");
  const [pubContrato, setPubContrato] = useState("clt");
  const [pubCarga, setPubCarga] = useState("");
  const [pubSalDe, setPubSalDe] = useState("");
  const [pubSalAte, setPubSalAte] = useState("");
  const [pubACombinar, setPubACombinar] = useState(false);
  const [pubDescricao, setPubDescricao] = useState("");

  useEffect(() => {
    if (!novaVagaOpen) return;
    supabase.from("companies").select("id, name").eq("status", "active").order("name")
      .then(({ data }) => setEmpresasCadastradas(data ?? []));
    supabase.from("users_profile").select("id, full_name").in("role", ["azumi_admin", "azumi_consultor"]).order("full_name")
      .then(({ data }) => setConsultoresVaga((data ?? []).map((d) => ({ id: d.id, full_name: d.full_name ?? "—" }))));
  }, [novaVagaOpen]);

  function resetNovaVaga() {
    setTipoEmpresa("avulsa"); setEmpresaCadastradaId("");
    setNTitulo(""); setNEmpresa(""); setNFilial("");
    setNTipo("operacional"); setNModalidade("presencial");
    setNPosicoes("1"); setNBeneficios([]); setNOutrosBeneficios(""); setNDescricao("");
    setAvulsaContatoNome(""); setAvulsaContatoCargo(""); setAvulsaContatoTelefone(""); setAvulsaContatoEmail("");
    setNResponsavelId("");
    setPubAberto(false); setPubPublicar(false); setPubConfidencial(false);
    setPubLocal(""); setPubModalidade("presencial"); setPubNivel("pleno");
    setPubTurno("integral"); setPubContrato("clt"); setPubCarga("");
    setPubSalDe(""); setPubSalAte(""); setPubACombinar(false); setPubDescricao("");
  }

  // Validação de plano: Hunt Executivo bloqueado no plano Ongoing.
  const PLANO_ATUAL = "ongoing"; // mock — em prod vem do contexto de auth
  const huntBloqueado = nTipo === "hunting" && PLANO_ATUAL === "ongoing";

  // Suporte a deep-link /app/atracao?new=1 vindo de "Nova solicitação"
  useEffect(() => {
    if (searchParams.get("new") === "1") {
      toast.info("Abertura de nova vaga", {
        description: "Preencha o briefing para iniciar o funil.",
      });
      const next = new URLSearchParams(searchParams);
      next.delete("new");
      setSearchParams(next, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  function moverVaga(vagaId: string, destino: FunilEtapa) {
    const vaga = vagas.find((v) => v.id === vagaId);
    if (!vaga || vaga.etapaFunil === destino) return;

    // Regra: não permite pular direto para "decisao" sem ter passado por "perfis_enviados"
    const idxAtual = FUNIL_ETAPAS.indexOf(vaga.etapaFunil);
    const idxDestino = FUNIL_ETAPAS.indexOf(destino);
    if (destino === "decisao" && vaga.etapaFunil !== "perfis_enviados") {
      toast.error("Antes de mover para 'Decisão', a vaga precisa passar por 'Perfis enviados'.");
      return;
    }
    // Avançar mais de 2 etapas seguidas → confirmação leve via toast
    if (idxDestino - idxAtual > 2) {
      toast.warning(`Pulou ${idxDestino - idxAtual} etapas — verifique se é intencional.`);
    }

    const etapaAnterior = vaga.etapaFunil;

    setVagas((prev) =>
      prev
        .map((v) => (v.id === vagaId ? { ...v, etapaFunil: destino, etapaAtualizadoEm: new Date().toISOString() } : v))
        .sort((a, b) => {
          const pa = STATUS_ORDEM[a.status] ?? 99;
          const pb = STATUS_ORDEM[b.status] ?? 99;
          return pa !== pb ? pa - pb : b.id.localeCompare(a.id);
        })
    );

    atualizarEtapa(vagaId, destino).catch((err) => {
      console.error("[moverVaga] falha ao persistir", err);
      toast.error("Erro ao salvar a mudança de etapa — revertendo.");
      setVagas((prev) => prev.map((v) => (v.id === vagaId ? { ...v, etapaFunil: etapaAnterior } : v)));
    });

    if (destino === "perfis_enviados") {
      toast.success("Perfis enviados ao cliente — aguarde avaliação.");
    } else {
      toast.success(`${vaga.titulo} → ${FUNIL_ETAPA_LABEL[destino]}`);
    }
  }

  const totalCriticas = useMemo(
    () => vagas.filter((v) => isSlaCritico(v.etapaFunil, v.sla)).length,
    [vagas],
  );

  const vagasAtivas = useMemo(
    () => vagas.filter((v) => v.status !== "standby" && v.status !== "cancelada" && v.status !== "concluida"),
    [vagas],
  );
  const vagasInativas = useMemo(
    () => vagas.filter((v) => v.status === "standby" || v.status === "cancelada" || v.status === "concluida"),
    [vagas],
  );

  return (
    <div>
      <PageHeader
        title="Atração & Hunting"
        subtitle="Gestão de todas as vagas em andamento"
        actions={
          <>
            <div className="flex items-center bg-secondary rounded-full p-0.5">
              <button
                onClick={() => setView("kanban")}
                className={cn(
                  "h-7 px-2.5 rounded-full text-xs flex items-center gap-1.5",
                  view === "kanban" && "bg-card shadow-card text-foreground",
                )}
              >
                <iconify-icon icon="solar:widget-2-bold-duotone" width="14" height="14" /> Kanban
              </button>
              <button
                onClick={() => setView("list")}
                className={cn(
                  "h-7 px-2.5 rounded-full text-xs flex items-center gap-1.5",
                  view === "list" && "bg-card shadow-card text-foreground",
                )}
              >
                <iconify-icon icon="solar:checklist-bold-duotone" width="14" height="14" /> Lista
              </button>
            </div>
            <button className="h-9 px-3 rounded-full border border-border hover:bg-secondary text-sm flex items-center gap-1.5">
              <iconify-icon icon="solar:tuning-2-bold-duotone" width="16" height="16" /> Filtros
            </button>
            <button
              onClick={() => setBancoOpen(true)}
              className="h-9 px-3 rounded-full border border-border hover:bg-secondary text-sm font-medium flex items-center gap-1.5"
            >
              <iconify-icon icon="solar:users-group-rounded-bold-duotone" width="16" height="16" /> Banco de Talentos
            </button>
            <button
              onClick={() => setNovaVagaOpen(true)}
              className="h-9 px-3 rounded-full bg-primary text-primary-foreground text-sm font-medium flex items-center gap-1.5"
            >
              <iconify-icon icon="solar:add-circle-bold-duotone" width="16" height="16" /> Nova vaga
            </button>
          </>
        }
      />

      {/* Painel de visão geral — substitui o banner solto de SLA crítico por dado de verdade */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-3 items-start">
        <div className="bg-card rounded-xl p-6" style={{ boxShadow: "0 1px 4px rgba(133,146,173,0.2)" }}>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">
            Candidatos por etapa — {vagasAtivas.length} vagas ativas
          </p>
          <ResponsiveContainer width="100%" height={110}>
            <BarChart
              data={[
                { etapa: "Triagem", n: vagasAtivas.reduce((s, v) => s + v.candidatosTriagem, 0), tone: "#264478" },
                { etapa: "Entrevista", n: vagasAtivas.reduce((s, v) => s + v.candidatosEntrevista, 0), tone: "#6B3FBF" },
                { etapa: "Enviados", n: vagasAtivas.reduce((s, v) => s + v.candidatosEnviados, 0), tone: "#12786B" },
                { etapa: "Contratados", n: vagasAtivas.reduce((s, v) => s + v.candidatosContratados, 0), tone: "#1E8A4C" },
              ]}
              margin={{ top: 4, right: 4, left: -24, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis dataKey="etapa" fontSize={10} tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" />
              <YAxis fontSize={10} tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" allowDecimals={false} width={28} />
              <Bar dataKey="n" radius={[4, 4, 0, 0]}>
                {[0, 1, 2, 3].map((i) => (
                  <Cell key={i} fill={["#264478", "#6B3FBF", "#12786B", "#1E8A4C"][i]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <ConnectStatCard
          variant="list"
          label="SLA crítico"
          items={vagasAtivas
            .filter((v) => isSlaCritico(v.etapaFunil, v.sla))
            .slice(0, 3)
            .map((v) => ({ label: v.titulo, tone: "red" as const }))}
          footer={
            totalCriticas > 0
              ? `${totalCriticas} vaga${totalCriticas === 1 ? "" : "s"} em "Perfis enviados" — cobrança recomendada`
              : "Nenhuma vaga crítica no momento"
          }
        />
        <ConnectStatCard
          variant="stack"
          label="Distribuição por etapa"
          segments={FUNIL_ETAPAS.map((etapa, i) => ({
            label: FUNIL_ETAPA_LABEL[etapa],
            value: String(vagasAtivas.filter((v) => v.etapaFunil === etapa).length),
            percent: vagasAtivas.length > 0
              ? (vagasAtivas.filter((v) => v.etapaFunil === etapa).length / vagasAtivas.length) * 100
              : 0,
            tone: (["blue", "violet", "teal", "amber", "green"] as const)[i % 5],
          }))}
        />
      </div>

      {/* Banner com as regras de negócio (Handoff): limite de envio + plano */}
      <div className="mb-5 rounded-xl border border-[hsl(var(--info)/0.3)] bg-[hsl(var(--info)/0.1)] px-4 py-3 flex items-start gap-3">
        <Info className="h-4 w-4 text-info shrink-0 mt-0.5" />
        <div className="text-xs text-[hsl(var(--info)/0.9)] leading-relaxed">
          Envie no máximo <strong>{MAX_CANDIDATOS_POR_ENVIO} candidatos por etapa</strong> ao cliente
          (acima disso é necessária justificativa). Vagas do tipo <strong>Hunt Executivo</strong> não
          são permitidas no plano Ongoing.
        </div>
      </div>

      {loadingVagas && (
        <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          Carregando vagas…
        </div>
      )}

      {!loadingVagas && vagas.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
          <p className="text-muted-foreground">Nenhuma vaga cadastrada ainda.</p>
          <button
            className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground"
            onClick={() => setNovaVagaOpen(true)}
          >
            Criar primeira vaga
          </button>
        </div>
      )}

      {!loadingVagas && vagas.length > 0 && (view === "kanban" ? (
        <>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin-invisible">
            {FUNIL_ETAPAS.map((etapa) => {
              const items = vagasAtivas.filter((v) => v.etapaFunil === etapa);
              const isOver = dragOverCol === etapa;
              const corEtapa = (["#264478", "#6B3FBF", "#12786B", "#B4740E", "#1E8A4C"] as const)[
                FUNIL_ETAPAS.indexOf(etapa) % 5
              ];
              return (
                <div
                  key={etapa}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = "move";
                    if (dragOverCol !== etapa) setDragOverCol(etapa);
                  }}
                  onDragLeave={() => {
                    if (dragOverCol === etapa) setDragOverCol(null);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    const id = e.dataTransfer.getData("text/plain") || draggingId;
                    setDragOverCol(null);
                    setDraggingId(null);
                    if (id) moverVaga(id, etapa);
                  }}
                  style={{ borderTopColor: corEtapa }}
                  className={cn(
                    "w-[280px] shrink-0 bg-card border border-t-[3px] rounded-xl p-3 min-h-[280px] transition-colors",
                    isOver ? "border-primary ring-2 ring-[hsl(var(--primary)/0.2)]" : "border-border",
                  )}
                >
                  <div className="flex items-center justify-between mb-3 px-1">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {FUNIL_ETAPA_LABEL[etapa]}
                    </span>
                    <span
                      className="text-[10px] font-semibold tabular-nums rounded-full px-1.5 py-0.5"
                      style={{ background: `${corEtapa}1A`, color: corEtapa }}
                    >
                      {items.length}
                    </span>
                  </div>
                  {items.length === 0 ? (
                    <div className="flex items-center justify-center h-32 text-xs text-muted-foreground border border-dashed border-border/60 rounded-md">
                      {isOver ? "Soltar aqui" : "—"}
                    </div>
                  ) : (
                    <ul className="space-y-2">
                      {items.map((v) => {
                        const critico = isSlaCritico(v.etapaFunil, v.sla);
                        const corUrgencia =
                          v.sla >= 90 ? "hsl(var(--destructive))" :
                          v.sla >= 70 ? "hsl(var(--warning))" : "hsl(var(--success))";
                        const consultorIniciais = v.consultor
                          .split(" ")
                          .filter(Boolean)
                          .slice(0, 2)
                          .map((p) => p[0])
                          .join("")
                          .toUpperCase();
                        return (
                          <li
                            key={v.id}
                            draggable
                            onDragStart={(e) => {
                              setDraggingId(v.id);
                              e.dataTransfer.effectAllowed = "move";
                              e.dataTransfer.setData("text/plain", v.id);
                            }}
                            onDragEnd={() => {
                              setDraggingId(null);
                              setDragOverCol(null);
                            }}
                            style={{ borderLeftColor: corUrgencia, boxShadow: "0 1px 4px rgba(133,146,173,0.15)" }}
                            className={cn(
                              "block bg-card border-l-[3px] rounded-lg p-3 transition-all cursor-grab active:cursor-grabbing hover:-translate-y-0.5",
                              draggingId === v.id && "opacity-50",
                            )}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <Link
                                to={`/app/atracao/${v.id}`}
                                onClick={(e) => e.stopPropagation()}
                                className="text-sm font-medium leading-tight hover:text-primary flex-1 min-w-0 line-clamp-2 break-words"
                              >
                                {v.titulo}
                              </Link>
                              <StatusBadge status={v.status} className="shrink-0" />
                            </div>
                            <div className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1.5">
                              {v.empresa}
                              {v.is_avulsa && (
                                <CategoryTag categoria="origem">Avulso</CategoryTag>
                              )}
                            </div>
                            <div className="mt-3"><SlaBar percent={v.sla} /></div>
                            {v.etapaAtualizadoEm && (() => {
                              const dias = Math.floor((Date.now() - new Date(v.etapaAtualizadoEm).getTime()) / (1000 * 60 * 60 * 24));
                              return (
                                <div className="text-[10px] text-muted-foreground mt-0.5">
                                  Há {dias} dia{dias === 1 ? "" : "s"} nesta etapa
                                </div>
                              );
                            })()}
                            {critico && (
                              <div className="mt-2 inline-flex items-center gap-1 rounded-full border border-[hsl(var(--warning)/0.3)] bg-[hsl(var(--warning)/0.1)] px-2 py-0.5 text-[10px] text-warning font-medium">
                                <iconify-icon icon="solar:danger-triangle-bold-duotone" width="12" height="12" /> SLA crítico
                              </div>
                            )}
                            <div className="mt-3 pt-2 border-t border-border flex items-center gap-1.5">
                              <span className="h-5 w-5 rounded-md bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center shrink-0">
                                {consultorIniciais}
                              </span>
                              <span className="text-[10px] text-muted-foreground truncate">{v.consultor}</span>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div className="bg-card rounded-xl overflow-hidden" style={{ boxShadow: "0 1px 4px rgba(133,146,173,0.2)" }}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left font-semibold px-4 py-4">Vaga</th>
                <th className="text-left font-semibold px-4 py-4">Etapa</th>
                <th className="text-left font-semibold px-4 py-4">Status</th>
                <th className="text-left font-semibold px-4 py-4 w-48">SLA</th>
                <th className="text-right font-semibold px-4 py-4">Candidatos</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody>
              {vagasAtivas.map((v) => (
                <tr key={v.id} className="border-b border-border last:border-0 hover:bg-muted/40 transition-colors">
                  <td className="px-4 py-3.5">
                    <Link to={`/app/atracao/${v.id}`} className="flex items-center gap-3 group">
                      <div
                        title={v.consultor ?? "Azumi"}
                        className="h-[52px] w-[52px] rounded-lg bg-[image:linear-gradient(135deg,hsl(var(--primary)),hsl(var(--primary-glow)))] flex items-center justify-center text-sm font-semibold text-white shrink-0"
                      >
                        {v.consultor?.split(" ").map((n) => n[0]).slice(0, 2).join("") ?? "AZ"}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium truncate group-hover:text-primary transition-colors">{v.titulo}</p>
                        <p className="text-xs text-muted-foreground truncate flex items-center gap-1.5">
                          {v.empresa}
                          {v.is_avulsa && <CategoryTag categoria="origem">Avulso</CategoryTag>}
                        </p>
                      </div>
                    </Link>
                  </td>
                  <td className="px-4 py-3.5 text-muted-foreground">{FUNIL_ETAPA_LABEL[v.etapaFunil]}</td>
                  <td className="px-4 py-3.5"><StatusBadge status={v.status} /></td>
                  <td className="px-4 py-3.5"><SlaBar percent={v.sla} /></td>
                  <td className="px-4 py-3.5 text-right tabular-nums">{v.candidatosTotal}</td>
                  <td className="px-2 py-3.5" onClick={(ev) => ev.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-[hsl(var(--primary)/0.1)] hover:text-primary text-muted-foreground transition-colors"
                          aria-label="Ações"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem className="gap-2" onClick={() => navigate(`/app/atracao/${v.id}`)}>
                          <iconify-icon icon="solar:eye-bold-duotone" width="16" height="16" /> Ver vaga
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

      {/* ── Seção: Standby e Canceladas ─────────────────────────── */}
      {vagasInativas.length > 0 && (
        <div className="mt-6">
          <button
            type="button"
            onClick={() => setInativasOpen((x) => !x)}
            className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors mb-3"
          >
            {inativasOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
            Standby, Canceladas e Concluídas ({vagasInativas.length})
          </button>
          {inativasOpen && (
            <div className="bg-card rounded-xl overflow-hidden" style={{ boxShadow: "0 1px 4px rgba(133,146,173,0.2)" }}>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left font-semibold px-4 py-4">Vaga</th>
                    <th className="text-left font-semibold px-4 py-4">Empresa</th>
                    <th className="text-left font-semibold px-4 py-4">Etapa</th>
                    <th className="text-left font-semibold px-4 py-4">Status</th>
                    <th className="text-left font-semibold px-4 py-4 w-48">SLA</th>
                  </tr>
                </thead>
                <tbody>
                  {vagasInativas.map((v) => (
                    <tr key={v.id} className="border-b border-border last:border-0 hover:bg-muted/40 transition-colors opacity-70">
                      <td className="px-4 py-3.5">
                        <Link to={`/app/atracao/${v.id}`} className="font-medium hover:text-primary">
                          {v.titulo}
                        </Link>
                      </td>
                      <td className="px-4 py-3.5 text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          {v.empresa}
                          {v.is_avulsa && (
                            <CategoryTag categoria="origem">Avulso</CategoryTag>
                          )}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">{FUNIL_ETAPA_LABEL[v.etapaFunil]}</td>
                      <td className="px-4 py-3.5"><StatusBadge status={v.status} /></td>
                      <td className="px-4 py-3.5"><SlaBar percent={v.sla} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <BancoTalentosDrawer open={bancoOpen} onClose={() => setBancoOpen(false)} />


      {/* Sheet de nova vaga */}
      <Dialog open={novaVagaOpen} onOpenChange={(o) => {
        setNovaVagaOpen(o);
        if (!o) resetNovaVaga();
      }}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nova vaga</DialogTitle>
            <DialogDescription>
              Preencha os dados para iniciar o funil de atração.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-6 space-y-5">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Informações básicas</p>
            {/* Título */}
            <div className="space-y-2">
              <Label htmlFor="nTitulo">Título da vaga *</Label>
              <Input
                id="nTitulo"
                value={nTitulo}
                onChange={(e) => setNTitulo(e.target.value)}
                placeholder="Ex.: Gerente de TI Sênior"
              />
            </div>

            {/* Consultor responsável */}
            <div className="space-y-2">
              <Label htmlFor="nResponsavel">Consultor responsável</Label>
              <select
                id="nResponsavel"
                value={nResponsavelId}
                onChange={(e) => setNResponsavelId(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Selecione o consultor…</option>
                {consultoresVaga.map((c) => (
                  <option key={c.id} value={c.id}>{c.full_name}</option>
                ))}
              </select>
            </div>

            {/* Toggle: Empresa cadastrada vs Cliente avulso */}
            <div className="space-y-3">
              <Label>Tipo de cliente *</Label>
              <div className="flex gap-2">
                {(["avulsa", "cadastrada"] as const).map((tipo) => (
                  <button
                    key={tipo}
                    type="button"
                    onClick={() => { setTipoEmpresa(tipo); setEmpresaCadastradaId(""); setNEmpresa(""); }}
                    className={`flex-1 rounded-full border px-3 py-2 text-sm font-medium transition ${
                      tipoEmpresa === tipo
                        ? "border-primary bg-[hsl(var(--primary)/0.1)] text-primary"
                        : "border-border bg-background text-muted-foreground hover:bg-secondary"
                    }`}
                  >
                    {tipo === "avulsa" ? "Cliente avulso" : "Empresa cadastrada"}
                  </button>
                ))}
              </div>
            </div>

            {/* Empresa e Filial */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="nEmpresa">Empresa *</Label>
                {tipoEmpresa === "cadastrada" ? (
                  <select
                    id="nEmpresa"
                    value={empresaCadastradaId}
                    onChange={(e) => setEmpresaCadastradaId(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="">Selecione a empresa…</option>
                    {empresasCadastradas.map((e) => (
                      <option key={e.id} value={e.id}>{e.name}</option>
                    ))}
                  </select>
                ) : (
                  <Input
                    id="nEmpresa"
                    value={nEmpresa}
                    onChange={(e) => setNEmpresa(e.target.value)}
                    placeholder="Nome da empresa"
                  />
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="nFilial">Filial</Label>
                <Input
                  id="nFilial"
                  value={nFilial}
                  onChange={(e) => setNFilial(e.target.value)}
                  placeholder="SP, RJ, BH..."
                />
              </div>
            </div>

            {/* Contato do solicitante — só avulso */}
            {tipoEmpresa === "avulsa" && (
              <div className="space-y-2">
                <Label>Contato do solicitante *</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input placeholder="Nome do contato" value={avulsaContatoNome} onChange={(e) => setAvulsaContatoNome(e.target.value)} />
                  <Input placeholder="Cargo do contato" value={avulsaContatoCargo} onChange={(e) => setAvulsaContatoCargo(e.target.value)} />
                  <Input placeholder="WhatsApp / Telefone" value={avulsaContatoTelefone} onChange={(e) => setAvulsaContatoTelefone(e.target.value)} />
                  <Input placeholder="E-mail" type="email" value={avulsaContatoEmail} onChange={(e) => setAvulsaContatoEmail(e.target.value)} />
                </div>
              </div>
            )}

            {/* Tipo + Modalidade */}
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground pt-1">Detalhes da vaga</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Tipo *</Label>
                <Select value={nTipo} onValueChange={(v) => setNTipo(v as TipoVaga)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIPOS_VAGA.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                        {t.value === "hunting" && PLANO_ATUAL === "ongoing" &&
                          " (indisponível no plano Ongoing)"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {huntBloqueado && (
                  <div className="text-xs text-destructive flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Hunt Executivo não está disponível no plano Ongoing.
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label>Modalidade</Label>
                <Select value={nModalidade} onValueChange={setNModalidade}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
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
                value={nPosicoes}
                onChange={(e) => setNPosicoes(e.target.value)}
                className="w-24"
              />
            </div>

            {/* Benefícios — checkboxes múltiplos */}
            <div className="space-y-2">
              <Label>Benefícios</Label>
              <div className="flex flex-wrap gap-2">
                {BENEFICIOS_OPCOES.map((b) => {
                  const sel = nBeneficios.includes(b.value);
                  return (
                    <button
                      key={b.value}
                      type="button"
                      onClick={() =>
                        setNBeneficios((prev) =>
                          sel ? prev.filter((x) => x !== b.value) : [...prev, b.value]
                        )
                      }
                      className={cn(
                        "rounded-full border px-3 py-1 text-xs transition-colors",
                        sel
                          ? "border-primary bg-[hsl(var(--primary)/0.1)] text-primary font-medium"
                          : "border-border hover:bg-muted/40"
                      )}
                    >
                      {b.label}
                    </button>
                  );
                })}
              </div>
              <Input
                placeholder="Outros benefícios (separados por vírgula)"
                value={nOutrosBeneficios}
                onChange={(e) => setNOutrosBeneficios(e.target.value)}
                className="mt-2"
              />
            </div>

            {/* Descrição */}
            <div className="space-y-2">
              <Label htmlFor="nDescricao">Descrição e requisitos</Label>
              <Textarea
                id="nDescricao"
                value={nDescricao}
                onChange={(e) => setNDescricao(e.target.value)}
                placeholder="Descreva o perfil desejado, requisitos obrigatórios e diferenciais."
              />
            </div>

            {/* Publicação no site */}
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground pt-1">Publicação</p>
            <div className="rounded-xl border border-border overflow-hidden">
              <button
                type="button"
                onClick={() => setPubAberto((x) => !x)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-muted/30"
              >
                <span className="h-8 w-8 rounded-lg bg-[hsl(var(--primary)/0.1)] text-primary flex items-center justify-center shrink-0">
                  <Megaphone className="h-4 w-4" />
                </span>
                <span className="flex-1 text-sm font-medium">Informações para publicação no site</span>
                <span className="text-xs text-muted-foreground">{pubAberto ? "Ocultar" : "Expandir"}</span>
              </button>
              {pubAberto && (
                <div className="space-y-4 border-t border-border px-4 py-4">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pubPublicar}
                      onChange={(e) => setPubPublicar(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded"
                    />
                    <div className="flex-1">
                      <span className="text-sm font-medium">Preparar para publicação</span>
                      <p className="text-xs text-muted-foreground">
                        Preencher estes campos NÃO publica automaticamente. A vaga fica como
                        "Não publicada" até clicar em "Publicar no site" na tela da vaga.
                      </p>
                    </div>
                  </label>

                  {pubPublicar && (
                    <div className="space-y-4 border-l-2 border-[hsl(var(--primary)/0.3)] pl-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={pubConfidencial}
                          onChange={(e) => setPubConfidencial(e.target.checked)}
                          className="h-4 w-4 rounded"
                        />
                        <span className="text-sm">Empresa confidencial (oculta nome e logo na página pública)</span>
                      </label>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label>Local de trabalho</Label>
                          <Input value={pubLocal} onChange={(e) => setPubLocal(e.target.value)} placeholder="Cidade, UF" />
                        </div>
                        <div className="space-y-2">
                          <Label>Modalidade</Label>
                          <Select value={pubModalidade} onValueChange={setPubModalidade}>
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
                          <Select value={pubNivel} onValueChange={setPubNivel}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="padrao">Padrão (sem senioridade definida)</SelectItem>
                              <SelectItem value="estagio">Estágio</SelectItem>
                              <SelectItem value="junior">Júnior</SelectItem>
                              <SelectItem value="pleno">Pleno</SelectItem>
                              <SelectItem value="senior">Sênior</SelectItem>
                              <SelectItem value="especialista">Especialista</SelectItem>
                              <SelectItem value="gerencia">Gerência</SelectItem>
                              <SelectItem value="diretoria">Diretoria</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Turno</Label>
                          <Select value={pubTurno} onValueChange={setPubTurno}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="integral">Integral</SelectItem>
                              <SelectItem value="manha">Manhã</SelectItem>
                              <SelectItem value="tarde">Tarde</SelectItem>
                              <SelectItem value="flexivel">Flexível</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label>Tipo de contrato</Label>
                          <Select value={pubContrato} onValueChange={setPubContrato}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="clt">CLT</SelectItem>
                              <SelectItem value="pj">PJ</SelectItem>
                              <SelectItem value="estagio">Estágio</SelectItem>
                              <SelectItem value="temporario">Temporário</SelectItem>
                              <SelectItem value="freelance">Freelance</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Carga horária</Label>
                          <Input value={pubCarga} onChange={(e) => setPubCarga(e.target.value)} placeholder="44h semanais" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Salário</Label>
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={pubACombinar}
                            onChange={(e) => setPubACombinar(e.target.checked)}
                            className="h-4 w-4 rounded"
                          />
                          A combinar
                        </label>
                        {!pubACombinar && (
                          <div className="grid grid-cols-2 gap-3">
                            <Input
                              type="number"
                              value={pubSalDe}
                              onChange={(e) => setPubSalDe(e.target.value)}
                              placeholder="De R$"
                            />
                            <Input
                              type="number"
                              value={pubSalAte}
                              onChange={(e) => setPubSalAte(e.target.value)}
                              placeholder="Até R$"
                            />
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label>Descrição da vaga para o site *</Label>
                        <Textarea
                          value={pubDescricao}
                          onChange={(e) => setPubDescricao(e.target.value)}
                          placeholder="O que o candidato verá na página pública da vaga."
                          rows={4}
                        />
                      </div>

                      <div className="rounded-md bg-[hsl(var(--info)/0.1)] border border-[hsl(var(--info)/0.2)] px-3 py-2 text-xs text-info flex items-start gap-2">
                        <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                        <span>Status inicial: <strong>Não publicada</strong>. Para tornar pública, use o botão
                        "Publicar no site" na tela interna da vaga.</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="border-t pt-4 flex flex-row gap-2 justify-end mt-6">
            <Button variant="outline" className="rounded-full"
              onClick={() => { setNovaVagaOpen(false); resetNovaVaga(); }}>
              Cancelar
            </Button>
            <Button
              className="rounded-full"
              disabled={
                !nTitulo.trim() ||
                (tipoEmpresa === "avulsa" ? !nEmpresa.trim() : !empresaCadastradaId) ||
                (tipoEmpresa === "avulsa" && (!avulsaContatoNome.trim() || !avulsaContatoCargo.trim() || !avulsaContatoTelefone.trim() || !avulsaContatoEmail.trim())) ||
                huntBloqueado
              }
              onClick={async () => {
                const titulo = nTitulo.trim();
                const outrosExtras = nOutrosBeneficios
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean);
                const beneficiosFinal = [...nBeneficios, ...outrosExtras];
                setNovaVagaOpen(false);
                resetNovaVaga();
                const tid = toast.loading(`Salvando "${titulo}"…`);
                try {
                  const vagaCriada = await criarVaga({
                    titulo,
                    is_avulsa: tipoEmpresa === "avulsa",
                    empresa: tipoEmpresa === "avulsa" ? nEmpresa.trim() : "",
                    empresa_id: tipoEmpresa === "cadastrada" ? empresaCadastradaId : undefined,
                    avulsa_solicitante_nome: tipoEmpresa === "avulsa" ? avulsaContatoNome.trim() : null,
                    avulsa_solicitante_cargo: tipoEmpresa === "avulsa" ? avulsaContatoCargo.trim() : null,
                    avulsa_solicitante_telefone: tipoEmpresa === "avulsa" ? avulsaContatoTelefone.trim() : null,
                    avulsa_solicitante_email: tipoEmpresa === "avulsa" ? avulsaContatoEmail.trim() : null,
                    filial: nFilial.trim() || undefined,
                    tipo: nTipo || undefined,
                    modalidade: pubModalidade || nModalidade || undefined,
                    beneficios: beneficiosFinal,
                    descricao: pubDescricao.trim() || undefined,
                    local_trabalho: pubLocal.trim() || undefined,
                    nivel: pubNivel || undefined,
                    turno: pubTurno || undefined,
                    tipo_contrato: pubContrato || undefined,
                    carga_horaria: pubCarga.trim() || undefined,
                    salario_de: pubACombinar ? undefined : (pubSalDe ? Number(pubSalDe) : undefined),
                    salario_ate: pubACombinar ? undefined : (pubSalAte ? Number(pubSalAte) : undefined),
                    confidencial: pubConfidencial,
                    salario_fixo: !pubACombinar && !!pubSalDe && !pubSalAte,
                    responsavel_id: nResponsavelId || null,
                  });
                  if (pubPublicar) {
                    await publicarVaga(vagaCriada.id);
                  }
                  toast.success(`Vaga "${titulo}" criada.`, { id: tid,
                    description: pubPublicar ? "Vaga publicada no site." : "Status: Briefing. Complete o preenchimento antes de publicar." });
                  recarregarVagas();
                } catch (err) {
                  console.error("[criarVaga]", err);
                  toast.error("Falha ao criar vaga. Tente novamente.", { id: tid });
                }
              }}
            >
              Criar vaga
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
