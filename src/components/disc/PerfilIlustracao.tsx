import type { DiscDim } from "./discQuestions";

const COR: Record<DiscDim, string> = {
  D: "#ef4444",
  I: "#f59e0b",
  S: "#10b981",
  C: "#3b82f6",
};

interface Props {
  dim: DiscDim;
  size?: number;
  className?: string;
}

/**
 * Ilustrações flat SVG representando cada perfil DISC.
 * - D Executor: figura com punho erguido (liderança/ação)
 * - I Comunicador: figura com megafone (expressivo)
 * - S Planejador: figura com coração (sereno/colaborativo)
 * - C Analista: figura com lupa (preciso/analítico)
 */
export default function PerfilIlustracao({ dim, size = 96, className }: Props) {
  const cor = COR[dim];
  const tint = `${cor}22`;
  const stroke = "#1f2937";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="60" cy="60" r="58" fill={tint} />
      {/* corpo */}
      <path d="M30 110 C 30 86, 90 86, 90 110 Z" fill={cor} />
      {/* cabeça */}
      <circle cx="60" cy="50" r="18" fill="#fde7d3" stroke={stroke} strokeWidth="1.5" />
      {/* cabelo */}
      <path d="M44 46 C 46 32, 74 32, 76 46 Z" fill={stroke} />

      {dim === "D" && (
        <>
          {/* braço erguido + punho */}
          <rect x="74" y="22" width="8" height="32" rx="3" fill={cor} stroke={stroke} strokeWidth="1.5" />
          <circle cx="78" cy="20" r="9" fill="#fde7d3" stroke={stroke} strokeWidth="1.5" />
          {/* raio de ação */}
          <path d="M95 25 l8 -4 -5 8 6 2 -10 6" fill="none" stroke={cor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </>
      )}

      {dim === "I" && (
        <>
          {/* megafone */}
          <path d="M82 44 L102 36 L102 64 L82 56 Z" fill={cor} stroke={stroke} strokeWidth="1.5" strokeLinejoin="round" />
          <rect x="74" y="46" width="10" height="8" fill={cor} stroke={stroke} strokeWidth="1.5" />
          {/* ondas */}
          <path d="M106 42 q4 8 0 16 M110 38 q6 12 0 24" fill="none" stroke={cor} strokeWidth="2" strokeLinecap="round" />
          {/* sorriso */}
          <path d="M53 54 q7 6 14 0" fill="none" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" />
        </>
      )}

      {dim === "S" && (
        <>
          {/* coração nas mãos */}
          <path
            d="M60 78 c -8 -8 -16 -2 -16 6 c 0 8 16 16 16 16 c 0 0 16 -8 16 -16 c 0 -8 -8 -14 -16 -6 z"
            fill={cor}
            stroke={stroke}
            strokeWidth="1.5"
          />
          {/* sorriso suave */}
          <path d="M53 55 q7 4 14 0" fill="none" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" />
        </>
      )}

      {dim === "C" && (
        <>
          {/* lupa */}
          <circle cx="86" cy="46" r="10" fill="#fff" stroke={cor} strokeWidth="3" />
          <line x1="94" y1="54" x2="104" y2="64" stroke={cor} strokeWidth="3.5" strokeLinecap="round" />
          {/* óculos no rosto */}
          <circle cx="54" cy="50" r="4" fill="none" stroke={stroke} strokeWidth="1.5" />
          <circle cx="66" cy="50" r="4" fill="none" stroke={stroke} strokeWidth="1.5" />
          <line x1="58" y1="50" x2="62" y2="50" stroke={stroke} strokeWidth="1.5" />
        </>
      )}
    </svg>
  );
}
