import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DiscTeste from "@/components/disc/DiscTeste";
import { DiscIntroConsentimento } from "@/components/disc/DiscIntroConsentimento";
import type { DiscDim, DiscScores } from "@/components/disc/discQuestions";
import { AzumiLogo } from "@/components/brand/AzumiLogo";
import { MessageCircle, Mail } from "lucide-react";

const GRAD = "linear-gradient(160deg, #14233F 0%, #264478 55%, #3D63B8 100%)";

const SETORES_INTERESSE = [
  "Administrativo", "Comercial/Vendas", "Financeiro", "RH",
  "Tecnologia", "Operações", "Marketing", "Atendimento",
  "Logística", "Produção/Industrial",
];
const WA_LINK = "https://wa.me/5541988350743";

type Step =
  | "loading"
  | "erro"
  | "landing"
  | "cpf"
  | "cpf_confirmar"
  | "cadastro"
  | "intro"
  | "teste"
  | "concluido"
  | "ja_respondeu";

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
      <a
        href={WA_LINK}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-semibold text-white shadow transition hover:brightness-95"
      >
        <MessageCircle className="h-4 w-4" /> WhatsApp
      </a>
      <a
        href="mailto:contato@azumirh.com.br"
        className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-white/20"
      >
        <Mail className="h-4 w-4" /> E-mail
      </a>
    </div>
  );
}

