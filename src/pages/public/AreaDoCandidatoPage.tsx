import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowRight, CheckCircle2, Instagram, Linkedin, Facebook, Globe } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import azumiLogoBranca from "@/assets/brand/azumi-logo-branca.png";
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

      {/* ── Topbar — mesmo padrão do portal de vagas ───────────────────────── */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 pt-4 sm:pt-6 pb-2">
        <div className="flex items-center justify-between gap-2 rounded-full px-3 sm:px-5 py-1 sm:py-1.5 backdrop-blur-md border border-white/10 shadow-elevated"
          style={{ background: "hsl(var(--ocean) / 0.9)" }}>
          <Link to="/vagas" className="flex items-center rounded-full px-2.5 sm:px-3 py-1 transition-colors hover:bg-white/10">
            <img src={azumiLogoBranca} alt="Azumi RH" style={{ height: 19, width: "auto" }} />
          </Link>
          <div className="flex items-center gap-1 sm:gap-3">
            <Link to="/vagas"
              className="flex items-center gap-1.5 rounded-full bg-white/10 border border-white/20 px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-white/20 transition-colors">
              ← Voltar para vagas
            </Link>
          </div>
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
        <div className="flex items-center justify-center gap-4 mb-3 opacity-60">
          <a href="https://www.instagram.com/azumirh/" target="_blank" rel="noopener noreferrer" aria-label="Instagram da Azumi RH" className="hover:opacity-100 transition-opacity">
            <Instagram className="h-4 w-4" />
          </a>
          <a href="https://www.linkedin.com/company/azumirh/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn da Azumi RH" className="hover:opacity-100 transition-opacity">
            <Linkedin className="h-4 w-4" />
          </a>
          <a href="https://www.facebook.com/azumirhc/" target="_blank" rel="noopener noreferrer" aria-label="Facebook da Azumi RH" className="hover:opacity-100 transition-opacity">
            <Facebook className="h-4 w-4" />
          </a>
          <a href="https://www.tiktok.com/@azumirh" target="_blank" rel="noopener noreferrer" aria-label="TikTok da Azumi RH" className="hover:opacity-100 transition-opacity">
            <iconify-icon icon="simple-icons:tiktok" width="16" height="16" />
          </a>
          <a href="https://azumirh.com.br" target="_blank" rel="noopener noreferrer" aria-label="Site da Azumi RH" className="hover:opacity-100 transition-opacity">
            <Globe className="h-4 w-4" />
          </a>
        </div>
        © {new Date().getFullYear()} Azumi RH · contato@azumirh.com.br
      </footer>

    </div>
  );
}
