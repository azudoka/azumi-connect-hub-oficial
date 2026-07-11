import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Mail, Lock, Sparkles, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { AzumiLogo } from "@/components/brand/AzumiLogo";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function Login() {
  const navigate = useNavigate();
  const { login, usuario } = useAuth();

  const roleRedirect: Record<string, string> = {
    admin:          "/app/dashboard",
    consultor:      "/app/dashboard",
    cliente:        "/cliente/dashboard",
    cliente_avulso: "/cliente/dashboard",
    trial:          "/cliente/dashboard",
    rh:             "/hub/colaborador/inicio",
    rh_operacional: "/hub/colaborador/inicio",
    rhoperacional:  "/hub/colaborador/inicio",
    colaborador:    "/hub/colaborador/inicio",
    lider:          "/hub/lider/painel",
    ceo:            "/hub/ceo/dashboard",
    dp:             "/hub/colaborador/inicio",
    contador:       "/hub/colaborador/inicio",
    juridico:       "/hub/colaborador/inicio",
  };
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const [pendingRedirect, setPendingRedirect] = useState(false);
  const [modoReset, setModoReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetEnviado, setResetEnviado] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  useEffect(() => {
    if (pendingRedirect && usuario) {
      const papel = usuario.role ?? "admin";
      navigate(roleRedirect[papel] ?? "/app/dashboard");
      setPendingRedirect(false);
    }
  }, [pendingRedirect, usuario, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setErro(null);
    setLoading(true);
    const res = await login(email, pass);
    setLoading(false);
    if (res === "ok") {
      setPendingRedirect(true);
    } else {
      setErro("E-mail ou senha incorretos");
      setShake(true);
      window.setTimeout(() => setShake(false), 500);
    }
  }

  async function solicitarReset() {
    if (!resetEmail.trim()) { toast.error("Digite seu e-mail."); return; }
    setResetLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail.trim(), {
      redirectTo: `${window.location.origin}/redefinir-senha`,
    });
    setResetLoading(false);
    if (error) { toast.error("Erro ao enviar: " + error.message); return; }
    setResetEnviado(true);
  }

  return (
    <div className="min-h-full w-full relative bg-background overflow-hidden flex items-center justify-center p-6">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-32 h-[28rem] w-[28rem] rounded-full bg-highlight/15 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,hsl(var(--primary)/0.08),transparent_60%)]" />
      </div>

      <div className="relative z-10 w-full max-w-xl animate-scale-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center">
            <AzumiLogo product="Connect" size={40} />
          </div>
          <h1 className="mt-4 font-logo text-2xl md:text-3xl font-bold leading-tight">
            A plataforma que centraliza toda a gestão de RH da sua empresa.
          </h1>
          <p className="mt-3 text-sm text-muted-foreground max-w-md mx-auto">
            Entregáveis, solicitações, documentos, indicadores e módulos integrados em um só ambiente. Para o time Azumi e para o cliente, tudo visível em tempo real.
          </p>
        </div>

        {modoReset ? (
          <div className="bg-card/80 backdrop-blur border border-border rounded-2xl p-6 shadow-elevated space-y-4">
            {resetEnviado ? (
              <>
                <p className="text-sm text-center text-foreground">
                  Enviamos um link pro seu e-mail.<br />
                  Confira sua caixa de entrada (e spam).
                </p>
                <button
                  type="button"
                  onClick={() => { setModoReset(false); setResetEnviado(false); setResetEmail(""); }}
                  className="w-full h-10 rounded-lg border border-border text-sm hover:bg-secondary transition-colors"
                >
                  Voltar pro login
                </button>
              </>
            ) : (
              <>
                <div>
                  <h2 className="text-sm font-semibold mb-1">Recuperar senha</h2>
                  <p className="text-xs text-muted-foreground">Digite o e-mail da sua conta e enviaremos um link de redefinição.</p>
                </div>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    type="email"
                    placeholder="voce@empresa.com"
                    disabled={resetLoading}
                    className="w-full h-10 pl-9 pr-3 rounded-lg bg-secondary border border-input focus:border-primary outline-none text-sm disabled:opacity-60"
                  />
                </div>
                <button
                  type="button"
                  onClick={solicitarReset}
                  disabled={resetLoading}
                  className="w-full h-11 rounded-lg bg-gradient-brand text-white font-medium flex items-center justify-center gap-2 hover:opacity-95 transition-opacity shadow-violet disabled:opacity-70"
                >
                  {resetLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enviar link de recuperação"}
                </button>
                <button
                  type="button"
                  onClick={() => { setModoReset(false); setResetEmail(""); }}
                  className="w-full text-xs text-muted-foreground hover:text-foreground text-center"
                >
                  Voltar pro login
                </button>
              </>
            )}
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className={`bg-card/80 backdrop-blur border border-border rounded-2xl p-6 shadow-elevated space-y-4 transition-transform ${
              shake ? "animate-[shake_0.4s_ease-in-out]" : ""
            }`}
            style={shake ? { animation: "shake 0.4s ease-in-out" } : undefined}
          >
            <div>
              <label className="text-xs font-medium text-muted-foreground">E-mail corporativo</label>
              <div className="mt-1.5 relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  disabled={loading}
                  required
                  placeholder="voce@empresa.com"
                  className="w-full h-10 pl-9 pr-3 rounded-lg bg-secondary border border-input focus:border-primary outline-none text-sm disabled:opacity-60"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-muted-foreground">Senha</label>
                <button type="button" onClick={() => setModoReset(true)} className="text-xs text-primary hover:underline">Esqueci minha senha</button>
              </div>
              <div className="mt-1.5 relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  value={pass}
                  onChange={(e) => setPass(e.target.value)}
                  type="password"
                  disabled={loading}
                  required
                  className="w-full h-10 pl-9 pr-3 rounded-lg bg-secondary border border-input focus:border-primary outline-none text-sm font-data disabled:opacity-60"
                />
              </div>
            </div>

            {erro && (
              <div className="text-xs text-destructive bg-destructive/10 border border-destructive/30 rounded-md px-3 py-2">
                {erro}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-lg bg-gradient-brand text-white font-medium font-ui flex items-center justify-center gap-2 hover:opacity-95 transition-opacity shadow-violet disabled:opacity-70"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Entrar
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>

            <div className="text-center">
              <button type="button" onClick={() => alert("Acesso SSO — em breve.")} className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                Acesso SSO da empresa
              </button>
            </div>
          </form>
        )}

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Ao continuar você concorda com os <a className="text-primary hover:underline">termos</a> e a <a className="text-primary hover:underline">política de privacidade</a>.
        </p>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-6px); }
          80% { transform: translateX(6px); }
        }
      `}</style>
    </div>
  );
}
