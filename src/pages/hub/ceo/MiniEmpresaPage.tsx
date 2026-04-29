import { PageHeader } from "@/components/PageHeader";
import { Building2, Network, BarChart3 } from "lucide-react";

const kpis = [
  { label: "Turnover", valor: "8,4%" },
  { label: "Headcount", valor: "142" },
  { label: "Absenteísmo", valor: "2,1%" },
];

const areas = ["Operações", "Comercial", "Tecnologia", "Financeiro", "Marketing", "Pessoas"];

export default function MiniEmpresaPage() {
  return (
    <div>
      <PageHeader title="Mini empresa" subtitle="Visão macro da sua organização em um piscar de olhos." />
      <div className="bg-card border border-border rounded-2xl shadow-card p-6 mb-4">
        <div className="flex items-start gap-4">
          <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center"><Building2 className="h-6 w-6" /></div>
          <div>
            <h2 className="font-display text-xl font-semibold">Azumi Tecnologia</h2>
            <p className="text-sm text-muted-foreground">142 colaboradores • 3 unidades • Fundada em 2018</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-2xl shadow-card p-5">
          <div className="flex items-center gap-2 mb-3"><Network className="h-4 w-4 text-primary" /><h3 className="font-display font-semibold text-sm">Estrutura de áreas</h3></div>
          <p className="text-sm text-muted-foreground mb-3">Distribuição atual das áreas que compõem a empresa:</p>
          <div className="flex flex-wrap gap-2">
            {areas.map((a) => <span key={a} className="px-3 py-1 rounded-full text-xs font-medium bg-muted text-foreground border border-border">{a}</span>)}
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl shadow-card p-5">
          <div className="flex items-center gap-2 mb-3"><BarChart3 className="h-4 w-4 text-primary" /><h3 className="font-display font-semibold text-sm">Principais indicadores</h3></div>
          <div className="grid grid-cols-3 gap-3 text-center">
            {kpis.map((k) => (
              <div key={k.label} className="p-3 rounded-lg border border-border">
                <p className="text-2xl font-display font-semibold">{k.valor}</p>
                <p className="text-xs text-muted-foreground">{k.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
