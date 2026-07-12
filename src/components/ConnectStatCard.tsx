import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

/**
 * ConnectStatCard — Kit de Marca Connect v1
 *
 * Componente NOVO, exclusivo do Connect. Não substitui o <KpiCard />, que
 * continua servindo o Hub (13 telas) sem nenhuma mudança visual.
 *
 * 7 estruturas aprovadas — o dado escolhe o formato, não o contrário:
 *   terminal  (A) — número + tendência + sparkline
 *   radial    (B) — proporção parte-do-todo em anel
 *   delta     (C) — comparação com período anterior é o protagonista
 *   list      (D) — ranking; o número vira rodapé
 *   stack     (E) — composição em barra empilhada com legenda
 *   spec      (F) — ficha técnica compacta (linhas label/valor)
 *   highlight (5) — card de destaque isolado, 1 por seção
 *   stat      (8) — referência MaterialM: ícone circular colorido + número + selo de variação + label
 *
 * Todas usam só as fontes aprovadas (font-display / font-sans, sem mono) e
 * só tokens semânticos (--primary, --border, --success, --destructive...),
 * então herdam a cor certa automaticamente — nada de hex fixo aqui.
 */

const TAG_COLORS = {
  blue: "#264478",
  violet: "#6B3FBF",
  green: "#1E8A4C",
  amber: "#B4740E",
  red: "#C23A3A",
  teal: "#12786B",
} as const;
type TagTone = keyof typeof TAG_COLORS;

interface BaseProps {
  className?: string;
  onClick?: () => void;
}

// ---------- 8 · Stat (referência MaterialM) ----------
interface StatProps extends BaseProps {
  variant: "stat";
  icon: LucideIcon;
  label: string;
  value: string | number;
  deltaValue?: string;
  positive?: boolean;
  tone: TagTone;
}

function StatCard({ icon: Icon, label, value, deltaValue, positive = true, tone, className, onClick }: StatProps) {
  const color = TAG_COLORS[tone];
  return (
    <div
      onClick={onClick}
      style={{ background: `${color}1F`, boxShadow: "0 1px 4px hsl(var(--foreground)/0.08)" }}
      className={cn(
        "rounded-xl p-6",
        onClick && "cursor-pointer hover:brightness-[0.98] transition-[filter]",
        className
      )}
    >
      <div
        className="h-12 w-12 rounded-full flex items-center justify-center mb-4"
        style={{ background: color }}
      >
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div className="flex items-center gap-2">
        <span className="font-display text-lg font-semibold text-foreground tabular-nums">
          {value}
        </span>
        {deltaValue && (
          <span
            className={cn(
              "text-xs font-semibold px-2.5 py-0.5 rounded-full border",
              positive
                ? "text-success border-[hsl(var(--success)/0.2)]"
                : "text-destructive border-[hsl(var(--destructive)/0.2)]"
            )}
          >
            {deltaValue}
          </span>
        )}
      </div>
      <p className="text-sm font-medium text-muted-foreground mt-1">{label}</p>
    </div>
  );
}

// ---------- A · Terminal ----------
interface TerminalProps extends BaseProps {
  variant: "terminal";
  label: string;
  value: string | number;
  suffix?: string;
  deltaLabel?: string;
  /** pontos 0–100 já normalizados por quem chama; mín. 2 pontos */
  sparkline?: number[];
}

function TerminalCard({ label, value, suffix, deltaLabel, sparkline, className, onClick }: TerminalProps) {
  const points =
    sparkline && sparkline.length > 1
      ? sparkline
          .map((v, i) => `${(i / (sparkline.length - 1)) * 100},${26 - (v / 100) * 24}`)
          .join(" ")
      : null;

  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-card border-l-[3px] border-primary border-y border-r border-border rounded-xl p-4",
        onClick && "cursor-pointer hover:shadow-card transition-shadow",
        className
      )}
    >
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-2 font-sans text-2xl font-bold text-foreground tabular-nums">
        {value}
        {suffix && <span className="text-sm font-medium text-muted-foreground">{suffix}</span>}
      </p>
      {deltaLabel && <p className="mt-1 text-xs font-semibold text-success">{deltaLabel}</p>}
      {points && (
        <svg className="mt-3 w-full h-6" viewBox="0 0 100 26" preserveAspectRatio="none">
          <polyline points={points} fill="none" stroke="hsl(var(--primary))" strokeWidth="2" />
        </svg>
      )}
    </div>
  );
}

