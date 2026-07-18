import { useEffect, useState } from "react";

const STORAGE_KEY = "azumi_theme";

export function useThemeToggle() {
  const [escuro, setEscuro] = useState(() => {
    const salvo = localStorage.getItem(STORAGE_KEY);
    if (salvo) return salvo === "midnight";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    document.documentElement.classList.toggle("theme-midnight", escuro);
    localStorage.setItem(STORAGE_KEY, escuro ? "midnight" : "light");
  }, [escuro]);

  return { escuro, alternar: () => setEscuro((v) => !v) };
}
