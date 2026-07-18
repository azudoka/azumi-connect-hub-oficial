import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Check, ChevronRight, Loader2, UserCheck } from "lucide-react";
import DiscTeste from "@/components/disc/DiscTeste";
import type { DiscDim, DiscScores } from "@/components/disc/discQuestions";
import { supabase } from "@/integrations/supabase/client";
import { AzumiLogo } from "@/components/brand/AzumiLogo";
import { toast } from "sonner";

const EMAIL_API = "https://azumi-email-api.vercel.app/api/send-email";

const ESCOLARIDADES = [
  "Ensino Fundamental", "Ensino Médio", "Técnico/Tecnólogo",
  "Superior incompleto", "Superior completo", "Pós-graduação/MBA", "Mestrado/Doutorado",
];

interface Cadastro {
  nome: string;
  email: string;
  telefone: string;
  cpf: string;
  escolaridade: string;
  aceitePrivacidade: boolean;
}

const INIT: Cadastro = {
  nome: "", email: "", telefone: "", cpf: "", escolaridade: "", aceitePrivacidade: false,
};

export default function CandidatarConvitePage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [cqId, setCqId] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobTitulo, setJobTitulo] = useState<string>("");
  const [temQuestionario, setTemQuestionario] = useState(false);

  const [step, setStep] = useState<1 | 2 | "ok">(1);
  const [c, setC] = useState<Cadastro>(INIT);
  const [erroForm, setErroForm] = useState("");
  const [enviando, setEnviando] = useState(false);

  // CPF — reaproveitamento de candidato existente
  const cpfBuscadoRef = useRef("");
  const [candidatoExistenteId, setCandidatoExistenteId] = useState<string | null>(null);

  // T3 — select inclui candidate_id
  useEffect(() => {
    if (!token) { setErro("Link inválido."); setCarregando(false); return; }
    (async () => {
      const { data, error } = await supabase
        .from("candidate_questionnaires")
        .select("id, job_id, questionnaire_id, status, candidate_id, job_solicitations(cargo)")
        .eq("token", token)
        .maybeSingle();
      if (error || !data) { setErro("Convite não encontrado ou expirado."); setCarregando(false); return; }
      if (data.candidate_id) { setErro("Este convite já foi utilizado."); setCarregando(false); return; }
      setCqId(data.id);
      setJobId(data.job_id);
      setTemQuestionario(!!data.questionnaire_id);
      const js = data.job_solicitations as any;
      setJobTitulo(js?.cargo ?? "Vaga");
      setCarregando(false);
    })();
  }, [token]);

  function up<K extends keyof Cadastro>(k: K, v: Cadastro[K]) {
    setC((p) => ({ ...p, [k]: v }));
  }

  // T2 — lookup de CPF com reaproveitamento real
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
    } else {
      setCandidatoExistenteId(null);
    }
  }

  // T1 — validação enxuta
  function validar(): string {
    if (!c.nome.trim()) return "Informe seu nome completo.";
    if (!c.email.trim()) return "Informe o email.";
    if (!c.telefone.trim()) return "Informe o telefone.";
    if (!c.cpf.trim()) return "Informe o CPF.";
    if (!c.aceitePrivacidade) return "Aceite a Política de Privacidade para continuar.";
    return "";
  }

  function avancar() {
    const msg = validar();
    if (msg) { setErroForm(msg); return; }
    setErroForm("");
    setStep(2);
  }

  async function concluir(scores: DiscScores, perfilDim: DiscDim) {
    if (!jobId || !cqId) return;
    setEnviando(true);

    // Sempre INSERT — CPF serve só pra pré-preencher dados, cada convite/vaga é uma linha nova
    const { data: candidatoInserido, error: erroCandidato } = await supabase
      .from("candidates")
      .insert({
        job_id: jobId,
        nome: c.nome,
        email: c.email,
        telefone: c.telefone,
        cpf: c.cpf || null,
        escolaridade: c.escolaridade || null,
        origem: "convite",
        banco_talentos: false,
        etapa_azumi: "recebido",
        lgpd_aceite: c.aceitePrivacidade,
        lgpd_aceite_at: c.aceitePrivacidade ? new Date().toISOString() : null,
      })
      .select("id")
      .single();

    if (erroCandidato || !candidatoInserido) {
      console.error("[convite] candidato:", erroCandidato?.message);
      setEnviando(false);
      return;
    }
    const candidatoId = candidatoInserido.id;

    // DISC — múltiplos resultados por pessoa ao longo do tempo é OK
    const entries = (["D", "I", "S", "C"] as const)
      .map((k) => ({ k, v: scores[k] }))
      .sort((a, b) => b.v - a.v);

    await supabase.from("disc_resultado_candidato").insert({
      candidato_id: candidatoId,
      score_d: scores.D,
      score_i: scores.I,
      score_s: scores.S,
      score_c: scores.C,
      fator_predominante: perfilDim,
      fator_secundario: entries[1]?.k ?? null,
    });

    // Vincular candidato ao convite
    await supabase
      .from("candidate_questionnaires")
      .update({ candidate_id: candidatoId })
      .eq("id", cqId);

    // Email de notificação
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
            <tr><td><strong>DISC</strong></td><td>D:${scores.D} I:${scores.I} S:${scores.S} C:${scores.C} — ${perfilDim}</td></tr>
          </table>`,
      }),
    }).catch(() => {});

    setEnviando(false);

    if (temQuestionario) {
      navigate(`/questionario-resposta/${token}`);
    } else {
      setStep("ok");
    }
  }

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

  return (
    <div className="min-h-screen flex flex-col bg-[#F0F4FA]">
      <div className="relative flex w-full max-w-4xl mx-auto flex-col flex-1">
        {enviando && (
          <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-white/80 backdrop-blur-sm">
            <Loader2 className="h-8 w-8 animate-spin text-[#264478]" />
            <p className="font-sans text-sm text-slate-600">Enviando candidatura…</p>
          </div>
        )}

        {/* Header — branded gradient */}
        <div
          className="flex items-center justify-between px-6 py-4 text-white"
          style={{ background: "linear-gradient(90deg, #14233F 0%, #264478 100%)" }}
        >
          <div className="min-w-0">
            <p className="font-sans text-xs uppercase tracking-wider text-white/60">Processo seletivo</p>
            <h2 className="truncate font-display text-base font-semibold">{jobTitulo}</h2>
          </div>
          <AzumiLogo product="Connect" light size={32} hideSubtitle />
        </div>

        {/* Stepper */}
        {step !== "ok" && (
          <div className="flex items-center gap-3 border-b border-slate-200 bg-white px-6 py-3">
            <StepItem n={1} label="Cadastro" active={step === 1} done={step === 2} />
            <div className="h-px flex-1 bg-slate-200" />
            <StepItem n={2} label="Perfil DISC" active={step === 2} done={false} />
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {step === 1 && (
            <div className="mx-auto max-w-2xl space-y-5">

              {/* Banner CPF encontrado */}
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
                <Field label="CPF *">
                  <FInput
                    value={c.cpf}
                    onChange={(v) => {
                      up("cpf", v);
                      setCandidatoExistenteId(null);
                      cpfBuscadoRef.current = "";
                    }}
                    placeholder="000.000.000-00"
                    onBlur={verificarCpf}
                  />
                </Field>
              </Grid2>

              <Field label="Escolaridade (opcional)">
                <FSelect value={c.escolaridade} onChange={(v) => up("escolaridade", v)}>
                  <option value="">Selecione...</option>
                  {ESCOLARIDADES.map((e) => <option key={e} value={e}>{e}</option>)}
                </FSelect>
              </Field>

              <label className="flex items-start gap-2 font-sans text-xs text-foreground">
                <input
                  type="checkbox"
                  checked={c.aceitePrivacidade}
                  onChange={(e) => up("aceitePrivacidade", e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-border"
                />
                <span>
                  Li e aceito a{" "}
                  <a className="underline" href="https://azumirh.com.br/privacidade" target="_blank" rel="noreferrer">
                    Política de Privacidade
                  </a>
                  . Autorizo o tratamento dos meus dados pela Azumi RH para fins de recrutamento, em conformidade com a LGPD.
                </span>
              </label>

              {erroForm && <p className="font-sans text-sm text-destructive">{erroForm}</p>}

              <div className="flex justify-end pt-2">
                <button type="button" onClick={avancar} className="btn-primary">
                  Próximo <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="mx-auto max-w-2xl">
              <DiscTeste candidateName={c.nome || "Candidato"} onComplete={concluir} />
            </div>
          )}

          {step === "ok" && (
            <div className="mx-auto max-w-md py-10 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[hsl(var(--success)/0.15)] text-success">
                <Check className="h-8 w-8" />
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground">Candidatura enviada!</h3>
              <p className="mt-2 font-sans text-sm text-muted-foreground">Entraremos em contato em breve.</p>
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

function FInput({ value, onChange, type = "text", placeholder, onBlur }: {
  value: string; onChange: (v: string) => void; type?: string; placeholder?: string; onBlur?: () => void;
}) {
  return (
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      className="w-full rounded-lg border border-border bg-background px-3 py-2 font-sans text-sm text-foreground focus:border-primary focus:outline-none"
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
