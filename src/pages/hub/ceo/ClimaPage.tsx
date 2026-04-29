import { PageHeader } from "@/components/PageHeader";
import { Activity, AlertTriangle, ArrowRight } from "lucide-react";

const areas = [
  { nome: "Operações", status: "Alta atenção", cls: "bg-destructive/15 text-destructive border-destructive/30" },
  { nome: "Comercial", status: "Estável", cls: "bg-success/15 text-success border-success/30" },
  { nome: "Tecnologia", status: "Atenção média", cls: "bg-warning/15 text-warning border-warning/30" },
];

const proximosPassos = [
  "Conduzir pesquisa de pulso em Operações nos próximos 15 dias",
  "Revisar carga de trabalho dos times com NPS abaixo de 7",
  "Agendar mentoria executiva com líderes de áreas críticas",
  "Comunicar plano de ação ao C-Level até o fim do mês",
];

export default function ClimaPage() {
  return (
    <div>
      <PageHeader title="Clima organizacional" subtitle="Visão executiva do engajamento e clima da empresa." />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-2xl shadow-card p-5">
          <div className="flex items-center gap-2 mb-3"><Activity className="h-4 w-4 text-primary" /><h3 className="font-display font-semibold text-sm">Visão geral do clima</h3></div>
          <p className="text-sm text-muted-foreground">Aqui você acompanha o resumo consolidado de NPS interno, engajamento e satisfação geral, com base nas pesquisas e no termômetro do time.</p>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div><p className="text-2xl font-display font-semibold">7.8</p><p className="text-xs text-muted-foreground">eNPS</p></div>
            <div><p className="text-2xl font-display font-semibold">82%</p><p className="text-xs text-muted-foreground">Engajamento</p></div>
            <div><p className="text-2xl font-display font-semibold">74%</p><p className="text-xs text-muted-foreground">Satisfação</p></div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl shadow-card p-5">
          <div className="flex items-center gap-2 mb-3"><AlertTriangle className="h-4 w-4 text-warning" /><h3 className="font-display font-semibold text-sm">Áreas com maior risco</h3></div>
          <ul className="space-y-2">
            {areas.map((a) => (
              <li key={a.nome} className="flex items-center justify-between text-sm">
                <span>{a.nome}</span>
                <span className={`badge-pill ${a.cls}`}>{a.status}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-card border border-border rounded-2xl shadow-card p-5">
          <div className="flex items-center gap-2 mb-3"><ArrowRight className="h-4 w-4 text-primary" /><h3 className="font-display font-semibold text-sm">Próximos passos sugeridos</h3></div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {proximosPassos.map((p) => <li key={p} className="flex gap-2"><span className="text-primary">•</span>{p}</li>)}
          </ul>
        </div>
      </div>
    </div>
  );
}
