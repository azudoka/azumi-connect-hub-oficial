import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AzumiLogo } from "@/components/brand/AzumiLogo";

function destinoParaPapel(papel: string): string {
  if (papel === "admin" || papel === "consultor") return "/app/dashboard";
  if (papel === "cliente" || papel === "cliente_avulso") return "/portal";
  return "/hub/colaborador/inicio";
}

export default function Login() {
  const navigate = useNavigate();
  const { usuario, carregando, login } = useAuth();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (!carregando && usuario) {
      navigate(destinoParaPapel(usuario.role), { replace: true });
    }
  }, [usuario, carregando, navigate]);

  if (carregando) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    setEnviando(true);
    const resultado = await login(email.trim(), senha);
    setEnviando(false);
    if (resultado === "inativo") {
      setErro("Sua conta está inativa. Entre em contato com o administrador.");
    } else if (resultado === "erro") {
      setErro("E-mail ou senha incorretos.");
    }
    // "ok" → useEffect acima redireciona
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* ── COLUNA ESQUERDA — capa ── */}
      <div className="relative hidden overflow-hidden lg:block">
        {/* Foto de capa — troque a div de baixo por uma <img> quando tiver a foto real */}
        <div className="absolute inset-0 bg-muted">
          {/* <img src={fotoCapa} alt="" className="h-full w-full object-cover" /> */}
        </div>
        <div className="absolute inset-0 bg-gradient-brand-bg opacity-90" />
        <div className="absolute inset-0 bg-black/10" />

        <div className="relative z-10 flex h-full flex-col justify-between p-12">
          <div className="flex items-center gap-6">
            <AzumiLogo product="Connect" light size={44} />
            <div className="h-8 w-px bg-white/20" />
            <AzumiLogo product="Hub" light size={44} />
          </div>

          <div className="max-w-sm">
            <p className="font-display text-2xl font-semibold leading-snug text-white">
              Gestão de pessoas, sem planilha solta e sem e-mail perdido.
            </p>
            <div className="divider-gradient mt-6 h-px w-16" />
            <p className="mt-6 font-sans text-sm text-white/70">
              Um só lugar pra consultoria, empresa e time trabalharem juntos.
            </p>
          </div>
        </div>
      </div>

      {/* ── COLUNA DIREITA — formulário ── */}
      <div className="flex items-center justify-center bg-background px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center justify-center gap-5 lg:hidden">
            <AzumiLogo product="Connect" size={30} />
            <div className="h-7 w-px bg-border" />
            <AzumiLogo product="Hub" size={30} />
          </div>

          <div className="mb-8 text-center lg:text-left">
            <h1 className="font-display text-2xl font-semibold text-foreground">
              Bem-vindo(a) de volta
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Entre com sua conta pra acessar a plataforma.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                disabled={enviando}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="senha">Senha</Label>
              <Input
                id="senha"
                type="password"
                autoComplete="current-password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••"
                required
                disabled={enviando}
              />
            </div>

            {erro && (
              <p className="text-center text-sm text-destructive">{erro}</p>
            )}

            <Button type="submit" className="btn-primary w-full" size="lg" disabled={enviando}>
              {enviando ? "Entrando…" : "Entrar"}
            </Button>
          </form>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            Azumi RH © {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
}
