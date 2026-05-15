import { createContext, useContext, useState } from "react";

const STORAGE_KEY = "azumi:financeiro-visivel";

interface FinanceiroContextType {
  visivel: boolean;
  toggle: () => void;
}

const FinanceiroContext = createContext<FinanceiroContextType>({
  visivel: true,
  toggle: () => {},
});

export function FinanceiroProvider({ children }: { children: React.ReactNode }) {
  const [visivel, setVisivel] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored === null ? true : stored === "true";
    } catch {
      return true;
    }
  });

  function toggle() {
    setVisivel((prev) => {
      const next = !prev;
      try { localStorage.setItem(STORAGE_KEY, String(next)); } catch {}
      return next;
    });
  }

  return (
    <FinanceiroContext.Provider value={{ visivel, toggle }}>
      {children}
    </FinanceiroContext.Provider>
  );
}

export function useFinanceiro() {
  return useContext(FinanceiroContext);
}
