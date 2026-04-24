import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { SlaBar } from "@/components/SlaBar";
import { vagas } from "@/data/mock";
import { Plus, LayoutGrid, List, Filter } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function AtracaoLista() {
  const [view, setView] = useState<"kanban" | "list">("kanban");
  const colunas = ["Briefing", "Triagem", "Entrevista", "Perfis enviados", "Decisão"];

  return (
    <div>
      <PageHeader
        title="Atração & Hunting"
        subtitle="Gestão de todas as vagas em andamento"
        actions={
          <>
            <div className="flex items-center bg-secondary rounded-lg p-0.5">
              <button onClick={() => setView("kanban")} className={cn("h-7 px-2.5 rounded-md text-xs flex items-center gap-1.5", view === "kanban" && "bg-card shadow-card text-foreground")}>
                <LayoutGrid className="h-3.5 w-3.5" /> Kanban
              </button>
              <button onClick={() => setView("list")} className={cn("h-7 px-2.5 rounded-md text-xs flex items-center gap-1.5", view === "list" && "bg-card shadow-card text-foreground")}>
                <List className="h-3.5 w-3.5" /> Lista
              </button>
            </div>
            <button className="h-9 px-3 rounded-lg border border-border hover:bg-secondary text-sm flex items-center gap-1.5">
              <Filter className="h-4 w-4" /> Filtros
            </button>
            <button className="h-9 px-3 rounded-lg bg-primary text-primary-foreground text-sm font-medium flex items-center gap-1.5">
              <Plus className="h-4 w-4" /> Nova vaga
            </button>
          </>
        }
      />

      {view === "kanban" ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {colunas.map((col) => {
            const items = vagas.filter(v =>
              (col === "Briefing" && v.etapa === "Briefing") ||
              (col === "Triagem" && v.etapa === "Triagem") ||
              (col === "Entrevista" && v.etapa === "Entrevista") ||
              (col === "Perfis enviados" && v.etapa === "Perfis enviados") ||
              (col === "Decisão" && v.etapa === "Decisão")
            );
            return (
              <div key={col} className="bg-card border border-border rounded-xl p-3 min-h-[280px]">
                <div className="flex items-center justify-between mb-3 px-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{col}</span>
                  <span className="font-data text-xs text-muted-foreground">{items.length}</span>
                </div>
                <ul className="space-y-2">
                  {items.map((v) => (
                    <li key={v.id}>
                      <Link to={`/app/atracao/${v.id}`} className="block bg-background/60 border border-border rounded-lg p-3 hover:border-primary/40 transition-colors">
                        <div className="flex items-start justify-between gap-2">
                          <div className="text-sm font-medium leading-tight">{v.titulo}</div>
                          <StatusBadge status={v.status} />
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-1">{v.empresa}</div>
                        <div className="mt-3"><SlaBar percent={v.sla} /></div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-secondary/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left font-medium px-4 py-3">Vaga</th>
                <th className="text-left font-medium px-4 py-3">Empresa</th>
                <th className="text-left font-medium px-4 py-3">Etapa</th>
                <th className="text-left font-medium px-4 py-3">Status</th>
                <th className="text-left font-medium px-4 py-3 w-48">SLA</th>
                <th className="text-right font-medium px-4 py-3">Candidatos</th>
              </tr>
            </thead>
            <tbody>
              {vagas.map((v) => (
                <tr key={v.id} className="border-t border-border hover:bg-secondary/30 transition-colors">
                  <td className="px-4 py-3"><Link to={`/app/atracao/${v.id}`} className="font-medium hover:text-primary">{v.titulo}</Link></td>
                  <td className="px-4 py-3 text-muted-foreground">{v.empresa}</td>
                  <td className="px-4 py-3">{v.etapa}</td>
                  <td className="px-4 py-3"><StatusBadge status={v.status} /></td>
                  <td className="px-4 py-3"><SlaBar percent={v.sla} /></td>
                  <td className="px-4 py-3 text-right font-data">{v.candidatosTotal}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
