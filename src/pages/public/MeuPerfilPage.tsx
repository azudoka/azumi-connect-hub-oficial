import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  MapPin, Briefcase, Linkedin, Camera, Pencil, Check, X,
  Instagram, ChevronRight, Download, Star, Lock, Mail, Phone,
  FileText, Upload,
} from "lucide-react";
import { cn } from "@/lib/utils";
import azumiLogoBranca from "@/assets/brand/azumi-logo-branca.png";

// ── Logos ─────────────────────────────────────────────────────────────────────
const CONNECT_LOGO = "https://raw.githubusercontent.com/azudoka/azumi-connect-hub-oficial/main/public/connect-logo.png";

// ── Serviços Azumi ─────────────────────────────────────────────────────────────
const SERVICOS = [
  {
    label: "Serviços para você",
    desc: "Soluções de RH pensadas para o seu desenvolvimento profissional.",
    href: "https://azumirh.com.br",
    grad: "from-[#264478] to-[#3D63B8]",
    emoji: "🧑‍💼",
  },
  {
    label: "Programa Impulso RH",
    desc: "Capacitação e crescimento para profissionais de recursos humanos.",
    href: "https://azumirh.com.br",
    grad: "from-[#0F2A4A] to-[#264478]",
    emoji: "🚀",
  },
  {
    label: "Gold Market",
    desc: "Oportunidades exclusivas para perfis em destaque.",
    href: "https://azumirh.com.br",
    grad: "from-[#3D63B8] to-[#7FA8E8]",
    emoji: "💼",
  },
];

// ── DISC ──────────────────────────────────────────────────────────────────────
const DISC_INFO: Record<string, { nome: string; cor: string; frase: string }> = {
  D: { nome: "Executor", cor: "#EF4444", frase: "Você age com velocidade porque desafios são o seu combustível." },
  I: { nome: "Comunicador", cor: "#F59E0B", frase: "Você conecta pessoas porque a energia que transmite é genuína." },
  S: { nome: "Planejador", cor: "#10B981", frase: "Você entrega consistência porque pensa antes e constrói com cuidado." },
  C: { nome: "Analista", cor: "#3B82F6", frase: "Você entrega qualidade alta porque pensa antes, mede e refina." },
};

// ── Etapas do funil ──────────────────────────────────────────────────────────
const ETAPAS = [
  { key: "recebido",           label: "Candidatura recebida",      desc: "Seus dados chegaram para a equipe Azumi" },
  { key: "triagem_inicial",    label: "Triagem",                   desc: "Análise do seu currículo" },
  { key: "questionario",       label: "Questionário",              desc: "Resposta ao questionário da vaga" },
  { key: "entrevista_azumi",   label: "Entrevista Azumi",          desc: "Entrevista com nossa consultora" },
  { key: "teste_tecnico",      label: "Teste Técnico",             desc: "Avaliação técnica, se aplicável à vaga" },
  { key: "entrevista_cliente", label: "Entrevista com a empresa",  desc: "" },
  { key: "proposta",           label: "Proposta 🎉",               desc: "" },
  { key: "contratado",         label: "Contratado 🎉",             desc: "" },
];

// ── Types ──────────────────────────────────────────────────────────────────────
interface DiscResultado {
  score_d: number; score_i: number; score_s: number; score_c: number;
  fator_predominante: string; fator_secundario: string | null;
}

interface Candidatura {
  id: string;
  etapa_azumi: string | null;
  banco_talentos: boolean;
  data_aplicacao: string | null;
  job_solicitations: { cargo: string; avulsa_empresa_nome: string | null } | null;
}

