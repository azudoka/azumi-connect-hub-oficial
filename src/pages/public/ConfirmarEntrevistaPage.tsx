import { useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import {
  CalendarCheck,
  MapPin,
  Video,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
  candidatoConfirmar,
  candidatoRecusar,
  formatarSugestao,
  getAgendamento,
} from "@/data/entrevistaGestorStore";

// ────────────────────────────────────────────────────────────────────
// Validação simples de CPF (apenas máscara + 11 dígitos no mock)
// ────────────────────────────────────────────────────────────────────

function maskCpf(value: string): string {
  const d = value.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

function cpfValido(value: string): boolean {
  return value.replace(/\D/g, "").length === 11;
}

// ────────────────────────────────────────────────────────────────────
// Página
// ────────────────────────────────────────────────────────────────────

export default function ConfirmarEntrevistaPage() {
  const { agendamentoId } = useParams();
  const [search] = useSearchParams();
  const candFromUrl = search.get("cand");

  const [versao, setVersao] = useState(0);
  const ag = useMemo(
    () => (agendamentoId ? getAgendamento(agendamentoId) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [agendamentoId, versao]
  );

  const [cpf, setCpf] = useState("");
  const [comentario, setComentario] = useState("");
  const [acaoEscolhida, setAcaoEscolhida] = useState<"confirmar" | "recusar" | null>(
    null
  );
  const [erro, setErro] = useState<string | null>(null);

  // Estado de UI: link inválido / agendamento de outro candidato
  if (!agendamentoId || !ag) {
    return (
      <PublicShell>
        <ErrorCard
          title="Link inválido ou expirado"
          message="Não localizamos esta entrevista. Confira o link recebido ou fale com a Azumi."
        />
      </PublicShell>
    );
  }
  if (candFromUrl && candFromUrl !== ag.candidatoId) {
    return (
      <PublicShell>
        <ErrorCard
          title="Link não corresponde ao candidato"
          message="O link parece pertencer a outra pessoa. Use o link que foi enviado para você."
        />
      </PublicShell>
    );
  }

  const escolhido = ag.escolhido;
  const isConfirmado = ag.status === "confirmado";
  const isRecusado = ag.status === "candidato_recusou";

  function handleConfirmar() {
    if (!cpfValido(cpf)) {
      setErro("Informe um CPF válido (11 dígitos).");
      return;
    }
    setErro(null);
    candidatoConfirmar(ag!.id);
    setAcaoEscolhida("confirmar");
    setVersao((v) => v + 1);
  }

  function handleRecusar() {
    if (!cpfValido(cpf)) {
      setErro("Informe um CPF válido para registrar a recusa.");
      return;
    }
    setErro(null);
    candidatoRecusar(ag!.id, comentario.trim() || undefined);
    setAcaoEscolhida("recusar");
    setVersao((v) => v + 1);
  }

  if (isConfirmado || acaoEscolhida === "confirmar") {
    return (
      <PublicShell>
        <SuccessCard
          title="Entrevista confirmada!"
          message="Boa entrevista! Encaminhamos a confirmação para a Azumi e para o gestor."
          ag={ag}
        />
      </PublicShell>
    );
  }

  if (isRecusado || acaoEscolhida === "recusar") {
    return (
      <PublicShell>
        <SuccessCard
          variant="warning"
          title="Recebemos sua mensagem"
          message="Avisamos a Azumi de que você precisa de outro horário. Em breve entraremos em contato."
          ag={ag}
        />
      </PublicShell>
    );
  }

  return (
    <PublicShell>
      <div className="bg-card border border-border rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
          <ShieldCheck className="h-3.5 w-3.5 text-primary" />
          Confirmação de entrevista — Azumi Connect
        </div>
        <h1 className="font-display font-semibold text-xl">
          Olá, {ag.candidatoNome.split(" ")[0]}!
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Confirme sua presença na entrevista com o gestor da{" "}
          <strong>{ag.empresaNome}</strong>.
        </p>

        {escolhido && (
          <div className="mt-5 rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-primary">
              <CalendarCheck className="h-4 w-4" />
              {formatarSugestao(escolhido)}
            </div>
            {escolhido.modo === "presencial" ? (
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                <div>
                  <div className="font-medium">Endereço</div>
                  <div className="text-muted-foreground">
                    {escolhido.localOuLink || "A confirmar"}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2 text-sm">
                <Video className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                <div>
                  <div className="font-medium">Reunião remota</div>
                  <div className="text-muted-foreground break-all">
                    {escolhido.localOuLink ||
                      "O link da reunião será enviado por e-mail."}
                  </div>
                </div>
              </div>
            )}
            <div className="text-xs text-muted-foreground pt-1 border-t border-border/60">
              Gestor responsável: <strong>{ag.gestorNome}</strong>
            </div>
          </div>
        )}

        <div className="mt-5 space-y-4">
          <div>
            <label className="text-xs font-medium block mb-1">E-mail</label>
            <input
              type="email"
              value={ag.candidatoEmail}
              readOnly
              className="w-full h-10 rounded-lg border border-input bg-muted/30 px-3 text-sm text-muted-foreground"
            />
          </div>
          <div>
            <label className="text-xs font-medium block mb-1">
              CPF <span className="text-destructive">*</span>
            </label>
            <input
              value={cpf}
              onChange={(e) => setCpf(maskCpf(e.target.value))}
              placeholder="000.000.000-00"
              inputMode="numeric"
              className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <p className="text-[11px] text-muted-foreground mt-1">
              Usamos o CPF apenas para validar a confirmação desta entrevista.
            </p>
          </div>

          {erro && (
            <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              {erro}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              onClick={handleConfirmar}
              className="h-11 rounded-lg bg-primary text-primary-foreground text-sm font-semibold inline-flex items-center justify-center gap-2 hover:opacity-90"
            >
              <CheckCircle2 className="h-4 w-4" /> Confirmar entrevista
            </button>
            <details className="group sm:col-span-1">
              <summary className="list-none cursor-pointer h-11 rounded-lg border border-border text-sm font-medium inline-flex items-center justify-center hover:bg-secondary">
                Não posso nesse horário
              </summary>
              <div className="mt-2 space-y-2">
                <textarea
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  rows={3}
                  placeholder="Conte rapidamente qual horário seria melhor."
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <button
                  onClick={handleRecusar}
                  className="w-full h-10 rounded-lg border border-destructive/40 text-destructive text-sm font-medium hover:bg-destructive/10"
                >
                  Enviar recusa à Azumi
                </button>
              </div>
            </details>
          </div>
        </div>
      </div>
    </PublicShell>
  );
}

// ────────────────────────────────────────────────────────────────────
// Componentes auxiliares
// ────────────────────────────────────────────────────────────────────

function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}

function SuccessCard({
  title,
  message,
  ag,
  variant = "success",
}: {
  title: string;
  message: string;
  ag: ReturnType<typeof getAgendamento>;
  variant?: "success" | "warning";
}) {
  const isWarn = variant === "warning";
  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-xl text-center">
      <div
        className={cn(
          "h-14 w-14 mx-auto rounded-full flex items-center justify-center",
          isWarn
            ? "bg-warning/15 text-warning"
            : "bg-success/15 text-success"
        )}
      >
        {isWarn ? (
          <AlertTriangle className="h-7 w-7" />
        ) : (
          <CheckCircle2 className="h-7 w-7" />
        )}
      </div>
      <h1 className="font-display font-semibold text-xl mt-3">{title}</h1>
      <p className="text-sm text-muted-foreground mt-1">{message}</p>
      {ag?.escolhido && !isWarn && (
        <p className="text-xs text-muted-foreground mt-4 font-data">
          {formatarSugestao(ag.escolhido)}
        </p>
      )}
    </div>
  );
}

function ErrorCard({ title, message }: { title: string; message: string }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-xl text-center">
      <div className="h-14 w-14 mx-auto rounded-full bg-destructive/15 text-destructive flex items-center justify-center">
        <AlertTriangle className="h-7 w-7" />
      </div>
      <h1 className="font-display font-semibold text-xl mt-3">{title}</h1>
      <p className="text-sm text-muted-foreground mt-1">{message}</p>
    </div>
  );
}
