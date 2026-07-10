/**
 * Azumi Brand — v2.3
 * Marca oficial: 2 círculos sobrepostos + wordmark "azumi RH"
 * Subtítulo opcional: "Connect" ou "Hub" em JetBrains Mono uppercase.
 */

interface AzumiMarkProps {
  size?: number;
  className?: string;
}

export function AzumiMark({ size = 28, className }: AzumiMarkProps) {
  const id = `azumi-mark-grad-${size}`;
  // Sobreposição ~25% — dois círculos do mesmo diâmetro
  const r = size / 2;
  const overlap = size * 0.25;
  const totalW = size * 2 - overlap;
  return (
    <svg
      width={totalW}
      height={size}
      viewBox={`0 0 ${totalW} ${size}`}
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#034C8B" />
          <stop offset="50%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
      </defs>
      <circle cx={r} cy={r} r={r} fill={`url(#${id})`} opacity="0.9" />
      <circle cx={totalW - r} cy={r} r={r} fill={`url(#${id})`} opacity="0.7" />
    </svg>
  );
}

interface AzumiLogoProps {
  product?: "Connect" | "Hub";
  light?: boolean;
  collapsed?: boolean;
  size?: number;
}

export function AzumiLogo({
  product = "Connect",
  light = false,
  collapsed = false,
  size = 22,
}: AzumiLogoProps) {
  if (collapsed) {
    return <AzumiMark size={size + 6} />;
  }
  const wordColor = light ? "text-white" : "text-foreground";
  const subColor = light ? "text-white/70" : "text-muted-foreground";
  return (
    <div className="flex items-center gap-2.5">
      <AzumiMark size={size + 6} />
      <div className="flex flex-col leading-none">
        <div
          className={`font-logo ${wordColor} flex items-baseline gap-1`}
          style={{ fontSize: size, lineHeight: 1 }}
        >
          <span className="font-semibold lowercase tracking-tight">azumi</span>
          <span className="brand-gradient font-normal italic uppercase" style={{ fontSize: size * 0.72 }}>
            RH
          </span>
        </div>
        <div
          className={`mt-1 font-data uppercase ${subColor}`}
          style={{ fontSize: 9, letterSpacing: "0.18em" }}
        >
          {product}
        </div>
      </div>
    </div>
  );
}
