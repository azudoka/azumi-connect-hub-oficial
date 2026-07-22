import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  MapPin, Mail, Phone, Linkedin, Briefcase, Camera, Pencil,
  Check, X, Instagram, ChevronRight, Download,
} from "lucide-react";
import { cn } from "@/lib/utils";
import azumiLogoBranca from "@/assets/brand/azumi-logo-branca.png";

// ── Constantes visuais ─────────────────────────────────────────────────────────

const CONNECT_LOGO = "https://raw.githubusercontent.com/azudoka/azumi-connect-hub-oficial/main/public/connect-logo.png";
const GRAD = "linear-gradient(150deg, #14233F 0%, #264478 60%, #3D63B8 100%)";

const SERVICOS = [
  {
    label: "Serviços para você",
    desc: "Soluções de RH pensadas para o seu desenvolvimento profissional.",
    href: "https://azumirh.com.br",
    grad: "from-[#264478] to-[#3D63B8]",
    emoji: "👤",
  },
  {
    label: "Programa Impulso RH",
    desc: "Capacitação e crescimento para profissionais de recursos humanos.",
    href: "https://azumirh.com.br",
    grad: "from-[#1a3a6b] to-[#264478]",
    emoji: "🚀",
  },
  {
    label: "Gold Market",
    desc: "Conexão com as melhores oportunidades do mercado executivo.",
    href: "https://azumirh.com.br",
    grad: "from-[#7C5A0A] to-[#C49A1A]",
    emoji: "⭐",
  },
];

const DISC_INFO: Record<string, { nome: string; cor: string; desc: string }> = {
  D: { nome: "Executor", cor: "#EF4444", desc: "Direto, decidido e orientado a resultados. Gosta de desafios e age com velocidade." },
  I: { nome: "Comunicador", cor: "#F59E0B", desc: "Entusiasta, influente e sociável. Motiva pessoas e se destaca em colaboração." },
  S: { nome: "Planejador", cor: "#10B981", desc: "Estável, confiável e paciente. Valoriza harmonia e entrega consistência." },
  C: { nome: "Analista", cor: "#3B82F6", desc: "Preciso, criterioso e analítico. Foca em qualidade e toma decisões baseadas em dados." },
};

const ETAPA_LABEL: Record<string, string> = {
  recebido: "Recebido",
  triagem_inicial: "Triagem",
  questionario: "Questionário",
  entrevista_azumi: "Entrevista Azumi",
  teste_tecnico: "Teste Técnico",
  entrevista_cliente: "Entrevista com a empresa",
  proposta: "Proposta enviada",
  contratado: "Contratado",
  reprovado: "Não selecionado",
};

const ETAPA_COR: Record<string, string> = {
  recebido: "bg-slate-100 text-slate-600",
  triagem_inicial: "bg-blue-100 text-blue-700",
  questionario: "bg-violet-100 text-violet-700",
  entrevista_azumi: "bg-cyan-100 text-cyan-700",
  teste_tecnico: "bg-indigo-100 text-indigo-700",
  entrevista_cliente: "bg-amber-100 text-amber-700",
  proposta: "bg-emerald-100 text-emerald-700",
  contratado: "bg-green-100 text-green-800",
  reprovado: "bg-red-100 text-red-600",
};

// ── Types ──────────────────────────────────────────────────────────────────────

interface DiscResultado {
  score_d: number;
  score_i: number;
  score_s: number;
  score_c: number;
  fator_predominante: string;
  fator_secundario: string | null;
}

interface Candidatura {
  id: string;
  etapa_azumi: string | null;
  banco_talentos: boolean;
  job_solicitations: { cargo: string; avulsa_empresa_nome: string | null } | null;
}

