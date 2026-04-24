import { PageHeader } from "@/components/PageHeader";
import { KpiCard } from "@/components/KpiCard";
import { SectionDivider } from "@/components/SectionDivider";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Briefcase, Clock, MessagesSquare, Star, Target, TrendingUp, Filter } from "lucide-react";
import { vagas, npsHistorico, horasSemana } from "@/data/mock";
import { StatusBadge } from "@/components/StatusBadge";
import { SlaBar } from "@/components/SlaBar";
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, Legend
} from "recharts";

const tabs = ["Visão Geral", "Atração", "Horas", "NPS", "Solicitações"] as const;

export default function Analytics() {
  const [tab, setTab] = useState<typeof tabs[number]>("Visão Geral");

  return (
    <div>
      <PageHeader
        title="Analytics"
        subtitle="Inteligência operacional e estratégica"
        actions={
          <>
            <select className="h-9 px-3 rounded-lg border border-border bg-card text-sm">
              <option>Últimos 30 dias</option><option>Trimestre</option><option>Ano</option>
            </select>
            <select className="h-9 px-3 rounded-lg border border-border bg-card text-sm">
              <option>Todas as empresas</option><option>Kentaki Foods</option><option>Studio Mira</option>
            </select>
            <button className="h-9 px-3 rounded-lg border border-border hover:bg-secondary text-sm flex items-center gap-1.5">
              <Filter className="h-4 w-4" /> Filtros avançados
            </button>
          </>
        }
      />

      <div className="flex items-center gap-1 border-b border-border mb-5 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap",
              tab === t ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Visão Geral" && <VisaoGeral />}
      {tab === "Atração" && <AbaAtracao />}
      {tab === "Horas" && <AbaHoras />}
      {tab === "NPS" && <AbaNps />}
      {tab === "Solicitações" && <AbaSolicitacoes />}
    </div>
  );
}

function VisaoGeral() {
  const evolucao = [
    { mes: "Jan", vagas: 38, projetos: 12, horas: 540 },
    { mes: "Fev", vagas: 42, projetos: 14, horas: 612 },
    { mes: "Mar", vagas: 45, projetos: 16, horas: 698 },
    { mes: "Abr", vagas: 47, projetos: 19, horas: 745 },
  ];
  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <KpiCard label="Vagas no período" value={47} icon={Target} trend={{ value: "+12%", positive: true }} />
        <KpiCard label="Projetos ativos" value={19} icon={Briefcase} trend={{ value: "+3", positive: true }} />
        <KpiCard label="Horas faturadas" value={745} icon={Clock} trend={{ value: "+8%", positive: true }} />
        <KpiCard label="NPS médio" value={81} icon={Star} trend={{ value: "+3", positive: true }} />
        <KpiCard label="Solicitações" value={42} icon={MessagesSquare} trend={{ value: "-5", positive: true }} />
        <KpiCard label="Tempo médio fechamento" value="22d" icon={TrendingUp} trend={{ value: "-2d", positive: true }} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-6">
        <div className="bg-card border border-border rounded-xl p-5 card-hover">
          <h3 className="font-display font-semibold mb-4">Evolução mensal</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={evolucao}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="mes" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="vagas" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="projetos" stroke="hsl(var(--highlight))" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 card-hover">
          <h3 className="font-display font-semibold mb-4">Distribuição por módulo</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={evolucao} stackOffset="sign">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="mes" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="vagas" stackId="a" fill="hsl(var(--primary))" radius={[0, 0, 0, 0]} />
                <Bar dataKey="projetos" stackId="a" fill="hsl(var(--highlight))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </>
  );
}