interface CandidatoData {
  id: string; nome: string; email: string | null; telefone: string | null;
  cidade: string | null; escolaridade: string | null; linkedin: string | null;
  foto_url: string | null; avatar_url: string | null; cpf: string | null;
  interesses_setores: string[] | null; interesses_cargos: string[] | null;
  observacoes: string | null; resumo_candidato: string | null;
  curriculo_url: string | null; curriculo_nome: string | null;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function calcProgresso(c: CandidatoData, disc: DiscResultado | null): number {
  const campos = [
    c.nome, c.email, c.telefone, c.linkedin,
    c.avatar_url || c.foto_url, c.escolaridade, c.cidade,
    c.observacoes, c.resumo_candidato,
    c.interesses_setores?.length, c.interesses_cargos?.length,
    disc ? "ok" : null,
  ];
  const preenchidos = campos.filter(Boolean).length;
  return Math.round((preenchidos / campos.length) * 100);
}

function fmtData(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

// ══════════════════════════════════════════════════════════════════════════════
// Page
// ══════════════════════════════════════════════════════════════════════════════
export default function MeuPerfilPage() {
  const { token } = useParams<{ token: string }>();

  const [candidato, setCandidato] = useState<CandidatoData | null>(null);
  const [disc, setDisc] = useState<DiscResultado | null>(null);
  const [candidaturas, setCandidaturas] = useState<Candidatura[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(false);

  // UI states
  const [verFinalizadas, setVerFinalizadas] = useState(false);
  const [editandoBio, setEditandoBio] = useState(false);
  const [bioRascunho, setBioRascunho] = useState("");
  const [salvandoBio, setSalvandoBio] = useState(false);
  const [editandoResumo, setEditandoResumo] = useState(false);
  const [resumoRascunho, setResumoRascunho] = useState("");
  const [salvandoResumo, setSalvandoResumo] = useState(false);
  const [editandoContato, setEditandoContato] = useState(false);
  const [telefoneDraft, setTelefoneDraft] = useState("");
  const [linkedinDraft, setLinkedinDraft] = useState("");
  const [salvandoContato, setSalvandoContato] = useState(false);
  const [uploadandoFoto, setUploadandoFoto] = useState(false);
  const [uploadandoCurriculo, setUploadandoCurriculo] = useState(false);

  const fotoInputRef = useRef<HTMLInputElement>(null);
  const curriculoInputRef = useRef<HTMLInputElement>(null);

  // Remove dark theme
  useEffect(() => {
    const html = document.documentElement;
    const had = html.classList.contains("theme-midnight");
    html.classList.remove("theme-midnight");
    return () => { if (had) html.classList.add("theme-midnight"); };
  }, []);

  // Fetch
  useEffect(() => {
    if (!token) { setErro(true); setLoading(false); return; }
    (async () => {
      const { data, error } = await supabase
        .from("candidates")
        .select("id, nome, email, telefone, cidade, escolaridade, linkedin, foto_url, avatar_url, cpf, interesses_setores, interesses_cargos, observacoes, resumo_candidato, curriculo_url, curriculo_nome, data_aplicacao")
        .eq("token_acesso_candidato" as any, token)
        .maybeSingle();

      if (error || !data) { setErro(true); setLoading(false); return; }
      const cand = data as unknown as CandidatoData;
      setCandidato(cand);
      setBioRascunho(cand.observacoes ?? "");
      setResumoRascunho(cand.resumo_candidato ?? "");
      setTelefoneDraft(cand.telefone ?? "");
      setLinkedinDraft(cand.linkedin ?? "");

      // DISC
      const { data: discData } = await supabase
        .from("disc_resultado_candidato" as any)
        .select("score_d, score_i, score_s, score_c, fator_predominante, fator_secundario")
        .eq("candidato_id", cand.id)
        .maybeSingle();
      if (discData) setDisc(discData as unknown as DiscResultado);

      // Todas as candidaturas pelo CPF
      if (cand.cpf) {
        const { data: apps } = await supabase
          .from("candidates")
          .select("id, etapa_azumi, banco_talentos, data_aplicacao, job_solicitations(cargo, avulsa_empresa_nome)")
          .eq("cpf", cand.cpf)
          .order("created_at", { ascending: false });
        if (apps) setCandidaturas(apps as unknown as Candidatura[]);
      }

      setLoading(false);
    })();
  }, [token]);

  // ── Handlers ────────────────────────────────────────────────────────────────

  async function salvarBio() {
    if (!candidato) return;
    setSalvandoBio(true);
    await supabase.from("candidates").update({ observacoes: bioRascunho || null } as any).eq("id", candidato.id);
    setCandidato((p) => p ? { ...p, observacoes: bioRascunho || null } : p);
    setSalvandoBio(false); setEditandoBio(false);
  }

  async function salvarResumo() {
    if (!candidato) return;
    setSalvandoResumo(true);
    await supabase.from("candidates").update({ resumo_candidato: resumoRascunho || null } as any).eq("id", candidato.id);
    setCandidato((p) => p ? { ...p, resumo_candidato: resumoRascunho || null } : p);
    setSalvandoResumo(false); setEditandoResumo(false);
  }

  async function salvarContato() {
    if (!candidato) return;
    setSalvandoContato(true);
    await supabase.from("candidates").update({ telefone: telefoneDraft || null, linkedin: linkedinDraft || null } as any).eq("id", candidato.id);
    setCandidato((p) => p ? { ...p, telefone: telefoneDraft || null, linkedin: linkedinDraft || null } : p);
    setSalvandoContato(false); setEditandoContato(false);
  }

  async function handleFotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !candidato) return;
    setUploadandoFoto(true);
    const ext = file.name.split(".").pop();
    const path = `avatars/${candidato.id}.${ext}`;
    const { error } = await supabase.storage.from("public-applications").upload(path, file, { upsert: true });
    if (!error) {
      const { data: u } = supabase.storage.from("public-applications").getPublicUrl(path);
      await supabase.from("candidates").update({ avatar_url: u.publicUrl } as any).eq("id", candidato.id);
      setCandidato((p) => p ? { ...p, avatar_url: u.publicUrl } : p);
    }
    setUploadandoFoto(false);
  }

  async function handleCurriculoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !candidato) return;
    setUploadandoCurriculo(true);
    const path = `curriculos/${candidato.id}-${file.name}`;
    const { error } = await supabase.storage.from("curriculos").upload(path, file, { upsert: true });
    if (!error) {
      const { data: u } = supabase.storage.from("curriculos").getPublicUrl(path);
      await supabase.from("candidates").update({ curriculo_url: u.publicUrl, curriculo_nome: file.name } as any).eq("id", candidato.id);
      setCandidato((p) => p ? { ...p, curriculo_url: u.publicUrl, curriculo_nome: file.name } : p);
    }
    setUploadandoCurriculo(false);
  }

  // ── Loading / Error ──────────────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F7FA]">
      <div className="h-8 w-8 rounded-full border-4 border-[#264478]/30 border-t-[#264478] animate-spin" />
    </div>
  );

  if (erro || !candidato) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg,#14233F,#264478,#3D63B8)" }}>
      <div className="text-center text-white px-6">
        <img src={azumiLogoBranca} alt="Azumi" className="mx-auto mb-6" style={{ height: 44 }} />
        <h1 className="text-xl font-bold mb-2">Link não encontrado</h1>
        <p className="text-white/70 text-sm">Este link é inválido ou expirou. Verifique o e-mail recebido.</p>
      </div>
    </div>
  );

  // ── Computed ──────────────────────────────────────────────────────────────
  const discInfo = disc ? DISC_INFO[disc.fator_predominante] : null;
  const maxScore = disc ? Math.max(disc.score_d, disc.score_i, disc.score_s, disc.score_c, 1) : 1;
  const iniciais = candidato.nome.split(" ").filter(Boolean).map((n) => n[0]).slice(0, 2).join("").toUpperCase();
  const fotoUrl = candidato.avatar_url || candidato.foto_url;
  const progresso = calcProgresso(candidato, disc);

  const ativas = candidaturas.filter((c) => c.job_solicitations && c.etapa_azumi !== "reprovado" && c.etapa_azumi !== "contratado" && !c.banco_talentos);
  const finalizadas = candidaturas.filter((c) => c.etapa_azumi === "reprovado" || c.etapa_azumi === "contratado");
  const estaNoBanco = candidaturas.some((c) => c.banco_talentos);

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#F5F7FA] overscroll-none">

      {/* ── Topbar pílula flutuante ────────────────────────────────────────── */}
      <div className="sticky top-0 z-50 px-4 pt-3 pb-1.5">
        <div className="max-w-[1060px] mx-auto flex items-center justify-between rounded-full px-5 py-1.5 border border-white/10 shadow-[0_8px_24px_rgba(3,29,56,0.25)]"
          style={{ background: "rgba(3,29,56,0.92)", backdropFilter: "blur(10px)" }}>
          {/* Logos */}
          <div className="flex items-center gap-4">
            <img src={azumiLogoBranca} alt="Azumi RH" style={{ height: 32, width: "auto" }} />
            <div className="w-px h-6 bg-white/20" />
            <img src={CONNECT_LOGO} alt="Connect" style={{ height: 28, width: "auto" }} />
          </div>
          {/* Nav */}
          <nav className="flex items-center gap-1.5">
            <Link
              to="/vagas"
              className="hidden sm:flex items-center rounded-full bg-white px-3.5 py-1.5 text-[12px] font-semibold text-[#031D38] hover:bg-slate-100 transition-colors"
            >
              Portal de Vagas
            </Link>
            <button className="hidden sm:flex items-center gap-1 rounded-full px-3 py-1.5 text-[12px] text-white/80 hover:bg-white/12 hover:text-white transition-colors">
              ⚙ Configurações
            </button>
          </nav>
        </div>
      </div>

      {/* ── Container ─────────────────────────────────────────────────────── */}
      <div className="max-w-[1060px] mx-auto px-4 pb-12">

        {/* ── Hero card ───────────────────────────────────────────────────── */}
        <section
          className="mt-4 rounded-[20px] overflow-hidden relative px-8 py-9"
          style={{ background: "linear-gradient(135deg,#14233F 0%,#264478 55%,#3D63B8 100%)", color: "#fff" }}
        >
          {/* Glow decoration */}
          <div className="pointer-events-none absolute -right-16 -top-16 w-64 h-64 rounded-full"
            style={{ background: "radial-gradient(circle,rgba(127,168,232,.28),transparent 70%)" }} />

          <div className="relative z-10 flex flex-col sm:flex-row gap-6 items-center sm:items-end flex-wrap">
            {/* Avatar quadrado */}
            <div className="relative shrink-0">
              <input ref={fotoInputRef} type="file" accept="image/*" className="hidden" onChange={handleFotoChange} />
              <div className="w-[132px] h-[132px] rounded-2xl overflow-hidden border-2 border-white/35 shadow-xl">
                {fotoUrl
                  ? <img src={fotoUrl} alt={candidato.nome} className="w-full h-full object-cover" />
                  : <div className="w-full h-full bg-white/20 flex items-center justify-center">
                      <span className="text-4xl font-bold text-white">{iniciais}</span>
                    </div>
                }
              </div>
              <button
                onClick={() => fotoInputRef.current?.click()}
                className="absolute bottom-2 right-2 bg-white text-[#264478] rounded-lg text-[10px] font-bold px-2 py-1 shadow-md hover:bg-slate-100 transition-colors flex items-center gap-1"
              >
                {uploadandoFoto
                  ? <div className="h-3 w-3 rounded-full border-2 border-[#264478] border-t-transparent animate-spin" />
                  : <Camera className="h-3 w-3" />
                }
                Trocar foto
              </button>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 text-center sm:text-left">
              <h1 className="text-[30px] font-extrabold tracking-tight leading-tight">{candidato.nome}</h1>
              <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-2.5">
                {candidato.escolaridade && (
                  <span className="flex items-center gap-1.5 text-[12px] rounded-full px-3.5 py-1.5"
                    style={{ background: "rgba(255,255,255,.14)", border: "1px solid rgba(255,255,255,.22)" }}>
                    <Briefcase className="h-3.5 w-3.5" /> {candidato.escolaridade}
                  </span>
                )}
                {candidato.cidade && (
                  <span className="flex items-center gap-1.5 text-[12px] rounded-full px-3.5 py-1.5"
                    style={{ background: "rgba(255,255,255,.14)", border: "1px solid rgba(255,255,255,.22)" }}>
                    <MapPin className="h-3.5 w-3.5" /> {candidato.cidade}
                  </span>
                )}
                {discInfo && (
                  <span className="flex items-center gap-1.5 text-[12px] rounded-full px-3.5 py-1.5 font-bold text-[#264478] bg-white">
                    🧭 Perfil DISC: {discInfo.nome} ({disc!.fator_predominante})
                  </span>
                )}
                {estaNoBanco && (
                  <span className="flex items-center gap-1.5 text-[12px] rounded-full px-3.5 py-1.5"
                    style={{ background: "rgba(255,255,255,.14)", border: "1px solid rgba(255,255,255,.22)" }}>
                    ✓ Banco de Talentos Azumi
                  </span>
                )}
              </div>
              {/* Barra de completude */}
              <div className="mt-4">
                <div className="flex items-center gap-3 mb-1.5">
                  <div className="flex-1 h-1.5 rounded-full bg-white/20 overflow-hidden">
                    <div className="h-full rounded-full bg-white transition-all" style={{ width: `${progresso}%` }} />
                  </div>
                  <span className="text-[12px] text-white/80 shrink-0">
                    Perfil <strong className="text-white">{progresso}% completo</strong>
                  </span>
                </div>
                {progresso < 100 && (
                  <p className="text-[12px] text-white/60">
                    {!candidato.resumo_candidato
                      ? "Adicione seu resumo de experiência para aumentar suas chances ✨"
                      : "Complete seu contato e interesses para chegar a 100% ✨"
                    }
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ── Grid ────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5 mt-5 items-start">

          {/* ═══ Coluna principal ═══════════════════════════════════════════ */}
          <div className="flex flex-col gap-5">

            {/* Candidaturas */}
            <Card title="Minhas candidaturas" icon="🎯"
              action={finalizadas.length > 0 ? (
                <button onClick={() => setVerFinalizadas((v) => !v)}
                  className="text-[12px] text-[#264478] font-semibold hover:underline ml-auto">
                  {verFinalizadas ? "Ocultar finalizadas" : `Ver finalizadas (${finalizadas.length}) →`}
                </button>
              ) : null}
            >
              {ativas.length === 0 && !estaNoBanco ? (
                <p className="text-[13px] text-slate-400">Você ainda não possui candidaturas registradas.</p>
              ) : null}

              {/* Banco de talentos */}
              {estaNoBanco && ativas.length === 0 && (
                <div className="rounded-xl border border-[#264478]/20 bg-[#264478]/5 px-4 py-3 text-[13px] text-[#264478]">
                  ✓ Você está no <strong>Banco de Talentos Azumi</strong>. Avisaremos quando surgir a oportunidade certa para você.
                </div>
              )}

              {/* Candidaturas ativas com timeline */}
              {ativas.map((cand, ci) => {
                const js = cand.job_solicitations as any;
                const cargo = js?.cargo ?? "Vaga";
                const empresa = js?.avulsa_empresa_nome ?? null;
                const etapaAtualIdx = ETAPAS.findIndex((e) => e.key === cand.etapa_azumi);
                return (
                  <div key={cand.id} className={ci > 0 ? "mt-6 pt-6 border-t border-slate-100" : ""}>
                    {/* Header processo */}
                    <div className="flex justify-between items-start gap-3 flex-wrap mb-5">
                      <div>
                        <p className="text-[16px] font-bold text-slate-800">{cargo}</p>
                        <p className="text-[12.5px] text-slate-500 mt-0.5">
                          {empresa ? `${empresa} · ` : ""}
                          {cand.data_aplicacao ? `Candidatura em ${fmtData(cand.data_aplicacao)}` : ""}
                        </p>
                      </div>
                      <span className="text-[11px] font-bold rounded-full px-3 py-1"
                        style={{ background: "#10B98118", color: "#0a7d5b", border: "1px solid #10B98140" }}>
                        ● Processo ativo
                      </span>
                    </div>
                    {/* Timeline stepper */}
                    <div className="relative">
                      {ETAPAS.map((etapa, idx) => {
                        const isDone = idx < etapaAtualIdx;
                        const isCurrent = idx === etapaAtualIdx;
                        const isFuture = idx > etapaAtualIdx;
                        return (
                          <div key={etapa.key} className="flex gap-3.5 relative pb-5 last:pb-0">
                            {/* Linha vertical */}
                            {idx < ETAPAS.length - 1 && (
                              <div className="absolute left-[13px] top-7 bottom-0 w-0.5"
                                style={{ background: isDone ? "#10B981" : "#E2E8F0" }} />
                            )}
                            {/* Dot */}
                            <div className={cn(
                              "w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-[11px] font-bold border-2 z-10",
                              isDone && "bg-[#10B981] border-[#10B981] text-white",
                              isCurrent && "bg-[#264478] border-[#264478] text-white shadow-[0_0_0_5px_#26447822]",
                              isFuture && "bg-white border-slate-200 text-slate-400",
                            )}>
                              {isDone ? <Check className="h-3.5 w-3.5" /> : isFuture ? idx + 1 : idx + 1}
                            </div>
                            {/* Body */}
                            <div className="pt-0.5 flex-1 min-w-0">
                              <p className={cn("text-[13.5px] font-semibold",
                                isCurrent && "text-[#264478]",
                                isFuture && "text-slate-400",
                                isDone && "text-slate-700",
                              )}>
                                {etapa.label}
                              </p>
                              {(isDone || isCurrent) && etapa.desc && (
                                <p className="text-[11.5px] text-slate-400 mt-0.5">{etapa.desc}</p>
                              )}
                              {isFuture && !etapa.desc && (
                                <p className="text-[11.5px] text-slate-300 mt-0.5">Próxima etapa</p>
                              )}
                              {/* Star rating em etapas concluídas (visual) */}
                              {isDone && (
                                <div className="mt-1.5 flex items-center gap-1.5">
                                  <span className="text-[11px] text-slate-400">Como foi?</span>
                                  <span className="text-[#F59E0B] text-[14px] tracking-wide cursor-pointer select-none">★★★★★</span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* Finalizadas (toggle) */}
              {verFinalizadas && finalizadas.length > 0 && (
                <div className="mt-5 pt-5 border-t border-slate-100">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-3">Processos finalizados</p>
                  {finalizadas.map((c) => {
                    const js = c.job_solicitations as any;
                    const isContratado = c.etapa_azumi === "contratado";
                    return (
                      <div key={c.id} className="flex items-center justify-between gap-3 py-2.5 border-b border-slate-100 last:border-0 opacity-70">
                        <div className="min-w-0">
                          <p className="text-[13px] font-semibold text-slate-700 truncate">{js?.cargo ?? "Vaga"}</p>
                          {js?.avulsa_empresa_nome && <p className="text-[11px] text-slate-400 truncate">{js.avulsa_empresa_nome}</p>}
                        </div>
                        <span className={cn("text-[11px] font-bold px-2.5 py-1 rounded-full shrink-0",
                          isContratado ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-500"
                        )}>
                          {isContratado ? "Contratado 🎉" : "Finalizada"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>

            {/* Sobre você */}
            <Card title="Sobre você" icon="👤"
              action={!editandoBio
                ? <button onClick={() => { setBioRascunho(candidato.observacoes ?? ""); setEditandoBio(true); }}
                    className="edit-link-btn"><Pencil className="h-3 w-3" /> Editar</button>
                : null
              }
            >
              {editandoBio ? (
                <div className="space-y-3">
                  <textarea value={bioRascunho} onChange={(e) => setBioRascunho(e.target.value)} rows={4}
                    placeholder="Fale sobre você, sua trajetória e o que busca profissionalmente…"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-[13.5px] text-slate-700 resize-none focus:outline-none focus:ring-2 focus:ring-[#264478]/25" />
                  <InlineActions onCancel={() => setEditandoBio(false)} onSave={salvarBio} saving={salvandoBio} />
                </div>
              ) : (
                <p className="text-[13.5px] text-slate-600 leading-relaxed">
                  {candidato.observacoes || <span className="text-slate-400 italic">Adicione uma apresentação sobre você. Clique em "Editar" para começar.</span>}
                </p>
              )}
            </Card>

            {/* Resumo de experiência */}
            <Card title="Resumo de experiência" icon="📄"
              action={!editandoResumo
                ? <button onClick={() => { setResumoRascunho(candidato.resumo_candidato ?? ""); setEditandoResumo(true); }}
                    className="edit-link-btn"><Pencil className="h-3 w-3" /> Editar</button>
                : null
              }
            >
              {editandoResumo ? (
                <div className="space-y-3">
                  <textarea value={resumoRascunho} onChange={(e) => setResumoRascunho(e.target.value)} rows={5}
                    placeholder="Descreva sua trajetória profissional, principais cargos e realizações…"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-[13.5px] text-slate-700 resize-none focus:outline-none focus:ring-2 focus:ring-[#264478]/25" />
                  <InlineActions onCancel={() => setEditandoResumo(false)} onSave={salvarResumo} saving={salvandoResumo} />
                </div>
              ) : (
                <p className="text-[13.5px] text-slate-600 leading-relaxed">
                  {candidato.resumo_candidato || <span className="text-slate-400 italic">Adicione um resumo da sua experiência profissional. Isso ajuda a Azumi a te apresentar melhor para as empresas.</span>}
                </p>
              )}
              {/* Currículo */}
              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-[10.5px] uppercase tracking-wider font-bold text-slate-400 mb-2">Currículo</p>
                <input ref={curriculoInputRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleCurriculoChange} />
                <div className="flex items-center gap-2">
                  {candidato.curriculo_url ? (
                    <a href={candidato.curriculo_url} target="_blank" rel="noreferrer"
                      className="flex items-center gap-2 text-[13px] text-[#264478] hover:underline flex-1 min-w-0">
                      <FileText className="h-4 w-4 shrink-0" />
                      <span className="truncate">{candidato.curriculo_nome || "Ver currículo"}</span>
                    </a>
                  ) : (
                    <span className="text-[13px] text-slate-400 flex items-center gap-2 flex-1">
                      <FileText className="h-4 w-4" /> Nenhum currículo enviado
                    </span>
                  )}
                  <button onClick={() => curriculoInputRef.current?.click()}
                    disabled={uploadandoCurriculo}
                    className="flex items-center gap-1.5 text-[12px] font-semibold text-[#264478] hover:underline shrink-0 disabled:opacity-50">
                    {uploadandoCurriculo
                      ? <div className="h-3 w-3 border border-[#264478] border-t-transparent rounded-full animate-spin" />
                      : <Upload className="h-3 w-3" />
                    }
                    {candidato.curriculo_url ? "Atualizar" : "Enviar"}
                  </button>
                </div>
              </div>
            </Card>

            {/* Contato */}
            <Card title="Contato" icon="✉️"
              action={!editandoContato
                ? <button onClick={() => { setTelefoneDraft(candidato.telefone ?? ""); setLinkedinDraft(candidato.linkedin ?? ""); setEditandoContato(true); }}
                    className="edit-link-btn"><Pencil className="h-3 w-3" /> Editar</button>
                : null
              }
            >
              {editandoContato ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 py-1">
                    <div className="w-7 h-7 rounded-lg bg-[#264478]/10 text-[#264478] flex items-center justify-center shrink-0"><Mail className="h-3.5 w-3.5" /></div>
                    <span className="text-[13px] text-slate-500">{candidato.email}</span>
                    <span className="text-[11px] text-slate-300 italic ml-auto">não editável</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-[#264478]/10 text-[#264478] flex items-center justify-center shrink-0"><Phone className="h-3.5 w-3.5" /></div>
                    <input value={telefoneDraft} onChange={(e) => setTelefoneDraft(e.target.value)} placeholder="(00) 00000-0000"
                      className="flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#264478]/25" />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-[#264478]/10 text-[#264478] flex items-center justify-center shrink-0"><Linkedin className="h-3.5 w-3.5" /></div>
                    <input value={linkedinDraft} onChange={(e) => setLinkedinDraft(e.target.value)} placeholder="linkedin.com/in/seuperfil"
                      className="flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#264478]/25" />
                  </div>
                  <InlineActions onCancel={() => setEditandoContato(false)} onSave={salvarContato} saving={salvandoContato} />
                </div>
              ) : (
                <div>
                  {candidato.email && (
                    <div className="flex items-center gap-2.5 py-1.5">
                      <div className="w-[26px] h-[26px] rounded-[7px] bg-[#264478]/10 text-[#264478] flex items-center justify-center shrink-0"><Mail className="h-3.5 w-3.5" /></div>
                      <span className="text-[13px] text-slate-700">{candidato.email}</span>
                    </div>
                  )}
                  {candidato.telefone && (
                    <div className="flex items-center gap-2.5 py-1.5">
                      <div className="w-[26px] h-[26px] rounded-[7px] bg-[#264478]/10 text-[#264478] flex items-center justify-center shrink-0"><Phone className="h-3.5 w-3.5" /></div>
                      <span className="text-[13px] text-slate-700">{candidato.telefone}</span>
                    </div>
                  )}
                  {candidato.linkedin && (
                    <div className="flex items-center gap-2.5 py-1.5">
                      <div className="w-[26px] h-[26px] rounded-[7px] bg-[#264478]/10 text-[#264478] flex items-center justify-center shrink-0"><Linkedin className="h-3.5 w-3.5" /></div>
                      <a href={candidato.linkedin.startsWith("http") ? candidato.linkedin : `https://${candidato.linkedin}`}
                        target="_blank" rel="noreferrer" className="text-[13px] text-[#264478] hover:underline">
                        {candidato.linkedin}
                      </a>
                    </div>
                  )}
                  {!candidato.email && !candidato.telefone && !candidato.linkedin && (
                    <p className="text-[13px] text-slate-400">Nenhum contato cadastrado. Clique em "Editar" para adicionar.</p>
                  )}
                </div>
              )}
            </Card>
          </div>

          {/* ═══ Coluna lateral ══════════════════════════════════════════════ */}
          <div className="flex flex-col gap-5">

            {/* DISC */}
            {disc && discInfo ? (
              <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 1px 4px rgba(133,146,173,0.2)" }}>
                {/* Header */}
                <div className="px-5 py-4 flex gap-4 items-center"
                  style={{ background: `${discInfo.cor}12`, borderBottom: `2px solid ${discInfo.cor}22` }}>
                  <div className="w-[74px] h-[74px] rounded-2xl flex flex-col items-center justify-center shadow-md shrink-0"
                    style={{ background: `linear-gradient(135deg,${discInfo.cor},#264478)` }}>
                    <span className="text-[26px] font-bold text-white leading-none">{disc.fator_predominante}</span>
                    <span className="text-[9px] uppercase tracking-widest text-white/80 mt-0.5">{discInfo.nome}</span>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Perfil Comportamental</p>
                    <p className="text-[15px] font-bold text-slate-800 mt-0.5">{discInfo.nome}</p>
                    <p className="text-[12.5px] text-slate-500 mt-0.5 leading-snug">{discInfo.frase}</p>
                    {disc.fator_secundario && (
                      <p className="text-[11px] text-slate-400 mt-1">Secundário: <strong>{disc.fator_secundario}</strong></p>
                    )}
                  </div>
                </div>
                {/* Barras */}
                <div className="px-5 py-4 space-y-3">
                  {(["D","I","S","C"] as const).map((dim) => {
                    const score = dim==="D"?disc.score_d:dim==="I"?disc.score_i:dim==="S"?disc.score_s:disc.score_c;
                    const pct = Math.round((score / maxScore) * 100);
                    const cor = DISC_INFO[dim].cor;
                    return (
                      <div key={dim} className="flex items-center gap-2.5">
                        <span className="text-[12px] font-bold w-4 shrink-0" style={{ color: cor }}>{dim}</span>
                        <div className="flex-1 h-2 rounded-full bg-[#e9edf3] overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: cor }} />
                        </div>
                        <span className="text-[11.5px] text-slate-400 w-8 text-right shrink-0">{score}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="px-5 pb-5 space-y-3">
                  <a
                    href={`/disc/${candidato.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 w-full rounded-full border-[1.5px] border-[#264478] text-[#264478] py-2 text-[12.5px] font-semibold hover:bg-[#264478]/5 transition-colors"
                  >
                    <Download className="h-3.5 w-3.5" /> Baixar relatório completo
                  </a>
                  <div className="rounded-xl border border-dashed border-slate-200 p-3 text-[12px] text-slate-400 flex items-start gap-2">
                    <Lock className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                    <span><strong className="text-slate-500">Em breve:</strong> novos testes de autoconhecimento para deixar seu perfil ainda mais completo.</span>
                  </div>
                </div>
              </div>
            ) : (
              <Card title="Perfil Comportamental" icon="🧭">
                <p className="text-[13px] text-slate-400">Você ainda não realizou o teste DISC. Fique de olho no seu e-mail!</p>
              </Card>
            )}

            {/* Serviços */}
            <div>
              <p className="text-[10.5px] uppercase tracking-wider font-bold text-slate-400 mb-3">Serviços Azumi para você</p>
              <div className="flex flex-col gap-3.5">
                {SERVICOS.map((s) => (
                  <a key={s.label} href={s.href} target="_blank" rel="noreferrer"
                    className="block rounded-2xl overflow-hidden bg-white transition-all hover:-translate-y-0.5 hover:shadow-lg"
                    style={{ boxShadow: "0 1px 4px rgba(133,146,173,0.2)" }}>
                    <div className={cn("h-[74px] flex items-center px-5 text-[26px] bg-gradient-to-r", s.grad)}>
                      {s.emoji}
                    </div>
                    <div className="px-4 py-3 flex items-center justify-between gap-2">
                      <div>
                        <p className="text-[13.5px] font-bold text-slate-800">{s.label}</p>
                        <p className="text-[12px] text-slate-400 mt-0.5">{s.desc}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-300 shrink-0" />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="mt-11 bg-[#031D38] py-10 px-4">
        <div className="max-w-[1060px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-8 flex-wrap">
          {/* Logos */}
          <div className="flex items-center gap-4">
            <img src={azumiLogoBranca} alt="Azumi RH"
              style={{ height: 42, width: "auto", filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.3))" }} />
            <div className="w-px h-10 bg-white/15" />
            <img src={CONNECT_LOGO} alt="Connect" style={{ height: 36, width: "auto" }} />
          </div>
          {/* Social */}
          <div className="flex items-center gap-2.5">
            {[
              { href: "https://www.instagram.com/azumirh/", icon: <Instagram className="h-4 w-4" />, label: "Instagram" },
              { href: "https://www.linkedin.com/company/azumirh/", icon: <Linkedin className="h-4 w-4" />, label: "LinkedIn" },
              { href: "https://www.facebook.com/azumirhc/", icon: <span className="text-[13px] font-bold">f</span>, label: "Facebook" },
              { href: "https://www.tiktok.com/@azumirh", icon: <span className="text-[12px] font-bold">TT</span>, label: "TikTok" },
            ].map((s) => (
              <a key={s.label} href={s.href} target="_blank" rel="noreferrer" aria-label={s.label}
                className="w-[34px] h-[34px] rounded-full flex items-center justify-center text-white border transition-colors hover:bg-white/20"
                style={{ background: "rgba(255,255,255,0.08)", borderColor: "rgba(255,255,255,0.14)" }}>
                {s.icon}
              </a>
            ))}
          </div>
          {/* Links */}
          <div className="flex items-center gap-5 text-[12px] text-white/30">
            <a href="https://azumirh.com.br" target="_blank" rel="noreferrer" className="hover:text-white/60 transition-colors">azumirh.com.br</a>
            <Link to="/login" className="hover:text-white/60 transition-colors">Login</Link>
          </div>
        </div>
        <p className="max-w-[1060px] mx-auto mt-6 pt-4 border-t border-white/10 text-center text-[11.5px] text-slate-500">
          © {new Date().getFullYear()} Azumi RH · azumirh.com.br · contato@azumirh.com.br
        </p>
      </footer>

    </div>
  );
}

// ── Primitivos ──────────────────────────────────────────────────────────────────

function Card({
  title, icon, children, action,
}: {
  title: string; icon?: string; children: React.ReactNode; action?: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl p-[22px]" style={{ boxShadow: "0 1px 4px rgba(133,146,173,0.2)" }}>
      <div className="flex items-center gap-2 mb-3.5">
        {icon && (
          <div className="w-7 h-7 rounded-lg bg-[#264478]/10 text-[#264478] flex items-center justify-center text-[14px]">{icon}</div>
        )}
        <h2 className="text-[15px] font-bold text-slate-800">{title}</h2>
        {action}
      </div>
      {children}
    </div>
  );
}

function InlineActions({ onCancel, onSave, saving }: { onCancel: () => void; onSave: () => void; saving: boolean }) {
  return (
    <div className="flex justify-end gap-2">
      <button type="button" onClick={onCancel}
        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[12px] text-slate-500 border border-slate-200 hover:bg-slate-50">
        <X className="h-3 w-3" /> Cancelar
      </button>
      <button type="button" onClick={onSave} disabled={saving}
        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[12px] text-white bg-[#264478] hover:bg-[#1e3560] disabled:opacity-60">
        <Check className="h-3 w-3" /> {saving ? "Salvando…" : "Salvar"}
      </button>
    </div>
  );
}
