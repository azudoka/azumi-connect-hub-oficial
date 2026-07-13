import { useState } from "react";
import { X, Upload, Check, ChevronRight, FileText, Loader2, UserCheck, RefreshCw } from "lucide-react";
import DiscTeste from "@/components/disc/DiscTeste";
import type { DiscDim, DiscScores } from "@/components/disc/discQuestions";
import { supabase } from "@/integrations/supabase/client";

const EMAIL_API = "https://azumi-email-api.vercel.app/api/send-email";
const DISC_VALIDADE_MS = 1000 * 60 * 60 * 24 * 30 * 6; // 6 meses

export type CandidaturaModo = "vaga" | "banco";

interface Props {
  open: boolean;
  onClose: () => void;
  modo: CandidaturaModo;
  vagaTitulo?: string;
  vagaId?: string;
}

interface Cadastro {
  foto: File | null;
  fotoPreview: string | null;
  nome: string;
  email: string;
  telefone: string;
  cpf: string;
  nascimento: string;
  cidadeEstado: string;
  bairro: string;
  escolaridade: string;
  filhos: "nao_informar" | "nao" | "sim" | "";
  linkedin: string;
  portfolio: string;
  origem: string;
  curriculo: File | null;
  mensagem: string;
  aceitePrivacidade: boolean;
  contratoDesejado: string;
  disponibilidade: string;
}

interface CandidatoAnterior {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  escolaridade: string;
  data_nascimento: string | null;
  cidade: string | null;
  bairro: string | null;
  possui_filhos: string | null;
  linkedin: string | null;
  portfolio_url: string | null;
  foto_url: string | null;
}

interface DiscAnterior {
  score_d: number;
  score_i: number;
  score_s: number;
  score_c: number;
  fator_predominante: string;
  fator_secundario: string | null;
}

const CADASTRO_INIT: Cadastro = {
  foto: null,
  fotoPreview: null,
  nome: "",
  email: "",
  telefone: "",
  cpf: "",
  nascimento: "",
  cidadeEstado: "",
  bairro: "",
  escolaridade: "",
  filhos: "",
  linkedin: "",
  portfolio: "",
  origem: "",
  curriculo: null,
  mensagem: "",
  aceitePrivacidade: false,
  contratoDesejado: "",
  disponibilidade: "",
};

const ESCOLARIDADES = [
  "Ensino Fundamental",
  "Ensino Médio",
  "Técnico/Tecnólogo",
  "Superior incompleto",
  "Superior completo",
  "Pós-graduação/MBA",
  "Mestrado/Doutorado",
];

const ORIGENS = ["LinkedIn", "Instagram", "Indicação", "Google", "Site Azumi", "Outro"];

