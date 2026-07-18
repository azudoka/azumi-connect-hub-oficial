import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AzumiLogo } from "@/components/brand/AzumiLogo";

type TipoPergunta = "texto_livre" | "multipla_escolha" | "escala_1_5";

interface Pergunta {
  id: string;
  ordem: number;
  texto: string;
  tipo: TipoPergunta;
  obrigatoria: boolean;
  opcoes?: string[];
}

type Step = "loading" | "erro" | "concluido" | "landing" | "cpf" | "cadastro" | "perguntas";

const WA_LINK = "https://wa.me/5541988350743";
const EMAIL_CONTATO = "contato@azumirh.com.br";

function formatarCpf(v: string) {
  const n = v.replace(/\D/g, "").slice(0, 11);
  return n
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

function formatarTelefone(v: string) {
  const n = v.replace(/\D/g, "").slice(0, 11);
  if (n.length <= 10) return n.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
  return n.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3");
}

// ── Shared wrapper (capa azul) ──────────────────────────────────────────────
function Capa({ vagaTitulo, children }: { vagaTitulo?: string; children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen"
      style={{ background: "linear-gradient(160deg, #14233F 0%, #264478 55%, #3D63B8 100%)" }}
    >
      <div className="mx-auto max-w-lg px-6 py-12 text-white text-center">
        <div className="flex justify-center mb-8">
          <AzumiLogo product="Connect" size={52} light />
        </div>
        {vagaTitulo && (
          <p className="text-white/60 text-xs uppercase tracking-widest mb-1">Processo seletivo</p>
        )}
        {vagaTitulo && (
          <p className="text-white font-semibold text-base mb-8">{vagaTitulo}</p>
        )}
        {children}
        <p className="text-white/30 text-xs mt-8">Azumi RH · azumirh.com.br</p>
      </div>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl p-6 text-left shadow-xl">
      {children}
    </div>
  );
}

function BtnPrimary({ onClick, disabled, children }: { onClick?: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full mt-4 rounded-full bg-[#264478] text-white font-semibold py-3 text-sm disabled:opacity-50 hover:bg-[#1e3561] transition-colors"
    >
      {children}
    </button>
  );
}

function BtnSecondary({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="w-full mt-3 rounded-full border border-[#264478] text-[#264478] font-medium py-3 text-sm hover:bg-blue-50 transition-colors"
    >
      {children}
    </button>
  );
}

function Voltar({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="mt-4 text-xs text-[#264478]/70 hover:text-[#264478] underline underline-offset-2 block mx-auto">
      ← Voltar
    </button>
  );
}

function BotaoContato() {
  return (
    <div className="mt-4 flex flex-col gap-2">
      <p className="text-xs text-slate-500 text-center">Precisa de ajuda? Fale com a Azumi RH:</p>
      <div className="flex gap-2">
        <a
          href={WA_LINK}
          target="_blank"
          rel="noreferrer"
          className="flex-1 flex items-center justify-center gap-1.5 rounded-full bg-[#25D366] text-white text-xs font-semibold py-2.5 hover:bg-[#1ebe5a] transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.5 2 2 6.5 2 12c0 1.8.5 3.5 1.3 5L2 22l5.2-1.3C8.6 21.5 10.3 22 12 22c5.5 0 10-4.5 10-10S17.5 2 12 2zm4.9 14.1c-.2.6-1.1 1.1-1.5 1.1-.4.1-.9.1-2.8-.7-2.3-1-3.8-3.2-4-3.5-.2-.3-1.3-1.7-1.3-3.5s1.1-2.5 1.4-2.8c.3-.3.7-.4.9-.4h.7c.2 0 .5 0 .7.5.2.6.8 1.8.9 1.9.1.1.1.3 0 .5-.1.2-.2.3-.4.6-.2.2-.3.4-.1.7.2.4.9 1.5 1.9 2.4 1.1 1 2 1.3 2.3 1.5.3.2.5.1.7-.1.2-.2.9-1 1.1-1.3.2-.3.5-.2.8-.1.3.1 1.8.8 2.1 1 .3.1.5.2.5.4.1.2.1.8-.1 1.3z"/></svg>
          WhatsApp
        </a>
        <a
          href={`mailto:${EMAIL_CONTATO}`}
          className="flex-1 flex items-center justify-center gap-1.5 rounded-full border border-slate-300 text-slate-600 text-xs font-medium py-2.5 hover:bg-slate-50 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 7L2 7"/></svg>
          E-mail
        </a>
      </div>
    </div>
  );
}

// ── Main component ──────────────────────────────────────────────────────────
export default function QuestionarioRespostaPage() {
  const { token } = useParams<{ token: string }>();

  const [step, setStep] = useState<Step>("loading");
  const [erroGlobal, setErroGlobal] = useState("");
  const [cq, setCq] = useState<any>(null);
  const [vagaTitulo, setVagaTitulo] = useState("");
  const [perguntas, setPerguntas] = useState<Pergunta[]>([]);
  const [respostas, setRespostas] = useState<Record<string, string>>({});
  const [enviando, setEnviando] = useState(false);

  // CPF path
  const [cpfDigitado, setCpfDigitado] = useState("");
  const [erroCpf, setErroCpf] = useState("");
  const [verificandoCpf, setVerificandoCpf] = useState(false);
  const [cpfNaoEncontrado, setCpfNaoEncontrado] = useState(false);

  // Cadastro path
  const [novoNome, setNovoNome] = useState("");
  const [novoEmail, setNovoEmail] = useState("");
  const [novoTelefone, setNovoTelefone] = useState("");
  const [novoCpf, setNovoCpf] = useState("");
  const [erroCadastro, setErroCadastro] = useState("");
  const [salvandoCadastro, setSalvandoCadastro] = useState(false);

  useEffect(() => {
    if (!token) { setErroGlobal("Link inválido."); setStep("erro"); return; }
    (async () => {
      const { data, error } = await supabase
        .from("candidate_questionnaires")
        .select("*, questionnaires(titulo, descricao, questionnaire_questions(*))")
        .eq("token", token)
        .maybeSingle();

      if (error || !data) {
        setErroGlobal("Questionário não encontrado ou link expirado.");
        setStep("erro");
        return;
      }
      if (data.status === "respondido") { setStep("concluido"); return; }

      setCq(data);

      // Fetch vaga title separately
      if (data.job_id) {
        const { data: job } = await supabase
          .from("job_solicitations")
          .select("titulo")
          .eq("id", data.job_id)
          .maybeSingle();
        if (job?.titulo) setVagaTitulo(job.titulo);
      }

      const qs: Pergunta[] = ((data.questionnaires?.questionnaire_questions ?? []) as any[])
        .sort((a: any, b: any) => a.ordem - b.ordem)
        .map((p: any) => ({
          id: p.id,
          ordem: p.ordem,
          texto: p.texto,
          tipo: (p.tipo as TipoPergunta) ?? "texto_livre",
          obrigatoria: p.obrigatoria ?? true,
          opcoes: Array.isArray(p.opcoes) ? p.opcoes : undefined,
        }));
      setPerguntas(qs);

      const init: Record<string, string> = {};
      qs.forEach((p) => {
        if (p.tipo === "multipla_escolha" && p.opcoes?.length) init[p.id] = p.opcoes[0];
      });
      setRespostas(init);

      // Skip landing if candidate already linked
      if (data.candidate_id) {
        setStep("perguntas");
      } else {
        setStep("landing");
      }
    })();
  }, [token]);

  // ── CPF path ─────────────────────────────────────────────────────────────
  async function handleConfirmarCpf() {
    const nums = cpfDigitado.replace(/\D/g, "");
    if (nums.length !== 11) { setErroCpf("Informe um CPF válido com 11 dígitos."); return; }
    setErroCpf("");
    setCpfNaoEncontrado(false);
    setVerificandoCpf(true);
    try {
      const { data: candidato } = await supabase
        .from("candidates")
        .select("id")
        .eq("cpf", nums)
        .maybeSingle();

      if (!candidato) {
        setErroCpf("CPF não encontrado no nosso sistema.");
        setCpfNaoEncontrado(true);
        return;
      }
      await supabase
        .from("candidate_questionnaires")
        .update({ candidate_id: candidato.id })
        .eq("id", cq.id);
      setCq((p: any) => ({ ...p, candidate_id: candidato.id }));
      setStep("perguntas");
    } finally {
      setVerificandoCpf(false);
    }
  }

  // ── Cadastro path ─────────────────────────────────────────────────────────
  async function handleCadastro() {
    if (!novoNome.trim()) { setErroCadastro("Informe seu nome completo."); return; }
    if (!novoEmail.trim() || !novoEmail.includes("@")) { setErroCadastro("Informe um e-mail válido."); return; }
    if (!novoTelefone.replace(/\D/g, "") || novoTelefone.replace(/\D/g, "").length < 10) {
      setErroCadastro("Informe um telefone válido."); return;
    }
    setErroCadastro("");
    setSalvandoCadastro(true);
    try {
      const cpfNums = novoCpf.replace(/\D/g, "");
      const { data: candidato, error } = await supabase
        .from("candidates")
        .insert({
          nome: novoNome.trim(),
          email: novoEmail.trim(),
          telefone: novoTelefone,
          cpf: cpfNums || null,
          job_id: cq.job_id ?? null,
          origem: "convite",
          banco_talentos: false,
          etapa_azumi: "recebido",
        })
        .select("id")
        .single();

      if (error || !candidato) {
        setErroCadastro("Erro ao criar cadastro. Tente novamente ou entre em contato com a Azumi RH.");
        return;
      }
      await supabase
        .from("candidate_questionnaires")
        .update({ candidate_id: candidato.id })
        .eq("id", cq.id);
      setCq((p: any) => ({ ...p, candidate_id: candidato.id }));
      setStep("perguntas");
    } finally {
      setSalvandoCadastro(false);
    }
  }

  // ── Enviar respostas ──────────────────────────────────────────────────────
  async function enviar() {
    const faltando = perguntas.filter((p) => p.obrigatoria && !respostas[p.id]?.trim());
    if (faltando.length > 0) {
      alert(`Responda todas as perguntas obrigatórias (${faltando.length} pendente${faltando.length > 1 ? "s" : ""}).`);
      return;
    }
    setEnviando(true);
    const { error } = await supabase.from("questionnaire_answers").insert(
      perguntas.map((p) => ({
        candidate_questionnaire_id: cq.id,
        question_id: p.id,
        resposta: respostas[p.id] ?? "",
      }))
    );
    if (!error) {
      await supabase
        .from("candidate_questionnaires")
        .update({ status: "respondido", respondido_em: new Date().toISOString() })
        .eq("id", cq.id);
      setStep("concluido");
    } else {
      alert("Erro ao enviar respostas. Tente novamente.");
    }
    setEnviando(false);
  }

  // ── RENDERS ───────────────────────────────────────────────────────────────

  if (step === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500 text-sm">
        Carregando…
      </div>
    );
  }

  if (step === "erro") {
    return (
      <Capa>
        <Card>
          <p className="text-slate-700 font-medium text-center text-sm mb-1">{erroGlobal}</p>
          <p className="text-slate-500 text-xs text-center mb-2">
            Confira o link recebido ou entre em contato com a Azumi RH.
          </p>
          <BotaoContato />
        </Card>
      </Capa>
    );
  }

  if (step === "concluido") {
    return (
      <Capa vagaTitulo={vagaTitulo}>
        <Card>
          <div className="flex flex-col items-center gap-3 py-4">
            <div className="h-14 w-14 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-2xl">✓</div>
            <h1 className="text-lg font-bold text-[#14233F]">Obrigado!</h1>
            <p className="text-slate-500 text-sm text-center max-w-xs">
              Suas respostas foram registradas com sucesso. Entraremos em contato em breve.
            </p>
          </div>
        </Card>
      </Capa>
    );
  }

  // ── Landing: "Já tem cadastro?" ───────────────────────────────────────────
  if (step === "landing") {
    return (
      <Capa vagaTitulo={vagaTitulo}>
        <p className="text-white/80 text-sm leading-relaxed mb-6">
          Você foi convidado(a) a responder um questionário de triagem.
          Leva poucos minutos e ajuda a gente a te conhecer melhor.
        </p>
        <Card>
          <h2 className="text-[#14233F] font-bold text-base mb-1">Você já tem cadastro na Azumi RH?</h2>
          <p className="text-slate-500 text-xs mb-4">
            Se já participou de algum processo seletivo conosco, selecione "Sim".
          </p>
          <BtnPrimary onClick={() => setStep("cpf")}>
            Sim, já tenho cadastro
          </BtnPrimary>
          <BtnSecondary onClick={() => setStep("cadastro")}>
            Não, é meu primeiro acesso
          </BtnSecondary>
        </Card>
      </Capa>
    );
  }

  // ── CPF: confirmação de identidade ────────────────────────────────────────
  if (step === "cpf") {
    return (
      <Capa vagaTitulo={vagaTitulo}>
        <Card>
          <h2 className="text-[#14233F] font-bold text-sm mb-1">Confirme sua identidade</h2>
          <p className="text-slate-500 text-xs mb-4">
            Digite o CPF que você usou no cadastro para continuar.
          </p>
          <input
            type="text"
            inputMode="numeric"
            value={cpfDigitado}
            onChange={(e) => { setCpfDigitado(formatarCpf(e.target.value)); setErroCpf(""); setCpfNaoEncontrado(false); }}
            onKeyDown={(e) => { if (e.key === "Enter") handleConfirmarCpf(); }}
            placeholder="000.000.000-00"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-[#264478] focus:outline-none text-slate-800"
          />
          {erroCpf && (
            <p className="mt-2 text-xs text-red-600">{erroCpf}</p>
          )}
          {cpfNaoEncontrado && <BotaoContato />}
          <BtnPrimary onClick={handleConfirmarCpf} disabled={verificandoCpf}>
            {verificandoCpf ? "Verificando…" : "Continuar →"}
          </BtnPrimary>
          <Voltar onClick={() => { setErroCpf(""); setCpfNaoEncontrado(false); setStep("landing"); }} />
        </Card>
      </Capa>
    );
  }

  // ── Cadastro: novo usuário ────────────────────────────────────────────────
  if (step === "cadastro") {
    const inputCls = "w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-[#264478] focus:outline-none text-slate-800";
    const labelCls = "text-xs font-medium text-[#14233F] mb-1 block";
    return (
      <Capa vagaTitulo={vagaTitulo}>
        <Card>
          <h2 className="text-[#14233F] font-bold text-sm mb-4">Vamos criar seu cadastro</h2>
          <div className="space-y-3">
            <div>
              <label className={labelCls}>Nome completo *</label>
              <input
                type="text"
                value={novoNome}
                onChange={(e) => setNovoNome(e.target.value)}
                placeholder="Seu nome completo"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>E-mail *</label>
              <input
                type="email"
                value={novoEmail}
                onChange={(e) => setNovoEmail(e.target.value)}
                placeholder="seu@email.com"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Telefone / WhatsApp *</label>
              <input
                type="tel"
                inputMode="numeric"
                value={novoTelefone}
                onChange={(e) => setNovoTelefone(formatarTelefone(e.target.value))}
                placeholder="(00) 00000-0000"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>CPF <span className="text-slate-400 font-normal">(opcional)</span></label>
              <input
                type="text"
                inputMode="numeric"
                value={novoCpf}
                onChange={(e) => setNovoCpf(formatarCpf(e.target.value))}
                placeholder="000.000.000-00"
                className={inputCls}
              />
            </div>
          </div>
          {erroCadastro && <p className="mt-3 text-xs text-red-600">{erroCadastro}</p>}
          <BtnPrimary onClick={handleCadastro} disabled={salvandoCadastro}>
            {salvandoCadastro ? "Salvando…" : "Criar cadastro e responder →"}
          </BtnPrimary>
          <Voltar onClick={() => { setErroCadastro(""); setStep("landing"); }} />
        </Card>
      </Capa>
    );
  }

  // ── Perguntas ─────────────────────────────────────────────────────────────
  return (
    <div style={{ background: "#F0F4FA" }} className="min-h-screen pb-12">
      {/* Mini-header */}
      <div style={{ background: "#264478" }} className="py-4 px-6 flex items-center justify-between">
        <AzumiLogo product="Connect" size={28} light hideSubtitle />
        {vagaTitulo && (
          <span className="text-white/70 text-xs hidden sm:block truncate ml-4 max-w-xs">{vagaTitulo}</span>
        )}
      </div>

      <div className="max-w-xl mx-auto px-4 pt-8">
        <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8">
          <h1 className="text-lg font-bold text-[#14233F]">{cq?.questionnaires?.titulo}</h1>
          {cq?.questionnaires?.descricao && (
            <p className="text-sm text-slate-500 mt-1">{cq.questionnaires.descricao}</p>
          )}

          <div className="mt-6 space-y-6">
            {perguntas.map((p, idx) => (
              <div key={p.id}>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {idx + 1}. {p.texto}{" "}
                  {p.obrigatoria && <span className="text-red-500">*</span>}
                </label>

                {p.tipo === "texto_livre" && (
                  <textarea
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#264478] focus:outline-none"
                    rows={3}
                    value={respostas[p.id] ?? ""}
                    onChange={(e) => setRespostas((prev) => ({ ...prev, [p.id]: e.target.value }))}
                  />
                )}

                {p.tipo === "multipla_escolha" && p.opcoes && (
                  <div className="space-y-2">
                    {p.opcoes.map((op) => (
                      <label key={op} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name={`q-${p.id}`}
                          value={op}
                          checked={respostas[p.id] === op}
                          onChange={() => setRespostas((prev) => ({ ...prev, [p.id]: op }))}
                          className="h-4 w-4 accent-[#264478]"
                        />
                        <span className="text-sm text-slate-700">{op}</span>
                      </label>
                    ))}
                  </div>
                )}

                {p.tipo === "escala_1_5" && (
                  <div className="flex gap-3 flex-wrap items-center">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setRespostas((prev) => ({ ...prev, [p.id]: String(n) }))}
                        className={`h-10 w-10 rounded-full border text-sm font-medium transition ${
                          respostas[p.id] === String(n)
                            ? "bg-[#264478] border-[#264478] text-white"
                            : "border-slate-300 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                    <span className="text-xs text-slate-400">1 = Discordo · 5 = Concordo</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={enviar}
            disabled={enviando}
            className="mt-8 w-full rounded-full bg-[#264478] text-white font-semibold py-3 text-sm disabled:opacity-50 hover:bg-[#1e3561] transition-colors"
          >
            {enviando ? "Enviando…" : "Enviar respostas"}
          </button>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">Azumi RH · azumirh.com.br</p>
      </div>
    </div>
  );
}
