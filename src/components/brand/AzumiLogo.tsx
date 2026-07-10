import connectLogo from "@/assets/brand/connect-logo.png";
import connectLogoLight from "@/assets/brand/connect-logo-light.png";
import connectIcon from "@/assets/brand/connect-icon.png";
import hubLogo from "@/assets/brand/hub-logo.png";
import hubLogoLight from "@/assets/brand/hub-logo-light.png";
import hubIcon from "@/assets/brand/hub-icon.png";

interface AzumiMarkProps {
  size?: number;
  className?: string;
}

/** SVG mark mantido para uso standalone se necessário. */
export function AzumiMark({ size = 28, className }: AzumiMarkProps) {
  const id = `azumi-mark-grad-${size}`;
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
  /** true = logo sobre fundo escuro (usa variante light/branca) */
  light?: boolean;
  collapsed?: boolean;
  size?: number;
  /** reservado para compatibilidade — sem efeito com logos PNG */
  hideSubtitle?: boolean;
}

export function AzumiLogo({
  product = "Connect",
  light = false,
  collapsed = false,
  size = 22,
}: AzumiLogoProps) {
  if (collapsed) {
    const icon = product === "Hub" ? hubIcon : connectIcon;
    return (
      <img
        src={icon}
        alt={product}
        style={{ height: size + 10, width: size + 10, objectFit: "contain" }}
      />
    );
  }
  const src =
    product === "Hub"
      ? light ? hubLogoLight : hubLogo
      : light ? connectLogoLight : connectLogo;
  return (
    <img
      src={src}
      alt={`${product} by Azumi`}
      style={{ height: size * 1.8, width: "auto", objectFit: "contain" }}
    />
  );
}
