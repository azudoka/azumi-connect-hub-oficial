import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { X, Search, AlertCircle, Eye, Link as LinkIcon, ChevronDown } from "lucide-react";
import {
  STATUS_LABEL,
  DISC_COR,
  type TalentoCandidato,
  type StatusTalento,
  type DiscDimMock,
} from "@/data/bancoTalentosMock";
import { supabase } from "@/integrations/supabase/client";
import FichaCandidatoModal from "@/components/candidatura/FichaCandidatoModal";

interface CandidatoBanco {
  id: string;
  nome: string;
  email: string | null;
  telefone: string | null;
  cidade: string | null;
  escolaridade: string | null;
  etapa_azumi: string | null;
  linkedin: string | null;
  foto_url: string | null;
  updated_at: string;
  // embed via FK candidates.job_id → job_solicitations.id (many-to-one → objeto)
  job_solicitations?: { cargo: string } | null;
  disc_resultado_candidato?: Array<{
    fator_predominante: string | null;
    score_d: number | null;
    score_i: number | null;
    score_s: number | null;
    score_c: number | null;
  }>;
}

function statusDoTalento(etapa: string | null): StatusTalento {
  if (etapa === "contratado") return "contratado";
  if (etapa === "recebido" || etapa === "reprovado" || !etapa) return "disponivel";
  return "em_processo";
}

function toView(t: CandidatoBanco): TalentoCandidato {
  const disc = t.disc_resultado_candidato?.[0];
  const perfil = (disc?.fator_predominante ?? "D") as DiscDimMock;
  // job_solicitations pode vir como objeto (many-to-one) ou array (PostgREST ambíguo)
  const js = t.job_solicitations;
  const cargo = Array.isArray(js) ? (js[0]?.cargo ?? "—") : (js?.cargo ?? "—");
  return {
    id: t.id,
    nome: t.nome,
    email: t.email ?? "—",
    telefone: t.telefone ?? "—",
    cargoPretendido: cargo,
    cidade: t.cidade ?? "—",
    escolaridade: t.escolaridade ?? "—",
    perfilDisc: perfil,
    scoresDisc: {
      D: disc?.score_d ?? 0,
      I: disc?.score_i ?? 0,
      S: disc?.score_s ?? 0,
      C: disc?.score_c ?? 0,
    },
    status: statusDoTalento(t.etapa_azumi),
    ultimaInteracao: t.updated_at,
    fotoUrl: t.foto_url ?? undefined,
    linkedin: t.linkedin ?? undefined,
    historico: [],
    contratoDesejado: "—",
    disponibilidade: "—",
  };
}

interface Props {
  open: boolean;
  onClose: () => void;
}

const STATUS_BG: Record<StatusTalento, string> = {
  disponivel: "bg-emerald-100 text-emerald-700",
  em_processo: "bg-blue-100 text-blue-700",
  contratado: "bg-amber-100 text-amber-800",
};

function fmtData(iso: string) {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (d <= 0) return "Hoje";
  if (d === 1) return "1 dia";
  if (d < 30) return `${d} dias`;
  return new Date(iso).toLocaleDateString("pt-BR");
}

