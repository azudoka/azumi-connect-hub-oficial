import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { Activity, CalendarRange, LineChart, Sparkles } from "lucide-react";

export default function TermometroPage() {
  return (
    <div>
      <PageHeader
        title="Termômetro"
        subtitle="Acompanhe seu humor ao longo do tempo e identifique o que tem impactado seu dia a dia."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-2xl shadow-card">
          <div className="p-5 border-b border-border flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            <h3 className="font-display font-semibold text-sm">Humor dos últimos 30 dias</h3>
          </div>
          <EmptyState
            icon={Activity}
            title="Sem registros ainda"
            description="Quando você marcar seu humor diariamente, o resumo aparecerá aqui."
          />
        </div>

        <div className="bg-card border border-border rounded-2xl shadow-card">
          <div className="p-5 border-b border-border flex items-center gap-2">
            <CalendarRange className="h-4 w-4 text-primary" />
            <h3 className="font-display font-semibold text-sm">Linha do tempo</h3>
          </div>
          <EmptyState
            icon={LineChart}
            title="Histórico vazio"
            description="Sua linha do tempo de humor ficará disponível após os primeiros registros."
          />
        </div>

        <div className="bg-card border border-border rounded-2xl shadow-card">
          <div className="p-5 border-b border-border flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h3 className="font-display font-semibold text-sm">Fatores que impactam</h3>
          </div>
          <EmptyState
            icon={Sparkles}
            title="Sem dados suficientes"
            description="Identificaremos padrões (rotina, carga, equipe) conforme você registrar seu humor."
          />
        </div>
      </div>
    </div>
  );
}
