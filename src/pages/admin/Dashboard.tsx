import { PageHeader } from "@/components/PageHeader";
import { KpiCard } from "@/components/KpiCard";
import { StatusBadge } from "@/components/StatusBadge";
import { SectionDivider } from "@/components/SectionDivider";
import { Timer } from "@/components/Timer";
import { ConsumoAlertCard } from "@/components/ConsumoAlertCard";
import { Briefcase, Target, Clock, MessagesSquare, Star, Plus, Calendar } from "lucide-react";
import { atividades, eventos, horasSemana, vagas, projetos } from "@/data/mock";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, LineChart, Line
} from "recharts";
import { Link } from "react-router-dom";

export default function AdminDashboard() {
  const horasMes = 61;
  const npsAtual = 81;

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Visão consolidada da operação Azumi Connect"
        actions={
          <>
            <Timer compact />
            <button className="h-9 px-3 rounded-lg bg-primary text-primary-foreground font-ui text-sm flex items-center gap-1.5 hover:opacity-90">
              <Plus className="h-4 w-4" /> Nova vaga
            </button>
          </>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard label="Vagas ativas" value={vagas.filter(v => v.status === "ativa" || v.status === "andamento").length + 13} icon={Target} trend={{ value: "+12%", positive: true }} />
        <KpiCard label="Projetos" value={projetos.filter(p => p.status === "andamento").length + 7} icon={Briefcase} trend={{ value: "+2", positive: true }} />
        <KpiCard label="Horas no mês" value={`${horasMes}h`} icon={Clock} hint="de 80h contratadas" trend={{ value: "76%", positive: true }} />
        <KpiCard label="Solicitações" value={9} icon={MessagesSquare} trend={{ value: "-3", positive: true }} />
        <KpiCard label="NPS médio" value={npsAtual} icon={Star} trend={{ value: "+3", positive: true }} />
      </div>

      <SectionDivider>Operação</SectionDivider>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5 card-hover">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display font-semibold">Horas por semana</h3>
              <p className="text-xs text-muted-foreground">Comparativo com a meta diária</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-primary" />Horas</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-highlight" />Meta</span>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={horasSemana} barGap={6}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="dia" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                  cursor={{ fill: "hsl(var(--muted) / 0.4)" }}
                />
                <Bar dataKey="horas" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="meta" fill="hsl(var(--highlight))" radius={[4, 4, 0, 0]} opacity={0.4} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 card-hover">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold">Próximos eventos</h3>
            <Link to="/app/calendario" className="text-xs text-primary hover:underline">Ver todos</Link>
          </div>
          <ul className="space-y-3">
            {eventos.map((e) => (
              <li key={e.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors">
                <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Calendar className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{e.titulo}</div>
                  <div className="text-xs text-muted-foreground">{e.quando} · {e.empresa}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <SectionDivider>Alertas operacionais</SectionDivider>

      <ConsumoAlertCard context="admin" />

      <SectionDivider>Últimas atividades</SectionDivider>

      <div className="bg-card border border-border rounded-xl overflow-hidden card-hover">
        <table className="w-full text-sm">
          <thead className="bg-secondary/40 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="text-left font-medium px-4 py-3">Empresa</th>
              <th className="text-left font-medium px-4 py-3">Tipo</th>
              <th className="text-left font-medium px-4 py-3">Responsável</th>
              <th className="text-left font-medium px-4 py-3">Status</th>
              <th className="text-right font-medium px-4 py-3">Quando</th>
            </tr>
          </thead>
          <tbody>
            {atividades.map((a) => (
              <tr key={a.id} className="border-t border-border hover:bg-secondary/30 transition-colors">
                <td className="px-4 py-3 font-medium">{a.empresa}</td>
                <td className="px-4 py-3 text-muted-foreground">{a.tipo}</td>
                <td className="px-4 py-3">{a.responsavel}</td>
                <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                <td className="px-4 py-3 text-right text-xs text-muted-foreground font-data">{a.tempo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