// ---------- B · Radial ----------
interface RadialProps extends BaseProps {
  variant: "radial";
  label: string;
  percent: number;
  contextLabel: string;
}

function RadialCard({ label, percent, contextLabel, className, onClick }: RadialProps) {
  const r = 30;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.min(100, Math.max(0, percent)) / 100) * c;
  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-card border border-border rounded-xl p-4 flex flex-col items-center text-center",
        onClick && "cursor-pointer hover:shadow-card transition-shadow",
        className
      )}
    >
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">{label}</p>
      <svg width="72" height="72" viewBox="0 0 72 72">
        <circle cx="36" cy="36" r={r} fill="none" stroke="hsl(var(--border))" strokeWidth="7" />
        <circle
          cx="36" cy="36" r={r} fill="none"
          stroke="hsl(var(--primary))" strokeWidth="7" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={offset}
          transform="rotate(-90 36 36)"
        />
        <text x="36" y="41" textAnchor="middle" className="fill-foreground font-sans font-bold" fontSize="15">
          {Math.round(percent)}%
        </text>
      </svg>
      <p className="mt-2 text-[11px] text-muted-foreground">{contextLabel}</p>
    </div>
  );
}

// ---------- C · Delta ----------
interface DeltaProps extends BaseProps {
  variant: "delta";
  label: string;
  value: string | number;
  previousLabel: string;
  deltaValue: string;
  positive?: boolean;
}

function DeltaCard({ label, value, previousLabel, deltaValue, positive = true, className, onClick }: DeltaProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-card border border-border rounded-xl p-4",
        onClick && "cursor-pointer hover:shadow-card transition-shadow",
        className
      )}
    >
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">{label}</p>
      <p className="font-display text-2xl font-bold text-foreground tabular-nums">{value}</p>
      <p className="text-xs text-muted-foreground line-through mt-1 mb-2">{previousLabel}</p>
      <span
        className={cn(
          "inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-md",
          positive ? "bg-[hsl(var(--success)/0.14)] text-success" : "bg-[hsl(var(--destructive)/0.14)] text-destructive"
        )}
      >
        {deltaValue}
      </span>
    </div>
  );
}

// ---------- D · Lista ----------
interface ListItemT {
  label: string;
  tone: TagTone;
}
interface ListProps extends BaseProps {
  variant: "list";
  label: string;
  items: ListItemT[];
  footer: string;
}

function ListCard({ label, items, footer, className, onClick }: ListProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-card border border-border rounded-xl p-4",
        onClick && "cursor-pointer hover:shadow-card transition-shadow",
        className
      )}
    >
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">{label}</p>
      <ul>
        {items.map((it, i) => (
          <li key={i} className="flex items-center gap-2 text-xs text-foreground py-1 border-b border-border last:border-0">
            <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: TAG_COLORS[it.tone] }} />
            {it.label}
          </li>
        ))}
      </ul>
      <p className="mt-2 text-[10px] font-semibold text-muted-foreground">{footer}</p>
    </div>
  );
}

// ---------- E · Stack ----------
interface StackSegment {
  label: string;
  value: string;
  percent: number;
  tone: TagTone;
}
interface StackProps extends BaseProps {
  variant: "stack";
  label: string;
  segments: StackSegment[];
}

