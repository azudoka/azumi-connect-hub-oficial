import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AzumiLogo } from "@/components/brand/AzumiLogo";
import { toast } from "sonner";

export default function RedefinirSenha() {
  const [senha, setSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [salvando, setSalvando] = useState(false);
  const navigate = useNavigate();

  async function salvar() {
    if (senha.length < 6) {
      toast.error("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }
    if (senha !== confirmacao) {
      toast.error("As senhas não coincidem.");
      return;
    }
    setSalvando(true);
    const { error } = await supabase.auth.updateUser({ password: senha });
    setSalvando(false);
    if (error) {
      toast.error("Erro ao salvar: " + error.message);
      return;
    }
    toast.success("Senha atualizada. Faça login com a senha nova.");
    navigate("/login");
  }

  return (
    <div className="min-h-full w-full relative bg-background overflow-hidden flex items-center justify-center p-6">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-32 h-[28rem] w-[28rem] rounded-full bg-highlight/15 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,hsl(var(--primary)/0.08),transparent_60%)]" />
      </div>

      <div className="relative z-10 w-full max-w-xl animate-scale-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center">
            <AzumiLogo product="Connect" size={26} />
          </div>
          <h1 className="mt-4 font-logo text-2xl font-bold leading-tight">
            Redefinir senha
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Digite e confirme sua nova senha.
          </p>
        </div>

        <div className="bg-card/80 backdrop-blur border border-border rounded-2xl p-6 shadow-elevated space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Nova senha</label>
            <div className="mt-1.5 relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                type="password"
                disabled={salvando}
                placeholder="Mínimo 6 caracteres"
                className="w-full h-10 pl-9 pr-3 rounded-lg bg-secondary border border-input focus:border-primary outline-none text-sm font-data disabled:opacity-60"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground">Confirmar nova senha</label>
            <div className="mt-1.5 relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={confirmacao}
                onChange={(e) => setConfirmacao(e.target.value)}
                type="password"
                disabled={salvando}
                placeholder="Repita a senha"
                className="w-full h-10 pl-9 pr-3 rounded-lg bg-secondary border border-input focus:border-primary outline-none text-sm font-data disabled:opacity-60"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={salvar}
            disabled={salvando}
            className="w-full h-11 rounded-lg bg-gradient-brand text-white font-medium flex items-center justify-center gap-2 hover:opacity-95 transition-opacity shadow-violet disabled:opacity-70"
          >
            {salvando ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar nova senha"}
          </button>
        </div>
      </div>
    </div>
  );
}
