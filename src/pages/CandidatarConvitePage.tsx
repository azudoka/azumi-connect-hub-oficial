import { Fragment, useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Check, ChevronRight, Loader2, UserCheck, X } from "lucide-react";
import DiscTeste from "@/components/disc/DiscTeste";
import { DiscIntroConsentimento } from "@/components/disc/DiscIntroConsentimento";
import type { DiscDim, DiscScores } from "@/components/disc/discQuestions";
import { supabase } from "@/integrations/supabase/client";
import { AzumiLogo } from "@/components/brand/AzumiLogo";
import { toast } from "sonner";

const EMAIL_API = "https://azumi-email-api.vercel.app/api/send-email";
const DISC_VALIDADE_MS = 1000 * 60 * 60 * 24 * 30 * 6;

const ESCOLARIDADES = [
  "Ensino Fundamental", "Ensino Médio", "Técnico/Tecnólogo",
  "Superior incompleto", "Superior completo", "Pós-graduação/MBA", "Mestrado/Doutorado",
];

type Step = "aceite" | "cpf" | "cadastro" | "disc" | "recusou" | "concluido";

interface Cadastro {
  nome: string; email: string; telefone: string; cpf: string;
  escolaridade: string; aceitePrivacidade: boolean;
}
const INIT: Cadastro = { nome: "", email: "", telefone: "", cpf: "", escolaridade: "", aceitePrivacidade: false };

interface DiscAnteriorData {
  score_d: number; score_i: number; score_s: number; score_c: number; fator_predominante: string;
}

