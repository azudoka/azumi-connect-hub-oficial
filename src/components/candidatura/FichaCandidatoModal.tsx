import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Mail, Phone, MapPin, GraduationCap, FileText, Link2, ExternalLink, Link as LinkIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { DiscRadarChart } from "@/components/disc/DiscRadarChart";
import { getDiscInterpretacao } from "@/components/disc/discProfileContent";

type DiscDim = "D" | "I" | "S" | "C";
const COR: Record<DiscDim, string> = { D: "#ef4444", I: "#f59e0b", S: "#10b981", C: "#3b82f6" };
const isDim = (v: unknown): v is DiscDim => ["D", "I", "S", "C"].includes(v as string);

interface CandData {
  id: string;
  nome: string;
  email: string | null;
  telefone: string | null;
  linkedin: string | null;
  curriculo_url: string | null;
  foto_url: string | null;
  cpf: string | null;
  escolaridade: string | null;
  cidade: string | null;
  disc: { D: number; I: number; S: number; C: number } | null;
  discPerfil: DiscDim | null;
  discSecundario: DiscDim | null;
}

interface ProcessoItem {
  cargo: string | null;
  empresa: string | null;
  etapa: string | null;
  data: string;
}

interface Props {
  candidatoId: string;
  onClose: () => void;
  onVincular?: (id: string, nome: string) => void;
}

