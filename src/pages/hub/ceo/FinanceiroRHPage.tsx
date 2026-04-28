import { PageHeader } from "@/components/PageHeader";
import { KpiCard } from "@/components/KpiCard";
import { SectionDivider } from "@/components/SectionDivider";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { AlertTriangle, GraduationCap, Gift, TrendingUp, Wallet } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const FOLHA_COLOR = "#034C8B";
const BUDGET_COLOR = "#3B82F6";

const folhaVsBudget = [
  { mes: "Nov/25", folha: 1380, budget: 1450 },
  { mes: "Dez/25", folha: 1520, budget: 1500 },
  { mes: "Jan/26", folha: 1410, budget: 1500 },
  { mes: "Fev/26", folha: 1430, budget: 1500 },
  { mes: "Mar/26", folha: 1480, budget: 1550 },
  { mes: "Abr/26", folha: 1465, budget: 1590 },
];

interface CustoDept {
  dept: string;
  folha: number;
  beneficios: number;
  orcamento: number;
}

const custosDept: CustoDept[] = [
  { dept: "RH", folha: 165, beneficios: 28, orcamento: 220 },
  { dept: "Comercial", folha: 410, beneficios: 70, orcamento: 500 },
  { dept: "TI", folha: 540, beneficios: 95, orcamento: 600 },
  { dept: "Operações", folha: 290, beneficios: 52, orcamento: 360 },
  { dept: "Financeiro", folha: 180, beneficios: 30, orcamento: 200 },
];

const fmt = (n: number) =>
  `R$ ${n.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}k`;

const tooltipStyle = {
  background: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 8,
  fontSize: 12,
};

export default function FinanceiroRHPage() {
  const folhaTotal = folhaVsBudget[folhaVsBudget.length - 1].folha;
  const beneficiosMes = custosDept.reduce((s, d) => s + d.beneficios, 0);
  const orcamentoMes = custosDept.reduce((s, d) => s + d.orcamento, 0);
  const realizadoMes = custosDept.reduce((s, d) => s + d.folha + d.beneficios, 0);
  const pctBudget = Math.round((realizadoMes / orcamentoMes) * 100);

  return (
    <div>
      <PageHeader
        title="Financeiro de RH"
        subtitle="Visão financeira de pessoas — folha, benefícios e orçamento."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Folha do mês"
          value={fmt(folhaTotal)}
          icon={Wallet}
          hint="Abr/2026"
        />
        <KpiCard
          label="Custo de benefícios"
          value={fmt(beneficiosMes)}
          icon={Gift}
          hint="incluso plano de saúde"
        />
        <div className="card-hover bg-card border border-border rounded-xl p-5 shadow-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Budget utilizado
              </p>
              <p className="mt-2 font-data text-3xl font-semibold tabular-nums">
                {pctBudget}%
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {fmt(realizadoMes)} de {fmt(orcamentoMes)}
              </p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Wallet className="h-5 w-5" />
            </div>
          </div>
          <Progress value={Math.min(pctBudget, 100)} className="h-2 mt-4" />
        </div>
        <KpiCard
          label="ROI de treinamentos"
          value="3.2x"
          icon={GraduationCap}
          trend={{ value: "+0.4x", positive: true }}
          hint="vs trimestre anterior"
        />
      </div>

      <SectionDivider>Folha vs Budget</SectionDivider>

      <div className="bg-card border border-border rounded-2xl p-5 shadow-card">
        <h3 className="font-display font-semibold mb-4">
          Folha realizada vs budget planejado — últimos 6 meses
        </h3>
        <div className="h-80">
          <ResponsiveContainer>
            <BarChart data={folhaVsBudget}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="mes" stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
                tickFormatter={(v) => `${v}k`}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(v: number) => fmt(v)}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="folha" name="Folha" fill={FOLHA_COLOR} radius={[6, 6, 0, 0]} />
              <Bar dataKey="budget" name="Budget" fill={BUDGET_COLOR} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <SectionDivider>Custos por departamento</SectionDivider>

      <section className="bg-card border border-border rounded-2xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left font-medium px-4 py-3">Departamento</th>
                <th className="text-right font-medium px-4 py-3">Folha</th>
                <th className="text-right font-medium px-4 py-3">Benefícios</th>
                <th className="text-right font-medium px-4 py-3">Total</th>
                <th className="text-right font-medium px-4 py-3">% do orçamento</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {custosDept.map((d) => {
                const total = d.folha + d.beneficios;
                const pct = Math.round((total / d.orcamento) * 100);
                const estouro = pct > 100;
                return (
                  <tr key={d.dept} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-4 py-3 font-medium">{d.dept}</td>
                    <td className="px-4 py-3 text-right font-data">{fmt(d.folha)}</td>
                    <td className="px-4 py-3 text-right font-data">{fmt(d.beneficios)}</td>
                    <td className="px-4 py-3 text-right font-data font-semibold">{fmt(total)}</td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={cn(
                          "badge-pill",
                          estouro
                            ? "bg-destructive/15 text-destructive border-destructive/30"
                            : pct > 90
                              ? "bg-warning/15 text-warning border-warning/30"
                              : "bg-success/15 text-success border-success/30"
                        )}
                      >
                        {estouro && <AlertTriangle className="h-3 w-3" />}
                        {!estouro && <TrendingUp className="h-3 w-3" />}
                        {pct}%
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
