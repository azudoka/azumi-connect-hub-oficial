import { PageHeader } from "@/components/PageHeader";
import { ConnectStatCard } from "@/components/ConnectStatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { SlaBar } from "@/components/SlaBar";
import { vagas as vagasMock, type StatusKey } from "@/data/mock";
import { criarVaga, getVaga, publicarVaga, listarVagas, atualizarEtapa, type VagaSupabase } from "@/services/vagasService";
import { sendEmail, emailAtribuicaoVaga } from "@/lib/emailTemplates";
import { supabase } from "@/integrations/supabase/client";
import { Plus, LayoutGrid, List, Filter, Info, AlertTriangle, Users, ChevronDown, ChevronRight, Megaphone, MoreVertical, Trash2 } from "lucide-react";
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
    diasAbertos: Math.floor((Date.now() - new Date(r.criado_em).getTime()) / 86400000),
    diasPrevistos: r.sla_dias ?? 30,
    sla: Math.min(Math.round((Math.floor((Date.now() - new Date(r.criado_em).getTime()) / 86400000) / (r.sla_dias ?? 30)) * 100), 100),
    candidatosTotal: r.candidatosTotal ?? 0,
    candidatosTriagem: 0,
    candidatosEntrevista: 0,
    candidatosEnviados: 0,
    candidatosContratados: 0,
    consultor: r.consultor ?? "Não atribuído",
    tipo: r.tipo ?? "",
    modalidade: r.modalidade ?? "—",
    beneficios: r.beneficios ?? [],
    is_avulsa: r.is_avulsa,
    etapaAtualizadoEm: r.etapaAtualizadoEm,
    responsavel_id: r.responsavel_id ?? null,
    consultor_avatar_url: r.consultor_avatar_url ?? null,
  } as unknown as VagaLocal;
}
import BancoTalentosDrawer from "@/components/atracao/BancoTalentosDrawer";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
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
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  FUNIL_ETAPAS,
  FUNIL_ETAPA_LABEL,
  LEGACY_ETAPA_TO_FUNIL,
  MAX_CANDIDATOS_POR_ENVIO,
  type FunilEtapa,
} from "@/constants/funil";
import { toast } from "sonner";
import { CategoryTag } from "@/components/CategoryTag";

function ConsultorAvatar({ url, iniciais, size = "sm" }: { url?: string | null; iniciais: string; size?: "sm" | "lg" }) {
  const [broken, setBroken] = useState(false);
  const sm = size === "sm";
  if (url && !broken) {
    return (
      <img
        src={url}
        alt=""
        className={sm ? "h-5 w-5 rounded-md object-cover shrink-0" : "h-[52px] w-[52px] rounded-lg object-cover shrink-0"}
        onError={() => setBroken(true)}
      />
    );
  }
  if (sm) {
    return <span className="h-5 w-5 rounded-md bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center shrink-0">{iniciais}</span>;
  }
  return <div className="h-[52px] w-[52px] rounded-lg bg-[image:linear-gradient(135deg,hsl(var(--primary)),hsl(var(--primary-glow)))] flex items-center justify-center text-sm font-semibold text-white shrink-0">{iniciais}</div>;
}

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

type VagaLocal = (typeof vagasMock)[number] & { etapaFunil: FunilEtapa; is_avulsa?: boolean; etapaAtualizadoEm?: string | null; responsavel_id?: string | null; consultor_avatar_url?: string | null };