export default function FichaCandidatoModal({ candidatoId, onClose, onVincular }: Props) {
  const [tab, setTab] = useState<"dados" | "disc" | "processos">("dados");
  const [cand, setCand] = useState<CandData | null>(null);
  const [processos, setProcessos] = useState<ProcessoItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setCand(null);
    setProcessos([]);
    setTab("dados");
    supabase
      .from("candidates")
      .select("id, nome, email, telefone, linkedin, curriculo_url, foto_url, cpf, escolaridade, cidade, disc_resultado_candidato(score_d, score_i, score_s, score_c, fator_predominante, fator_secundario)")
      .eq("id", candidatoId)
      .single()
      .then(({ data }) => {
        if (!data) { setLoading(false); return; }
        const d = data as any;
        const disc = d.disc_resultado_candidato?.[0];
        setCand({
          id: d.id, nome: d.nome, email: d.email, telefone: d.telefone,
          linkedin: d.linkedin, curriculo_url: d.curriculo_url, foto_url: d.foto_url,
          cpf: d.cpf, escolaridade: d.escolaridade, cidade: d.cidade,
          disc: disc ? { D: disc.score_d ?? 0, I: disc.score_i ?? 0, S: disc.score_s ?? 0, C: disc.score_c ?? 0 } : null,
          discPerfil: isDim(disc?.fator_predominante) ? disc.fator_predominante : null,
          discSecundario: isDim(disc?.fator_secundario) ? disc.fator_secundario : null,
        });
        setLoading(false);
        if (d.email) {
          supabase.from("candidates")
            .select("etapa_azumi, created_at, job_solicitations(cargo, avulsa_empresa_nome)")
            .eq("email", d.email)
            .not("job_id", "is", null)
            .order("created_at", { ascending: false })
            .limit(20)
            .then(({ data: procs }) => {
              setProcessos((procs ?? []).map((p: any) => {
                const js = Array.isArray(p.job_solicitations) ? p.job_solicitations[0] : p.job_solicitations;
                return { cargo: js?.cargo ?? null, empresa: js?.avulsa_empresa_nome ?? null, etapa: p.etapa_azumi, data: p.created_at };
              }));
            });
        }
      });
  }, [candidatoId]);

  const interp = cand?.discPerfil ? getDiscInterpretacao(cand.discPerfil, cand.discSecundario) : null;
  const iniciais = cand?.nome.split(" ").map((n) => n[0]).slice(0, 2).join("") ?? "—";

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-start justify-end bg-black/50" onClick={onClose}>
      <div
        className="relative flex h-full w-full max-w-xl flex-col bg-background shadow-elevated overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {cand?.foto_url ? (
              <img src={cand.foto_url} alt="" className="h-10 w-10 rounded-lg object-cover shrink-0" />
            ) : (
              <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center text-sm font-semibold text-muted-foreground shrink-0">
                {iniciais}
              </div>
            )}
            <div className="min-w-0">
              <h3 className="font-semibold text-foreground truncate">
                {loading ? "Carregando…" : (cand?.nome ?? "Candidato")}
              </h3>
              {cand?.discPerfil && (
                <span className="inline-block text-xs font-bold text-white rounded px-1.5 py-0.5 mt-0.5"
                  style={{ background: COR[cand.discPerfil] }}>
                  DISC {cand.discPerfil}
                </span>
              )}
            </div>
          </div>
          <button onClick={onClose} className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary shrink-0">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border shrink-0">
          {(["dados", "disc", "processos"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                tab === t
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t === "dados" ? "Dados Gerais" : t === "disc" ? "Perfil DISC" : "Processos"}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto p-6">
          {loading && <p className="text-sm text-muted-foreground">Carregando…</p>}

          {!loading && tab === "dados" && cand && (
            <div className="space-y-4 text-sm">
              <InfoRow icon={Mail} label="E-mail" value={cand.email} />
              <InfoRow icon={Phone} label="Telefone" value={cand.telefone} />
              <InfoRow icon={MapPin} label="Cidade" value={cand.cidade} />
              <InfoRow icon={GraduationCap} label="Escolaridade" value={cand.escolaridade} />
              {cand.linkedin && (
                <div className="flex items-start gap-3">
                  <Link2 className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">LinkedIn</p>
                    <a href={cand.linkedin.startsWith("http") ? cand.linkedin : `https://${cand.linkedin}`}
                      target="_blank" rel="noopener noreferrer"
                      className="text-primary hover:underline truncate block text-sm">
                      {cand.linkedin.replace(/^https?:\/\//, "")}
                    </a>
                  </div>
                </div>
              )}
              {cand.curriculo_url && (
                <div className="flex items-start gap-3">
                  <FileText className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Currículo</p>
                    <a href={cand.curriculo_url} target="_blank" rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center gap-1 text-sm">
                      Abrir <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              )}
              {cand.cpf && <InfoRow icon={FileText} label="CPF" value={cand.cpf} />}
            </div>
          )}

          {!loading && tab === "disc" && cand && (
            cand.disc ? (
              <div className="space-y-5">
                <DiscRadarChart scores={cand.disc} />
                <div className="space-y-2">
                  {(["D", "I", "S", "C"] as DiscDim[]).map((d) => (
                    <div key={d} className="flex items-center gap-3">
                      <span className="w-5 text-sm font-bold" style={{ color: COR[d] }}>{d}</span>
                      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-secondary">
                        <div className="h-full rounded-full" style={{ width: `${cand.disc![d]}%`, background: COR[d] }} />
                      </div>
                      <span className="w-10 text-right text-xs tabular-nums text-muted-foreground">
                        {cand.disc![d]}%
                      </span>
                    </div>
                  ))}
                </div>
                {interp?.predominante && (
                  <div className="rounded-lg border border-border p-4 space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Perfil predominante</p>
                      <p className="font-semibold text-foreground">{interp.predominante.nome}</p>
                      <p className="text-sm text-muted-foreground mt-1">{interp.predominante.resumo}</p>
                    </div>
                    {interp.predominante.pontosFortes.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-emerald-600 mb-1">Pontos fortes</p>
                        <ul className="space-y-0.5">
                          {interp.predominante.pontosFortes.map((p, i) => (
                            <li key={i} className="text-sm text-muted-foreground">• {p}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {interp.secundario && (
                      <div className="pt-3 border-t border-border">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Perfil secundário</p>
                        <p className="text-sm font-medium" style={{ color: interp.secundario.corHex }}>{interp.secundario.nome}</p>
                        <p className="text-sm text-muted-foreground mt-0.5">{interp.secundario.resumo}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">DISC não realizado.</p>
            )
          )}

          {!loading && tab === "processos" && (
            processos.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum processo encontrado.</p>
            ) : (
              <ul className="space-y-3">
                {processos.map((p, i) => (
                  <li key={i} className="rounded-lg border border-border p-3 text-sm">
                    <p className="font-medium text-foreground">{p.cargo ?? "—"}</p>
                    {p.empresa && <p className="text-xs text-muted-foreground">{p.empresa}</p>}
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-xs bg-secondary rounded px-1.5 py-0.5 text-foreground">
                        {p.etapa ?? "—"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(p.data).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )
          )}
        </div>

        {/* Footer */}
        {onVincular && cand && (
          <div className="shrink-0 border-t border-border px-6 py-3 flex justify-end">
            <button
              onClick={() => onVincular(cand.id, cand.nome)}
              className="h-9 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90 inline-flex items-center gap-1.5"
            >
              <LinkIcon className="h-3.5 w-3.5" /> Vincular a vaga
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm text-foreground truncate">{value || "—"}</p>
      </div>
    </div>
  );
}
