import { PageHeader } from "@/components/PageHeader";
import { Building2, Users, TrendingUp, AlertTriangle, MapPin, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

const empresa = {
  nome: "Azumi Tecnologia",
  totalColab: 142,
  unidades: 3,
  fundada: 2018,
};

const departamentos = [
  { nome: "Operações", pessoas: 48, status: "Em crescimento" },
  { nome: "Comercial", pessoas: 22, status: "Estável" },
  { nome: "Tecnologia", pessoas: 35, status: "Em crescimento" },
  { nome: "Financeiro", pessoas: 9, status: "Estável" },
  { nome: "Marketing", pessoas: 12, status: "Estável" },
  { nome: "Pessoas (RH)", pessoas: 8, status: "Estável" },
  { nome: "Atendimento", pessoas: 8, status: "Atenção" },
];

const kpis = [
  { label: "Headcount total", valor: "142", icon: Users },
  { label: "Turnover 12m", valor: "8,4%", icon: TrendingUp },
  { label: "Tempo médio de casa", valor: "2,7 anos", icon: Calendar },
];

const atencao = [
  "Turnover acima da meta no time de Operações.",
  "Equipe de Tecnologia em expansão acelerada — atenção a onboarding.",
  "Clima em atenção em Atendimento (eNPS abaixo da média).",
  "Liderança de Comercial sem avaliações no último ciclo.",
];

const statusColor: Record<string, string> = {
  "Em crescimento": "bg-success/15 text-success border-success/30",
  "Estável": "bg-muted text-foreground border-border",
  "Atenção": "bg-warning/15 text-warning border-warning/30",
};

export default function MinhaEmpresaPage() {
  return (
    <div>
      <PageHeader
        title="Minha empresa"
        subtitle="Visão geral da estrutura, times e pessoas da sua organização."
      />

      {/* Resumo da empresa */}
      <div className="bg-card border border-border rounded-2xl shadow-card p-6 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
            <Building2 className="h-7 w-7" />
          </div>
          <div className="flex-1">
            <h2 className="font-display text-xl font-semibold">{empresa.nome}</h2>
            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {empresa.totalColab} colaboradores</span>
              <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {empresa.unidades} unidades</span>
              <span className="inline-flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Fundada em {empresa.fundada}</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPIs principais */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        {kpis.map((k) => (
          <div key={k.label} className="bg-card border border-border rounded-2xl shadow-card p-5">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <k.icon className="h-4 w-4" />
              <span className="text-xs uppercase tracking-wider">{k.label}</span>
            </div>
            <div className="text-3xl font-display font-semibold">{k.valor}</div>
          </div>
        ))}
      </div>

      {/* Estrutura de áreas */}
      <div className="bg-card border border-border rounded-2xl shadow-card p-5 mb-4">
        <h3 className="font-display font-semibold text-sm mb-3">Estrutura de áreas</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Times que compõem a empresa hoje, com headcount por área.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {departamentos.map((d) => (
            <div key={d.nome} className="rounded-xl border border-border p-4 hover:bg-secondary/30 transition-colors">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-medium">{d.nome}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{d.pessoas} pessoas</div>
                </div>
                <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border", statusColor[d.status])}>
                  {d.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pontos de atenção */}
      <div className="bg-card border border-border rounded-2xl shadow-card p-5">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="h-4 w-4 text-warning" />
          <h3 className="font-display font-semibold text-sm">Pontos de atenção</h3>
        </div>
        <ul className="space-y-2 text-sm">
          {atencao.map((a, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-warning shrink-0" />
              <span className="text-foreground">{a}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
