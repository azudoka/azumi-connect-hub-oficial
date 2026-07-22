import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  CalendarCheck, MapPin, Video, ShieldCheck,
  AlertTriangle, CheckCircle2, Clock, XCircle,
  ExternalLink,
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
  horario_sugerido_pelo_candidato: string | null;
  horario_consultor_contra_proposta: string | null;
  status: string;
  token: string;
  candidates: CandInfo | null;
  job_solicitations: JobInfo | null;
};

type Step =
  | "loading" | "not_found" | "already_done"
  | "choice"
  | "suggest"
  | "counter"
  | "done_confirm"
  | "done_suggest"
  | "done_counter_confirm"
  | "done_descontinuado";

// ── Helpers ────────────────────────────────────────────────────────────

function fmtDT(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", {
    weekday: "long", day: "2-digit", month: "long",
    hour: "2-digit", minute: "2-digit",
  });
}

function calendarLinks(iso: string, titulo: string, descricao: string) {
  const start = new Date(iso);
  const end = new Date(start.getTime() + 60 * 60 * 1000); // +1h
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z";
  const googleUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(titulo)}&dates=${fmt(start)}/${fmt(end)}&details=${encodeURIComponent(descricao)}`;
  const outlookUrl = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(titulo)}&startdt=${start.toISOString()}&enddt=${end.toISOString()}&body=${encodeURIComponent(descricao)}`;
  const icsContent = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "BEGIN:VEVENT",
    `SUMMARY:${titulo}`,
    `DTSTART:${fmt(start)}`,
    `DTEND:${fmt(end)}`,
    `DESCRIPTION:${descricao}`,
    "STATUS:CONFIRMED", "END:VEVENT", "END:VCALENDAR",
  ].join("\r\n");
  const icsUrl = `data:text/calendar;charset=utf-8,${encodeURIComponent(icsContent)}`;
  return { googleUrl, outlookUrl, icsUrl };
}

// ── Page ───────────────────────────────────────────────────────────────