interface CandidatoData {
  id: string;
  nome: string;
  email: string | null;
  telefone: string | null;
  cidade: string | null;
  escolaridade: string | null;
  linkedin: string | null;
  foto_url: string | null;
  avatar_url: string | null;
  cpf: string | null;
  interesses_setores: string[] | null;
  interesses_cargos: string[] | null;
  observacoes: string | null;
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function MeuPerfilPage() {
  const { token } = useParams<{ token: string }>();
  const [candidato, setCandidato] = useState<CandidatoData | null>(null);
  const [disc, setDisc] = useState<DiscResultado | null>(null);
  const [candidaturas, setCandidaturas] = useState<Candidatura[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(false);

  // Edit bio state
  const [editandoBio, setEditandoBio] = useState(false);
  const [bioRascunho, setBioRascunho] = useState("");
  const [salvandoBio, setSalvandoBio] = useState(false);

  // Photo upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadandoFoto, setUploadandoFoto] = useState(false);

  // Remove dark theme if active
  useEffect(() => {
    const html = document.documentElement;
    const hadMidnight = html.classList.contains("theme-midnight");
    html.classList.remove("theme-midnight");
    return () => { if (hadMidnight) html.classList.add("theme-midnight"); };
  }, []);

  useEffect(() => {
    if (!token) { setErro(true); setLoading(false); return; }
    (async () => {
      // 1. Buscar candidato pelo token
      const { data, error } = await supabase
        .from("candidates")
        .select("id, nome, email, telefone, cidade, escolaridade, linkedin, foto_url, avatar_url, cpf, interesses_setores, interesses_cargos, observacoes")
        .eq("token_acesso_candidato" as any, token)
        .maybeSingle();

      if (error || !data) { setErro(true); setLoading(false); return; }
      const cand = data as unknown as CandidatoData;
      setCandidato(cand);
      setBioRascunho(cand.observacoes ?? "");

      // 2. Buscar DISC separadamente (join não funciona sem FK no schema cache)
      const { data: discData } = await supabase
        .from("disc_resultado_candidato" as any)
        .select("score_d, score_i, score_s, score_c, fator_predominante, fator_secundario")
        .eq("candidato_id", cand.id)
        .maybeSingle();
      if (discData) setDisc(discData as unknown as DiscResultado);

      // 3. Buscar todas as candidaturas pelo CPF
      if (cand.cpf) {
        const { data: apps } = await supabase
          .from("candidates")
          .select("id, etapa_azumi, banco_talentos, job_solicitations(cargo, avulsa_empresa_nome)")
          .eq("cpf", cand.cpf)
          .order("created_at", { ascending: false });
        if (apps) setCandidaturas(apps as unknown as Candidatura[]);
      }

      setLoading(false);
    })();
  }, [token]);

  async function salvarBio() {
    if (!candidato) return;
    setSalvandoBio(true);
    await supabase
      .from("candidates")
      .update({ observacoes: bioRascunho || null } as any)
      .eq("id", candidato.id);
    setCandidato((prev) => prev ? { ...prev, observacoes: bioRascunho || null } : prev);
    setSalvandoBio(false);
    setEditandoBio(false);
  }

  async function handleFotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !candidato) return;
    setUploadandoFoto(true);
    const ext = file.name.split(".").pop();
    const path = `avatars/${candidato.id}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("public-applications")
      .upload(path, file, { upsert: true });
    if (!upErr) {
      const { data: urlData } = supabase.storage.from("public-applications").getPublicUrl(path);
      const url = urlData.publicUrl;
      await supabase.from("candidates").update({ avatar_url: url } as any).eq("id", candidato.id);
      setCandidato((prev) => prev ? { ...prev, avatar_url: url } : prev);
    }
    setUploadandoFoto(false);
  }

  // ── Computed ──────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: GRAD }}>
        <div className="h-8 w-8 rounded-full border-4 border-white/30 border-t-white animate-spin" />
      </div>
    );
  }

  if (erro || !candidato) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: GRAD }}>
        <div className="text-center text-white px-6">
          <img src={azumiLogoBranca} alt="Azumi" className="mx-auto mb-6" style={{ height: 44 }} />
          <h1 className="text-xl font-bold mb-2">Link não encontrado</h1>
          <p className="text-white/70 text-sm">Este link é inválido ou expirou. Verifique o e-mail recebido.</p>
        </div>
      </div>
    );
  }

  const discInfo = disc ? DISC_INFO[disc.fator_predominante] : null;
  const maxScore = disc ? Math.max(disc.score_d, disc.score_i, disc.score_s, disc.score_c, 1) : 1;
  const iniciais = candidato.nome.split(" ").filter(Boolean).map((n) => n[0]).slice(0, 2).join("").toUpperCase();
  const fotoUrl = candidato.avatar_url || candidato.foto_url;

  const candidaturasAtivas = candidaturas.filter(
    (c) => c.job_solicitations && c.etapa_azumi !== "reprovado" && c.etapa_azumi !== "contratado"
  );
  const candidaturasEncerradas = candidaturas.filter(
    (c) => c.etapa_azumi === "reprovado" || c.etapa_azumi === "contratado"
  );
  const estaNoBanco = candidaturas.some((c) => c.banco_talentos);

  return (
    <div className="min-h-screen bg-[#F0F4FA]">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-20 border-b border-white/10" style={{ background: GRAD }}>
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={azumiLogoBranca} alt="Azumi RH" style={{ height: 40, width: "auto" }} />
            <div className="w-px h-8 bg-white/20" />
            <img src={CONNECT_LOGO} alt="Connect" style={{ height: 34, width: "auto" }} />
          </div>
          <nav className="hidden md:flex items-center gap-1">
            {SERVICOS.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              >
                {s.label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <div style={{ background: GRAD }} className="pb-20">
        <div className="max-w-5xl mx-auto px-4 pt-10 pb-4">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6">

            {/* Foto quadrada */}
            <div className="relative shrink-0">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFotoChange}
              />
              <div
                className="h-36 w-36 rounded-2xl overflow-hidden ring-4 ring-white/30 shadow-xl cursor-pointer group relative"
                onClick={() => fileInputRef.current?.click()}
              >
                {fotoUrl ? (
                  <img src={fotoUrl} alt={candidato.nome} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full bg-white/20 flex items-center justify-center">
                    <span className="text-4xl font-bold text-white">{iniciais}</span>
                  </div>
                )}
                {/* Overlay câmera */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  {uploadandoFoto
                    ? <div className="h-6 w-6 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    : <Camera className="h-7 w-7 text-white" />
                  }
                </div>
              </div>
              {/* Badge DISC */}
              {discInfo && (
                <div
                  className="absolute -bottom-2 -right-2 h-9 w-9 rounded-xl flex items-center justify-center text-sm font-bold text-white shadow-lg ring-2 ring-white/40"
                  style={{ background: discInfo.cor }}
                  title={`Perfil ${discInfo.nome}`}
                >
                  {disc!.fator_predominante}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="text-white text-center sm:text-left flex-1 min-w-0 pb-1">
              <h1 className="text-3xl font-bold leading-tight">{candidato.nome}</h1>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-5 gap-y-1.5 mt-2 text-white/75 text-sm">
                {candidato.cidade && (
                  <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{candidato.cidade}</span>
                )}
                {candidato.escolaridade && (
                  <span className="flex items-center gap-1.5"><Briefcase className="h-3.5 w-3.5" />{candidato.escolaridade}</span>
                )}
                {candidato.linkedin && (
                  <a
                    href={candidato.linkedin.startsWith("http") ? candidato.linkedin : `https://${candidato.linkedin}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 hover:text-white transition-colors"
                  >
                    <Linkedin className="h-3.5 w-3.5" /> LinkedIn
                  </a>
                )}
              </div>
              <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-3">
                {discInfo && (
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold text-white"
                    style={{ background: discInfo.cor + "33", border: `1px solid ${discInfo.cor}66` }}
                  >
                    <span className="font-bold">{disc!.fator_predominante}</span> · {discInfo.nome}
                  </span>
                )}
                {estaNoBanco && (
                  <span className="inline-flex items-center gap-1.5 bg-white/15 text-white/90 rounded-full px-3 py-1 text-xs font-medium border border-white/20">
                    ✓ Banco de Talentos Azumi
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ───────────────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 -mt-10 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">

          {/* ── Coluna principal ──────────────────────────────────────────── */}
          <div className="space-y-5">

            {/* Sobre você (bio editável) */}
            <Card
              title="Sobre você"
              action={
                !editandoBio ? (
                  <button
                    type="button"
                    onClick={() => { setBioRascunho(candidato.observacoes ?? ""); setEditandoBio(true); }}
                    className="flex items-center gap-1 text-xs text-[#264478] hover:underline"
                  >
                    <Pencil className="h-3 w-3" /> Editar
                  </button>
                ) : null
              }
            >
              {editandoBio ? (
                <div className="space-y-3">
                  <textarea
                    value={bioRascunho}
                    onChange={(e) => setBioRascunho(e.target.value)}
                    rows={4}
                    placeholder="Fale um pouco sobre você, sua trajetória e o que busca profissionalmente…"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 resize-none focus:outline-none focus:ring-2 focus:ring-[#264478]/30"
                  />
                  <div className="flex gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => setEditandoBio(false)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-slate-500 border border-slate-200 hover:bg-slate-50"
                    >
                      <X className="h-3 w-3" /> Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={salvarBio}
                      disabled={salvandoBio}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-white bg-[#264478] hover:bg-[#1e3560] disabled:opacity-60"
                    >
                      <Check className="h-3 w-3" /> {salvandoBio ? "Salvando…" : "Salvar"}
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-600 leading-relaxed">
                  {candidato.observacoes || (
                    <span className="text-slate-400 italic">
                      Adicione uma apresentação sobre você. Clique em "Editar" para começar.
                    </span>
                  )}
                </p>
              )}
            </Card>

            {/* Contato */}
            <Card title="Contato">
              <div className="flex flex-wrap gap-4">
                {candidato.email && (
                  <a href={`mailto:${candidato.email}`} className="flex items-center gap-2 text-sm text-slate-600 hover:text-[#264478] transition-colors">
                    <Mail className="h-4 w-4 text-slate-400" /> {candidato.email}
                  </a>
                )}
                {candidato.telefone && (
                  <a href={`tel:${candidato.telefone}`} className="flex items-center gap-2 text-sm text-slate-600 hover:text-[#264478] transition-colors">
                    <Phone className="h-4 w-4 text-slate-400" /> {candidato.telefone}
                  </a>
                )}
              </div>
            </Card>

            {/* Candidaturas ativas */}
            {candidaturasAtivas.length > 0 && (
              <Card title="Processos em andamento">
                <div className="divide-y divide-slate-100">
                  {candidaturasAtivas.map((c) => {
                    const label = ETAPA_LABEL[c.etapa_azumi ?? ""] ?? c.etapa_azumi ?? "Em processo";
                    const cor = ETAPA_COR[c.etapa_azumi ?? ""] ?? "bg-slate-100 text-slate-600";
                    const js = c.job_solicitations as any;
                    return (
                      <div key={c.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                        <div className="min-w-0">
                          <p className="font-medium text-sm text-slate-800 truncate">{js?.cargo ?? "Vaga"}</p>
                          {js?.avulsa_empresa_nome && (
                            <p className="text-xs text-slate-400 truncate mt-0.5">{js.avulsa_empresa_nome}</p>
                          )}
                        </div>
                        <span className={cn("shrink-0 text-[11px] font-semibold px-2.5 py-1 rounded-full", cor)}>
                          {label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}

            {/* Histórico */}
            {candidaturasEncerradas.length > 0 && (
              <Card title="Histórico de processos">
                <div className="divide-y divide-slate-100">
                  {candidaturasEncerradas.map((c) => {
                    const label = ETAPA_LABEL[c.etapa_azumi ?? ""] ?? c.etapa_azumi ?? "";
                    const cor = ETAPA_COR[c.etapa_azumi ?? ""] ?? "bg-slate-100 text-slate-600";
                    const js = c.job_solicitations as any;
                    return (
                      <div key={c.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0 opacity-65">
                        <div className="min-w-0">
                          <p className="font-medium text-sm text-slate-700 truncate">{js?.cargo ?? "Vaga"}</p>
                          {js?.avulsa_empresa_nome && (
                            <p className="text-xs text-slate-400 truncate mt-0.5">{js.avulsa_empresa_nome}</p>
                          )}
                        </div>
                        <span className={cn("shrink-0 text-[11px] font-semibold px-2.5 py-1 rounded-full", cor)}>
                          {label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}

            {candidaturasAtivas.length === 0 && candidaturasEncerradas.length === 0 && (
              <Card title="Processos">
                <p className="text-sm text-slate-400">Você ainda não possui candidaturas registradas.</p>
              </Card>
            )}

            {/* Interesses */}
            {(candidato.interesses_setores?.length || candidato.interesses_cargos?.length) ? (
              <Card title="Interesses profissionais">
                {candidato.interesses_setores?.length ? (
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Setores</p>
                    <div className="flex flex-wrap gap-2">
                      {candidato.interesses_setores.map((s) => (
                        <span key={s} className="text-xs px-3 py-1 rounded-full bg-[#264478]/10 text-[#264478] font-medium">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}
                {candidato.interesses_cargos?.length ? (
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Cargos de interesse</p>
                    <div className="flex flex-wrap gap-2">
                      {candidato.interesses_cargos.map((c) => (
                        <span key={c} className="text-xs px-3 py-1 rounded-full bg-slate-100 text-slate-600 font-medium">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}
              </Card>
            ) : null}
          </div>

          {/* ── Coluna lateral ────────────────────────────────────────────── */}
          <div className="space-y-5">

            {/* Perfil DISC */}
            {disc && discInfo ? (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                {/* Header colorido */}
                <div
                  className="px-5 py-4 flex items-center gap-3"
                  style={{ background: `linear-gradient(135deg, ${discInfo.cor}22, ${discInfo.cor}08)`, borderBottom: `2px solid ${discInfo.cor}33` }}
                >
                  <div
                    className="h-14 w-14 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-md shrink-0"
                    style={{ background: discInfo.cor }}
                  >
                    {disc.fator_predominante}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Perfil Comportamental</p>
                    <p className="text-xl font-bold text-slate-800 leading-tight">{discInfo.nome}</p>
                    {disc.fator_secundario && (
                      <p className="text-xs text-slate-400 mt-0.5">Secundário: <span className="font-semibold">{disc.fator_secundario}</span></p>
                    )}
                  </div>
                </div>
                <div className="px-5 py-4">
                  <p className="text-xs text-slate-500 leading-relaxed mb-5">{discInfo.desc}</p>
                  {/* Barras */}
                  <div className="space-y-3">
                    {(["D", "I", "S", "C"] as const).map((dim) => {
                      const score = dim === "D" ? disc.score_d : dim === "I" ? disc.score_i : dim === "S" ? disc.score_s : disc.score_c;
                      const pct = Math.round((score / maxScore) * 100);
                      const cor = DISC_INFO[dim].cor;
                      const nome = DISC_INFO[dim].nome;
                      return (
                        <div key={dim} className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5 w-24 shrink-0">
                            <span className="text-xs font-bold" style={{ color: cor }}>{dim}</span>
                            <span className="text-[10px] text-slate-400">{nome}</span>
                          </div>
                          <div className="flex-1 h-2.5 rounded-full bg-slate-100 overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${pct}%`, background: cor }} />
                          </div>
                          <span className="text-xs font-semibold text-slate-500 w-6 text-right shrink-0">{score}</span>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-[10px] text-slate-300 mt-4 text-center">DISC · Azumi Connect</p>
                </div>
              </div>
            ) : (
              <Card title="Perfil Comportamental DISC">
                <p className="text-sm text-slate-400">Você ainda não realizou o teste DISC. Fique de olho no seu e-mail!</p>
              </Card>
            )}

            {/* Serviços Azumi */}
            <div className="space-y-3">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">Serviços Azumi para você</p>
              {SERVICOS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  className="block bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow group"
                >
                  {/* Capa colorida */}
                  <div className={cn("h-16 bg-gradient-to-br flex items-center justify-start px-5", s.grad)}>
                    <span className="text-3xl">{s.emoji}</span>
                  </div>
                  {/* Conteúdo */}
                  <div className="px-4 py-3 flex items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-slate-800 leading-tight">{s.label}</p>
                      <p className="text-xs text-slate-400 mt-0.5 leading-snug">{s.desc}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-[#264478] transition-colors shrink-0" />
                  </div>
                </a>
              ))}
            </div>

          </div>
        </div>
      </div>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="bg-[#080f1a] py-10 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col items-center md:items-start gap-3">
            <div className="flex items-center gap-5">
              <img
                src={azumiLogoBranca}
                alt="Azumi RH"
                style={{ height: 42, width: "auto", objectFit: "contain", filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.3))" }}
              />
              <div className="w-px h-10 bg-white/15" />
              <img
                src={CONNECT_LOGO}
                alt="Connect"
                style={{ height: 36, width: "auto", objectFit: "contain" }}
              />
            </div>
            <p className="text-xs text-white/25 mt-1">
              © {new Date().getFullYear()} Azumi RH · Todos os direitos reservados
            </p>
          </div>

          <div className="flex items-center gap-5">
            <a href="https://instagram.com/azumirh" target="_blank" rel="noreferrer"
              className="text-white/35 hover:text-white/80 transition-colors" aria-label="Instagram">
              <Instagram className="h-5 w-5" />
            </a>
            <a href="https://linkedin.com/company/azumirh" target="_blank" rel="noreferrer"
              className="text-white/35 hover:text-white/80 transition-colors" aria-label="LinkedIn">
              <Linkedin className="h-5 w-5" />
            </a>
            <a href="mailto:contato@azumirh.com.br"
              className="text-white/35 hover:text-white/80 transition-colors" aria-label="E-mail">
              <Mail className="h-5 w-5" />
            </a>
          </div>

          <div className="flex items-center gap-5 text-xs text-white/30">
            <a href="https://azumirh.com.br" target="_blank" rel="noreferrer"
              className="hover:text-white/60 transition-colors">azumirh.com.br</a>
            <Link to="/login" className="hover:text-white/60 transition-colors">Login</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}

// ── Primitivo Card ─────────────────────────────────────────────────────────────

function Card({
  title,
  children,
  action,
}: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-slate-700">{title}</h2>
        {action}
      </div>
      {children}
    </div>
  );
}
