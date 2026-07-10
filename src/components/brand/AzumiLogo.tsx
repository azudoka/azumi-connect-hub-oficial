/**
 * Azumi Brand — v3.0
 * Connect: círculos concêntricos em azul, wordmark "CONNECT" em Fraunces
 * Hub: círculos concêntricos em roxo, wordmark "HUB" em Fraunces
 * Subtítulo: "by AZUMI" em Inter
 */

const PALETAS = {
  Connect: ["#BFDBFE", "#93C5FD", "#60A5FA", "#2563EB", "#1D4ED8"],
  Hub:     ["#EDE9FE", "#DDD6FE", "#A78BFA", "#7C3AED", "#6D28D9"],
};

// Raios e opacidades: externo → interno (mais opaco no centro)
const RADII   = [1.0, 0.80, 0.63, 0.48, 0.34];
const OPACITY = [0.25, 0.42, 0.62, 0.82, 1.0];

interface AzumiMarkProps {
  size?: number;
  className?: string;
  product?: "Connect" | "Hub";
}

export function AzumiMark({ size = 28, className, product = "Connect" }: AzumiMarkProps) {
  const cores = PALETAS[product];
  const r = size / 2;
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={className}
      aria-hidden="true"
    >
      {cores.map((cor, i) => (
        <circle
          key={i}
          cx={r}
          cy={r}
          r={r * RADII[i]}
          fill={cor}
          opacity={OPACITY[i]}
        />
      ))}
    </svg>
  );
}

interface AzumiLogoProps {
  product?: "Connect" | "Hub";
  light?: boolean;
  collapsed?: boolean;
  size?: number;
  hideSubtitle?: boolean;
}

export function AzumiLogo({
  product = "Connect",
  light = false,
  collapsed = false,
  size = 22,
  hideSubtitle = false,
}: AzumiLogoProps) {
  if (collapsed) return <AzumiMark size={size + 6} product={product} />;

  const wordColor = light ? "text-white" : "text-foreground";
  const subColor  = light ? "text-white/60" : "text-muted-foreground";

  return (
    <div className="flex items-center gap-2.5">
      <AzumiMark size={size + 10} product={product} />
      <div className="flex flex-col leading-none">
        <div
          className={`font-display ${wordColor} uppercase tracking-wide`}
          style={{ fontSize: size * 1.25, fontWeight: 500, lineHeight: 1 }}
        >
          {product}
        </div>
        {!hideSubtitle && (
          <div
            className={`font-brand ${subColor} uppercase`}
            style={{ fontSize: size * 0.42, letterSpacing: "0.12em", marginTop: 3 }}
          >
            by AZUMI
          </div>
        )}
      </div>
    </div>
  );
}
