import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { DiscScores } from "./discQuestions";

const chartConfig = {
  valor: { label: "Score", color: "hsl(var(--primary))" },
} satisfies ChartConfig;

export function DiscRadarChart({ scores }: { scores: DiscScores }) {
  const chartData = [
    { fator: "Dominância", valor: scores.D },
    { fator: "Influência", valor: scores.I },
    { fator: "Estabilidade", valor: scores.S },
    { fator: "Conformidade", valor: scores.C },
  ];
  return (
    <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[280px]">
      <RadarChart data={chartData}>
        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
        <PolarAngleAxis dataKey="fator" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
        <PolarGrid stroke="hsl(var(--border))" />
        <Radar
          dataKey="valor"
          fill="hsl(var(--primary))"
          fillOpacity={0.5}
          stroke="hsl(var(--primary))"
          strokeWidth={2}
        />
      </RadarChart>
    </ChartContainer>
  );
}
