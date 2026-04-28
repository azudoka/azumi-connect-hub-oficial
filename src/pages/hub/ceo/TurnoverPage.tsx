import { PageHeader } from "@/components/PageHeader";
import { KpiCard } from "@/components/KpiCard";
import { SectionDivider } from "@/components/SectionDivider";
import { cn } from "@/lib/utils";
import { AlertTriangle, Clock, Heart, TrendingDown, TrendingUp } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const COR_LINHA = "#8B5CF6";
const COR_BARRAS = "#034C8B";
const META = 3.0;

const turnoverMensal = [
  { mes: "Mai/25", taxa: 2.4 },
  { mes: "Jun/25", taxa: 3.1 },
  { mes: "Jul/25", taxa: 2.8 },
  { mes: "Ago/25", taxa: 3.5 },
  { mes: "Set/25", taxa: 4.2 },
  { mes: "Out/25", taxa: 3.6 },
  { mes: "Nov/25", taxa: 2.9 },
  { mes: "Dez/25", taxa: 2.2 },
  { mes: "Jan/26", taxa: 2.7 },
  { mes: "Fev/26", taxa: 3.3 },
  { mes: "Mar/26", taxa: 3.8 },
  { mes: "Abr/26", taxa: 2.6 },
];

const motivosSaida = [
  { motivo: "Voluntário", n: 18 },
  { motivo: "Involuntário", n: 9 },
  { motivo: "Aposentadoria", n: 3 },
  { motivo: "Outros", n: 4 },
];

interface TurnDept {
  dept: string;
  taxa: number;
  meta: number;
  retencaoMeses: number;
  desligYTD: number;
}

const porDept: TurnDept[] = [
  { dept: "RH", taxa: 1.8, meta: 3.0, retencaoMeses: 38, desligYTD: 1 },
  { dept: "Comercial", taxa: 5.2, meta: 4.0, retencaoMeses: 18, desligYTD: 9 },
  { dept: "TI", taxa: 3.4, meta: 3.5, retencaoMeses: 26, desligYTD: 6 },
  { dept: "Operações", taxa: 4.6, meta: 3.5, retencaoMeses: 22, desligYTD: 7 },
  { dept: "Financeiro", taxa: 1.2, meta: 3.0, retencaoMeses: 42, desligYTD: 1 },
];

const tooltipStyle = {
  background: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 8,
  fontSize: 12,
};

export default function TurnoverPage() {
  const taxaMes = turnoverMensal[turnoverMensal.length - 1].taxa;
  const taxaAnual =
    turnoverMensal.reduce((s, m) => s + m.taxa, 0) / turnoverMensal.length;

  return (
    <div>
      <PageHeader
        title="Turnover"
        subtitle="Rotatividade, retenção e motivos de saída."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Turnover mensal"
          value={`${taxaMes.toFixed(1)}%`}
          icon={TrendingDown}
          trend={{ value: "-0.7pp", positive: true }}
        />
        <KpiCard
          label="Turnover anual"
          value={`${taxaAnual.toFixed(1)}%`}
          icon={TrendingUp}
          hint={`meta ${META.toFixed(1)}%`}
        />
        <KpiCard label="Retenção média" value="28 m" icon={Clock} hint="tempo de casa" />
        <KpiCard
          label="Satisfação"
          value="4.2"
          icon={Heart}
          trend={{ value: "+0.3", positive: true }}
        />
      </div>

      <SectionDivider>Tendências</SectionDivider>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-card border border-border rounded-2xl p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold">
              Taxa de turnover — últimos 12 meses
            </h3>
            <span className="text-xs text-muted-foreground inline-flex items-center gap-2">
              <span className="inline-block h-0.5 w-4 border-t-2 border-dashed border-destructive" />
              Meta {META}%
            </span>
          </div>
          <div className="h-72">
            <ResponsiveContainer>
              <LineChart data={turnoverMensal}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="mes" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(v: number) => `${v.toFixed(1)}%`}
                />
                <ReferenceLine
                  y={META}
                  stroke="hsl(var(--destructive))"
                  strokeDasharray="6 4"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="taxa"
                  stroke={COR_LINHA}
                  strokeWidth={3}
                  dot={{ r: 4, fill: COR_LINHA }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 shadow-card">
          <h3 className="font-display font-semibold mb-4">Motivos de saída — YTD</h3>
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={motivosSaida}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="motivo" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="n" fill={COR_BARRAS} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <SectionDivider>Por departamento</SectionDivider>

      <section className="bg-card border border-border rounded-2xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left font-medium px-4 py-3">Departamento</th>
                <th className="text-right font-medium px-4 py-3">Turnover</th>
                <th className="text-right font-medium px-4 py-3">Retenção média</th>
                <th className="text-right font-medium px-4 py-3">Desligamentos YTD</th>
                <th className="text-right font-medium px-4 py-3">Status vs meta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {porDept.map((d) => {
                const acima = d.taxa > d.meta;
                return (
                  <tr key={d.dept} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-4 py-3 font-medium">{d.dept}</td>
                    <td className="px-4 py-3 text-right font-data">
                      {d.taxa.toFixed(1)}%
                    </td>
                    <td className="px-4 py-3 text-right font-data">
                      {d.retencaoMeses} m
                    </td>
                    <td className="px-4 py-3 text-right font-data">{d.desligYTD}</td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={cn(
                          "badge-pill",
                          acima
                            ? "bg-destructive/15 text-destructive border-destructive/30"
                            : "bg-success/15 text-success border-success/30"
                        )}
                      >
                        {acima ? (
                          <AlertTriangle className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        {acima ? "acima" : "dentro"} (meta {d.meta.toFixed(1)}%)
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
