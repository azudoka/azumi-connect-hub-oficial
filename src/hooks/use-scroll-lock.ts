import { useEffect } from "react";

/**
 * Trava o scroll da página de fundo enquanto `active` for true.
 * Usa contador no <body> para suportar múltiplos modais empilhados.
 * Aplica a classe `modal-open` (overflow:hidden) definida em index.css.
 */
export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const body = document.body;
    const current = Number(body.dataset.modalLockCount ?? "0");
    body.dataset.modalLockCount = String(current + 1);
    body.classList.add("modal-open");
    return () => {
      const next = Number(body.dataset.modalLockCount ?? "1") - 1;
      if (next <= 0) {
        delete body.dataset.modalLockCount;
        body.classList.remove("modal-open");
      } else {
        body.dataset.modalLockCount = String(next);
      }
    };
  }, [active]);
}
