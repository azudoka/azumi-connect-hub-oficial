import { PageHeader } from "@/components/PageHeader";
import { FileText } from "lucide-react";

const solicitacoes = [
  { titulo: "Relatório detalhado de turnover", data: "27/04/2026", status: "Em análise", cls: "bg-info/15 text-info border-info/30" },
  { titulo: "Revisão de política de bônus", data: "22/04/2026", status: "Pendente", cls: "bg-warning/15 text-warning border-warning/30" },
  { titulo: "Estudo de equidade salarial", data: "15/04/2026", status: "Concluído", cls: "bg-success/15 text-success border-success/30" },
  { titulo: "Benchmark de benefícios do setor", data: "10/04/2026", status: "Em análise", cls: "bg-info/15 text-info border-info/30" },
];

export default function SolicitacoesPage() {
  return (
    <div>
      <PageHeader title="Solicitações executivas" subtitle="Demandas estratégicas direcionadas ao time de RH." />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {solicitacoes.map((s) => (
          <article key={s.titulo} className="bg-card border border-border rounded-2xl p-5 shadow-card">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center"><FileText className="h-5 w-5" /></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-display font-semibold text-base">{s.titulo}</h3>
                  <span className={`badge-pill ${s.cls} shrink-0`}>{s.status}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 font-data">Aberta em {s.data}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