export default function BancoTalentosDrawer({ open, onClose }: Props) {
  const [busca, setBusca] = useState("");
  const [perfilFiltro, setPerfilFiltro] = useState<"" | DiscDimMock>("");
  const [statusFiltro, setStatusFiltro] = useState<"" | StatusTalento>("");
  const [cidadeFiltro, setCidadeFiltro] = useState("");
  const [cargoFiltro, setCargoFiltro] = useState("");
  const [selecionado, setSelecionado] = useState<TalentoCandidato | null>(null);
  const [talentos, setTalentos] = useState<CandidatoBanco[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [vincularTarget, setVincularTarget] = useState<{ id: string; nome: string } | null>(null);
  const [vagasAbertas, setVagasAbertas] = useState<{ id: string; cargo: string; empresa: string | null }[]>([]);
  const [vagaVincularId, setVagaVincularId] = useState("");
  const [vinculando, setVinculando] = useState(false);

  useEffect(() => {
    if (!open) return;
    setCarregando(true);
    supabase
      .from("candidates")
      .select("id, nome, email, telefone, cidade, escolaridade, etapa_azumi, linkedin, foto_url, updated_at, job_solicitations(cargo), disc_resultado_candidato(score_d, score_i, score_s, score_c, fator_predominante)")
      .eq("banco_talentos", true)
      .order("updated_at", { ascending: false })
      .then(({ data, error }) => {
        setCarregando(false);
        if (error) {
          console.error("[bancoTalentos] erro completo:", JSON.stringify(error, null, 2));
          toast.error("Erro ao carregar Banco de Talentos: " + error.message);
          return;
        }
        setTalentos((data ?? []) as unknown as CandidatoBanco[]);
      });
  }, [open]);

  const talentosView = useMemo(() => talentos.map(toView), [talentos]);

  const cidades = useMemo(() => Array.from(new Set(talentosView.map((t) => t.cidade))).sort(), [talentosView]);
  const cargos = useMemo(() => Array.from(new Set(talentosView.map((t) => t.cargoPretendido))).sort(), [talentosView]);

  const filtrados = useMemo(() => {
    return talentosView.filter((t) => {
      if (busca) {
        const q = busca.toLowerCase();
        if (!t.nome.toLowerCase().includes(q) && !t.email.toLowerCase().includes(q)) return false;
      }
      if (perfilFiltro && t.perfilDisc !== perfilFiltro) return false;
      if (statusFiltro && t.status !== statusFiltro) return false;
      if (cidadeFiltro && t.cidade !== cidadeFiltro) return false;
      if (cargoFiltro && t.cargoPretendido !== cargoFiltro) return false;
      return true;
    });
  }, [talentosView, busca, perfilFiltro, statusFiltro, cidadeFiltro, cargoFiltro]);

  useEffect(() => {
    if (!vincularTarget) return;
    setVagaVincularId("");
    (supabase as any).from("job_solicitations")
      .select("id, cargo, avulsa_empresa_nome")
      .eq("status", "em_processo")
      .is("encerrada_em", null)
      .order("cargo")
      .then(({ data }: { data: any[] | null }) =>
        setVagasAbertas((data ?? []).map((v) => ({ id: v.id, cargo: v.cargo ?? "—", empresa: v.avulsa_empresa_nome ?? null })))
      );
  }, [vincularTarget]);

  async function confirmarVinculo() {
    if (!vincularTarget || !vagaVincularId) return;
    setVinculando(true);
    const { error } = await supabase.from("candidates")
      .update({ job_id: vagaVincularId, banco_talentos: false, etapa_azumi: "recebido" } as any)
      .eq("id", vincularTarget.id);
    setVinculando(false);
    if (error) { toast.error("Erro ao vincular: " + error.message); return; }
    toast.success(`${vincularTarget.nome} vinculado(a) à vaga.`);
    setTalentos((prev) => prev.filter((t) => t.id !== vincularTarget.id));
    setSelecionado(null);
    setVincularTarget(null);
  }

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[90] flex justify-end bg-black/50">
      <div className="relative flex h-full w-full max-w-5xl flex-col bg-background shadow-elevated">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Banco de Talentos</h2>
            <p className="text-xs text-muted-foreground">{filtrados.length} candidatos · {talentos.length} no total</p>
          </div>
          <button onClick={onClose} className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Filtros */}
        <div className="border-b border-border bg-secondary/30 px-6 py-3">
          <div className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_140px_140px_160px_160px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar por nome ou email…"
                className="h-9 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm focus:outline-none focus:border-primary"
              />
            </div>
            <select value={perfilFiltro} onChange={(e) => setPerfilFiltro(e.target.value as "" | DiscDimMock)} className="h-9 rounded-lg border border-border bg-background px-2 text-sm">
              <option value="">DISC: todos</option>
              <option value="D">D — Executor</option>
              <option value="I">I — Comunicador</option>
              <option value="S">S — Planejador</option>
              <option value="C">C — Analista</option>
            </select>
            <select value={statusFiltro} onChange={(e) => setStatusFiltro(e.target.value as "" | StatusTalento)} className="h-9 rounded-lg border border-border bg-background px-2 text-sm">
              <option value="">Status: todos</option>
              <option value="disponivel">Disponível</option>
              <option value="em_processo">Em processo</option>
              <option value="contratado">Contratado</option>
            </select>
            <select value={cidadeFiltro} onChange={(e) => setCidadeFiltro(e.target.value)} className="h-9 rounded-lg border border-border bg-background px-2 text-sm">
              <option value="">Todas cidades</option>
              {cidades.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={cargoFiltro} onChange={(e) => setCargoFiltro(e.target.value)} className="h-9 rounded-lg border border-border bg-background px-2 text-sm">
              <option value="">Todos cargos</option>
              {cargos.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* Tabela */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-secondary/50 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-6 py-3 text-left font-medium">Candidato</th>
                <th className="px-3 py-3 text-left font-medium">Cargo</th>
                <th className="px-3 py-3 text-left font-medium">Cidade</th>
                <th className="px-3 py-3 text-left font-medium">Escolaridade</th>
                <th className="px-3 py-3 text-left font-medium">DISC</th>
                <th className="px-3 py-3 text-left font-medium">Status</th>
                <th className="px-3 py-3 text-left font-medium">Última interação</th>
                <th className="px-6 py-3 text-right font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {carregando && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-sm text-muted-foreground">
                    Carregando…
                  </td>
                </tr>
              )}
              {!carregando && filtrados.map((t) => (
                <tr
                  key={t.id}
                  onClick={() => setSelecionado(t)}
                  className="cursor-pointer border-t border-border hover:bg-secondary/40"
                >
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      {t.fotoUrl ? (
                        <img src={t.fotoUrl} alt="" className="h-9 w-9 shrink-0 rounded-lg object-cover" />
                      ) : (
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-xs font-semibold text-muted-foreground">
                          {t.nome.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="truncate font-medium text-foreground">{t.nome}</p>
                        <p className="truncate text-xs text-muted-foreground">{t.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-foreground">{t.cargoPretendido}</td>
                  <td className="px-3 py-3 text-muted-foreground">{t.cidade}</td>
                  <td className="px-3 py-3 text-muted-foreground">{t.escolaridade}</td>
                  <td className="px-3 py-3">
                    <span
                      className="inline-flex h-6 w-6 items-center justify-center rounded text-xs font-bold text-white"
                      style={{ background: DISC_COR[t.perfilDisc] }}
                    >
                      {t.perfilDisc}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BG[t.status]}`}>
                      {t.status === "contratado" && <AlertCircle className="h-3 w-3" />}
                      {STATUS_LABEL[t.status]}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-xs text-muted-foreground">{fmtData(t.ultimaInteracao)}</td>
                  <td className="px-6 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelecionado(t); }}
                        className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
                        title="Ver perfil completo"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setVincularTarget({ id: t.id, nome: t.nome }); }}
                        className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
                        title="Vincular a vaga"
                      >
                        <LinkIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!carregando && filtrados.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-sm text-muted-foreground">
                    Nenhum candidato encontrado com esses filtros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Ficha completa do candidato */}
        {selecionado && (
          <FichaCandidatoModal
            candidatoId={selecionado.id}
            onClose={() => setSelecionado(null)}
            onVincular={(id, nome) => { setSelecionado(null); setVincularTarget({ id, nome }); }}
          />
        )}

        {/* Modal: vincular a vaga */}
        {vincularTarget && createPortal(
          <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 px-4" onClick={() => setVincularTarget(null)}>
            <div className="w-full max-w-md rounded-xl bg-background shadow-elevated p-6" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-base font-semibold text-foreground mb-1">Vincular a vaga</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Selecione a vaga para associar <strong>{vincularTarget.nome}</strong>.
                O candidato sairá do Banco de Talentos e entrará no Kanban da vaga como "Recebido".
              </p>
              <div className="relative mb-4">
                <select
                  value={vagaVincularId}
                  onChange={(e) => setVagaVincularId(e.target.value)}
                  className="w-full h-10 appearance-none rounded-md border border-border bg-background px-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="">Selecione uma vaga…</option>
                  {vagasAbertas.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.cargo}{v.empresa ? ` — ${v.empresa}` : ""}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setVincularTarget(null)}
                  className="h-9 px-4 rounded-lg border border-border text-sm hover:bg-secondary"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmarVinculo}
                  disabled={!vagaVincularId || vinculando}
                  className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50"
                >
                  {vinculando ? "Vinculando…" : "Confirmar"}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
      </div>
    </div>,
    document.body
  );
}

// DrawerDetalhe e Linha removidos — substituídos por FichaCandidatoModal
