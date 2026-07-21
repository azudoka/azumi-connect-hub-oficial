import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  CalendarCheck, MapPin, Video, ShieldCheck,
  AlertTriangle, CheckCircle2, Clock,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  sendEmail,
  emailCandidatoConfirmouEntrevista,
  emailCandidatoSugeriuHorarios,
} from "@/lib/emailTemplates";

// ── Types ──────────────────────────────────────────────────────────────

type Responsavel = { full_name: string; email: string | null };
type JobInfo = { cargo: string; responsavel_id: string | null; users_profile: Responsavel | null };
type CandInfo = { nome: string; cpf: string | null };

type Agendamento = {
  id: string;
  candidate_id: string;
  job_id: string;
  tipo: "presencial" | "remota";
  horario_sugestao_1: string;
  horario_sugestao_2: string;
  horario_confirmado: string | null;
  status: string;
  token: string;
  candidates: CandInfo | null;
  job_solicitations: JobInfo | null;
};

type Step = "loading" | "not_found" | "choice" | "suggest" | "done_confirm" | "done_suggest" | "already_done";

// ── Helpers ────────────────────────────────────────────────────────────

function fmtDT(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", {
    weekday: "long", day: "2-digit", month: "long",
    hour: "2-digit", minute: "2-digit",
  });
}

// ── Page ───────────────────────────────────────────────────────────────

