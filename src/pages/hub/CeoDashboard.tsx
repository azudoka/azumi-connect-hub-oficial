import { PageHeader } from "@/components/PageHeader";
import { KpiCard } from "@/components/KpiCard";
import { SectionDivider } from "@/components/SectionDivider";
import { headcountDept } from "@/data/mock";
import { Link } from "react-router-dom";
import { Users, TrendingDown, UserPlus, UserMinus, Heart, AlertTriangle, Wallet } from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, Legend
} from "recharts";

export default function CeoDashboard() {
  const custos = [
    { name: "Folha", value: 68, color: "hsl(var(--primary))" },
    { name: "Benefícios", value: 14, color: "hsl(var(--highlight))" },
    { name: "Treinamento", value: 6, color: "hsl(var(--info))" },
    { name: "Recrutamento", value: 8, color: "hsl(var(--warning))" },
    { name: "Outros", value: 4, color: "hsl(var(--muted-foreground))" },
  ];

  return (
    <div>
      <PageHeader title="Visão executiva" subtitle="Indicadores estratégicos de pessoas e operação" />

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard label="Headcount total" value={173} icon={Users} trend={{ value: "+8", positive: true }} />
        <KpiCard label="Turnover" value="6.4%" icon={TrendingDown} trend={{ value: "-1.2pp", positive: true }} />
        <KpiCard label="Admissões (mês)" value={9} icon={UserPlus} />
        <KpiCard label="Desligamentos" value={4} icon={UserMinus} />
        <KpiCard label="Satisfação média" value="4.2" icon={Heart} hint="de 5.0" trend={{ value: "+0.3", positive: true }} />
      </div>

      <SectionDivider>Estrutura</SectionDivider>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-card border border-border rounded-xl p-5 card-hover">
          <h3 className="font-display font-semibold mb-4">Headcount por departamento</h3>
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={headcountDept} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis dataKey="dept" type="category" stroke="hsl(var(--muted-foreground))" fontSize={11} width={90} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="n" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 card-hover">
          <h3 className="font-display font-semibold mb-4">Composição de custos de RH</h3>
          <div className="h-72">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={custos} dataKey="value" nameKey="name" outerRadius={100} innerRadius={55} paddingAngle={2}>
                  {custos.map((c, i) => <Cell key={i} fill={c.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <SectionDivider>ROI de RH</SectionDivider>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 text-xs text-muted-foreground"><Wallet className="h-4 w-4" /> Custo por colaborador</div>
          <div className="mt-2 font-data text-3xl font-semibold">R$ 8.420</div>
          <div className="text-xs text-muted-foreground mt-1">média mensal · todos os encargos</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 text-xs text-muted-foreground"><UserPlus className="h-4 w-4" /> Custo por contratação</div>
          <div className="mt-2 font-data text-3xl font-semibold">R$ 4.180</div>
          <div className="text-xs text-success mt-1">-12% vs trimestre anterior</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 text-xs text-muted-foreground"><Wallet className="h-4 w-4" /> Budget × Realizado</div>
          <div className="mt-3">
            <div className="h-3 rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full bg-gradient-brand" style={{ width: "92%" }} />
            </div>
            <div className="mt-2 flex justify-between text-xs font-data">
              <span>R$ 1.46M realizado</span>
              <span className="text-muted-foreground">R$ 1.59M previsto</span>
            </div>
          </div>
        </div>
      </div>

      <SectionDivider>Alertas executivos</SectionDivider>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {([
          {
            t: "Feedbacks de ajuste pendentes",
            d: "3 colaboradores aguardam há mais de 30 dias",
            tone: "warning" as const,
            to: "/hub/ceo/avaliacoes",
          },
          {
            t: "Budget de TI ultrapassado",
            d: "Departamento excedeu em 4% o previsto",
            tone: "destructive" as const,
            to: "/hub/ceo/financeiro",
          },
          {
            t: "Turnover acima da média em Vendas",
            d: "9.8% nos últimos 90 dias",
            tone: "destructive" as const,
            to: "/hub/ceo/turnover",
          },
        ]).map((a, i) => {
          const tone =
            a.tone === "warning"
              ? "border-warning/30 text-warning hover:border-warning/60"
              : "border-destructive/30 text-destructive hover:border-destructive/60";
          return (
            <Link
              key={i}
              to={a.to}
              className={`rounded-xl border bg-card p-4 card-hover transition-colors ${tone}`}
            >
              <div className="flex items-center gap-2 text-sm font-medium">
                <AlertTriangle className="h-4 w-4" /> {a.t}
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">{a.d}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
