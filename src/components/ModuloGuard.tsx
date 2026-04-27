import type { ReactNode } from "react";
import { Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth, type ModuloSlug } from "@/context/AuthContext";

interface ModuloGuardProps {
  modulo: ModuloSlug;
  children: ReactNode;
  apenasOperar?: boolean;
}

export function ModuloGuard({ modulo, children, apenasOperar = false }: ModuloGuardProps) {
  const { hasModulo, podeOperar } = useAuth();
  const navigate = useNavigate();

  const liberado = apenasOperar ? podeOperar(modulo) : hasModulo(modulo);
  if (liberado) return <>{children}</>;

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-6">
      <div className="bg-muted/30 border border-border rounded-xl p-12 text-center max-w-md w-full">
        <div className="inline-flex h-12 w-12 rounded-full bg-muted items-center justify-center mb-4">
          <Lock className="h-6 w-6 text-muted-foreground" />
        </div>
        <h2 className="text-lg font-semibold mb-2">Módulo não habilitado</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Você não tem acesso a este módulo. Entre em contato com o administrador.
        </p>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center justify-center h-10 px-5 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Voltar
        </button>
      </div>
    </div>
  );
}

export default ModuloGuard;
