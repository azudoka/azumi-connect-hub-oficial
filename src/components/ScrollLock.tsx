import { useScrollLock } from "@/hooks/use-scroll-lock";

/**
 * Componente invisível que ativa o trava-scroll global enquanto montado.
 * Útil para travar o scroll de fundo quando há modais inline (sem ModalShell).
 */
export function ScrollLock() {
  useScrollLock(true);
  return null;
}
