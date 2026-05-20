import { useEffect, useState } from "react";
import { FlaskConical, X } from "lucide-react";

const STORAGE_KEY = "azumi.mockBanner.dismissed";

export function MockDataBanner() {
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    try {
      const dismissed = sessionStorage.getItem(STORAGE_KEY) === "1";
      setHidden(dismissed);
    } catch {
      setHidden(false);
    }
  }, []);

  function dispensar() {
    try { sessionStorage.setItem(STORAGE_KEY, "1"); } catch { /* noop */ }
    setHidden(true);
  }

  if (hidden) return null;

  return (
    <div
      role="status"
      className="flex items-start gap-3 border-b border-amber-200 bg-amber-50 px-6 py-2 text-sm text-amber-900"
      style={{ fontFamily: "'Urbanist',sans-serif" }}
    >
      <FlaskConical className="h-4 w-4 mt-0.5 shrink-0 text-amber-600" />
      <p className="flex-1 leading-snug">
        Você está visualizando dados de demonstração. Explore à vontade — nenhuma ação aqui afeta dados reais.
      </p>
      <button
        type="button"
        onClick={dispensar}
        aria-label="Dispensar aviso"
        className="shrink-0 rounded-md p-1 text-amber-700 hover:bg-amber-100 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export default MockDataBanner;