export default function CandidaturaModal({ open, onClose, modo, vagaTitulo, vagaId }: Props) {
  // step 0 = CPF lookup; 1 = formulário; 2 = DISC; "ok" = sucesso
  const [step, setStep] = useState<0 | 1 | 2 | "ok">(0);
  const [c, setC] = useState<Cadastro>(CADASTRO_INIT);
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  // Step 0 — CPF lookup
  const [cpfInicial, setCpfInicial] = useState("");
  const [buscandoCpf, setBuscandoCpf] = useState(false);
  const [candidatoAnterior, setCandidatoAnterior] = useState<CandidatoAnterior | null>(null);
  const [discAnterior, setDiscAnterior] = useState<DiscAnterior | null>(null);
  const [discValido, setDiscValido] = useState(false);
  // null = não respondeu ainda; true/false = respondeu
  const [querAlterarDados, setQuerAlterarDados] = useState<boolean | null>(null);
  const [querRefazerDisc, setQuerRefazerDisc] = useState<boolean | null>(null);

  if (!open) return null;

  function up<K extends keyof Cadastro>(k: K, v: Cadastro[K]) {
    setC((p) => ({ ...p, [k]: v }));
  }

  function close() {
    setStep(0);
    setC(CADASTRO_INIT);
    setErro("");
    setCpfInicial("");
    setCandidatoAnterior(null);
    setDiscAnterior(null);
    setDiscValido(false);
    setQuerAlterarDados(null);
    setQuerRefazerDisc(null);
    onClose();
  }

  // ── Step 0: busca CPF ────────────────────────────────────────────────────────
  async function buscarCpf() {
    const cpf = cpfInicial.trim();
    if (!cpf) { setErro("Informe o CPF para continuar."); return; }
    setErro("");
    setBuscandoCpf(true);
    try {
      const { data } = await supabase
        .from("candidates")
        .select("id, nome, email, telefone, escolaridade, data_nascimento, cidade, bairro, possui_filhos, linkedin, portfolio_url, foto_url, disc_resultado_candidato(score_d, score_i, score_s, score_c, fator_predominante, fator_secundario, created_at)")
        .eq("cpf", cpf)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) {
        const anterior: CandidatoAnterior = {
          id: data.id,
          nome: data.nome ?? "",
          email: data.email ?? "",
          telefone: data.telefone ?? "",
          escolaridade: (data.escolaridade as string) ?? "",
          data_nascimento: (data.data_nascimento as string) ?? null,
          cidade: (data.cidade as string) ?? null,
          bairro: (data.bairro as string) ?? null,
          possui_filhos: (data.possui_filhos as string) ?? null,
          linkedin: (data.linkedin as string) ?? null,
          portfolio_url: (data.portfolio_url as string) ?? null,
          foto_url: (data.foto_url as string) ?? null,
        };
        setCandidatoAnterior(anterior);

        const discs = (data.disc_resultado_candidato as any[]) ?? [];
        const ultimo = discs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
        const valido = !!ultimo && (Date.now() - new Date(ultimo.created_at).getTime()) < DISC_VALIDADE_MS;
        if (ultimo) {
          setDiscAnterior({
            score_d: ultimo.score_d,
            score_i: ultimo.score_i,
            score_s: ultimo.score_s,
            score_c: ultimo.score_c,
            fator_predominante: ultimo.fator_predominante,
            fator_secundario: ultimo.fator_secundario ?? null,
          });
        }
        setDiscValido(valido);
        // Perguntas serão mostradas progressivamente na tela 0
      } else {
        // CPF novo — avança direto pro formulário sem perguntas
        avancarParaFormulario(cpf, null);
      }
    } finally {
      setBuscandoCpf(false);
    }
  }

  function avancarParaFormulario(cpf: string, ant: CandidatoAnterior | null = candidatoAnterior) {
    setC((p) => ({
      ...p,
      cpf,
      ...(ant ? {
        nome: ant.nome,
        email: ant.email,
        telefone: ant.telefone,
        escolaridade: ant.escolaridade || p.escolaridade,
        nascimento: ant.data_nascimento ?? p.nascimento,
        cidadeEstado: ant.cidade ?? p.cidadeEstado,
        bairro: ant.bairro ?? p.bairro,
        filhos: (ant.possui_filhos as Cadastro["filhos"]) || p.filhos,
        linkedin: ant.linkedin ?? p.linkedin,
        portfolio: ant.portfolio_url ?? p.portfolio,
        fotoPreview: ant.foto_url ?? p.fotoPreview,
      } : {}),
    }));
    setStep(1);
  }

  function confirmarStep0() {
    avancarParaFormulario(cpfInicial.trim());
  }

  // Determina se todas as perguntas do step 0 foram respondidas
  const todasPerguntasRespondidas =
    candidatoAnterior !== null &&
    querAlterarDados !== null &&
    (!discValido || querRefazerDisc !== null);

  // ── Step 1: validação ────────────────────────────────────────────────────────
  function validarStep1(): string {
    if (!c.nome.trim()) return "Informe seu nome completo.";
    if (!c.email.trim()) return "Informe o email.";
    if (!c.telefone.trim()) return "Informe o telefone.";
    if (!c.cpf.trim()) return "Informe o CPF.";
    if (!c.nascimento) return "Informe a data de nascimento.";
    if (!c.cidadeEstado.trim()) return "Informe cidade/estado.";
    if (!c.bairro.trim()) return "Informe o bairro.";
    if (!c.escolaridade) return "Selecione a escolaridade.";
    if (!c.origem) return "Informe como ficou sabendo da vaga.";
    if (!c.curriculo) return "Anexe seu currículo.";
    if (!c.aceitePrivacidade) return "Aceite a política de privacidade.";
    if (modo === "banco") {
      if (!c.contratoDesejado) return "Selecione o tipo de contratação desejada.";
      if (!c.disponibilidade) return "Selecione sua disponibilidade.";
    }
    return "";
  }

  function avancar() {
    const e = validarStep1();
    if (e) { setErro(e); return; }
    setErro("");
    // Se DISC anterior válido e não quer refazer → pular step 2
    if (discValido && querRefazerDisc === false && discAnterior) {
      const scores: DiscScores = { D: discAnterior.score_d, I: discAnterior.score_i, S: discAnterior.score_s, C: discAnterior.score_c };
      concluir(scores, discAnterior.fator_predominante as DiscDim);
    } else {
      setStep(2);
    }
  }

  // ── Conclusão ────────────────────────────────────────────────────────────────
  async function concluir(scores: DiscScores, perfilDim: DiscDim) {
    setEnviando(true);
    setErro("");
    try {
      let curriculoUrl: string | null = null;
      if (c.curriculo) {
        const ext = c.curriculo.name.split(".").pop() ?? "pdf";
        const path = `${vagaId ?? "banco"}/${Date.now()}_${c.nome.replace(/\s+/g, "_")}.${ext}`;
        const { data: upData, error: upError } = await supabase.storage
          .from("curriculos")
          .upload(path, c.curriculo, { upsert: false });
        if (upError) {
          console.error("[curriculo] storage:", upError.message);
        } else if (upData) {
          const { data: urlData } = supabase.storage.from("curriculos").getPublicUrl(upData.path);
          curriculoUrl = urlData.publicUrl;
        }
      }

      // Se candidato anterior e não quer alterar dados → reusar ID existente
      const candidatoExistenteId = candidatoAnterior && querAlterarDados === false ? candidatoAnterior.id : null;

      let candidatoId: string;

      if (candidatoExistenteId) {
        candidatoId = candidatoExistenteId;
      } else {
        const row = {
          job_id: vagaId ?? null,
          nome: c.nome,
          email: c.email,
          telefone: c.telefone,
          cpf: c.cpf || null,
          data_nascimento: c.nascimento || null,
          cidade: c.cidadeEstado || null,
          bairro: c.bairro || null,
          escolaridade: c.escolaridade || null,
          possui_filhos: c.filhos || null,
          linkedin: c.linkedin || null,
          portfolio_url: c.portfolio || null,
          origem: c.origem || null,
          observacoes: c.mensagem || null,
          curriculo_nome: c.curriculo?.name ?? null,
          curriculo_url: curriculoUrl,
          disponibilidade_inicio: modo === "banco" ? (c.disponibilidade || null) : null,
          banco_talentos: modo === "banco",
          etapa_azumi: "recebido",
          lgpd_aceite: c.aceitePrivacidade,
          lgpd_aceite_at: c.aceitePrivacidade ? new Date().toISOString() : null,
        };

        const { data: candidatoInserido, error } = await supabase
          .from("candidates")
          .insert(row)
          .select("id")
          .single();

        if (error || !candidatoInserido) {
          throw new Error(error?.message ?? "Não foi possível salvar sua candidatura.");
        }
        candidatoId = candidatoInserido.id;
      }

      // DISC — gravar sempre (mesmo reaproveitando candidato, pula se reutilizando disc anterior sem refazer)
      const reutilizandoDisc = discValido && querRefazerDisc === false && discAnterior;
      if (!reutilizandoDisc) {
        const entries = (["D", "I", "S", "C"] as const)
          .map((k) => ({ k, v: scores[k] }))
          .sort((a, b) => b.v - a.v);
        const { error: discError } = await supabase
          .from("disc_resultado_candidato")
          .insert({
            candidato_id: candidatoId,
            score_d: scores.D,
            score_i: scores.I,
            score_s: scores.S,
            score_c: scores.C,
            fator_predominante: perfilDim,
            fator_secundario: entries[1]?.k ?? null,
          });
        if (discError) console.error("[candidatura] DISC:", discError.message);
      }

      const linhas = [
        `<tr><td><strong>Vaga</strong></td><td>${vagaTitulo ?? "Banco de talentos"}</td></tr>`,
        `<tr><td><strong>Modo</strong></td><td>${modo === "banco" ? "Banco de talentos" : "Candidatura"}</td></tr>`,
        `<tr><td><strong>Nome</strong></td><td>${c.nome}</td></tr>`,
        `<tr><td><strong>Email</strong></td><td>${c.email}</td></tr>`,
        `<tr><td><strong>Telefone</strong></td><td>${c.telefone}</td></tr>`,
        c.cpf ? `<tr><td><strong>CPF</strong></td><td>${c.cpf}</td></tr>` : "",
        c.nascimento ? `<tr><td><strong>Nascimento</strong></td><td>${c.nascimento}</td></tr>` : "",
        c.cidadeEstado ? `<tr><td><strong>Cidade/UF</strong></td><td>${c.cidadeEstado}</td></tr>` : "",
        c.bairro ? `<tr><td><strong>Bairro</strong></td><td>${c.bairro}</td></tr>` : "",
        c.escolaridade ? `<tr><td><strong>Escolaridade</strong></td><td>${c.escolaridade}</td></tr>` : "",
        c.linkedin ? `<tr><td><strong>LinkedIn</strong></td><td>${c.linkedin}</td></tr>` : "",
        c.portfolio ? `<tr><td><strong>Portfólio</strong></td><td>${c.portfolio}</td></tr>` : "",
        c.origem ? `<tr><td><strong>Origem</strong></td><td>${c.origem}</td></tr>` : "",
        c.mensagem ? `<tr><td><strong>Mensagem</strong></td><td>${c.mensagem}</td></tr>` : "",
        c.curriculo ? `<tr><td><strong>Currículo</strong></td><td>${c.curriculo.name}</td></tr>` : "",
        c.contratoDesejado ? `<tr><td><strong>Contrato desejado</strong></td><td>${c.contratoDesejado}</td></tr>` : "",
        c.disponibilidade ? `<tr><td><strong>Disponibilidade</strong></td><td>${c.disponibilidade}</td></tr>` : "",
        `<tr><td><strong>DISC</strong></td><td>D:${scores.D} I:${scores.I} S:${scores.S} C:${scores.C} — Perfil: ${perfilDim}${reutilizandoDisc ? " (reaproveitado)" : ""}</td></tr>`,
      ].filter(Boolean).join("");

      fetch(EMAIL_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: `Nova candidatura: ${c.nome} → ${vagaTitulo ?? "Banco de talentos"}`,
          html: `<h2 style="color:#031D38">Nova ${modo === "banco" ? "inscrição no banco de talentos" : "candidatura"}</h2>
            <table cellpadding="6" cellspacing="0" style="border-collapse:collapse;font-size:14px">${linhas}</table>
            <p style="margin-top:16px;font-size:12px;color:#666">Enviado automaticamente por Azumi Connect · ${new Date().toLocaleString("pt-BR")}</p>`,
        }),
      }).catch((e) => console.error("[candidatura] email:", e));

      setStep("ok");
    } catch (err: any) {
      console.error("[candidatura] Falha completa:", err);
      setErro("Não conseguimos registrar sua candidatura agora. Tente novamente em instantes ou entre em contato com a Azumi RH.");
      setStep(1);
    } finally {
      setEnviando(false);
    }
  }

  const dadosTravados = candidatoAnterior !== null && querAlterarDados === false;
  const stepNum = step === 0 ? 0 : step === 1 ? 1 : step === 2 ? 2 : 3;

  return (
    <div className="fixed inset-0 z-[100] flex items-stretch justify-center overflow-y-auto bg-black/70 sm:items-center sm:p-6">
      <div className="relative flex w-full max-w-4xl flex-col bg-card sm:my-6 sm:max-h-[calc(100vh-3rem)] sm:rounded-2xl">
        {enviando && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 rounded-2xl bg-card/90">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="font-sans text-sm text-muted-foreground">Enviando candidatura…</p>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between border-b border-border bg-[hsl(var(--ocean))] px-6 py-4 text-white sm:rounded-t-2xl">
          <div className="min-w-0">
            <p className="font-sans text-xs uppercase tracking-wider text-white/70">
              {modo === "banco" ? "Banco de talentos" : "Candidatura"}
            </p>
            <h2 className="truncate font-display text-base font-semibold">
              {vagaTitulo ?? "Entre para o banco de talentos Azumi"}
            </h2>
          </div>
          <button onClick={close} className="rounded-md p-1.5 text-white/80 hover:bg-white/10">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Stepper */}
        {step !== "ok" && (
          <div className="flex items-center gap-3 border-b border-border bg-muted/50 px-6 py-3">
            <StepItem n={1} label="Identificação" active={step === 0} done={stepNum > 0} />
            <div className="h-px flex-1 bg-border" />
            <StepItem n={2} label="Cadastro" active={step === 1} done={stepNum > 1} />
            <div className="h-px flex-1 bg-border" />
            <StepItem n={3} label="Perfil DISC" active={step === 2} done={false} />
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6">

          {/* ── Step 0: CPF ── */}
          {step === 0 && (
            <div className="mx-auto max-w-sm space-y-5 py-4">
              <div className="text-center">
                <h3 className="font-display text-lg font-semibold text-foreground">Vamos começar pelo seu CPF</h3>
                <p className="mt-1 font-sans text-sm text-muted-foreground">
                  Se você já se candidatou antes, seus dados serão carregados automaticamente.
                </p>
              </div>

              <Field label="CPF *">
                <Input
                  value={cpfInicial}
                  onChange={(v) => { setCpfInicial(v); setCandidatoAnterior(null); setDiscAnterior(null); setQuerAlterarDados(null); setQuerRefazerDisc(null); setErro(""); }}
                  placeholder="000.000.000-00"
                  onKeyDown={(e) => { if (e.key === "Enter") buscarCpf(); }}
                />
              </Field>

              {erro && <p className="font-sans text-sm text-destructive">{erro}</p>}

              {/* Candidato encontrado — perguntas progressivas */}
              {candidatoAnterior && (
                <div className="space-y-4">
                  <div className="flex items-start gap-3 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3">
                    <UserCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <div className="min-w-0">
                      <p className="font-sans text-sm font-medium text-foreground">Cadastro encontrado</p>
                      <p className="font-sans text-xs text-muted-foreground">{candidatoAnterior.nome} · {candidatoAnterior.email}</p>
                    </div>
                  </div>

                  {/* Pergunta 1: alterar dados? */}
                  {querAlterarDados === null && (
                    <div className="space-y-2">
                      <p className="font-sans text-sm font-medium text-foreground">Deseja alterar alguma informação?</p>
                      <div className="flex gap-2">
                        <BtnOpcao onClick={() => setQuerAlterarDados(false)} label="Não, usar esses dados" />
                        <BtnOpcao onClick={() => setQuerAlterarDados(true)} label="Sim, quero alterar" secondary />
                      </div>
                    </div>
                  )}

                  {querAlterarDados !== null && (
                    <p className="font-sans text-xs text-muted-foreground">
                      {querAlterarDados ? "Você poderá editar seus dados no próximo passo." : "Seus dados serão mantidos como estão."}
                    </p>
                  )}

                  {/* Pergunta 2: refazer DISC? (só se disc válido e dados respondidos) */}
                  {querAlterarDados !== null && discValido && discAnterior && querRefazerDisc === null && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <RefreshCw className="h-4 w-4 text-muted-foreground" />
                        <p className="font-sans text-sm font-medium text-foreground">
                          Você já fez nosso teste de perfil (DISC) há menos de 6 meses. Deseja refazer?
                        </p>
                      </div>
                      <p className="font-sans text-xs text-muted-foreground">
                        Perfil anterior: {discAnterior.fator_predominante}
                        {discAnterior.fator_secundario ? ` / ${discAnterior.fator_secundario}` : ""}
                      </p>
                      <div className="flex gap-2">
                        <BtnOpcao onClick={() => setQuerRefazerDisc(true)} label="Sim, refazer" secondary />
                        <BtnOpcao onClick={() => setQuerRefazerDisc(false)} label="Não, usar resultado anterior" />
                      </div>
                    </div>
                  )}

                  {querRefazerDisc !== null && (
                    <p className="font-sans text-xs text-muted-foreground">
                      {querRefazerDisc ? "Você fará o teste DISC novamente." : "Usaremos seu resultado anterior do teste DISC."}
                    </p>
                  )}
                </div>
              )}

              <div className="flex justify-end pt-2">
                {!candidatoAnterior ? (
                  <button
                    type="button"
                    onClick={buscarCpf}
                    disabled={buscandoCpf}
                    className="btn-primary"
                  >
                    {buscandoCpf ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Continuar <ChevronRight className="h-4 w-4" /></>}
                  </button>
                ) : todasPerguntasRespondidas ? (
                  <button type="button" onClick={confirmarStep0} className="btn-primary">
                    Continuar <ChevronRight className="h-4 w-4" />
                  </button>
                ) : null}
              </div>
            </div>
          )}

          {/* ── Step 1: formulário ── */}
          {step === 1 && (
            <div className="mx-auto max-w-2xl space-y-5">
              <div>
                <label className="mb-1 block font-sans text-xs font-medium text-foreground">Foto (opcional)</label>
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-border bg-muted font-sans text-xs text-muted-foreground">
                    {c.fotoPreview ? <img src={c.fotoPreview} alt="" className="h-full w-full object-cover" /> : "Sem foto"}
                  </div>
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-2 font-sans text-xs text-foreground hover:bg-muted">
                    <Upload className="h-3.5 w-3.5" /> Enviar foto
                    <input
                      type="file"
                      accept="image/jpeg,image/png"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0] ?? null;
                        if (f && f.size > 5 * 1024 * 1024) { setErro("Foto maior que 5MB"); return; }
                        if (f) {
                          const reader = new FileReader();
                          reader.onload = () => setC((p) => ({ ...p, foto: f, fotoPreview: reader.result as string }));
                          reader.readAsDataURL(f);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              <Grid2>
                <Field label="Nome completo *">
                  <Input value={c.nome} onChange={(v) => up("nome", v)} readOnly={dadosTravados} />
                </Field>
                <Field label="Email *">
                  <Input type="email" value={c.email} onChange={(v) => up("email", v)} readOnly={dadosTravados} />
                </Field>
              </Grid2>
              <Grid2>
                <Field label="Telefone *">
                  <Input value={c.telefone} onChange={(v) => up("telefone", v)} placeholder="(00) 00000-0000" readOnly={dadosTravados} />
                </Field>
                <Field label="CPF *">
                  <Input value={c.cpf} onChange={(v) => up("cpf", v)} placeholder="000.000.000-00" readOnly />
                </Field>
              </Grid2>
              <Grid2>
                <Field label="Data de nascimento *">
                  <Input type="date" value={c.nascimento} onChange={(v) => up("nascimento", v)} readOnly={dadosTravados} />
                </Field>
                <Field label="Cidade / Estado *">
                  <Input value={c.cidadeEstado} onChange={(v) => up("cidadeEstado", v)} placeholder="Ex.: Curitiba, PR" readOnly={dadosTravados} />
                </Field>
              </Grid2>
              <Grid2>
                <Field label="Bairro *">
                  <Input value={c.bairro} onChange={(v) => up("bairro", v)} readOnly={dadosTravados} />
                </Field>
                <Field label="Escolaridade *">
                  <Select value={c.escolaridade} onChange={(v) => up("escolaridade", v)} disabled={dadosTravados}>
                    <option value="">Selecione...</option>
                    {ESCOLARIDADES.map((e) => <option key={e} value={e}>{e}</option>)}
                  </Select>
                </Field>
              </Grid2>

              <Field label="Possui filhos?">
                <div className="flex flex-wrap gap-2">
                  {[
                    { v: "nao_informar", l: "Prefiro não informar" },
                    { v: "nao", l: "Não" },
                    { v: "sim", l: "Sim" },
                  ].map((o) => (
                    <button
                      key={o.v}
                      type="button"
                      onClick={() => { if (!dadosTravados) up("filhos", o.v as Cadastro["filhos"]); }}
                      className={`rounded-full border px-3 py-1.5 font-sans text-xs font-medium ${
                        c.filhos === o.v
                          ? "border-primary bg-primary text-primary-foreground"
                          : dadosTravados
                          ? "border-border bg-muted text-muted-foreground cursor-default"
                          : "border-border bg-background text-foreground hover:bg-muted"
                      }`}
                    >
                      {o.l}
                    </button>
                  ))}
                </div>
              </Field>

              <Grid2>
                <Field label="LinkedIn">
                  <Input value={c.linkedin} onChange={(v) => up("linkedin", v)} placeholder="linkedin.com/in/..." readOnly={dadosTravados} />
                </Field>
                <Field label="Portfólio ou link adicional">
                  <Input value={c.portfolio} onChange={(v) => up("portfolio", v)} readOnly={dadosTravados} />
                </Field>
              </Grid2>

              {modo === "banco" && (
                <Grid2>
                  <Field label="Tipo de contratação desejada *">
                    <Select value={c.contratoDesejado} onChange={(v) => up("contratoDesejado", v)}>
                      <option value="">Selecione...</option>
                      <option>CLT</option><option>PJ</option><option>Estágio</option><option>Sem preferência</option>
                    </Select>
                  </Field>
                  <Field label="Disponibilidade para início *">
                    <Select value={c.disponibilidade} onChange={(v) => up("disponibilidade", v)}>
                      <option value="">Selecione...</option>
                      <option>Imediato</option><option>15 dias</option><option>30 dias</option><option>A combinar</option>
                    </Select>
                  </Field>
                </Grid2>
              )}

              <Field label="Como ficou sabendo desta vaga? *">
                <div className="flex flex-wrap gap-2">
                  {ORIGENS.map((o) => (
                    <button
                      key={o}
                      type="button"
                      onClick={() => up("origem", o)}
                      className={`rounded-full border px-3 py-1.5 font-sans text-xs font-medium ${
                        c.origem === o
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background text-foreground hover:bg-muted"
                      }`}
                    >
                      {o}
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="Currículo *">
                <label
                  className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-6 text-center transition ${
                    c.curriculo
                      ? "border-success bg-[hsl(var(--success)/0.08)]"
                      : "border-border bg-muted/50 hover:bg-muted"
                  }`}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const f = e.dataTransfer.files?.[0];
                    if (f) {
                      if (f.size > 5 * 1024 * 1024) { setErro("Currículo maior que 5MB"); return; }
                      up("curriculo", f);
                    }
                  }}
                >
                  {c.curriculo ? (
                    <div className="flex items-center gap-2 font-sans text-sm text-success">
                      <FileText className="h-4 w-4" /> {c.curriculo.name}
                    </div>
                  ) : (
                    <>
                      <Upload className="mb-2 h-5 w-5 text-muted-foreground" />
                      <p className="font-sans text-sm font-medium text-foreground">Arraste o arquivo aqui ou clique para selecionar</p>
                      <p className="mt-0.5 font-sans text-xs text-muted-foreground">PDF, DOC ou DOCX — máx 5MB</p>
                    </>
                  )}
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0] ?? null;
                      if (f && f.size > 5 * 1024 * 1024) { setErro("Currículo maior que 5MB"); return; }
                      up("curriculo", f);
                    }}
                  />
                </label>
              </Field>

              <Field label="Mensagem (opcional)">
                <textarea
                  rows={3}
                  maxLength={500}
                  value={c.mensagem}
                  onChange={(e) => up("mensagem", e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 font-sans text-sm text-foreground focus:border-primary focus:outline-none"
                />
                <p className="mt-1 text-right font-sans text-[10px] text-muted-foreground">{c.mensagem.length}/500</p>
              </Field>

              <label className="flex items-start gap-2 font-sans text-xs text-foreground">
                <input
                  type="checkbox"
                  checked={c.aceitePrivacidade}
                  onChange={(e) => up("aceitePrivacidade", e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-border"
                />
                <span>
                  Li e aceito a <a className="underline" href="https://azumirh.com.br/privacidade" target="_blank" rel="noreferrer">Política de Privacidade</a>.
                  Autorizo o tratamento dos meus dados pela Azumi RH para fins de recrutamento, em conformidade com a LGPD.
                </span>
              </label>

              {erro && <p className="font-sans text-sm text-destructive">{erro}</p>}

              <div className="flex items-center justify-between pt-2">
                <button type="button" onClick={() => { setStep(0); setErro(""); }} className="font-sans text-sm text-muted-foreground hover:text-foreground">
                  ← Voltar
                </button>
                <button type="button" onClick={avancar} className="btn-primary">
                  {discValido && querRefazerDisc === false ? "Enviar candidatura" : <>Próximo <ChevronRight className="h-4 w-4" /></>}
                </button>
              </div>
            </div>
          )}

          {/* ── Step 2: DISC ── */}
          {step === 2 && (
            <div className="mx-auto max-w-2xl">
              <DiscTeste candidateName={c.nome || "Candidato"} onComplete={concluir} />
            </div>
          )}

          {/* ── Sucesso ── */}
          {step === "ok" && (
            <div className="mx-auto max-w-md py-10 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[hsl(var(--success)/0.15)] text-success">
                <Check className="h-8 w-8" />
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground">Candidatura enviada!</h3>
              <p className="mt-2 font-sans text-sm text-muted-foreground">Entraremos em contato em breve.</p>
              <button onClick={close} className="btn-primary mt-6">
                Fechar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Primitives ────────────────────────────────────────────────────────────────

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

function BtnOpcao({ onClick, label, secondary }: { onClick: () => void; label: string; secondary?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg border px-3 py-2 font-sans text-xs font-medium transition ${
        secondary
          ? "border-border bg-background text-foreground hover:bg-muted"
          : "border-primary bg-primary text-primary-foreground hover:bg-primary/90"
      }`}
    >
      {label}
    </button>
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

function Input({ value, onChange, type = "text", placeholder, readOnly, onKeyDown }: {
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  readOnly?: boolean;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}) {
  return (
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      readOnly={readOnly}
      onKeyDown={onKeyDown}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full rounded-lg border border-border px-3 py-2 font-sans text-sm text-foreground focus:border-primary focus:outline-none ${
        readOnly ? "bg-muted text-muted-foreground cursor-default" : "bg-background"
      }`}
    />
  );
}

function Select({ value, onChange, children, disabled }: { value: string; onChange: (v: string) => void; children: React.ReactNode; disabled?: boolean }) {
  return (
    <select
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full rounded-lg border border-border px-3 py-2 font-sans text-sm text-foreground focus:border-primary focus:outline-none ${disabled ? "bg-muted text-muted-foreground cursor-default" : "bg-background"}`}
    >
      {children}
    </select>
  );
}