export default function ConfirmarEntrevistaPage() {
  const { agendamentoId } = useParams(); // token value in URL

  useEffect(() => {
    const html = document.documentElement;
    const hadMidnight = html.classList.contains("theme-midnight");
    html.classList.remove("theme-midnight");
    return () => { if (hadMidnight) html.classList.add("theme-midnight"); };
  }, []);

  const [step, setStep] = useState<Step>("loading");
  const [ag, setAg] = useState<Agendamento | null>(null);
  const [horarioEscolhido, setHorarioEscolhido] = useState<string | null>(null);
  const [sug1, setSug1] = useState("");
  const [sug2, setSug2] = useState("");
  const [obs, setObs] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!agendamentoId) { setStep("not_found"); return; }
    (supabase as any)
      .from("entrevista_agendamentos")
      .select(
        "*, candidates!entrevista_agendamentos_candidate_id_fkey(nome, cpf), " +
        "job_solicitations!entrevista_agendamentos_job_id_fkey(cargo, responsavel_id, " +
        "users_profile!job_solicitations_responsavel_id_fkey(full_name, email))"
      )
      .eq("token", agendamentoId)
      .single()
      .then(({ data, error }: { data: any; error: any }) => {
        if (error || !data) { setStep("not_found"); return; }
        setAg(data as Agendamento);
        if (data.status === "confirmado" || data.status === "candidato_sugeriu") {
          setStep("already_done");
        } else {
          setStep("choice");
        }
      });
  }, [agendamentoId]);

  async function confirmar() {
    if (!ag || !horarioEscolhido) return;
    setSubmitting(true);
    setErro(null);

    const { error } = await (supabase as any)
      .from("entrevista_agendamentos")
      .update({ status: "confirmado", horario_confirmado: horarioEscolhido })
      .eq("id", ag.id);

    if (error) { setErro("Erro ao confirmar. Tente novamente."); setSubmitting(false); return; }

    const nomeCandidato = ag.candidates?.nome ?? "Candidato";
    const cargo = ag.job_solicitations?.cargo ?? "a vaga";
    const resp = ag.job_solicitations?.users_profile;
    const responsavelId = ag.job_solicitations?.responsavel_id;
    const horarioFmt = fmtDT(horarioEscolhido);
    const linkVaga = `${window.location.origin}/app/atracao/${ag.job_id}`;

    if (resp?.email) {
      sendEmail(resp.email, `${nomeCandidato} confirmou a entrevista`,
        emailCandidatoConfirmouEntrevista({
          nomeConsultor: resp.full_name,
          nomeCandidato, cargo,
          horario: horarioFmt,
          linkVaga,
        })
      );
    }
    if (responsavelId) {
      (supabase as any).from("app_notifications").insert({
        user_id: responsavelId,
        tipo: "entrevista_confirmada",
        titulo: "Entrevista confirmada",
        mensagem: `${nomeCandidato} confirmou para ${cargo} — ${horarioFmt}.`,
        link: `/app/atracao/${ag.job_id}`,
        lida: false,
      });
    }
    setStep("done_confirm");
    setSubmitting(false);
  }

  async function sugerirHorarios() {
    if (!ag || !sug1 || !sug2) return;
    setSubmitting(true);
    setErro(null);

    const { error } = await (supabase as any)
      .from("entrevista_agendamentos")
      .update({
        status: "candidato_sugeriu",
        horario_sugerido_pelo_candidato: new Date(sug1).toISOString(),
        horario_sugestao_candidato_2: new Date(sug2).toISOString(),
        observacao_candidato: obs.trim() || null,
      })
      .eq("id", ag.id);

    if (error) { setErro("Erro ao enviar. Tente novamente."); setSubmitting(false); return; }

    const nomeCandidato = ag.candidates?.nome ?? "Candidato";
    const cargo = ag.job_solicitations?.cargo ?? "a vaga";
    const resp = ag.job_solicitations?.users_profile;
    const responsavelId = ag.job_solicitations?.responsavel_id;
    const h1 = fmtDT(new Date(sug1).toISOString());
    const h2 = fmtDT(new Date(sug2).toISOString());
    const linkVaga = `${window.location.origin}/app/atracao/${ag.job_id}`;

    if (resp?.email) {
      sendEmail(resp.email, `${nomeCandidato} sugeriu novos horários`,
        emailCandidatoSugeriuHorarios({
          nomeConsultor: resp.full_name,
          nomeCandidato, cargo,
          horario1: h1, horario2: h2,
          observacao: obs.trim() || undefined,
          linkVaga,
        })
      );
    }
    if (responsavelId) {
      (supabase as any).from("app_notifications").insert({
        user_id: responsavelId,
        tipo: "candidato_sugeriu_horario",
        titulo: `${nomeCandidato} sugeriu novos horários`,
        mensagem: `Candidato propôs alternativas para ${cargo}: ${h1} ou ${h2}.`,
        link: `/app/atracao/${ag.job_id}`,
        lida: false,
      });
    }
    setStep("done_suggest");
    setSubmitting(false);
  }

  // ── Render ─────────────────────────────────────────────────────────

  if (step === "loading") {
    return (
      <Shell>
        <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">Carregando...</div>
      </Shell>
    );
  }

  if (step === "not_found") {
    return (
      <Shell>
        <StatusCard icon={<AlertTriangle className="h-7 w-7" />} color="destructive"
          title="Link inválido ou expirado"
          message="Não localizamos esta entrevista. Verifique o link recebido ou entre em contato com a Azumi."
        />
      </Shell>
    );
  }

  if (step === "already_done") {
    return (
      <Shell>
        <StatusCard icon={<CheckCircle2 className="h-7 w-7" />} color="primary"
          title="Resposta já registrada"
          message="Você já respondeu a este convite. Em breve a Azumi entrará em contato."
        />
      </Shell>
    );
  }

  if (step === "done_confirm") {
    return (
      <Shell>
        <StatusCard icon={<CheckCircle2 className="h-7 w-7" />} color="success"
          title="Entrevista confirmada!"
          message="Perfeito! Sua confirmação foi registrada. Boa entrevista!"
          detail={horarioEscolhido ? fmtDT(horarioEscolhido) : undefined}
        />
      </Shell>
    );
  }

  if (step === "done_suggest") {
    return (
      <Shell>
        <StatusCard icon={<Clock className="h-7 w-7" />} color="warning"
          title="Sugestões enviadas!"
          message="Recebemos seus horários alternativos. O time da Azumi vai analisar e entrar em contato."
        />
      </Shell>
    );
  }

  if (step === "suggest") {
    return (
      <Shell>
        <div className="bg-card border border-border rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            Azumi Connect — Sugestão de horários
          </div>
          <h1 className="font-semibold text-xl">Sugira dois horários</h1>
          <p className="text-sm text-muted-foreground mt-1 mb-5">
            Informe duas opções e nossa equipe tentará confirmar uma delas.
          </p>
          <div className="space-y-4">
            <LabelInput label="Opção 1 *">
              <input type="datetime-local" value={sug1} onChange={(e) => setSug1(e.target.value)}
                className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </LabelInput>
            <LabelInput label="Opção 2 *">
              <input type="datetime-local" value={sug2} onChange={(e) => setSug2(e.target.value)}
                className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </LabelInput>
            <LabelInput label="Observação (opcional)">
              <textarea value={obs} onChange={(e) => setObs(e.target.value)} rows={2}
                placeholder="Ex: prefiro pela manhã, disponível a partir das 9h..."
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </LabelInput>
            {erro && <ErroBanner msg={erro} />}
            <div className="flex gap-2 pt-1">
              <button type="button" onClick={() => setStep("choice")}
                className="flex-1 h-10 rounded-lg border border-border text-sm font-medium hover:bg-secondary">
                Voltar
              </button>
              <button type="button" onClick={sugerirHorarios} disabled={!sug1 || !sug2 || submitting}
                className="flex-1 h-10 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-50">
                {submitting ? "Enviando..." : "Enviar sugestões"}
              </button>
            </div>
          </div>
        </div>
      </Shell>
    );
  }

  // step === "choice"
  if (!ag) return null;
  const nomeFirst = (ag.candidates?.nome ?? "").split(" ")[0] || "Candidato";
  const cargo = ag.job_solicitations?.cargo ?? "a vaga";

  return (
    <Shell>
      <div className="bg-card border border-border rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
          <ShieldCheck className="h-3.5 w-3.5 text-primary" />
          Azumi Connect — Confirmação de entrevista
        </div>
        <h1 className="font-semibold text-xl">Olá, {nomeFirst}!</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Selecione o melhor horário para sua entrevista — vaga de <strong>{cargo}</strong>.
        </p>

        <div className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
          {ag.tipo === "presencial"
            ? <><MapPin className="h-3.5 w-3.5" /> Entrevista presencial</>
            : <><Video className="h-3.5 w-3.5" /> Entrevista remota — link enviado por e-mail</>}
        </div>

        <div className="mt-5 space-y-3">
          {[ag.horario_sugestao_1, ag.horario_sugestao_2].map((iso, i) => (
            <button key={i} type="button" onClick={() => setHorarioEscolhido(iso)}
              className={`w-full text-left rounded-xl border px-4 py-3 transition-colors ${
                horarioEscolhido === iso
                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                  : "border-border hover:border-primary/40 hover:bg-secondary/50"
              }`}>
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                <CalendarCheck className={`h-3.5 w-3.5 ${horarioEscolhido === iso ? "text-primary" : ""}`} />
                Opção {i + 1}
              </div>
              <div className="text-sm font-medium mt-1 ml-5">{fmtDT(iso)}</div>
            </button>
          ))}
        </div>

        {erro && <ErroBanner msg={erro} />}

        <div className="mt-5 space-y-2">
          <button type="button" disabled={!horarioEscolhido || submitting} onClick={confirmar}
            className="w-full h-11 rounded-lg bg-primary text-primary-foreground text-sm font-semibold inline-flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50">
            <CheckCircle2 className="h-4 w-4" />
            {submitting ? "Confirmando..." : "Confirmar este horário"}
          </button>
          <button type="button" onClick={() => setStep("suggest")}
            className="w-full h-10 rounded-lg border border-border text-sm font-medium hover:bg-secondary">
            Nenhum horário serve — sugerir alternativas
          </button>
        </div>
      </div>
    </Shell>
  );
}

// ── Shared UI ──────────────────────────────────────────────────────────

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}

function StatusCard({ icon, color, title, message, detail }: {
  icon: React.ReactNode;
  color: "success" | "warning" | "destructive" | "primary";
  title: string;
  message: string;
  detail?: string;
}) {
  const cls = {
    success: "bg-success/15 text-success",
    warning: "bg-warning/15 text-warning",
    destructive: "bg-destructive/15 text-destructive",
    primary: "bg-primary/15 text-primary",
  }[color];
  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-xl text-center">
      <div className={`h-14 w-14 mx-auto rounded-full flex items-center justify-center ${cls}`}>
        {icon}
      </div>
      <h1 className="font-semibold text-xl mt-3">{title}</h1>
      <p className="text-sm text-muted-foreground mt-1">{message}</p>
      {detail && (
        <p className="text-xs text-muted-foreground mt-3 bg-muted rounded-lg px-3 py-2 inline-block">
          {detail}
        </p>
      )}
    </div>
  );
}

function LabelInput({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-medium block mb-1">{label}</label>
      {children}
    </div>
  );
}

function ErroBanner({ msg }: { msg: string }) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
      <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" /> {msg}
    </div>
  );
}