function StackCard({ label, segments, className, onClick }: StackProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-card border border-border rounded-xl p-4",
        onClick && "cursor-pointer hover:shadow-card transition-shadow",
        className
      )}
    >
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">{label}</p>
      <div className="flex h-3.5 rounded-full overflow-hidden mb-3">
        {segments.map((s, i) => (
          <div key={i} style={{ width: `${s.percent}%`, background: TAG_COLORS[s.tone] }} />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1.5">
        {segments.map((s, i) => (
          <span key={i} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-sm shrink-0" style={{ background: TAG_COLORS[s.tone] }} />
            {s.label} · {s.value}
          </span>
        ))}
      </div>
    </div>
  );
}

// ---------- F · Spec ----------
interface SpecRow {
  label: string;
  value: string;
}
interface SpecProps extends BaseProps {
  variant: "spec";
  label: string;
  rows: SpecRow[];
}

function SpecCard({ label, rows, className, onClick }: SpecProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-card border border-border rounded-xl p-4",
        onClick && "cursor-pointer hover:shadow-card transition-shadow",
        className
      )}
    >
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">{label}</p>
      {rows.map((r, i) => (
        <div key={i} className={cn("flex justify-between text-xs py-1.5", i > 0 && "border-t border-border")}>
          <span className="text-muted-foreground">{r.label}</span>
          <span className="font-bold text-foreground">{r.value}</span>
        </div>
      ))}
    </div>
  );
}

// ---------- Destaque · Highlight ----------
interface HighlightProps extends BaseProps {
  variant: "highlight";
  icon: LucideIcon;
  title: string;
  description: string;
  metricValue?: string | number;
  metricLabel?: string;
  actionLabel: string;
  onAction?: () => void;
  /** Conteúdo visual opcional (ex: mini gráfico de coluna) entre a descrição e o rodapé */
  chart?: ReactNode;
}

function HighlightCard({
  icon: Icon,
  title,
  description,
  metricValue,
  metricLabel,
  actionLabel,
  onAction,
  chart,
  className,
  onClick,
}: HighlightProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "relative rounded-2xl p-5 overflow-hidden text-primary-foreground flex flex-col",
        "bg-[image:radial-gradient(circle_at_1px_1px,hsl(0_0%_100%/0.18)_1px,transparent_0),linear-gradient(135deg,hsl(var(--primary)),hsl(var(--primary-glow)))]",
        "[background-size:14px_14px,100%_100%]",
        onClick && "cursor-pointer hover:brightness-[1.04] transition-[filter]",
        className
      )}
    >
      <div
        className="absolute top-0 right-6 h-14 w-11 bg-card text-primary flex items-start justify-center pt-2.5"
        style={{ clipPath: "polygon(0 0,100% 0,100% 100%,50% 78%,0 100%)" }}
      >
        <Icon className="h-4 w-4" />
      </div>
      <h3 className="font-display text-lg font-bold max-w-[78%] leading-tight">{title}</h3>
      <p className="mt-1 text-xs text-primary-foreground/85 max-w-[85%] leading-relaxed">{description}</p>
      {chart && <div className="mt-3 max-h-16 overflow-hidden">{chart}</div>}
      <div className="mt-auto">
        <div className="my-4 h-px bg-primary-foreground/25" />
        <div className="flex items-end justify-between gap-2">
          <div className="min-w-0">
            {metricValue !== undefined && (
              <p className="font-sans text-2xl font-bold tabular-nums truncate">{metricValue}</p>
            )}
            {metricLabel && <p className="text-[11px] text-primary-foreground/75">{metricLabel}</p>}
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onAction?.(); }}
            className="shrink-0 bg-primary-foreground/25 backdrop-blur-sm text-xs font-bold px-4 py-2 rounded-full hover:bg-primary-foreground/35 transition-colors"
          >
            {actionLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------- Export único ----------
export type ConnectStatCardProps =
  | TerminalProps
  | RadialProps
  | DeltaProps
  | ListProps
  | StackProps
  | SpecProps
  | HighlightProps
  | StatProps;

export function ConnectStatCard(props: ConnectStatCardProps) {
  switch (props.variant) {
    case "terminal":
      return <TerminalCard {...props} />;
    case "radial":
      return <RadialCard {...props} />;
    case "delta":
      return <DeltaCard {...props} />;
    case "list":
      return <ListCard {...props} />;
    case "stack":
      return <StackCard {...props} />;
    case "spec":
      return <SpecCard {...props} />;
    case "highlight":
      return <HighlightCard {...props} />;
    case "stat":
      return <StatCard {...props} />;
  }
}
