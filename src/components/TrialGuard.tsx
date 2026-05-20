import { useState, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { Lock, Sparkles, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { UpgradePlanoModal } from "@/components/UpgradePlanoModal";

/** Páginas liberadas para usuários em modo trial. */
const TRIAL_ROTAS_LIBERADAS = [
  "/cliente/dashboard",
  "/cliente/projetos",
  "/cliente/solicitacoes",
  "/cliente/atracao",
  "/cliente/documentos",
  "/cliente/comunicados",
  "/cliente/calendario",
  "/cliente/guia",
];

function rotaLiberada(path: string): boolean {
  return TRIAL_ROTAS_LIBERADAS.some((base) => path === base || path.startsWith(base + "/"));
}

export function TrialGuard({ children }: { children: ReactNode }) {
  const { usuario } = useAuth();
  const { pathname } = useLocation();
  const [openUpgrade, setOpenUpgrade] = useState(false);

  if (usuario?.role !== "trial") return <>{children}</>;
  if (rotaLiberada(pathname)) return <>{children}</>;

  return (
    <div
      className="flex items-center justify-center min-h-[60vh] p-6"
      style={{ fontFamily: "'Urbanist', sans-serif" }}
    >
      <div className="bg-card border border-border rounded-2xl overflow-hidden max-w-xl w-full shadow-sm">
        <div className="h-32 bg-gradient-to-br from-[#031D38] via-[#1D4E89] to-[#8B5CF6] flex items-center justify-center">
          <div className="h-16 w-16 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center ring-1 ring-white/20">
            <Lock className="h-8 w-8 text-white" />
          </div>
        </div>
        <div className="p-7 text-center">
          <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[#8B5CF6] mb-2">
            <Sparkles className="h-3 w-3" /> Área bloqueada no trial
          </div>
          <h2 className="text-xl font-bold mb-2 text-foreground">
            Este módulo não está disponível no seu plano atual
          </h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto leading-relaxed">
            Sua conta está em modo demonstração. Para acessar esta área, conheça os planos
            Azumi Connect e libere todas as funcionalidades.
          </p>
          <button
            type="button"
            onClick={() => setOpenUpgrade(true)}
            className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-lg text-sm font-semibold text-white hover:opacity-95 transition-opacity"
            style={{ background: "#8B5CF6" }}
          >
            Conheça os planos <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <UpgradePlanoModal
        open={openUpgrade}
        onClose={() => setOpenUpgrade(false)}
        planoAtual={usuario.plano ?? "trial"}
      />
    </div>
  );
}

export default TrialGuard;