function BotaoContatoCard() {
  return (
    <div className="flex gap-2 mt-3">
      <a
        href={WA_LINK}
        target="_blank"
        rel="noreferrer"
        className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full bg-[#25D366] py-2 text-xs font-semibold text-white"
      >
        <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
      </a>
      <a
        href="mailto:contato@azumirh.com.br"
        className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full border border-slate-300 py-2 text-xs font-semibold text-slate-600"
      >
        <Mail className="h-3.5 w-3.5" /> E-mail
      </a>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
      {children}
    </div>
  );
}

function BtnPrimary({ onClick, disabled, children }: { onClick?: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-full rounded-full bg-[#264478] py-3 text-sm font-semibold text-white transition hover:bg-[#1e3560] disabled:opacity-60"
    >
      {children}
    </button>
  );
}

function BtnSecondary({ onClick, children }: { onClick?: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-full border border-slate-300 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
    >
      {children}
    </button>
  );
}

export default function DiscAvulsoPage() {
  const { token } = useParams<{ token: string }>();
  const [step, setStep] = useState<Step>("loading");

  useEffect(() => {
    const html = document.documentElement;
    const hadMidnight = html.classList.contains("theme-midnight");
    html.classList.remove("theme-midnight");
    return () => { if (hadMidnight) html.classList.add("theme-midnight"); };
  }, []);
  const [erroMsg, setErroMsg] = useState("");
  const [conviteId, setConviteId] = useState<string | null>(null);
  const [candidatoId, setCandidatoId] = useState<string | null>(null);
  const [candidatoNome, setCandidatoNome] = useState<string | null>(null);
  const [candidatoCpf, setCandidatoCpf] = useState<string | null>(null);

  // CPF lookup / confirmation
  const [cpfInput, setCpfInput] = useState("");
  const [cpfErro, setCpfErro] = useState<string | null>(null);
  const [cpfCarregando, setCpfCarregando] = useState(false);

  // Mini-cadastro
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [setoresSelecionados, setSetoresSelecionados] = useState<string[]>([]);
  const [cargosInteresse, setCargosInteresse] = useState("");
  const [cadastrando, setCadastrando] = useState(false);

  function toggleSetor(s: string) {
    setSetoresSelecionados((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  }

  useEffect(() => {
    if (!token) { setErroMsg("Link inválido."); setStep("erro"); return; }
    (async () => {
      const { data: convite, error } = await (supabase as any)
        .from("disc_convites_avulsos")
        .select("id, candidato_id")
        .eq("token", token)
        .maybeSingle();

      if (error || !convite) {
        setErroMsg("Link inválido ou expirado.");
        setStep("erro");
        return;
      }

      setConviteId(convite.id);

      if (convite.candidato_id) {
        const { data: cand } = await supabase
          .from("candidates")
          .select("nome, cpf")
          .eq("id", convite.candidato_id)
          .maybeSingle();

        if (!cand) {
          setErroMsg("Candidato vinculado não encontrado.");
          setStep("erro");
          return;
        }

        const { data: discExistente } = await supabase
          .from("disc_resultado_candidato")
          .select("id")
          .eq("candidato_id", convite.candidato_id)
          .maybeSingle();

        if (discExistente) { setStep("ja_respondeu"); return; }

        setCandidatoId(convite.candidato_id);
        setCandidatoNome(cand.nome);
        setCandidatoCpf((cand as any).cpf ?? null);
        setStep((cand as any).cpf ? "cpf_confirmar" : "intro");
      } else {
        setStep("landing");
      }
    })();
  }, [token]);

  function formatarCpf(val: string) {
    const nums = val.replace(/\D/g, "").slice(0, 11);
    return nums
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1-$2");
  }

  async function handleCpfLookup() {
    const nums = cpfInput.replace(/\D/g, "");
    if (nums.length < 11) { setCpfErro("Digite o CPF completo."); return; }
    setCpfCarregando(true);
    setCpfErro(null);

    const { data: cand } = await supabase
      .from("candidates")
      .select("id, nome, cpf")
      .eq("cpf", nums)
      .maybeSingle();

    if (!cand) {
      setCpfErro("CPF não encontrado. Se ainda não tem cadastro, clique em \"Não tenho cadastro\".");
      setCpfCarregando(false);
      return;
    }

    const { data: discExistente } = await supabase
      .from("disc_resultado_candidato")
      .select("id")
      .eq("candidato_id", cand.id)
      .maybeSingle();

    if (discExistente) { setStep("ja_respondeu"); setCpfCarregando(false); return; }

    await (supabase as any)
      .from("disc_convites_avulsos")
      .update({ candidato_id: cand.id })
      .eq("id", conviteId!);

    setCandidatoId(cand.id);
    setCandidatoNome(cand.nome);
    setCpfCarregando(false);
    setStep("intro");
  }

  function handleCpfConfirmar() {
    const nums = cpfInput.replace(/\D/g, "");
    const cpfNums = (candidatoCpf ?? "").replace(/\D/g, "");
    if (nums.length < 11) { setCpfErro("Digite o CPF completo."); return; }
    if (nums === cpfNums) { setCpfErro(null); setStep("intro"); }
    else { setCpfErro("CPF incorreto. Verifique e tente novamente."); }
  }

  async function handleCadastro() {
    if (!nome.trim()) return;
    setCadastrando(true);

    const cargosArray = cargosInteresse
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);

    const { data: novoCand, error } = await supabase
      .from("candidates")
      .insert({
        nome: nome.trim(),
        email: email.trim() || null,
        telefone: telefone.trim() || null,
        banco_talentos: true,
        job_id: null,
        origem: "disc_avulso",
        interesses_setores: setoresSelecionados.length ? setoresSelecionados : null,
        interesses_cargos: cargosArray.length ? cargosArray : null,
      } as any)
      .select("id")
      .single();

    if (error || !novoCand) {
      setErroMsg("Erro ao criar cadastro. Tente novamente.");
      setStep("erro");
      setCadastrando(false);
      return;
    }

    await (supabase as any)
      .from("disc_convites_avulsos")
      .update({ candidato_id: novoCand.id })
      .eq("id", conviteId!);

    setCandidatoId(novoCand.id);
    setCandidatoNome(nome.trim());
    setCadastrando(false);
    setStep("intro");
  }

  async function handleComplete(scores: DiscScores, perfilDim: DiscDim) {
    if (!candidatoId) return;
    const entries = (["D", "I", "S", "C"] as const)
      .map((k) => ({ k, v: scores[k] }))
      .sort((a, b) => b.v - a.v);
    const fatorSecundario = entries[1]?.k ?? null;

    const { error } = await supabase.from("disc_resultado_candidato").insert({
      candidato_id: candidatoId,
      score_d: scores.D,
      score_i: scores.I,
      score_s: scores.S,
      score_c: scores.C,
      fator_predominante: perfilDim,
      fator_secundario: fatorSecundario,
    });

    if (error) { setErroMsg("Erro ao salvar: " + error.message); setStep("erro"); return; }
    setStep("concluido");
  }

  // ── Renders ──────────────────────────────────────────────

  if (step === "loading") {
    return (
      <div className="min-h-screen bg-[#F0F4FA]">
        <Capa><p className="text-white/70 text-sm">Carregando…</p></Capa>
      </div>
    );
  }

  if (step === "erro") {
    return (
      <div className="min-h-screen bg-[#F0F4FA]">
        <Capa>
          <p className="mt-2 text-lg font-semibold">Algo deu errado</p>
          <p className="text-white/80 text-sm max-w-sm">{erroMsg}</p>
          <p className="text-white/70 text-sm mt-1">Entre em contato com a consultora responsável:</p>
          <BotaoContato />
        </Capa>
      </div>
    );
  }

  if (step === "ja_respondeu") {
    return (
      <div className="min-h-screen bg-[#F0F4FA]">
        <Capa>
          <p className="mt-2 text-xl font-semibold">Teste já realizado</p>
          <p className="text-white/80 text-sm max-w-sm">
            Você já respondeu o teste DISC. Nossa equipe já tem acesso ao seu perfil.
          </p>
          <p className="text-white/70 text-sm mt-1">Dúvidas? Fale conosco:</p>
          <BotaoContato />
        </Capa>
      </div>
    );
  }

  if (step === "concluido") {
    return (
      <div className="min-h-screen bg-[#F0F4FA]">
        <Capa>
          <p className="mt-2 text-xl font-semibold">
            Obrigado{candidatoNome ? `, ${candidatoNome.split(" ")[0]}` : ""}!
          </p>
          <p className="text-white/80 text-sm max-w-sm">
            Seu resultado foi registrado com sucesso. Nossa equipe já tem acesso ao seu perfil comportamental.
          </p>
        </Capa>
      </div>
    );
  }

  if (step === "intro") {
    return (
      <div className="min-h-screen bg-[#F0F4FA]">
        <Capa><p className="text-white/70 text-sm -mt-1">Perfil Comportamental DISC</p></Capa>
        <div className="max-w-2xl mx-auto py-8 px-4">
          <DiscIntroConsentimento
            nomeCandidato={candidatoNome ?? "Candidato"}
            onAceitar={() => setStep("teste")}
          />
        </div>
      </div>
    );
  }

  if (step === "teste") {
    return (
      <div className="min-h-screen bg-[#F0F4FA]">
        <Capa><p className="text-white/70 text-sm -mt-1">Perfil Comportamental DISC</p></Capa>
        <div className="max-w-2xl mx-auto py-8 px-4">
          <DiscTeste candidateName={candidatoNome ?? "Candidato"} onComplete={handleComplete} />
        </div>
      </div>
    );
  }

  // ── landing / cpf / cpf_confirmar / cadastro ──

  return (
    <div className="min-h-screen bg-[#F0F4FA]">
      <Capa><p className="text-white/70 text-sm -mt-1">Perfil Comportamental DISC</p></Capa>

      <div className="max-w-md mx-auto py-8 px-4">
        {step === "landing" && (
          <Card>
            <p className="text-slate-800 font-semibold text-lg text-center">Você já tem cadastro na Azumi?</p>
            <p className="text-slate-500 text-sm text-center mt-1 mb-8">
              Se já se candidatou a alguma vaga ou participou de outro processo conosco, provavelmente já tem.
            </p>
            <div className="flex flex-col gap-3">
              <BtnPrimary onClick={() => setStep("cpf")}>Sim, tenho cadastro</BtnPrimary>
              <BtnSecondary onClick={() => setStep("cadastro")}>Não tenho cadastro</BtnSecondary>
            </div>
          </Card>
        )}

        {step === "cpf" && (
          <Card>
            <button
              type="button"
              onClick={() => { setStep("landing"); setCpfErro(null); setCpfInput(""); }}
              className="text-xs text-slate-400 hover:text-slate-600 mb-4"
            >
              ← Voltar
            </button>
            <p className="text-slate-800 font-semibold text-lg text-center">Informe seu CPF</p>
            <p className="text-slate-500 text-sm text-center mt-1 mb-6">
              Vamos localizá-lo no nosso banco de candidatos.
            </p>
            <div className="flex flex-col gap-3">
              <input
                type="text"
                inputMode="numeric"
                placeholder="000.000.000-00"
                value={cpfInput}
                onChange={(e) => setCpfInput(formatarCpf(e.target.value))}
                onKeyDown={(e) => e.key === "Enter" && handleCpfLookup()}
                className="w-full rounded-lg border border-slate-200 px-4 py-3 text-center text-lg font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#264478]/30"
              />
              {cpfErro && (
                <div>
                  <p className="text-red-500 text-sm text-center">{cpfErro}</p>
                  <BotaoContatoCard />
                </div>
              )}
              <BtnPrimary onClick={handleCpfLookup} disabled={cpfCarregando}>
                {cpfCarregando ? "Buscando…" : "Continuar"}
              </BtnPrimary>
              <BtnSecondary onClick={() => { setStep("cadastro"); setCpfInput(""); setCpfErro(null); }}>
                Não tenho cadastro
              </BtnSecondary>
            </div>
          </Card>
        )}

        {step === "cpf_confirmar" && (
          <Card>
            <p className="text-slate-800 font-semibold text-lg text-center">Confirme sua identidade</p>
            <p className="text-slate-500 text-sm text-center mt-1 mb-6">
              Para acessar o teste DISC, informe seu CPF.
            </p>
            <div className="flex flex-col gap-3">
              <input
                type="text"
                inputMode="numeric"
                placeholder="000.000.000-00"
                value={cpfInput}
                onChange={(e) => setCpfInput(formatarCpf(e.target.value))}
                onKeyDown={(e) => e.key === "Enter" && handleCpfConfirmar()}
                className="w-full rounded-lg border border-slate-200 px-4 py-3 text-center text-lg font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#264478]/30"
              />
              {cpfErro && (
                <div>
                  <p className="text-red-500 text-sm text-center">{cpfErro}</p>
                  <p className="text-slate-400 text-xs text-center mt-2">Precisa de ajuda?</p>
                  <BotaoContatoCard />
                </div>
              )}
              <BtnPrimary onClick={handleCpfConfirmar}>Confirmar</BtnPrimary>
            </div>
          </Card>
        )}

        {step === "cadastro" && (
          <Card>
            <button
              type="button"
              onClick={() => { setStep("landing"); setNome(""); setEmail(""); setTelefone(""); setSetoresSelecionados([]); setCargosInteresse(""); }}
              className="text-xs text-slate-400 hover:text-slate-600 mb-4"
            >
              ← Voltar
            </button>
            <p className="text-slate-800 font-semibold text-lg text-center">Seus dados</p>
            <p className="text-slate-500 text-sm text-center mt-1 mb-6">
              Preencha para continuarmos com o teste.
            </p>
            <div className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Nome completo *"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#264478]/30"
              />
              <input
                type="email"
                placeholder="E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#264478]/30"
              />
              <input
                type="tel"
                placeholder="WhatsApp"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#264478]/30"
              />
              <div className="pt-1">
                <p className="text-xs font-medium text-slate-600 mb-2">Setores de interesse</p>
                <div className="flex flex-wrap gap-2">
                  {SETORES_INTERESSE.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleSetor(s)}
                      className={[
                        "px-3 py-1.5 rounded-full text-xs border transition-colors",
                        setoresSelecionados.includes(s)
                          ? "bg-[#264478] text-white border-[#264478]"
                          : "border-slate-300 text-slate-500 hover:border-[#264478]/50",
                      ].join(" ")}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <input
                type="text"
                placeholder="Cargos de interesse (separados por vírgula)"
                value={cargosInteresse}
                onChange={(e) => setCargosInteresse(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#264478]/30"
              />
              <BtnPrimary onClick={handleCadastro} disabled={!nome.trim() || cadastrando}>
                {cadastrando ? "Salvando…" : "Continuar para o teste →"}
              </BtnPrimary>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
