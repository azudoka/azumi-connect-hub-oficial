import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        // Etiquetas por categoria — Kit de Marca Connect v1. Cada categoria tem cor própria,
        // fim do "toda etiqueta é cinza". Uso: className={badgeVariants({variant:"tagBlue"})}
        tagBlue: "border-transparent bg-[#E7EEFC] text-[#264478] hover:bg-[#DCE6FA]",
        tagViolet: "border-transparent bg-[#EFE7FC] text-[#6B3FBF] hover:bg-[#E6DAFA]",
        tagGreen: "border-transparent bg-[#E4F5EC] text-[#1E8A4C] hover:bg-[#D8F0E2]",
        tagAmber: "border-transparent bg-[#FDF0DC] text-[#B4740E] hover:bg-[#FBE7C7]",
        tagRed: "border-transparent bg-[#FCE4E4] text-[#C23A3A] hover:bg-[#FAD6D6]",
        tagTeal: "border-transparent bg-[#E1F3F0] text-[#12786B] hover:bg-[#D3EEE9]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
