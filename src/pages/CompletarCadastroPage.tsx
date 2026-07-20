import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AzumiLogo } from "@/components/brand/AzumiLogo";
import { Loader2, CheckCircle2, XCircle, MessageCircle, Mail } from "lucide-react";
import { toast } from "sonner";
import DiscTeste from "@/components/disc/DiscTeste";
import { DiscIntroConsentimento } from "@/components/disc/DiscIntroConsentimento";
import type { DiscDim, DiscScores } from "@/components/disc/discQuestions";

const GRAD = "linear-gradient(160deg, #14233F 0%, #264478 55%, #3D63B8 100%)";
const WA_LINK = "https://wa.me/5541988350743";

const ESCOLARIDADES = [
  "Ensino Fundamental", "Ensino Médio", "Técnico/Tecnólogo",
  "Superior incompleto", "Superior completo", "Pós-graduação/MBA", "Mestrado/Doutorado",
];

type Step = "loading" | "erro" | "boas_vindas" | "form" | "disc_intro" | "disc_teste" | "concluido";

interface CandidatoData {
  id: string;
  nome: string | null;
  email: string | null;
  telefone: string | null;
  cpf: string | null;
  escolaridade: string | null;
  linkedin: string | null;
  cidade: string | null;
  curriculo_url: string | null;
  job_solicitations?: { cargo: string | null; avulsa_empresa_nome: string | null; disc_habilitado: boolean | null } | null;
}

function Capa({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: GRAD }} className="flex flex-col items-center gap-3 px-6 py-10 text-center text-white">
      <AzumiLogo product="Connect" size={44} light hideSubtitle />
      {children}
    </div>
  );
}

function BotaoContato() {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-4">
      <a href={WA_LINK} target="_blank" rel="noreferrer"
        className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-semibold text-white shadow transition hover:brightness-95">
        <MessageCircle className="h-4 w-4" /> WhatsApp
      </a>
      <a href="mailto:contato@azumirh.com.br"
        className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-white/20">
        <Mail className="h-4 w-4" /> E-mail
      </a>
    </div>
  );
}