export default function ConfirmarEntrevistaPage() {
  const { agendamentoId } = useParams();

  useEffect(() => {
    const html = document.documentElement;
    const hadMidnight = html.classList.contains("theme-midnight");
    html.classList.remove("theme-midnight");
    return () => { if (hadMidnight) html.classList.add("theme-midnight"); };
  }, []);

  const [step, setStep] = useState<Step>("loading");
  const [ag, setAg] = useState<Agendamento | null>(null);
  const [horarioConfirmado, setHorarioConfirmado] = useState<string | null>(null);
  const [horarioEscolhido, setHorarioEscolhido] = useState<string | null>(null);
  const [sugHorario, setSugHorario] = useState("");
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
        const st: string = data.status;
        if (st === "confirmado" || st === "confirmado_aguardando_detalhes") {
          if (data.horario_confirmado) setHorarioConfirmado(data.horario_confirmado);
          setStep("already_done");
          return;
        }
        if (st === "candidato_sugeriu") { setStep("already_done"); return; }
        if (st === "descontinuado") { setStep("done_descontinuado"); return; }
        if (st === "consultor_contra_proposta") { setStep("counter"); return; }
        setStep("choice");
      });
  }, [agendamentoId]);

  async function confirmar() {
    if (!ag || !horarioEscolhido || !agendamentoId) return;
    setSubmitting(true); setErro(null);
    const { error } = await (supabase as any)
      .from("entrevista_agendamentos")
      .update({ status: "confirmado_aguardando_detalhes", horario_confirmado: horarioEscolhido })
      .eq("token", agendamentoId);
    if (error) {
      console.error("[confirmar entrevista]", error);
      setErro("Erro ao confirmar. Tente novamente."); setSubmitting(false); return;
    }
    const nomeCandidato = ag.candidates?.nome ?? "Candidato";
    const cargo = ag.job_solicitations?.cargo ?? "a vaga";
    const resp = ag.job_solicitations?.users_profile;
    const responsavelId = ag.job_solicitations?.responsavel_id;
    const horarioFmt = fmtDT(horarioEscolhido);
    const linkVaga = `${window.location.origin}/app/atracao/${ag.job_id}`;
    if (resp?.email) {
      sendEmail(resp.email, `${nomeCandidato} confirmou a entrevista`,
        emailCandidatoConfirmouEntrevista({ nomeConsultor: resp.full_name, nomeCandidato, cargo, horario: horarioFmt, linkVaga }));
    }
    if (responsavelId) {
      (supabase as any).from("app_notifications").insert({
        user_id: responsavelId, tipo: "entrevista_confirmada",
        titulo: "Entrevista confirmada",
        mensagem: `${nomeCandidato} confirmou para ${cargo} — ${horarioFmt}.`,
        link: `/app/atracao/${ag.job_id}`, lida: false,
      });
    }
    setHorarioConfirmado(horarioEscolhido);
    setStep("done_confirm");
    setSubmitting(false);
  }

  async function sugerirHorario() {
    if (!ag || !sugHorario || !agendamentoId) return;
    setSubmitting(true); setErro(null);
    const { error } = await (supabase as any)
      .from("entrevista_agendamentos")
      .update({
        status: "candidato_sugeriu",
        horario_sugerido_pelo_candidato: new Date(sugHorario).toISOString(),
        observacao_candidato: obs.trim() || null,
      })
      .eq("token", agendamentoId);
    if (error) {
      console.error("[sugerir horario]", error);
      setErro("Erro ao enviar. Tente novamente."); setSubmitting(false); return;
    }
    const nomeCandidato = ag.candidates?.nome ?? "Candidato";
    const cargo = ag.job_solicitations?.cargo ?? "a vaga";
    const resp = ag.job_solicitations?.users_profile;
    const responsavelId = ag.job_solicitations?.responsavel_id;
    const h1 = fmtDT(new Date(sugHorario).toISOString());
    const linkVaga = `${window.location.origin}/app/atracao/${ag.job_id}`;
    if (resp?.email) {
      sendEmail(resp.email, `${nomeCandidato} sugeriu novo horário`,
        emailCandidatoSugeriuHorarios({ nomeConsultor: resp.full_name, nomeCandidato, cargo, horario1: h1, horario2: h1, observacao: obs.trim() || undefined, linkVaga }));
    }
    if (responsavelId) {
      (supabase as any).from("app_notifications").insert({
        user_id: responsavelId, tipo: "candidato_sugeriu_horario",
        titulo: `${nomeCandidato} sugeriu novo horário`,
        mensagem: `Candidato propôs ${h1} para ${cargo}. Revise no painel.`,
        link: `/app/atracao/${ag.job_id}`, lida: false,
      });
    }
    setStep("done_suggest");
    setSubmitting(false);
  }

  async function confirmarContraProposta() {
    if (!ag || !agendamentoId) return;
    const horario = ag.horario_consultor_contra_proposta!;
    setSubmitting(true); setErro(null);
    const { error } = await (supabase as any)
      .from("entrevista_agendamentos")
      .update({ status: "confirmado_aguardando_detalhes", horario_confirmado: horario })
      .eq("token", agendamentoId);
    if (error) {
      console.error("[confirmar contra proposta]", error);
      setErro("Erro ao confirmar. Tente novamente."); setSubmitting(false); return;
    }
    const nomeCandidato = ag.candidates?.nome ?? "Candidato";
    const cargo = ag.job_solicitations?.cargo ?? "a vaga";
    const resp = ag.job_solicitations?.users_profile;
    const responsavelId = ag.job_solicitations?.responsavel_id;
    const horarioFmt = fmtDT(horario);
    const linkVaga = `${window.location.origin}/app/atracao/${ag.job_id}`;
    if (resp?.email) {
      sendEmail(resp.email, `${nomeCandidato} confirmou a entrevista`,
        emailCandidatoConfirmouEntrevista({ nomeConsultor: resp.full_name, nomeCandidato, cargo, horario: horarioFmt, linkVaga }));
    }
    if (responsavelId) {
      (supabase as any).from("app_notifications").insert({
        user_id: responsavelId, tipo: "entrevista_confirmada",
        titulo: "Entrevista confirmada",
        mensagem: `${nomeCandidato} confirmou para ${cargo} — ${horarioFmt}.`,
        link: `/app/atracao/${ag.job_id}`, lida: false,
      });
    }
    setHorarioConfirmado(horario);
    setStep("done_counter_confirm");
    setSubmitting(false);
  }

  async function recusarContraProposta() {
    if (!ag || !agendamentoId) return;
    setSubmitting(true); setErro(null);
    const [r1] = await Promise.all([
      (supabase as any).from("entrevista_agendamentos").update({ status: "descontinuado" }).eq("token", agendamentoId),
      (supabase as any).from("candidates").update({ etapa_azumi: "reprovado" }).eq("id", ag.candidate_id),
    ]);
    if (r1.error) {
      console.error("[recusar contra proposta]", r1.error);
      setErro("Erro ao registrar. Tente novamente."); setSubmitting(false); return;
    }
    const nomeCandidato = ag.candidates?.nome ?? "Candidato";
    const cargo = ag.job_solicitations?.cargo ?? "a vaga";
    const resp = ag.job_solicitations?.users_profile;
    const responsavelId = ag.job_solicitations?.responsavel_id;
    if (responsavelId) {
      (supabase as any).from("app_notifications").insert({
        user_id: responsavelId, tipo: "candidato_descontinuado",
        titulo: `${nomeCandidato} recusou — descontinuado`,
        mensagem: `${nomeCandidato} não aceitou nenhum horário para ${cargo}.`,
        link: `/app/atracao/${ag.job_id}`, lida: false,
      });
    }
    if (resp?.email) {
      sendEmail(resp.email, `${nomeCandidato} recusou a última proposta`,
        `<p>${nomeCandidato} recusou o último horário proposto para a vaga de <strong>${cargo}</strong> e foi descontinuado.</p>`);
    }
    setStep("done_descontinuado");
    setSubmitting(false);
  }

  // ── Render ─────────────────────────────────────────────────────────

  if (step === "loading") return (
    <Shell><div className="flex items-center justify-center py-16 text-muted-foreground text-sm">Carregando...</div></Shell>
  );

  if (step === "not_found") return (
    <Shell><StatusCard icon={<AlertTriangle className="h-7 w-7" />} color="destructive"
      title="Link inválido ou expirado"
      message="Não localizamos esta entrevista. Verifique o link ou entre em contato com a Azumi." /></Shell>
  );

  if (step === "already_done") return (
    <Shell><StatusCard icon={<CheckCircle2 className="h-7 w-7" />} color="primary"
      title="Resposta já registrada"
      message="Você já respondeu a este convite. Em breve a Azumi entrará em contato." /></Shell>
  );

  if (step === "done_descontinuado") return (
    <Shell><StatusCard icon={<XCircle className="h-7 w-7" />} color="destructive"
      title="Processo encerrado"
      message="Não foi possível encontrar um horário compatível. Você foi descontinuado(a) deste processo. Obrigado pela participação!" /></Shell>
  );

  if (step === "done_suggest") return (
    <Shell><StatusCard icon={<Clock className="h-7 w-7" />} color="warning"
      title="Sugestão enviada!"
      message="Recebemos sua proposta de horário. O time da Azumi vai analisar e entrar em contato." /></Shell>
  );

  // Confirmação bem-sucedida — mostra botões de agenda
  if (step === "done_confirm" || step === "done_counter_confirm") {
    const horario = horarioConfirmado;
    return (
      <Shell>
        <div className="bg-card border border-border rounded-2xl p-6 shadow-xl text-center">
          <div className="h-14 w-14 mx-auto rounded-full flex items-center justify-center bg-success/15 text-success">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <h1 className="font-semibold text-xl mt-3">🎉 Confirmado!</h1>
          {horario && (
            <p className="text-sm font-medium mt-2 bg-muted rounded-lg px-3 py-2 inline-block">
              {fmtDT(horario)}
            </p>
          )}
          <p className="text-sm text-muted-foreground mt-3">
            Em breve você receberá um e-mail com todos os detalhes da entrevista — local ou link para acesso.
          </p>
          <p className="text-xs text-muted-foreground mt-2">Boa sorte! Estamos torcendo por você. 🚀</p>
        </div>
      </Shell>
    );
  }

  // ── Contra-proposta do consultor (última tentativa) ──────────────────
  if (step === "counter" && ag?.horario_consultor_contra_proposta) {
    const nomeFirst = (ag.candidates?.nome ?? "").split(" ")[0] || "Candidato";
    const cargo = ag.job_solicitations?.cargo ?? "a vaga";
    return (
      <Shell>
        <div className="bg-card border border-border rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Azumi Connect — Última tentativa
          </div>
          <h1 className="font-semibold text-xl">Olá, {nomeFirst}!</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Nossa equipe recebeu sua sugestão mas precisou ajustar. Abaixo está a <strong>proposta final</strong> para a vaga de <strong>{cargo}</strong>.
          </p>
          <div className="mt-5 rounded-xl border border-warning/40 bg-warning/5 px-4 py-3">
            <div className="flex items-center gap-2 text-sm font-medium text-warning mb-1">
              <CalendarCheck className="h-4 w-4" /> Última proposta
            </div>
            <div className="text-sm ml-6">{fmtDT(ag.horario_consultor_contra_proposta)}</div>
          </div>
          <div className="mt-3 text-xs text-warning bg-warning/10 border border-warning/30 rounded-lg px-3 py-2">
            Atenção: recusando este horário você será descontinuado(a) do processo.
          </div>
          {ag.tipo === "remota"
            ? <p className="mt-3 text-xs text-muted-foreground flex items-center gap-1"><Video className="h-3.5 w-3.5" /> Remota — link enviado por e-mail</p>
            : <p className="mt-3 text-xs text-muted-foreground flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> Presencial</p>}
          {erro && <ErroBanner msg={erro} />}
          <div className="mt-5 space-y-2">
            <button type="button" disabled={submitting} onClick={confirmarContraProposta}
              className="w-full h-11 rounded-lg bg-primary text-primary-foreground text-sm font-semibold inline-flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50">
              <CheckCircle2 className="h-4 w-4" /> {submitting ? "Confirmando..." : "Confirmar este horário"}
            </button>
            <button type="button" disabled={submitting} onClick={recusarContraProposta}
              className="w-full h-10 rounded-lg border border-destructive/40 text-destructive text-sm font-medium hover:bg-destructive/10 disabled:opacity-50">
              {submitting ? "Registrando..." : "Não posso — encerrar participação"}
            </button>
          </div>
        </div>
      </Shell>
    );
  }

  // ── Sugestão de 1 horário alternativo ───────────────────────────────
  if (step === "suggest") {
    return (
      <Shell>
        <div className="bg-card border border-border rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Azumi Connect — Sugestão de horário
          </div>
          <h1 className="font-semibold text-xl">Sugira um horário</h1>
          <p className="text-sm text-muted-foreground mt-1 mb-5">
            Informe um horário que funcione para você. Nossa equipe vai analisar e retornar.
          </p>
          <div className="space-y-4">
            <LabelInput label="Seu horário proposto *">
              <input type="datetime-local" value={sugHorario} onChange={(e) => setSugHorario(e.target.value)}
                className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </LabelInput>
            <LabelInput label="Observação (opcional)">
              <textarea value={obs} onChange={(e) => setObs(e.target.value)} rows={2}
                placeholder="Ex: prefiro manhã, disponível a partir das 9h..."
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </LabelInput>
            {erro && <ErroBanner msg={erro} />}
            <div className="flex gap-2 pt-1">
              <button type="button" onClick={() => setStep("choice")}
                className="flex-1 h-10 rounded-lg border border-border text-sm font-medium hover:bg-secondary">Voltar</button>
              <button type="button" onClick={sugerirHorario} disabled={!sugHorario || submitting}
                className="flex-1 h-10 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-50">
                {submitting ? "Enviando..." : "Enviar sugestão"}
              </button>
            </div>
          </div>
        </div>
      </Shell>
    );
  }

  // ── Escolha entre as 2 opções do consultor ───────────────────────────
  if (!ag) return null;
  const nomeFirst = (ag.candidates?.nome ?? "").split(" ")[0] || "Candidato";
  const cargo = ag.job_solicitations?.cargo ?? "a vaga";

  return (
    <Shell>
      <div className="bg-card border border-border rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
          <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Azumi Connect — Confirmação de entrevista
        </div>
        <h1 className="font-semibold text-xl">Olá, {nomeFirst}!</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Selecione o melhor horário para sua entrevista — vaga de <strong>{cargo}</strong>.
        </p>
        <div className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
          {ag.tipo === "presencial"
            ? <><MapPin className="h-3.5 w-3.5" /> Entrevista presencial</>
            : <><Video className="h-3.5 w-3.5" /> Remota — link enviado por e-mail</>}
        </div>
        <div className="mt-5 space-y-3">
          {[ag.horario_sugestao_1, ag.horario_sugestao_2].map((iso, i) => (
            <button key={i} type="button" onClick={() => setHorarioEscolhido(iso)}
              className={`w-full text-left rounded-xl border px-4 py-3 transition-colors ${
                horarioEscolhido === iso
                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                  : "border-border hover:border-primary/40 hover:bg-secondary/50"}`}>
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
            <CheckCircle2 className="h-4 w-4" /> {submitting ? "Confirmando..." : "Confirmar este horário"}
          </button>
          <button type="button" onClick={() => setStep("suggest")}
            className="w-full h-10 rounded-lg border border-border text-sm font-medium hover:bg-secondary">
            Nenhum horário serve — sugerir alternativa
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

function StatusCard({ icon, color, title, message }: {
  icon: React.ReactNode; color: "success" | "warning" | "destructive" | "primary";
  title: string; message: string;
}) {
  const cls = { success: "bg-success/15 text-success", warning: "bg-warning/15 text-warning", destructive: "bg-destructive/15 text-destructive", primary: "bg-primary/15 text-primary" }[color];
  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-xl text-center">
      <div className={`h-14 w-14 mx-auto rounded-full flex items-center justify-center ${cls}`}>{icon}</div>
      <h1 className="font-semibold text-xl mt-3">{title}</h1>
      <p className="text-sm text-muted-foreground mt-1">{message}</p>
    </div>
  );
}

function LabelInput({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="text-xs font-medium block mb-1">{label}</label>{children}</div>;
}

function ErroBanner({ msg }: { msg: string }) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive mt-3">
      <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" /> {msg}
    </div>
  );
}
