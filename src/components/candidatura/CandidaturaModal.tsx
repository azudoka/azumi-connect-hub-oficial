import { useState } from "react";
import { X, Upload, Check, ChevronRight, FileText, Loader2 } from "lucide-react";
import DiscTeste from "@/components/disc/DiscTeste";
import type { DiscDim, DiscScores } from "@/components/disc/discQuestions";
import { supabase } from "@/integrations/supabase/client";

const EMAIL_API = "https://azumi-email-api.vercel.app/api/send-email";

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
  const [step, setStep] = useState<1 | 2 | "ok">(1);
  const [c, setC] = useState<Cadastro>(CADASTRO_INIT);
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  if (!open) return null;

  function up<K extends keyof Cadastro>(k: K, v: Cadastro[K]) {
    setC((p) => ({ ...p, [k]: v }));
  }

  function close() {
    setStep(1);
    setC(CADASTRO_INIT);
    setErro("");
    onClose();
  }

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
    setStep(2);
  }

  async function concluir(scores: DiscScores, perfilDim: DiscDim) {
    setEnviando(true);

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

    if (error) {
      console.error("[candidatura] Supabase:", error.message);
    } else if (candidatoInserido) {
      const entries = (["D", "I", "S", "C"] as const)
        .map((k) => ({ k, v: scores[k] }))
        .sort((a, b) => b.v - a.v);
      const fatorSecundario = entries[1]?.k ?? null;

      const { error: discError } = await supabase
        .from("disc_resultado_candidato")
        .insert({
          candidato_id: candidatoInserido.id,
          score_d: scores.D,
          score_i: scores.I,
          score_s: scores.S,
          score_c: scores.C,
          fator_predominante: perfilDim,
          fator_secundario: fatorSecundario,
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
      `<tr><td><strong>DISC</strong></td><td>D:${scores.D} I:${scores.I} S:${scores.S} C:${scores.C} — Perfil: ${perfilDim}</td></tr>`,
    ].filter(Boolean).join("");

    const html = `
      <h2 style="color:#031D38">Nova ${modo === "banco" ? "inscrição no banco de talentos" : "candidatura"}</h2>
      <table cellpadding="6" cellspacing="0" style="border-collapse:collapse;font-size:14px">
        ${linhas}
      </table>
      <p style="margin-top:16px;font-size:12px;color:#666">
        Enviado automaticamente por Azumi Connect · ${new Date().toLocaleString("pt-BR")}
      </p>
    `;

    fetch(EMAIL_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subject: `Nova candidatura: ${c.nome} → ${vagaTitulo ?? "Banco de talentos"}`,
        html,
      }),
    }).catch((err) => console.error("[candidatura] email:", err));

    setEnviando(false);
    setStep("ok");
  }

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
            <StepItem n={1} label="Cadastro" active={step === 1} done={step === 2} />
            <div className="h-px flex-1 bg-border" />
            <StepItem n={2} label="Perfil DISC" active={step === 2} done={false} />
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
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
                  <Input value={c.nome} onChange={(v) => up("nome", v)} />
                </Field>
                <Field label="Email *">
                  <Input type="email" value={c.email} onChange={(v) => up("email", v)} />
                </Field>
              </Grid2>
              <Grid2>
                <Field label="Telefone *">
                  <Input value={c.telefone} onChange={(v) => up("telefone", v)} placeholder="(00) 00000-0000" />
                </Field>
                <Field label="CPF *">
                  <Input value={c.cpf} onChange={(v) => up("cpf", v)} placeholder="000.000.000-00" />
                </Field>
              </Grid2>
              <Grid2>
                <Field label="Data de nascimento *">
                  <Input type="date" value={c.nascimento} onChange={(v) => up("nascimento", v)} />
                </Field>
                <Field label="Cidade / Estado *">
                  <Input value={c.cidadeEstado} onChange={(v) => up("cidadeEstado", v)} placeholder="Ex.: Curitiba, PR" />
                </Field>
              </Grid2>
              <Grid2>
                <Field label="Bairro *">
                  <Input value={c.bairro} onChange={(v) => up("bairro", v)} />
                </Field>
                <Field label="Escolaridade *">
                  <Select value={c.escolaridade} onChange={(v) => up("escolaridade", v)}>
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
                      onClick={() => up("filhos", o.v as Cadastro["filhos"])}
                      className={`rounded-full border px-3 py-1.5 font-sans text-xs font-medium ${
                        c.filhos === o.v
                          ? "border-primary bg-primary text-primary-foreground"
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
                  <Input value={c.linkedin} onChange={(v) => up("linkedin", v)} placeholder="linkedin.com/in/..." />
                </Field>
                <Field label="Portfólio ou link adicional">
                  <Input value={c.portfolio} onChange={(v) => up("portfolio", v)} />
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

function StepItem({ n, label, active, done }: { n: number; label: string; active: boolean; done: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`flex h-7 w-7 items-center justify-center rounded-full font-sans text-xs font-semibold ${
          done
            ? "bg-success text-success-foreground"
            : active
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground"
        }`}
      >
        {done ? <Check className="h-4 w-4" /> : n}
      </div>
      <span className={`font-sans text-sm font-medium ${active || done ? "text-foreground" : "text-muted-foreground"}`}>
        {label}
      </span>
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

function Input({ value, onChange, type = "text", placeholder }: { value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return (
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-border bg-background px-3 py-2 font-sans text-sm text-foreground focus:border-primary focus:outline-none"
    />
  );
}

function Select({ value, onChange, children }: { value: string; onChange: (v: string) => void; children: React.ReactNode }) {
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
