import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { Activity, AlertTriangle, TrendingUp } from "lucide-react";

const alertas = [
  { titulo: "Sobrecarga em Operações", descricao: "3 colaboradores reportaram alta carga nas últimas 2 semanas." },
  { titulo: "Queda de humor às segundas", descricao: "Padrão recorrente identificado nos últimos registros." },
  { titulo: "Pouca interação no time", descricao: "Frequência de reuniões 1:1 abaixo do recomendado." },
];

export default function TermometroPage() {
  return (
    <div>
      <PageHeader
        title="Termômetro do time"
        subtitle="Acompanhe o humor coletivo e identifique pontos de atenção da sua equipe."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-2xl shadow-card">
          <div className="p-5 border-b border-border flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            <h3 className="font-display font-semibold text-sm">Humor médio do time (30 dias)</h3>
          </div>
          <EmptyState
            icon={Activity}
            title="Sem dados ainda"
            description="Quando o time registrar humor, o resumo coletivo aparecerá aqui."
          />
        </div>

        <div className="bg-card border border-border rounded-2xl shadow-card">
          <div className="p-5 border-b border-border flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <h3 className="font-display font-semibold text-sm">Tendência de humor</h3>
          </div>
          <EmptyState
            icon={TrendingUp}
            title="Em breve"
            description="Esta seção exibirá um gráfico de tendência semanal e mensal do time."
          />
        </div>

        <div className="bg-card border border-border rounded-2xl shadow-card">
          <div className="p-5 border-b border-border flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <h3 className="font-display font-semibold text-sm">Alertas de atenção</h3>
          </div>
          <ul className="p-5 space-y-3">
            {alertas.map((a) => (
              <li key={a.titulo} className="text-sm">
                <p className="font-medium">{a.titulo}</p>
                <p className="text-muted-foreground text-xs mt-0.5">{a.descricao}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