export default function AtracaoLista() {
  const [view, setView] = useState<"kanban" | "list">("kanban");
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [vagas, setVagas] = useState<VagaLocal[]>([]);
  const [loadingVagas, setLoadingVagas] = useState(true);
  const [inativasOpen, setInativasOpen] = useState(false);

  async function recarregarVagas() {
    setLoadingVagas(true);
    try {
      const rows = await listarVagas();
      const localVagas = rows.map(supabaseToLocal);
      if (localVagas.length > 0) {
        const vagaIds = localVagas.map((v) => v.id);
        const { data: cands } = await (supabase as any)
          .from("candidates")
          .select("job_id, etapa_azumi")
          .in("job_id", vagaIds);
        if (cands && cands.length > 0) {
          const countsByJob: Record<string, { triagem: number; entrevista: number; enviados: number; contratados: number }> = {};
          for (const c of cands as { job_id: string; etapa_azumi: string }[]) {
            if (!countsByJob[c.job_id]) countsByJob[c.job_id] = { triagem: 0, entrevista: 0, enviados: 0, contratados: 0 };
            if (c.etapa_azumi === "triagem" || c.etapa_azumi === "recebido") countsByJob[c.job_id].triagem++;
            else if (c.etapa_azumi === "entrevista") countsByJob[c.job_id].entrevista++;
            else if (c.etapa_azumi === "perfis_enviados") countsByJob[c.job_id].enviados++;
            else if (c.etapa_azumi === "contratado") countsByJob[c.job_id].contratados++;
          }
          for (const v of localVagas) {
            const counts = countsByJob[v.id];
            if (counts) {
              v.candidatosTriagem = counts.triagem;
              v.candidatosEntrevista = counts.entrevista;
              v.candidatosEnviados = counts.enviados;
              v.candidatosContratados = counts.contratados;
            }
          }
        }
      }
      setVagas(localVagas);
    } catch {/* silencia */}
    setLoadingVagas(false);
  }

  async function handleDuplicarVaga(vagaId: string) {
    const tid = toast.loading("Duplicando vaga…");
    try {
      const vagaFull = await getVaga(vagaId);
      if (!vagaFull) throw new Error("Vaga não encontrada");
      const nova = await criarVaga({
        titulo: `${vagaFull.titulo} (cópia)`,
        is_avulsa: vagaFull.is_avulsa,
        empresa: vagaFull.empresa,
        empresa_id: vagaFull.empresa_id ?? undefined,
        filial: vagaFull.filial ?? undefined,
        tipo: vagaFull.tipo ?? undefined,
        modalidade: vagaFull.modalidade ?? undefined,
        posicoes: vagaFull.posicoes ?? undefined,
        beneficios: vagaFull.beneficios ?? undefined,
        descricao: vagaFull.descricao ?? undefined,
        local_trabalho: vagaFull.local_trabalho ?? undefined,
        nivel: vagaFull.nivel ?? undefined,
        turno: vagaFull.turno ?? undefined,
        tipo_contrato: vagaFull.tipo_contrato ?? undefined,
        carga_horaria: vagaFull.carga_horaria ?? undefined,
        salario_de: vagaFull.salario_de ?? undefined,
        salario_ate: vagaFull.salario_ate ?? undefined,
        confidencial: vagaFull.confidencial,
        salario_fixo: vagaFull.salario_fixo,
        responsavel_id: vagaFull.responsavel_id ?? undefined,
        disc_habilitado: vagaFull.disc_habilitado,
        perguntas_customizadas_habilitado: vagaFull.perguntas_customizadas_habilitado,
        sla_dias: vagaFull.sla_dias ?? undefined,
        sla_urgente: vagaFull.sla_urgente ?? undefined,
        sla_taxa_urgencia: vagaFull.sla_taxa_urgencia ?? undefined,
        sla_nivel: vagaFull.sla_nivel ?? undefined,
        sla_modulo: vagaFull.sla_modulo ?? undefined,
        avulsa_solicitante_nome: vagaFull.avulsa_solicitante_nome ?? undefined,
        avulsa_solicitante_cargo: vagaFull.avulsa_solicitante_cargo ?? undefined,
        avulsa_solicitante_telefone: vagaFull.avulsa_solicitante_telefone ?? undefined,
        avulsa_solicitante_email: vagaFull.avulsa_solicitante_email ?? undefined,
      });
      if (vagaFull.perguntas_customizadas_habilitado) {
        const { data: perguntas } = await (supabase as any)
          .from("vaga_perguntas_customizadas")
          .select("pergunta, tipo, obrigatoria, ordem")
          .eq("job_id", vagaFull.id)
          .order("ordem");
        if (perguntas && perguntas.length > 0) {
          await (supabase as any)
            .from("vaga_perguntas_customizadas")
            .insert((perguntas as { pergunta: string; tipo: string; obrigatoria: boolean; ordem: number }[]).map((q) => ({
              job_id: nova.id,
              pergunta: q.pergunta,
              tipo: q.tipo,
              obrigatoria: q.obrigatoria,
              ordem: q.ordem,
            })));
        }
      }
      toast.success("Vaga duplicada com sucesso.", { id: tid });
      navigate(`/app/atracao/${nova.id}`);
    } catch (err) {
      toast.error("Falha ao duplicar: " + (err instanceof Error ? err.message : "erro desconhecido"), { id: tid, duration: 8000 });
    }
  }

  useEffect(() => { recarregarVagas(); }, []);

  useEffect(() => {
    (supabase as any).from("users_profile").select("id, full_name, avatar_url, job_title, email, role").order("full_name")
      .then(({ data }: any) => setConsultoresVaga(
        (data ?? [])
          .filter((d: any) => d.role === "azumi_admin" || d.role === "azumi_consultor")
          .map((d: any) => ({ id: d.id, full_name: d.full_name ?? "—", avatar_url: d.avatar_url ?? null, job_title: d.job_title ?? null, email: d.email ?? null }))
      ));
  }, []);

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
  const [consultoresVaga, setConsultoresVaga] = useState<{ id: string; full_name: string; avatar_url: string | null; job_title: string | null; email: string | null }[]>([]);
  const [nResponsavelId, setNResponsavelId] = useState("");
  const [nDiscHabilitado, setNDiscHabilitado] = useState(true);
  const [nPerguntasHabilitado, setNPerguntasHabilitado] = useState(false);
  const [nPerguntas, setNPerguntas] = useState<{ texto: string; obrigatoria: boolean }[]>([]);
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

  // SLA motor
  type SlaRegra = { id: string; modulo: string; nivel: string; dias_uteis: number; ordem: number };
  type SlaExcecao = { dias_uteis: number; isento_taxa_urgencia: boolean; restrito_operacional: boolean; nivel: string | null };
  const [slaRegras, setSlaRegras] = useState<SlaRegra[]>([]);
  const [slaExcecao, setSlaExcecao] = useState<SlaExcecao | null>(null);
  const [nSlaRegra, setNSlaRegra] = useState("");
  const [nSlaDias, setNSlaDias] = useState("");
  const [nSlaAltaGestao, setNSlaAltaGestao] = useState(false);
  const [nUrgente, setNUrgente] = useState(false);
  const [nSlaTaxa, setNSlaTaxa] = useState("300");

  // Filtros do kanban/lista
  const [filtrosOpen, setFiltrosOpen] = useState(false);
  const [filtroStatus, setFiltroStatus] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroConsultorId, setFiltroConsultorId] = useState("");
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
  const [pubModoSalario, setPubModoSalario] = useState<"combinar" | "a_partir" | "fixo">("combinar");
  const [pubSalarioValor, setPubSalarioValor] = useState("");
  const [pubDescricao, setPubDescricao] = useState("");
  const pubDescricaoRef = useRef<HTMLTextAreaElement>(null);

  // Load client SLA exception when a registered company is selected
  useEffect(() => {
    if (tipoEmpresa !== "cadastrada" || !empresaCadastradaId) {
      setSlaExcecao(null);
      return;
    }
    (supabase as any)
      .from("sla_excecoes_cliente")
      .select("dias_uteis, isento_taxa_urgencia, restrito_operacional, nivel")
      .eq("empresa_id", empresaCadastradaId)
      .maybeSingle()
      .then(({ data }: { data: SlaExcecao | null }) => setSlaExcecao(data ?? null));
  }, [tipoEmpresa, empresaCadastradaId]);

  // Reset SLA when tipo changes (different module → different levels)
  useEffect(() => {
    setNSlaRegra("");
    setNSlaDias("");
    setNSlaAltaGestao(false);
    setNUrgente(false);
  }, [nTipo]);

  useEffect(() => {
    if (!novaVagaOpen) return;
    supabase.from("companies").select("id, name").eq("status", "active").order("name")
      .then(({ data }) => setEmpresasCadastradas(data ?? []));
    (supabase as any).from("users_profile").select("id, full_name, avatar_url, job_title, email, role").order("full_name")
      .then(({ data }: any) => setConsultoresVaga(
        (data ?? [])
          .filter((d: any) => d.role === "azumi_admin" || d.role === "azumi_consultor")
          .map((d: any) => ({ id: d.id, full_name: d.full_name ?? "—", avatar_url: d.avatar_url ?? null, job_title: d.job_title ?? null, email: d.email ?? null }))
      ));
    (supabase as any).from("sla_regras").select("id, modulo, nivel, dias_uteis, ordem").order("modulo").order("ordem")
      .then(({ data }: { data: SlaRegra[] | null }) => setSlaRegras(data ?? []));
  }, [novaVagaOpen]);

  function resetNovaVaga() {
    setTipoEmpresa("avulsa"); setEmpresaCadastradaId("");
    setNTitulo(""); setNEmpresa(""); setNFilial("");
    setNTipo("operacional"); setNModalidade("presencial");
    setNPosicoes("1"); setNBeneficios([]); setNOutrosBeneficios(""); setNDescricao("");
    setAvulsaContatoNome(""); setAvulsaContatoCargo(""); setAvulsaContatoTelefone(""); setAvulsaContatoEmail("");
    setNResponsavelId("");
    setNDiscHabilitado(true);
    setNPerguntasHabilitado(false);
    setNPerguntas([]);
    setNSlaRegra(""); setNSlaDias(""); setNSlaAltaGestao(false);
    setNUrgente(false); setNSlaTaxa("300"); setSlaExcecao(null);
    setPubAberto(false); setPubPublicar(false); setPubConfidencial(false);
    setPubLocal(""); setPubModalidade("presencial"); setPubNivel("pleno");
    setPubTurno("integral"); setPubContrato("clt"); setPubCarga("");
    setPubSalDe(""); setPubSalAte(""); setPubACombinar(false); setPubDescricao("");
  }

  // SLA helpers
  const slaModulo = nTipo === "hunting" ? "hunting" : "atracao";
  const slaRegrasDoModulo = slaRegras.filter((r) => r.modulo === slaModulo);
  const slaRegraAtual = slaRegras.find((r) => r.id === nSlaRegra) ?? null;

  function isExcecaoAplicavel(): boolean {
    if (!slaExcecao || !slaRegraAtual) return false;
    return !slaExcecao.restrito_operacional || slaRegraAtual.ordem <= 2;
  }

  const excecaoAplicavel = isExcecaoAplicavel();
  const urgenteIsentoTaxa = nUrgente && excecaoAplicavel && !!slaExcecao?.isento_taxa_urgencia;

  function onSlaRegraChange(regraId: string) {
    setNSlaRegra(regraId);
    setNUrgente(false);
    const regra = slaRegras.find((r) => r.id === regraId);
    if (!regra) { setNSlaDias(""); setNSlaAltaGestao(false); return; }
    if (regra.dias_uteis === 0) { setNSlaAltaGestao(true); setNSlaDias(""); return; }
    setNSlaAltaGestao(false);
    setNSlaDias(String(regra.dias_uteis));
  }

  function onUrgenteChange(checked: boolean) {
    setNUrgente(checked);
    if (!checked) {
      // Restore standard SLA
      if (slaRegraAtual && slaRegraAtual.dias_uteis > 0) setNSlaDias(String(slaRegraAtual.dias_uteis));
      return;
    }
    // Apply exception for urgente if applicable
    if (slaExcecao && isExcecaoAplicavel()) {
      setNSlaDias(String(slaExcecao.dias_uteis));
    }
    // No exception → leave dias as-is (editable suggestion)
  }

  // Validação de plano: Hunt Executivo bloqueado no plano Ongoing.
  const [planoEmpresaSelecionada, setPlanoEmpresaSelecionada] = useState<string | null>(null);
  useEffect(() => {
    if (tipoEmpresa !== "cadastrada" || !empresaCadastradaId) {
      setPlanoEmpresaSelecionada(null);
      return;
    }
    supabase.from("companies").select("plan").eq("id", empresaCadastradaId).maybeSingle()
      .then(({ data }) => setPlanoEmpresaSelecionada(data?.plan ?? null));
  }, [tipoEmpresa, empresaCadastradaId]);
  const huntBloqueado = nTipo === "hunting" && planoEmpresaSelecionada === "ongoing";

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

  const consultoresListados = useMemo(
    () => Array.from(new Set(vagas.map((v) => (v as any).consultor).filter(Boolean))).sort() as string[],
    [vagas],
  );

  const temFiltrosAtivos = !!(filtroStatus || filtroTipo || filtroConsultorId);

  const vagasAtivas = useMemo(() => {
    return vagas
      .filter((v) => v.status !== "standby" && v.status !== "cancelada" && v.status !== "concluida")
      .filter((v) => !filtroStatus || v.status === filtroStatus)
      .filter((v) => !filtroTipo || (v as any).tipo === filtroTipo)
      .filter((v) => !filtroConsultorId || (v as any).consultor === filtroConsultorId);
  }, [vagas, filtroStatus, filtroTipo, filtroConsultorId]);
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
            <Popover open={filtrosOpen} onOpenChange={setFiltrosOpen}>
              <PopoverTrigger asChild>
                <button className="h-9 px-3 rounded-full border border-border hover:bg-secondary text-sm flex items-center gap-1.5">
                  <iconify-icon icon="solar:tuning-2-bold-duotone" width="16" height="16" /> Filtros
                  {temFiltrosAtivos && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                </button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-72 space-y-4 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Filtrar vagas</p>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Status</label>
                  <select
                    value={filtroStatus}
                    onChange={(e) => setFiltroStatus(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="">Todos os status</option>
                    <option value="ativa">Ativa</option>
                    <option value="standby">Standby</option>
                    <option value="cancelada">Cancelada</option>
                    <option value="concluida">Concluída</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Tipo</label>
                  <select
                    value={filtroTipo}
                    onChange={(e) => setFiltroTipo(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="">Todos os tipos</option>
                    <option value="operacional">Operacional</option>
                    <option value="tatico">Tático</option>
                    <option value="gestao">Gestão</option>
                    <option value="hunting">Hunt Executivo</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Consultor responsável</label>
                  <select
                    value={filtroConsultorId}
                    onChange={(e) => setFiltroConsultorId(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="">Todos os consultores</option>
                    {consultoresListados.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                {temFiltrosAtivos && (
                  <button
                    type="button"
                    onClick={() => { setFiltroStatus(""); setFiltroTipo(""); setFiltroConsultorId(""); }}
                    className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
                  >
                    Limpar filtros
                  </button>
                )}
              </PopoverContent>
            </Popover>
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
          label="Distribuição de vagas por etapa"
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
                            <div className="mt-3 pt-2 border-t border-border flex items-center gap-1.5 justify-between">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <ConsultorAvatar url={v.consultor_avatar_url} iniciais={consultorIniciais} size="sm" />
                                <span className="text-[10px] text-muted-foreground truncate">{v.consultor}</span>
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <button
                                    onClick={(e) => e.stopPropagation()}
                                    className="h-5 w-5 rounded flex items-center justify-center hover:bg-secondary text-muted-foreground shrink-0"
                                  >
                                    <MoreVertical className="h-3.5 w-3.5" />
                                  </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-40" onClick={(e) => e.stopPropagation()}>
                                  <DropdownMenuItem className="gap-2" onClick={() => navigate(`/app/atracao/${v.id}`)}>
                                    <iconify-icon icon="solar:eye-bold-duotone" width="16" height="16" /> Ver vaga
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="gap-2" onClick={() => handleDuplicarVaga(v.id)}>
                                    <iconify-icon icon="solar:copy-bold-duotone" width="16" height="16" /> Duplicar
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
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
                <th className="text-left font-semibold px-4 py-4">Consultor</th>
                <th className="text-right font-semibold px-4 py-4">Candidatos</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody>
              {vagasAtivas.map((v) => (
                <tr key={v.id} className="border-b border-border last:border-0 hover:bg-muted/40 transition-colors">
                  <td className="px-4 py-3.5">
                    <Link to={`/app/atracao/${v.id}`} className="flex items-center gap-3 group">
                      <ConsultorAvatar
                        url={v.consultor_avatar_url}
                        iniciais={v.consultor?.split(" ").map((n) => n[0]).slice(0, 2).join("") ?? "AZ"}
                        size="lg"
                      />

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
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <ConsultorAvatar url={v.consultor_avatar_url} iniciais={v.consultor?.split(" ").map((n) => n[0]).slice(0, 2).join("") ?? "AZ"} size="sm" />
                      <span className="text-xs text-muted-foreground truncate max-w-[120px]">{v.consultor ?? "Não atribuído"}</span>
                    </div>
                  </td>
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
                        <DropdownMenuItem className="gap-2" onClick={() => handleDuplicarVaga(v.id)}>
                          <iconify-icon icon="solar:copy-bold-duotone" width="16" height="16" /> Duplicar
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
              <Label>Consultor responsável</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex h-10 w-full items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring text-left">
                    {nResponsavelId ? (() => {
                      const sel = consultoresVaga.find((c) => c.id === nResponsavelId);
                      return sel ? (
                        <>
                          {sel.avatar_url
                            ? <img src={sel.avatar_url} className="h-6 w-6 rounded-full object-cover flex-shrink-0" />
                            : <span className="h-6 w-6 rounded-full bg-primary/20 text-primary text-[10px] font-semibold flex items-center justify-center flex-shrink-0">{sel.full_name.split(" ").map((n) => n[0]).slice(0, 2).join("")}</span>
                          }
                          <span className="flex-1 truncate">{sel.full_name}</span>
                        </>
                      ) : null;
                    })() : <span className="flex-1 text-muted-foreground">Selecione o consultor…</span>}
                    <ChevronDown className="ml-auto h-4 w-4 text-muted-foreground flex-shrink-0" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)]">
                  <DropdownMenuItem onSelect={() => setNResponsavelId("")}>
                    <span className="text-muted-foreground text-sm">Nenhum (sem responsável)</span>
                  </DropdownMenuItem>
                  {consultoresVaga.map((c) => (
                    <DropdownMenuItem key={c.id} onSelect={() => setNResponsavelId(c.id)} className="flex items-center gap-2 py-2">
                      {c.avatar_url
                        ? <img src={c.avatar_url} className="h-7 w-7 rounded-full object-cover flex-shrink-0" />
                        : <span className="h-7 w-7 rounded-full bg-primary/20 text-primary text-xs font-semibold flex items-center justify-center flex-shrink-0">{c.full_name.split(" ").map((n) => n[0]).slice(0, 2).join("")}</span>
                      }
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-medium truncate">{c.full_name}</span>
                        {c.job_title && <span className="text-xs text-muted-foreground truncate">{c.job_title}</span>}
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* DISC habilitado */}
            <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
              <div>
                <p className="text-sm font-medium text-foreground">Solicitar teste DISC</p>
                <p className="text-xs text-muted-foreground">O candidato fará o Perfil Comportamental ao se candidatar</p>
              </div>
              <Switch checked={nDiscHabilitado} onCheckedChange={setNDiscHabilitado} />
            </div>

            {/* Perguntas customizadas */}
            <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
              <div>
                <p className="text-sm font-medium text-foreground">Perguntas customizadas</p>
                <p className="text-xs text-muted-foreground">O candidato responderá perguntas específicas desta vaga ao se candidatar</p>
              </div>
              <Switch checked={nPerguntasHabilitado} onCheckedChange={setNPerguntasHabilitado} />
            </div>

            {nPerguntasHabilitado && (
              <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-foreground">Perguntas</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setNPerguntas((p) => [...p, { texto: "", obrigatoria: true }])}
                    disabled={nPerguntas.length >= 10}
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" /> Adicionar
                  </Button>
                </div>
                {nPerguntas.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-2">Nenhuma pergunta. Clique em "Adicionar" para criar.</p>
                ) : (
                  nPerguntas.map((q, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <Input
                        value={q.texto}
                        onChange={(e) => setNPerguntas((p) => p.map((x, j) => j === i ? { ...x, texto: e.target.value } : x))}
                        placeholder={`Pergunta ${i + 1}…`}
                        className="flex-1"
                      />
                      <div className="flex items-center gap-2 shrink-0 pt-2">
                        <label className="flex items-center gap-1.5 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={q.obrigatoria}
                            onChange={(e) => setNPerguntas((p) => p.map((x, j) => j === i ? { ...x, obrigatoria: e.target.checked } : x))}
                            className="h-3.5 w-3.5 accent-primary"
                          />
                          <span className="text-xs text-muted-foreground">Obrig.</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => setNPerguntas((p) => p.filter((_, j) => j !== i))}
                          className="text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

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
                        {t.value === "hunting" && planoEmpresaSelecionada === "ongoing" &&
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

            {/* ── SLA e prazo ─────────────────────────────────────────── */}
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground pt-1">SLA e prazo</p>

            {/* Nível SLA */}
            <div className="space-y-2">
              <Label>Nível da vaga <span className="text-xs font-normal text-muted-foreground">(define o prazo padrão)</span></Label>
              <select
                value={nSlaRegra}
                onChange={(e) => onSlaRegraChange(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Selecione o nível…</option>
                {slaRegrasDoModulo.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.nivel}{r.dias_uteis > 0 ? ` — ${r.dias_uteis} dias úteis` : " — prazo a definir"}
                  </option>
                ))}
              </select>
            </div>

            {/* Prazo em dias */}
            {nSlaRegra && (
              <div className="space-y-2">
                <Label>
                  {nSlaAltaGestao ? "Prazo — negociado via proposta formal" : "Prazo calculado (dias úteis)"}
                </Label>
                {nSlaAltaGestao ? (
                  <Input
                    type="text"
                    value={nSlaDias}
                    onChange={(e) => setNSlaDias(e.target.value)}
                    placeholder="A definir via proposta formal"
                  />
                ) : (
                  <div className="flex items-center gap-3">
                    <Input
                      type="number"
                      min={1}
                      value={nSlaDias}
                      onChange={(e) => setNSlaDias(e.target.value)}
                      className="w-28"
                    />
                    <span className="text-sm text-muted-foreground">dias úteis</span>
                    {excecaoAplicavel && !nUrgente && (
                      <span className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                        Acordo especial do cliente
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Toggle urgente */}
            {nSlaRegra && !nSlaAltaGestao && (
              <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-foreground">Vaga com prazo de urgência</p>
                  <p className="text-xs text-muted-foreground">
                    {urgenteIsentoTaxa
                      ? "Prazo preferencial do cliente aplicado — sem cobrança de taxa."
                      : "Reduz o SLA com prioridade máxima. Taxa de urgência será cobrada."}
                  </p>
                </div>
                <Switch checked={nUrgente} onCheckedChange={onUrgenteChange} />
              </div>
            )}

            {/* Taxa de urgência */}
            {nUrgente && !urgenteIsentoTaxa && (
              <div className="space-y-2">
                <Label>Taxa de urgência</Label>
                <Select value={nSlaTaxa} onValueChange={setNSlaTaxa}>
                  <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="300">R$ 300,00</SelectItem>
                    <SelectItem value="500">R$ 500,00</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

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
                        <div className="flex gap-2">
                          {(["combinar", "a_partir", "fixo"] as const).map((modo) => (
                            <button
                              key={modo}
                              type="button"
                              onClick={() => setPubModoSalario(modo)}
                              className={`flex-1 h-8 rounded-md border text-xs font-medium transition-colors ${pubModoSalario === modo ? "bg-primary text-primary-foreground border-primary" : "border-border bg-background text-muted-foreground hover:bg-secondary"}`}
                            >
                              {modo === "combinar" ? "A combinar" : modo === "a_partir" ? "A partir de" : "Fixo"}
                            </button>
                          ))}
                        </div>
                        {pubModoSalario !== "combinar" && (
                          <Input
                            type="number"
                            value={pubSalarioValor}
                            onChange={(e) => setPubSalarioValor(e.target.value)}
                            placeholder={pubModoSalario === "a_partir" ? "Valor mínimo (R$)" : "Valor exato (R$)"}
                          />
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>Descrição da vaga para o site *</Label>
                          <button
                            type="button"
                            title="Negrito (envolve o texto selecionado)"
                            onClick={() => {
                              const el = pubDescricaoRef.current;
                              if (!el) return;
                              const start = el.selectionStart;
                              const end = el.selectionEnd;
                              const antes = pubDescricao.slice(0, start);
                              const selecionado = pubDescricao.slice(start, end);
                              const depois = pubDescricao.slice(end);
                              const novo = `${antes}**${selecionado || "texto"}**${depois}`;
                              setPubDescricao(novo);
                              requestAnimationFrame(() => {
                                el.focus();
                                const novoInicio = start + 2;
                                const novoFim = novoInicio + (selecionado || "texto").length;
                                el.setSelectionRange(novoInicio, novoFim);
                              });
                            }}
                            className="h-6 w-6 rounded flex items-center justify-center text-xs font-bold border border-border hover:bg-secondary text-foreground"
                          >
                            B
                          </button>
                        </div>
                        <Textarea
                          ref={pubDescricaoRef}
                          value={pubDescricao}
                          onChange={(e) => setPubDescricao(e.target.value)}
                          placeholder="O que o candidato verá na página pública da vaga."
                          rows={5}
                        />
                        <p className="text-[11px] text-muted-foreground">
                          Use <strong>**texto**</strong> pra negrito e <em>*texto*</em> pra itálico. Linhas
                          começando com "- " viram lista. Emoji: use o atalho do seu teclado (Cmd+Ctrl+Espaço no Mac,
                          Win+. no Windows) e cole direto no texto.
                        </p>
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
                const perguntasParaSalvar = nPerguntasHabilitado
                  ? nPerguntas.filter((q) => q.texto.trim())
                  : [];
                const tid = toast.loading(`Salvando "${titulo}"…`);
                try {
                  const slaDiasNum = nSlaAltaGestao
                    ? (nSlaDias ? parseInt(nSlaDias) || null : null)
                    : (nSlaDias ? parseInt(nSlaDias) : undefined);

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
                    salario_de: pubModoSalario !== "combinar" && pubSalarioValor ? Number(pubSalarioValor) : undefined,
                    salario_ate: pubModoSalario === "fixo" && pubSalarioValor ? Number(pubSalarioValor) : undefined,
                    confidencial: pubConfidencial,
                    salario_fixo: pubModoSalario === "fixo",
                    responsavel_id: nResponsavelId || null,
                    disc_habilitado: nDiscHabilitado,
                    perguntas_customizadas_habilitado: nPerguntasHabilitado,
                    sla_dias: slaDiasNum,
                    sla_urgente: nUrgente,
                    sla_taxa_urgencia: (nUrgente && !urgenteIsentoTaxa && nSlaTaxa) ? Number(nSlaTaxa) : null,
                    sla_nivel: slaRegraAtual?.nivel ?? null,
                    sla_modulo: nSlaRegra ? slaModulo : null,
                  });
                  if (pubPublicar) {
                    await publicarVaga(vagaCriada.id);
                  }
                  if (nResponsavelId) {
                    const cons = consultoresVaga.find((c) => c.id === nResponsavelId);
                    if (cons?.email) {
                      const linkVaga = `${window.location.origin}/app/atracao/${vagaCriada.id}`;
                      const empresaNome = (nEmpresa.trim() || empresasCadastradas.find((e) => e.id === empresaCadastradaId)?.name) ?? "—";
                      sendEmail(cons.email, `Nova vaga: ${titulo}`, emailAtribuicaoVaga({ nomeConsultor: cons.full_name, tituloVaga: titulo, empresa: empresaNome, linkVaga }));
                    }
                  }
                  if (perguntasParaSalvar.length > 0) {
                    const { error: erroPerguntas } = await (supabase as any)
                      .from("vaga_perguntas_customizadas")
                      .insert(perguntasParaSalvar.map((q, i) => ({
                        job_id: vagaCriada.id,
                        pergunta: q.texto,
                        tipo: "texto",
                        obrigatoria: q.obrigatoria,
                        ordem: i + 1,
                      })));
                    if (erroPerguntas) {
                      toast.error("Erro ao salvar perguntas customizadas: " + erroPerguntas.message);
                    }
                  }
                  toast.success(`Vaga "${titulo}" criada.`, { id: tid,
                    description: pubPublicar ? "Vaga publicada no site." : "Status: Briefing. Complete o preenchimento antes de publicar." });
                  setNovaVagaOpen(false);
                  resetNovaVaga();
                  recarregarVagas();
                } catch (err) {
                  console.error("[criarVaga]", err);
                  toast.error("Falha ao criar vaga: " + (err instanceof Error ? err.message : "erro desconhecido"), { id: tid, duration: 8000 });
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
