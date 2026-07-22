import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowRight, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AzumiLogo } from "@/components/brand/AzumiLogo";
import {
  sendEmail,
  emailAcessoAreaCandidato,
  emailCadastroNaoEncontrado,
} from "@/lib/emailTemplates";

const RATE_LIMIT_MS = 60_000; // 60s por e-mail

function getRateKey(email: string) {
  return `aca_last_${email.toLowerCase().trim()}`;
}

function isRateLimited(email: string): boolean {
  try {
    const last = localStorage.getItem(getRateKey(email));
    if (!last) return false;
    return Date.now() - Number(last) < RATE_LIMIT_MS;
  } catch {
    return false;
  }
}

function markSent(email: string) {
  try {
    localStorage.setItem(getRateKey(email), String(Date.now()));
  } catch {}
}

export default function AreaDoCandidatoPage() {
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<"form" | "sending" | "sent">("form");
  const [erro, setErro] = useState("");

  // Remove dark theme
  useEffect(() => {
    const html = document.documentElement;
    const had = html.classList.contains("theme-midnight");
    html.classList.remove("theme-midnight");
    return () => { if (had) html.classList.add("theme-midnight"); };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const emailLimpo = email.toLowerCase().trim();

    // Validação básica
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLimpo)) {
      setErro("Digite um e-mail válido.");
      return;
    }

    // Rate limit client-side
    if (isRateLimited(emailLimpo)) {
      setErro("Já enviamos um link para este e-mail. Aguarde 1 minuto antes de tentar novamente.");
      return;
    }

    setErro("");
    setStep("sending");

    // Busca candidato por e-mail (pega o mais recente com email)
    const { data: rows } = await supabase
      .from("candidates")
      .select("id, nome, token_acesso_candidato")
      .ilike("email", emailLimpo)
      .order("created_at", { ascending: false })
      .limit(1);

    const candidato = rows?.[0] ?? null;

    if (candidato) {
      // Garante token (gera se não existir)
      let token: string = (candidato as any).token_acesso_candidato ?? "";
      if (!token) {
        token = crypto.randomUUID();
        await supabase
          .from("candidates")
          .update({ token_acesso_candidato: token } as any)
          .eq("id", (candidato as any).id);
      }

      const link = `${window.location.origin}/meu-perfil/${token}`;
      const nome = (candidato as any).nome ?? "Candidato";
      sendEmail(emailLimpo, "Seu acesso à Área do Candidato — Azumi RH", emailAcessoAreaCandidato({ nome, link }));
    } else {
      // E-mail não encontrado — envia e-mail neutro (anti-enumeração)
      sendEmail(emailLimpo, "Área do Candidato — Azumi RH", emailCadastroNaoEncontrado());
    }

    markSent(emailLimpo);
    setStep("sent");
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">

      {/* ── Topbar pílula ─────────────────────────────────────────────── */}
      <div className="px-4 pt-4 pb-2">
        <div className="max-w-5xl mx-auto flex items-center justify-between rounded-full px-4 py-1.5 backdrop-blur-md border border-white/10 shadow-elevated"
          style={{ background: "hsl(var(--ocean) / 0.9)" }}>
          <Link to="/vagas" className="flex items-center rounded-full px-2 py-1 transition-colors hover:bg-white/10">
            <AzumiLogo product="Connect" light size={19} hideSubtitle />
          </Link>
          <Link
            to="/vagas"
            className="text-[12px] text-white/80 hover:text-white transition-colors hidden sm:block"
          >
            ← Voltar para vagas
          </Link>
        </div>
      </div>

      {/* ── Conteúdo central ─────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">

          {step !== "sent" ? (
            <>
              {/* Ícone + título */}
              <div className="text-center mb-8">
                <div className="mx-auto mb-4 w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{ background: "hsl(var(--ocean) / 0.08)" }}>
                  <Mail className="h-6 w-6" style={{ color: "hsl(var(--ocean))" }} />
                </div>
                <h1 className="text-2xl font-bold text-foreground">Área do Candidato</h1>
                <p className="text-muted-foreground text-sm mt-2 leading-relaxed">
                  Digite seu e-mail para receber um link de acesso seguro.
                </p>
              </div>

              {/* Card do formulário */}
              <div className="bg-card rounded-2xl p-6" style={{ boxShadow: "0 1px 4px rgba(133,146,173,0.2)" }}>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">
                      E-mail cadastrado
                    </label>
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setErro(""); }}
                      placeholder="seu@email.com.br"
                      required
                      disabled={step === "sending"}
                      className="w-full rounded-xl border px-4 py-3 text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 disabled:opacity-50"
                      style={{
                        borderColor: erro ? "hsl(var(--destructive))" : "hsl(var(--border))",
                        // @ts-ignore
                        "--tw-ring-color": "hsl(var(--ocean) / 0.3)",
                      }}
                    />
                    {erro && (
                      <p className="mt-1.5 text-xs text-destructive">{erro}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={step === "sending" || !email}
                    className="w-full flex items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold text-white transition-all disabled:opacity-60"
                    style={{ background: "hsl(var(--ocean))" }}
                  >
                    {step === "sending" ? (
                      <>
                        <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        Enviando…
                      </>
                    ) : (
                      <>
                        Continuar <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </form>

                <p className="text-center text-xs text-muted-foreground mt-4 leading-relaxed">
                  Ainda não tem cadastro?{" "}
                  <Link to="/vagas" className="font-medium hover:underline" style={{ color: "hsl(var(--ocean))" }}>
                    Veja nossas vagas
                  </Link>
                </p>
              </div>
            </>
          ) : (
            /* ── Estado: enviado ──────────────────────────────────────── */
            <div className="text-center">
              <div className="mx-auto mb-5 w-16 h-16 rounded-2xl flex items-center justify-center bg-emerald-50">
                <CheckCircle2 className="h-8 w-8 text-emerald-500" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Verifique seu e-mail 📬</h2>
              <p className="text-muted-foreground text-sm mt-3 leading-relaxed max-w-xs mx-auto">
                Enviamos um link de acesso para <strong>{email}</strong>.
                Clique no link dentro do e-mail para acessar sua área.
              </p>
              <p className="text-xs text-muted-foreground mt-4">
                Não recebeu? Verifique a pasta de spam ou{" "}
                <button
                  onClick={() => { setStep("form"); setEmail(""); }}
                  className="font-medium hover:underline"
                  style={{ color: "hsl(var(--ocean))" }}
                >
                  tente novamente
                </button>
                .
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Footer mínimo ─────────────────────────────────────────────── */}
      <footer className="py-6 text-center text-xs text-muted-foreground">
        <AzumiLogo product="Connect" size={13} className="mx-auto mb-2 opacity-60" />
        © {new Date().getFullYear()} Azumi RH · contato@azumirh.com.br
      </footer>

    </div>
  );
}
