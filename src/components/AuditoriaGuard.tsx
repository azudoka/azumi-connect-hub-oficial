import type { ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";

interface AuditoriaGuardProps {
  children: ReactNode;
}

/**
 * Renderiza children apenas se o usuário possuir flag de auditoria.
 * Use para envolver logs e informações sensíveis em qualquer página.
 */
export function AuditoriaGuard({ children }: AuditoriaGuardProps) {
  const { temAuditoria } = useAuth();
  if (!temAuditoria) return null;
  return <>{children}</>;
}

export default AuditoriaGuard;
