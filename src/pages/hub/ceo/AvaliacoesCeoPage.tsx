import { PageHeader } from "@/components/PageHeader";
import { KpiCard } from "@/components/KpiCard";
import { SectionDivider } from "@/components/SectionDivider";
import { Progress } from "@/components/ui/progress";
import { Heart, ListChecks, Star, Users } from "lucide-react";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const COR_ACIMA = "hsl(var(--success))";
const COR_MEDIA = "#3B82F6";
const COR_ABAIXO = "hsl(var(--destructive) / 0.7)";

const distribuicao = [
  { name: "Acima da média", value: 38, color: COR_ACIMA },
  { name: "Na média", value: 92, color: COR_MEDIA },
  { name: "Abaixo da média", value: 18, color: COR_ABAIXO },
];

interface AvalDept {
  dept: string;
  total: number;
  avaliados: number;
  notaMedia: number;
}

const porDept: AvalDept[] = [
  { dept: "RH", total: 18, avaliados: 17, notaMedia: 4.4 },
  { dept: "Comercial", total: 42, avaliados: 35, notaMedia: 4.1 },
  { dept: "TI", total: 56, avaliados: 51, notaMedia: 4.3 },
  { dept: "Operações", total: 38, avaliados: 32, notaMedia: 3.9 },
  { dept: "Financeiro", total: 19, avaliados: 13, notaMedia: 4.2 },
];

const tooltipStyle = {
  background: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 8,
  fontSize: 12,
};

export default function AvaliacoesCeoPage() {
  const totalAvaliados = porDept.reduce((s, d) => s + d.avaliados, 0);
  const notaMedia =
    porDept.reduce((s, d) => s + d.notaMedia * d.avaliados, 0) / totalAvaliados;

  return (
    <div>
      <PageHeader
        title="Avaliações"
        subtitle="Visão consolidada dos ciclos de avaliação da empresa."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Ciclos ativos" value={3} icon={ListChecks} hint="em andamento" />
        <KpiCard label="Colaboradores avaliados" value={totalAvaliados} icon={Users} />
        <KpiCard
          label="NPS interno"
          value={72}
          icon={Heart}
          trend={{ value: "+4", positive: true }}
        />
        <KpiCard
          label="Nota média geral"
          value={notaMedia.toFixed(2)}
          icon={Star}
          hint="de 5.0"
        />
      </div>

      <SectionDivider>Distribuição de performance</SectionDivider>

      <div className="bg-card border border-border rounded-2xl p-5 shadow-card">
        <h3 className="font-display font-semibold mb-4">
          Distribuição da performance — todos os ciclos ativos
        </h3>
        <div className="h-80">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={distribuicao}
                dataKey="value"
                nameKey="name"
                outerRadius={120}
                innerRadius={70}
                paddingAngle={3}
                label={({ value }) => `${value}`}
              >
                {distribuicao.map((d, i) => (
                  <Cell key={i} fill={d.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <SectionDivider>Por departamento</SectionDivider>

      <section className="bg-card border border-border rounded-2xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left font-medium px-4 py-3">Departamento</th>
                <th className="text-right font-medium px-4 py-3">Total avaliados</th>
                <th className="text-right font-medium px-4 py-3">Nota média</th>
                <th className="text-left font-medium px-4 py-3 w-[260px]">% concluído</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {porDept.map((d) => {
                const pct = Math.round((d.avaliados / d.total) * 100);
                return (
                  <tr key={d.dept} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-4 py-3 font-medium">{d.dept}</td>
                    <td className="px-4 py-3 text-right font-data">
                      {d.avaliados}/{d.total}
                    </td>
                    <td className="px-4 py-3 text-right font-data">
                      {d.notaMedia.toFixed(1)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Progress value={pct} className="h-2 flex-1" />
                        <span className="font-data text-xs font-medium tabular-nums w-10 text-right">
                          {pct}%
                        </span>
                      </div>
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
