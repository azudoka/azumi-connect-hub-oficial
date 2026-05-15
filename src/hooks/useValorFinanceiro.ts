import { useFinanceiro } from "@/context/FinanceiroContext";

export function useValorFinanceiro() {
  const { visivel } = useFinanceiro();
  function ocultar(valor: string | number): string {
    if (!visivel) return "••••";
    return String(valor);
  }
  return { visivel, ocultar };
}