export default function CandidatarConvitePage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    const html = document.documentElement;
    const hadMidnight = html.classList.contains("theme-midnight");
    html.classList.remove("theme-midnight");
    return () => { if (hadMidnight) html.classList.add("theme-midnight"); };
  }, []);

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [cqId, setCqId] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobTitulo, setJobTitulo] = useState("");
  const [empresaNome, setEmpresaNome] = useState("");
  const [discHabilitado, setDiscHabilitado] = useState(false);
  const [temQuestionario, setTemQuestionario] = useState(false);
  const [publicVisible, setPublicVisible] = useState(false);

  const [step, setStep] = useState<Step>("aceite");
  const [c, setC] = useState<Cadastro>(INIT);
  const [erroForm, setErroForm] = useState("");
  const [enviando, setEnviando] = useState(false);

  const cpfBuscadoRef = useRef("");
  const [candidatoExistenteId, setCandidatoExistenteId] = useState<string | null>(null);
  const [discAnterior, setDiscAnterior] = useState<DiscAnteriorData | null>(null);
  const [discValido, setDiscValido] = useState(false);
  const [querRefazerDisc, setQuerRefazerDisc] = useState<boolean | null>(null);
  const [discIntroAceito, setDiscIntroAceito] = useState(false);
  const [candidatoIdCriado, setCandidatoIdCriado] = useState<string | null>(null);

  useEffect(() => {
    if (!token) { setErro("Link inválido."); setCarregando(false); return; }
    (async () => {
      const { data, error } = await supabase
        .from("candidate_questionnaires")
        .select(`id, job_id, questionnaire_id, status, candidate_id,
          job_solicitations(id, cargo, confidencial, avulsa_empresa_nome, disc_habilitado, public_visible,
            companies(nome))`)
        .eq("token", token)
        .maybeSingle();
      if (error || !data) { setErro("Convite não encontrado ou expirado."); setCarregando(false); return; }
      if (data.candidate_id) { setErro("Este convite já foi utilizado."); setCarregando(false); return; }
      if ((data as any).status === "recusado") { setErro("Este convite foi recusado."); setCarregando(false); return; }

      setCqId(data.id);
      setJobId(data.job_id);
      setTemQuestionario(!!data.questionnaire_id);

      const js = (data as any).job_solicitations ?? {};
      setJobTitulo(js.cargo ?? "Vaga");
      setDiscHabilitado(js.disc_habilitado ?? false);
      setPublicVisible(js.public_visible ?? false);

      const confidencial = js.confidencial ?? false;
      if (!confidencial) {
        setEmpresaNome(js.companies?.nome ?? js.avulsa_empresa_nome ?? "");
      }
      setCarregando(false);
    })();
  }, [token]);

  function up<K extends keyof Cadastro>(k: K, v: Cadastro[K]) {
    setC((p) => ({ ...p, [k]: v }));
  }

  async function verificarCpf() {
    const cpfTrim = c.cpf.trim();
    if (!cpfTrim || cpfTrim === cpfBuscadoRef.current) return;
    cpfBuscadoRef.current = cpfTrim;

    const { data } = await supabase
      .from("candidates")
      .select("id, nome, email, telefone, escolaridade")
      .eq("cpf", cpfTrim)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data) {
      setCandidatoExistenteId(data.id);
      setC((p) => ({
        ...p,
        nome: data.nome ?? p.nome,
        email: data.email ?? p.email,
        telefone: data.telefone ?? p.telefone,
        escolaridade: (data.escolaridade as string) ?? p.escolaridade,
      }));
      toast.info(`Bem-vindo(a) de volta, ${data.nome}! Seus dados foram carregados automaticamente.`);

      if (discHabilitado) {
        const { data: disc } = await supabase
          .from("disc_resultado_candidato")
          .select("score_d, score_i, score_s, score_c, fator_predominante, created_at")
          .eq("candidato_id", data.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (disc) {
          const age = Date.now() - new Date((disc as any).created_at).getTime();
          if (age < DISC_VALIDADE_MS) {
            setDiscAnterior(disc as DiscAnteriorData);
            setDiscValido(true);
          }
        }
      }
    } else {
      setCandidatoExistenteId(null);
      setDiscAnterior(null);
      setDiscValido(false);
    }
  }

  async function avancarCpf() {
    if (!c.cpf.trim()) { setErroForm("Informe seu CPF."); return; }
    setErroForm("");
    await verificarCpf();
    setStep("cadastro");
  }

  function validar(): string {
    if (!c.nome.trim()) return "Informe seu nome completo.";
    if (!c.email.trim()) return "Informe o email.";
    if (!c.telefone.trim()) return "Informe o telefone.";
    if (!c.aceitePrivacidade) return "Aceite a Política de Privacidade para continuar.";
    return "";
  }

  async function submeterCadastro() {
    const msg = validar();
    if (msg) { setErroForm(msg); return; }
    setErroForm("");
    setEnviando(true);

    const { data: candidatoInserido, error } = await supabase
      .from("candidates")
      .insert({
        job_id: jobId,
        nome: c.nome, email: c.email, telefone: c.telefone,
        cpf: c.cpf || null, escolaridade: c.escolaridade || null,
        origem: "convite", banco_talentos: false, etapa_azumi: "recebido",
        lgpd_aceite: true, lgpd_aceite_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (error || !candidatoInserido) {
      console.error("[convite] candidato:", error?.message);
      setErroForm("Erro ao salvar. Tente novamente.");
      setEnviando(false);
      return;
    }

    const candidatoId = candidatoInserido.id;
    setCandidatoIdCriado(candidatoId);
    setEnviando(false);

    if (discHabilitado) {
      setStep("disc");
    } else {
      await finalizarCandidatura(candidatoId, null, null);
    }
  }

  async function recusar() {
    if (!cqId) return;
    setEnviando(true);
    await supabase.from("candidate_questionnaires")
      .update({ status: "recusado" })
      .eq("id", cqId);
    setEnviando(false);
    setStep("recusou");
  }

  async function usarDiscAnterior() {
    const candidatoId = candidatoIdCriado;
    if (!candidatoId || !discAnterior) return;
    const scores: DiscScores = {
      D: discAnterior.score_d, I: discAnterior.score_i,
      S: discAnterior.score_s, C: discAnterior.score_c,
    };
    await finalizarCandidatura(candidatoId, scores, discAnterior.fator_predominante as DiscDim);
  }

  async function concluirDisc(scores: DiscScores, perfilDim: DiscDim) {
    const candidatoId = candidatoIdCriado;
    if (!candidatoId) return;
    await finalizarCandidatura(candidatoId, scores, perfilDim);
  }

  async function finalizarCandidatura(candidatoId: string, scores: DiscScores | null, perfilDim: DiscDim | null) {
    setEnviando(true);

    if (scores && perfilDim) {
      const entries = (["D", "I", "S", "C"] as const)
        .map((k) => ({ k, v: scores[k] }))
        .sort((a, b) => b.v - a.v);
      await supabase.from("disc_resultado_candidato").insert({
        candidato_id: candidatoId,
        score_d: scores.D, score_i: scores.I, score_s: scores.S, score_c: scores.C,
        fator_predominante: perfilDim, fator_secundario: entries[1]?.k ?? null,
      });
    }

    await supabase.from("candidate_questionnaires")
      .update({ candidate_id: candidatoId, status: "respondido" })
      .eq("id", cqId!);

    fetch(EMAIL_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subject: `Nova candidatura (convite): ${c.nome} → ${jobTitulo}`,
        html: `<h2 style="color:#031D38">Nova candidatura via convite</h2>
          <table cellpadding="6" cellspacing="0" style="border-collapse:collapse;font-size:14px">
            <tr><td><strong>Vaga</strong></td><td>${jobTitulo}</td></tr>
            <tr><td><strong>Nome</strong></td><td>${c.nome}</td></tr>
            <tr><td><strong>Email</strong></td><td>${c.email}</td></tr>
            <tr><td><strong>Telefone</strong></td><td>${c.telefone}</td></tr>
            ${scores ? `<tr><td><strong>DISC</strong></td><td>D:${scores.D} I:${scores.I} S:${scores.S} C:${scores.C} — ${perfilDim}</td></tr>` : ""}
          </table>`,
      }),
    }).catch(() => {});

    setEnviando(false);

    if (temQuestionario) {
      navigate(`/questionario-resposta/${token}`);
    } else {
      setStep("concluido");
    }
  }

  // ── Loading / error ────────────────────────────────────────────────────────

  if (carregando) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500 text-sm">
        Carregando…
      </div>
    );
  }

  if (erro) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 gap-3"
        style={{ background: "linear-gradient(160deg, #14233F 0%, #264478 55%, #3D63B8 100%)" }}>
        <AzumiLogo product="Connect" size={44} light />
        <div className="mt-4 bg-white rounded-2xl p-6 shadow-xl max-w-sm w-full text-center">
          <p className="text-[#14233F] font-semibold text-sm mb-1">{erro}</p>
          <p className="text-slate-500 text-xs">Entre em contato com a Azumi RH se acredita que isso é um erro.</p>
          <div className="mt-4 flex gap-2">
            <a href="https://wa.me/5541988350743" target="_blank" rel="noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 rounded-full bg-[#25D366] text-white text-xs font-semibold py-2.5 hover:bg-[#1ebe5a] transition-colors">
              WhatsApp
            </a>
            <a href="mailto:contato@azumirh.com.br"
              className="flex-1 flex items-center justify-center gap-1.5 rounded-full border border-slate-300 text-slate-600 text-xs font-medium py-2.5 hover:bg-slate-50 transition-colors">
              E-mail
            </a>
          </div>
        </div>
        <p className="text-white/30 text-xs mt-4">Azumi RH · azumirh.com.br</p>
      </div>
    );
  }

  // ── Step: aceite ──────────────────────────────────────────────────────────

  if (step === "aceite") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 py-10 text-white"
        style={{ background: "linear-gradient(160deg, #14233F 0%, #264478 55%, #3D63B8 100%)" }}>
        {enviando && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#14233F]/60 backdrop-blur-sm">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          </div>
        )}
        <AzumiLogo product="Connect" size={44} light />
        <div className="mt-10 w-full max-w-sm">
          <div className="rounded-2xl bg-white/10 border border-white/20 p-6 text-center backdrop-blur-sm">
            <p className="text-xs font-sans uppercase tracking-wider text-white/60 mb-1">Convite para processo seletivo</p>
            <h1 className="font-display text-2xl font-bold leading-tight">{jobTitulo}</h1>
            {empresaNome && (
              <p className="mt-1 text-sm text-white/70">{empresaNome}</p>
            )}
            {publicVisible && jobId && (
              <a href={`/vagas/${jobId}`} target="_blank" rel="noreferrer"
                className="mt-3 inline-block text-xs text-white/60 underline hover:text-white/90 transition-colors">
                Ver detalhes da vaga ↗
              </a>
            )}
          </div>
          <div className="mt-6 space-y-3">
            <button
              onClick={() => setStep("cpf")}
              className="w-full rounded-full bg-white text-[#264478] font-semibold text-sm py-3.5 hover:bg-white/90 transition-colors shadow-lg">
              Sim, quero participar
            </button>
            <button
              onClick={recusar}
              disabled={enviando}
              className="w-full rounded-full border border-white/30 text-white/80 font-medium text-sm py-3.5 hover:bg-white/10 transition-colors">
              Não desejo participar
            </button>
          </div>
        </div>
        <p className="mt-10 text-white/30 text-xs">Azumi RH · azumirh.com.br</p>
      </div>
    );
  }

  // ── Step: recusou ─────────────────────────────────────────────────────────

  if (step === "recusou") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 py-10 text-center"
        style={{ background: "linear-gradient(160deg, #14233F 0%, #264478 55%, #3D63B8 100%)" }}>
        <AzumiLogo product="Connect" size={44} light />
        <div className="mt-8 bg-white rounded-2xl p-8 shadow-xl max-w-sm w-full">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
            <X className="h-7 w-7 text-slate-400" />
          </div>
          <h3 className="font-display text-lg font-semibold text-[#14233F]">Resposta registrada</h3>
          <p className="mt-2 text-sm text-slate-500">
            Agradecemos sua resposta. Sua recusa foi registrada com sucesso.
          </p>
        </div>
        <p className="mt-8 text-white/30 text-xs">Azumi RH · azumirh.com.br</p>
      </div>
    );
  }

  // ── Step: concluido ───────────────────────────────────────────────────────

  if (step === "concluido") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 py-10 text-center"
        style={{ background: "linear-gradient(160deg, #14233F 0%, #264478 55%, #3D63B8 100%)" }}>
        <AzumiLogo product="Connect" size={44} light />
        <div className="mt-8 bg-white rounded-2xl p-8 shadow-xl max-w-sm w-full">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-50">
            <Check className="h-7 w-7 text-green-500" />
          </div>
          <h3 className="font-display text-lg font-semibold text-[#14233F]">Candidatura enviada!</h3>
          <p className="mt-2 text-sm text-slate-500">Entraremos em contato em breve. Boa sorte!</p>
        </div>
        <p className="mt-8 text-white/30 text-xs">Azumi RH · azumirh.com.br</p>
      </div>
    );
  }

  // ── Multi-step page (cpf → cadastro → disc) ───────────────────────────────

  const stepLabels = [
    { key: "cpf", label: "Identificação" },
    { key: "cadastro", label: "Cadastro" },
    ...(discHabilitado ? [{ key: "disc", label: "Perfil DISC" }] : []),
  ];
  const stepIndex = stepLabels.findIndex((s) => s.key === step);

  return (
    <div className="min-h-screen flex flex-col bg-[#F0F4FA]">
      <div className="relative flex w-full max-w-4xl mx-auto flex-col flex-1">
        {enviando && (
          <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-white/80 backdrop-blur-sm">
            <Loader2 className="h-8 w-8 animate-spin text-[#264478]" />
            <p className="font-sans text-sm text-slate-600">Processando…</p>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 text-white"
          style={{ background: "linear-gradient(90deg, #14233F 0%, #264478 100%)" }}>
          <div className="min-w-0">
            <p className="font-sans text-xs uppercase tracking-wider text-white/60">Processo seletivo</p>
            <h2 className="truncate font-display text-base font-semibold">{jobTitulo}</h2>
          </div>
          <AzumiLogo product="Connect" light size={32} hideSubtitle />
        </div>

        {/* Stepper */}
        <div className="flex items-center gap-3 border-b border-slate-200 bg-white px-6 py-3">
          {stepLabels.map((s, i) => (
            <Fragment key={s.key}>
              {i > 0 && <div className="h-px flex-1 bg-slate-200" />}
              <StepItem n={i + 1} label={s.label} active={step === s.key} done={stepIndex > i} />
            </Fragment>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6">

          {step === "cpf" && (
            <div className="mx-auto max-w-md space-y-5">
              <div>
                <h3 className="font-display text-xl font-semibold text-foreground">Identificação</h3>
                <p className="mt-1 font-sans text-sm text-muted-foreground">
                  Informe seu CPF para começarmos. Se você já participou de outro processo pela Azumi RH, seus dados serão preenchidos automaticamente.
                </p>
              </div>
              <Field label="CPF *">
                <FInput
                  value={c.cpf}
                  onChange={(v) => { up("cpf", v); cpfBuscadoRef.current = ""; }}
                  placeholder="000.000.000-00"
                />
              </Field>
              {erroForm && <p className="font-sans text-sm text-destructive">{erroForm}</p>}
              <div className="flex justify-end pt-2">
                <button type="button" onClick={avancarCpf} className="btn-primary">
                  Continuar <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {step === "cadastro" && (
            <div className="mx-auto max-w-2xl space-y-5">
              {candidatoExistenteId && (
                <div className="flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3">
                  <UserCheck className="h-4 w-4 shrink-0 text-primary" />
                  <p className="font-sans text-sm text-foreground">
                    Cadastro encontrado — seus dados foram preenchidos automaticamente.
                  </p>
                </div>
              )}
              <Grid2>
                <Field label="Nome completo *"><FInput value={c.nome} onChange={(v) => up("nome", v)} /></Field>
                <Field label="Email *"><FInput type="email" value={c.email} onChange={(v) => up("email", v)} /></Field>
              </Grid2>
              <Grid2>
                <Field label="Telefone *">
                  <FInput value={c.telefone} onChange={(v) => up("telefone", v)} placeholder="(00) 00000-0000" />
                </Field>
                <Field label="CPF">
                  <FInput value={c.cpf} onChange={() => {}} readOnly />
                </Field>
              </Grid2>
              <Field label="Escolaridade (opcional)">
                <FSelect value={c.escolaridade} onChange={(v) => up("escolaridade", v)}>
                  <option value="">Selecione...</option>
                  {ESCOLARIDADES.map((e) => <option key={e} value={e}>{e}</option>)}
                </FSelect>
              </Field>
              <label className="flex items-start gap-2 font-sans text-xs text-foreground">
                <input type="checkbox" checked={c.aceitePrivacidade}
                  onChange={(e) => up("aceitePrivacidade", e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-border" />
                <span>
                  Li e aceito a{" "}
                  <a className="underline" href="https://azumirh.com.br/privacidade" target="_blank" rel="noreferrer">
                    Política de Privacidade
                  </a>
                  . Autorizo o tratamento dos meus dados pela Azumi RH para fins de recrutamento, em conformidade com a LGPD.
                </span>
              </label>
              {erroForm && <p className="font-sans text-sm text-destructive">{erroForm}</p>}
              <div className="flex items-center justify-between pt-2">
                <button type="button" onClick={() => { setStep("cpf"); setErroForm(""); }}
                  className="font-sans text-sm text-muted-foreground hover:text-foreground">
                  ← Voltar
                </button>
                <button type="button" onClick={submeterCadastro} className="btn-primary">
                  {discHabilitado ? <>Próximo <ChevronRight className="h-4 w-4" /></> : "Enviar candidatura"}
                </button>
              </div>
            </div>
          )}

          {step === "disc" && (
            <div className="mx-auto max-w-2xl">
              {/* Reuse question */}
              {discValido && querRefazerDisc === null && (
                <div className="mx-auto max-w-md space-y-5 py-8 text-center">
                  <h3 className="font-display text-xl font-semibold text-foreground">Perfil DISC</h3>
                  <p className="font-sans text-sm text-muted-foreground">
                    Você já possui um resultado DISC recente. Deseja utilizá-lo ou prefere refazer o teste?
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button type="button" onClick={usarDiscAnterior} className="btn-primary">
                      Usar resultado anterior
                    </button>
                    <button type="button" onClick={() => setQuerRefazerDisc(true)}
                      className="rounded-full border border-border px-5 py-2.5 font-sans text-sm font-medium text-foreground hover:bg-muted transition-colors">
                      Refazer o teste
                    </button>
                  </div>
                </div>
              )}

              {/* DISC intro */}
              {(!discValido || querRefazerDisc === true) && !discIntroAceito && (
                <DiscIntroConsentimento
                  nomeCandidato={c.nome || "Candidato"}
                  onAceitar={() => setDiscIntroAceito(true)}
                />
              )}

              {/* DISC test */}
              {(!discValido || querRefazerDisc === true) && discIntroAceito && (
                <DiscTeste candidateName={c.nome || "Candidato"} onComplete={concluirDisc} />
              )}
            </div>
          )}
        </div>

        <p className="text-center text-xs text-slate-400 py-4">Azumi RH · azumirh.com.br</p>
      </div>
    </div>
  );
}

function StepItem({ n, label, active, done }: { n: number; label: string; active: boolean; done: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`flex h-7 w-7 items-center justify-center rounded-full font-sans text-xs font-semibold ${
        done ? "bg-success text-success-foreground" : active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
      }`}>
        {done ? <Check className="h-4 w-4" /> : n}
      </div>
      <span className={`font-sans text-sm font-medium ${active || done ? "text-foreground" : "text-muted-foreground"}`}>{label}</span>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block font-sans text-xs font-medium text-foreground">{label}</label>
      {children}
    </div>
  );
}

function Grid2({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>;
}

function FInput({ value, onChange, type = "text", placeholder, onBlur, readOnly }: {
  value: string; onChange: (v: string) => void; type?: string; placeholder?: string; onBlur?: () => void; readOnly?: boolean;
}) {
  return (
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      readOnly={readOnly}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      className={`w-full rounded-lg border border-border bg-background px-3 py-2 font-sans text-sm text-foreground focus:border-primary focus:outline-none ${readOnly ? "cursor-default select-none opacity-70" : ""}`}
    />
  );
}

function FSelect({ value, onChange, children }: { value: string; onChange: (v: string) => void; children: React.ReactNode }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-border bg-background px-3 py-2 font-sans text-sm text-foreground focus:border-primary focus:outline-none"
    >
      {children}
    </select>
  );
}
