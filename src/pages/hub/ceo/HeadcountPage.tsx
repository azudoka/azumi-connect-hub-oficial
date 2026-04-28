import { PageHeader } from "@/components/PageHeader";
import { KpiCard } from "@/components/KpiCard";
import { SectionDivider } from "@/components/SectionDivider";
import { cn } from "@/lib/utils";
import { ArrowDownRight, ArrowUpRight, UserMinus, UserPlus, Users, Target } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const PRIMARY = "#3B82F6";
const ACCENT = "#8B5CF6";

const departamentos = [
  { dept: "RH", atual: 18, anterior: 17 },
  { dept: "Comercial", atual: 42, anterior: 44 },
  { dept: "TI", atual: 56, anterior: 53 },
  { dept: "Operações", atual: 38, anterior: 38 },
  { dept: "Financeiro", atual: 19, anterior: 18 },
];

const evolucao = [
  { mes: "Nov/25", n: 165 },
  { mes: "Dez/25", n: 168 },
  { mes: "Jan/26", n: 170 },
  { mes: "Fev/26", n: 172 },
  { mes: "Mar/26", n: 169 },
  { mes: "Abr/26", n: 173 },
];

const total = departamentos.reduce((s, d) => s + d.atual, 0);

const tooltipStyle = {
  background: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 8,
  fontSize: 12,
};

export default function HeadcountPage() {
  return (
    <div>
      <PageHeader
        title="Headcount"
        subtitle="Estrutura de pessoal por departamento e evolução mensal."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Headcount total" value={total} icon={Users} hint="ativos" />
        <KpiCard label="Admissões (mês)" value={9} icon={UserPlus} trend={{ value: "+2", positive: true }} />
        <KpiCard label="Desligamentos" value={4} icon={UserMinus} trend={{ value: "-1", positive: true }} />
        <KpiCard label="Previsto vs real" value={`${total}/180`} icon={Target} hint="96% do plano" />
      </div>

      <SectionDivider>Distribuição</SectionDivider>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-card border border-border rounded-2xl p-5 shadow-card">
          <h3 className="font-display font-semibold mb-4">Headcount por departamento</h3>
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={departamentos}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="dept" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="atual" fill={PRIMARY} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 shadow-card">
          <h3 className="font-display font-semibold mb-4">Evolução mensal — últimos 6 meses</h3>
          <div className="h-72">
            <ResponsiveContainer>
              <LineChart data={evolucao}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="mes" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} domain={["dataMin - 5", "dataMax + 5"]} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line
                  type="monotone"
                  dataKey="n"
                  stroke={ACCENT}
                  strokeWidth={3}
                  dot={{ r: 4, fill: ACCENT }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <SectionDivider>Detalhamento</SectionDivider>

      <section className="bg-card border border-border rounded-2xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left font-medium px-4 py-3">Departamento</th>
                <th className="text-right font-medium px-4 py-3">Headcount</th>
                <th className="text-right font-medium px-4 py-3">% do total</th>
                <th className="text-right font-medium px-4 py-3">Variação vs mês anterior</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {departamentos.map((d) => {
                const variacao = d.atual - d.anterior;
                const positivo = variacao > 0;
                const negativo = variacao < 0;
                const pct = ((d.atual / total) * 100).toFixed(1);
                return (
                  <tr key={d.dept} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-4 py-3 font-medium">{d.dept}</td>
                    <td className="px-4 py-3 text-right font-data">{d.atual}</td>
                    <td className="px-4 py-3 text-right font-data text-muted-foreground">{pct}%</td>
                    <td className="px-4 py-3 text-right">
                      {variacao === 0 ? (
                        <span className="text-xs text-muted-foreground">—</span>
                      ) : (
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 font-data text-xs font-medium",
                            positivo && "text-success",
                            negativo && "text-destructive"
                          )}
                        >
                          {positivo ? (
                            <ArrowUpRight className="h-3 w-3" />
                          ) : (
                            <ArrowDownRight className="h-3 w-3" />
                          )}
                          {positivo ? "+" : ""}
                          {variacao}
                        </span>
                      )}
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