function AbaAtracao() {
  const funil = [
    { etapa: "Currículos", n: 1240 },
    { etapa: "Triagem", n: 412 },
    { etapa: "Entrevista", n: 168 },
    { etapa: "Enviados", n: 62 },
    { etapa: "Contratados", n: 18 },
  ];
  const max = funil[0].n;
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5">
        <h3 className="font-display font-semibold mb-4">Funil consolidado</h3>
        <ul className="space-y-3">
          {funil.map((f, i) => {
            const w = (f.n / max) * 100;
            const conv = i > 0 ? Math.round((f.n / funil[i-1].n) * 100) : 100;
            return (
              <li key={f.etapa}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">{f.etapa}</span>
                  <span className="font-data tabular-nums">{f.n.toLocaleString("pt-BR")} <span className="text-muted-foreground">· {conv}%</span></span>
                </div>
                <div className="h-3 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${w}%`, opacity: 1 - i * 0.12 }} />
                </div>
              </li>
            );
          })}
        </ul>
      </div>
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="font-display font-semibold mb-4">Vagas — SLA</h3>
        <ul className="space-y-3">
          {vagas.map(v => (
            <li key={v.id}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-medium">{v.titulo}</span>
                <StatusBadge status={v.status} />
              </div>
              <SlaBar percent={v.sla} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function AbaHoras() {
  const porConsultor = [
    { nome: "Ana Beatriz", h: 184 },
    { nome: "Rafael Moura", h: 162 },
    { nome: "Camila Torres", h: 148 },
  ];
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="font-display font-semibold mb-4">Horas por consultor</h3>
        <div className="h-64">
          <ResponsiveContainer>
            <BarChart data={porConsultor} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
              <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis dataKey="nome" type="category" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} width={100} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="h" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="font-display font-semibold mb-4">Horas por dia</h3>
        <div className="h-64">
          <ResponsiveContainer>
            <BarChart data={horasSemana}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="dia" stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="horas" fill="hsl(var(--highlight))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function AbaNps() {
  const histo = [
    { faixa: "0-6 (Detratores)", n: 4, cor: "hsl(var(--destructive))" },
    { faixa: "7-8 (Neutros)", n: 12, cor: "hsl(var(--warning))" },
    { faixa: "9-10 (Promotores)", n: 38, cor: "hsl(var(--success))" },
  ];
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="font-display font-semibold mb-4">Evolução do NPS</h3>
        <div className="h-64">
          <ResponsiveContainer>
            <LineChart data={npsHistorico}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="mes" stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} domain={[60, 100]} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              <Line type="monotone" dataKey="nps" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 5, fill: "hsl(var(--highlight))" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="font-display font-semibold mb-4">Distribuição</h3>
        <ul className="space-y-3 mt-6">
          {histo.map(h => (
            <li key={h.faixa}>
              <div className="flex justify-between text-xs mb-1">
                <span>{h.faixa}</span>
                <span className="font-data">{h.n}</span>
              </div>
              <div className="h-3 rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${(h.n / 54) * 100}%`, background: h.cor }} />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function AbaSolicitacoes() {
  const tipos = [
    { name: "Recrutamento", value: 18, color: "hsl(var(--primary))" },
    { name: "Jurídico", value: 9, color: "hsl(var(--highlight))" },
    { name: "DP / Folha", value: 12, color: "hsl(var(--info))" },
    { name: "Treinamento", value: 6, color: "hsl(var(--warning))" },
    { name: "Outros", value: 3, color: "hsl(var(--muted-foreground))" },
  ];
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="font-display font-semibold mb-4">Por tipo</h3>
        <div className="h-64">
          <ResponsiveContainer>
            <PieChart>
              <Pie data={tipos} dataKey="value" nameKey="name" outerRadius={90} innerRadius={50}>
                {tipos.map((t, i) => <Cell key={i} fill={t.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="font-display font-semibold mb-4">Por mês</h3>
        <div className="h-64">
          <ResponsiveContainer>
            <LineChart data={[{m:"Jan",n:32},{m:"Fev",n:38},{m:"Mar",n:45},{m:"Abr",n:48}]}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="m" stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              <Line type="monotone" dataKey="n" stroke="hsl(var(--highlight))" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
