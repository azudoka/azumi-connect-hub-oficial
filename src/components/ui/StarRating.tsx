import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StarRatingProps {
  value: number;
  onChange?: (v: number) => void;
  readonly?: boolean;
  size?: number;
  className?: string;
}

/**
 * 5-star rating. Hover preenche até a estrela apontada (quando interativo).
 * readonly=true: sem hover/click. Sem dependências externas.
 */
export function StarRating({
  value,
  onChange,
  readonly = false,
  size = 28,
  className,
}: StarRatingProps) {
  const [hover, setHover] = useState(0);
  const display = !readonly && hover > 0 ? hover : value;

  return (
    <div
      className={cn("inline-flex items-center gap-1", className)}
      role={readonly ? undefined : "radiogroup"}
      aria-label="Nota de 1 a 5"
    >
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= display;
        return (
          <button
            key={n}
            type="button"
            disabled={readonly}
            aria-label={`${n} ${n === 1 ? "estrela" : "estrelas"}`}
            aria-checked={value === n}
            role={readonly ? undefined : "radio"}
            onMouseEnter={() => !readonly && setHover(n)}
            onMouseLeave={() => !readonly && setHover(0)}
            onFocus={() => !readonly && setHover(n)}
            onBlur={() => !readonly && setHover(0)}
            onClick={() => !readonly && onChange?.(n)}
            className={cn(
              "transition-transform duration-150 outline-none",
              !readonly && "hover:scale-110 focus-visible:scale-110 cursor-pointer",
              readonly && "cursor-default"
            )}
          >
            <Star
              size={size}
              className={cn(
                "transition-colors",
                filled ? "fill-primary text-primary" : "text-muted-foreground/40"
              )}
            />
          </button>
        );
      })}
    </div>
  );
}

export default StarRating;