export default function CompletarCadastroPage() {
  const { token } = useParams<{ token: string }>();
  const [step, setStep] = useState<Step>("loading");

  useEffect(() => {
    const html = document.documentElement;
    const hadMidnight = html.classList.contains("theme-midnight");
    html.classList.remove("theme-midnight");
    return () => { if (hadMidnight) html.classList.add("theme-midnight"); };
  }, []);
  const [erroMsg, setErroMsg] = useState<string | null>(null);
  const [cand, setCand] = useState<CandidatoData | null>(null);
  const [discHabilitado, setDiscHabilitado] = useState(false);

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cpf, setCpf] = useState("");
  const [escolaridade, setEscolaridade] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [cidade, setCidade] = useState("");
  const [curriculo, setCurriculo] = useState<File | null>(null);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (!token) { setErroMsg("Link inválido."); setStep("erro"); return; }
    (async () => {
      const { data, error } = await (supabase as any)
        .from("candidates")
        .select("id, nome, email, telefone, cpf, escolaridade, linkedin, cidade, curriculo_url, job_solicitations!candidates_job_id_fkey(cargo, avulsa_empresa_nome, disc_habilitado)")
        .eq("token_completar_cadastro", token)
        .maybeSingle();
      if (error || !data) {
        setErroMsg("Link não encontrado ou já utilizado.");
        setStep("erro");
        return;
      }
      setCand(data);
      setNome(data.nome ?? "");
      setEmail(data.email ?? "");
      setTelefone(data.telefone ?? "");
      setCpf(data.cpf ?? "");
      setEscolaridade(data.escolaridade ?? "");
      setLinkedin(data.linkedin ?? "");
      setCidade(data.cidade ?? "");
      setDiscHabilitado(data.job_solicitations?.disc_habilitado ?? false);
      setStep("boas_vindas");
    })();
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!cand || !nome.trim()) return;
    setEnviando(true);
    try {
      const updates: Record<string, string | null> = {
        nome: nome.trim(),
        email: email.trim() || null,
        telefone: telefone.trim() || null,
        cpf: cpf.trim() || null,
        escolaridade: escolaridade || null,
        linkedin: linkedin.trim() || null,
        cidade: cidade.trim() || null,
        token_completar_cadastro: null,
      };

      if (curriculo) {
        const ext = curriculo.name.split(".").pop();
        const path = `${cand.id}/curriculo.${ext}`;
        const { error: errUp } = await supabase.storage.from("curriculos").upload(path, curriculo, { upsert: true });
        if (!errUp) {
          const { data: pub } = supabase.storage.from("curriculos").getPublicUrl(path);
          updates.curriculo_url = pub.publicUrl;
          updates.curriculo_nome = curriculo.name;
        }
      }

      const { error } = await (supabase as any).from("candidates").update(updates).eq("id", cand.id);
      if (error) throw error;

      if (discHabilitado) {
        const { data: discExistente } = await (supabase as any)
          .from("disc_resultado_candidato")
          .select("id")
          .eq("candidato_id", cand.id)
          .maybeSingle();
        setStep(discExistente ? "concluido" : "disc_intro");
      } else {
        setStep("concluido");
      }
    } catch (err) {
      toast.error("Erro ao salvar: " + (err instanceof Error ? err.message : "tente novamente"));
    } finally {
      setEnviando(false);
    }
  }

  async function handleDiscComplete(scores: DiscScores, perfilDim: DiscDim) {
    if (!cand) return;
    const fatorSecundario = (["D", "I", "S", "C"] as const)
      .map((k) => ({ k, v: scores[k] }))
      .sort((a, b) => b.v - a.v)[1]?.k ?? null;

    const { error } = await (supabase as any).from("disc_resultado_candidato").insert({
      candidato_id: cand.id,
      score_d: scores.D,
      score_i: scores.I,
      score_s: scores.S,
      score_c: scores.C,
      fator_predominante: perfilDim,
      fator_secundario: fatorSecundario,
    });

    if (error) {
      toast.error("Erro ao salvar resultado DISC.");
      return;
    }
    setStep("concluido");
  }

  const empresa = cand?.job_solicitations?.avulsa_empresa_nome ?? "Azumi RH";
  const vaga = cand?.job_solicitations?.cargo ?? "vaga";
  const primeiroNome = (cand?.nome ?? nome).split(" ")[0] || "";

  // ── Loading ───────────────────────────────────────────────
  if (step === "loading") {
    return (
      <div className="min-h-screen bg-[#F0F4FA]">
        <Capa><p className="text-white/70 text-sm">Carregando…</p></Capa>
      </div>
    );
  }

  // ── Erro ─────────────────────────────────────────────────
  if (step === "erro") {
    return (
      <div className="min-h-screen bg-[#F0F4FA]">
        <Capa>
          <XCircle className="h-10 w-10 text-red-300 mt-2" />
          <p className="text-lg font-semibold">Link inválido</p>
          <p className="text-white/80 text-sm max-w-sm">{erroMsg}</p>
          <p className="text-white/70 text-sm mt-1">Em caso de dúvidas, entre em contato:</p>
          <BotaoContato />
        </Capa>
      </div>
    );
  }

  // ── DISC intro ───────────────────────────────────────────
  if (step === "disc_intro") {
    return (
      <div className="min-h-screen bg-[#F0F4FA]">
        <Capa><p className="text-white/70 text-sm -mt-1">Perfil Comportamental DISC</p></Capa>
        <div className="max-w-2xl mx-auto py-8 px-4">
          <DiscIntroConsentimento
            nomeCandidato={primeiroNome || "Candidato"}
            onAceitar={() => setStep("disc_teste")}
          />
        </div>
      </div>
    );
  }

  // ── DISC teste ───────────────────────────────────────────
  if (step === "disc_teste") {
    return (
      <div className="min-h-screen bg-[#F0F4FA]">
        <Capa><p className="text-white/70 text-sm -mt-1">Perfil Comportamental DISC</p></Capa>
        <div className="max-w-2xl mx-auto py-8 px-4">
          <DiscTeste candidateName={primeiroNome || "Candidato"} onComplete={handleDiscComplete} />
        </div>
      </div>
    );
  }

  // ── Concluído ────────────────────────────────────────────
  if (step === "concluido") {
    return (
      <div className="min-h-screen bg-[#F0F4FA]">
        <Capa>
          <CheckCircle2 className="h-12 w-12 text-green-300 mt-2" />
          <p className="text-xl font-semibold">
            {discHabilitado ? "Tudo pronto!" : "Cadastro concluído!"}
          </p>
          <p className="text-white/80 text-sm max-w-sm">
            {discHabilitado
              ? `Seu perfil e resultado comportamental foram enviados para a equipe da Azumi RH. Em breve entraremos em contato sobre a vaga de ${vaga}.`
              : `Seu perfil foi enviado para a equipe da Azumi RH. Em breve entraremos em contato sobre a vaga de ${vaga}.`}
          </p>
        </Capa>
      </div>
    );
  }

  // ── Boas-vindas ──────────────────────────────────────────
  if (step === "boas_vindas") {
    return (
      <div className="min-h-screen bg-[#F0F4FA]">
        <Capa>
          <p className="mt-1 text-2xl font-bold leading-tight">
            Olá{primeiroNome ? `, ${primeiroNome}` : ""}! 👋
          </p>
          <p className="text-white/85 text-sm max-w-xs leading-relaxed">
            Bem-vindo(a) à <strong className="text-white">Azumi RH</strong>. Você foi selecionado(a) para o processo seletivo da vaga de{" "}
            <strong className="text-white">{vaga}</strong> em {empresa}.
          </p>
        </Capa>

        <div className="max-w-md mx-auto py-8 px-4">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 space-y-6">
            <div className="text-center">
              <p className="text-slate-800 font-semibold text-lg">O que vai acontecer agora?</p>
            </div>

            <ol className="space-y-4">
              <li className="flex items-start gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#264478] text-white text-xs font-bold">1</span>
                <div>
                  <p className="text-sm font-medium text-slate-800">Complete seu cadastro</p>
                  <p className="text-xs text-slate-500 mt-0.5">Confirme seus dados pessoais e envie seu currículo.</p>
                </div>
              </li>
              {discHabilitado && (
                <li className="flex items-start gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#264478] text-white text-xs font-bold">2</span>
                  <div>
                    <p className="text-sm font-medium text-slate-800">Perfil Comportamental DISC</p>
                    <p className="text-xs text-slate-500 mt-0.5">Responda um questionário rápido para mapear seu perfil. Leva ~10 minutos.</p>
                  </div>
                </li>
              )}
              <li className="flex items-start gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#264478] text-white text-xs font-bold">{discHabilitado ? "3" : "2"}</span>
                <div>
                  <p className="text-sm font-medium text-slate-800">Aguarde o contato</p>
                  <p className="text-xs text-slate-500 mt-0.5">Nossa equipe vai analisar seu perfil e entrar em contato em breve.</p>
                </div>
              </li>
            </ol>

            <button
              type="button"
              onClick={() => setStep("form")}
              className="w-full rounded-full bg-[#264478] py-3 text-sm font-semibold text-white transition hover:bg-[#1e3560]"
            >
              Começar →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Formulário ───────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#F0F4FA]">
      <Capa>
        <p className="text-white/70 text-sm -mt-1">Complete seu cadastro</p>
      </Capa>

      <div className="max-w-lg mx-auto py-8 px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <div className="mb-6">
            <h1 className="text-lg font-semibold text-slate-800">Seus dados</h1>
            <p className="text-slate-500 text-sm mt-0.5">
              Processo seletivo: <strong>{vaga}</strong> — {empresa}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-medium text-slate-700">Nome completo *</label>
                <input required value={nome} onChange={(e) => setNome(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#264478]/30" />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700">E-mail</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#264478]/30" />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700">Telefone / WhatsApp</label>
                <input value={telefone} onChange={(e) => setTelefone(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#264478]/30" />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700">CPF</label>
                <input value={cpf} onChange={(e) => setCpf(e.target.value)} placeholder="000.000.000-00"
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#264478]/30" />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700">Cidade / Estado</label>
                <input value={cidade} onChange={(e) => setCidade(e.target.value)} placeholder="Ex: São Paulo / SP"
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#264478]/30" />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700">Escolaridade</label>
                <select value={escolaridade} onChange={(e) => setEscolaridade(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#264478]/30">
                  <option value="">Selecione...</option>
                  {ESCOLARIDADES.map((e) => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700">LinkedIn (opcional)</label>
                <input value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="linkedin.com/in/..."
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#264478]/30" />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-medium text-slate-700">
                  Currículo {cand?.curriculo_url ? "(novo arquivo substitui o atual)" : "(opcional)"}
                </label>
                <input type="file" accept=".pdf,.doc,.docx"
                  onChange={(e) => setCurriculo(e.target.files?.[0] ?? null)}
                  className="w-full text-sm text-slate-500 file:mr-3 file:h-8 file:rounded-full file:border-0 file:bg-[#264478] file:px-4 file:text-xs file:font-semibold file:text-white hover:file:bg-[#1e3560]" />
                {cand?.curriculo_url && !curriculo && (
                  <a href={cand.curriculo_url} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-[#264478] underline">Ver currículo atual</a>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={enviando || !nome.trim()}
              className="w-full rounded-full bg-[#264478] py-3 text-sm font-semibold text-white transition hover:bg-[#1e3560] disabled:opacity-60 inline-flex items-center justify-center gap-2"
            >
              {enviando ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {discHabilitado ? "Salvar e responder DISC →" : "Enviar cadastro"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
