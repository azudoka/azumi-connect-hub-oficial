// B08 — Card/widget de alertas de % de consumo de horas.
// Cada alerta mostra o NOME da empresa e leva direto para a página da empresa.
import { Link } from "react-router-dom";
import { AlertTriangle, ArrowRight, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { consumoNotificacoes, type ConsumoNotificacao } from "@/data/mock";

interface ConsumoAlertCardProps {
  /** "admin" linka para /app/empresas/:id, "cliente" para /cliente/gestao-conta */
  context?: "admin" | "cliente";
  /** Filtra por empresaId (útil no dashboard do cliente) */
  empresaId?: string;
  /** Limita a quantidade de itens */
  limit?: number;
  className?: string;
}

const sevColors: Record<ConsumoNotificacao["severidade"], string> = {
  critical: "border-l-destructive bg-destructive/5",
  warning:  "border-l-warning bg-warning/5",
  info:     "border-l-info bg-info/5",
};

const sevText: Record<ConsumoNotificacao["severidade"], string> = {
  critical: "text-destructive",
  warning:  "text-warning",
  info:     "text-info",
};

export function ConsumoAlertCard({ context = "admin", empresaId, limit = 4, className }: ConsumoAlertCardProps) {
  const itens = consumoNotificacoes
    .filter((n) => (empresaId ? n.empresaId === empresaId : true))
    .slice(0, limit);

  if (itens.length === 0) return null;

  function linkFor(n: ConsumoNotificacao) {
    return context === "admin" ? `/app/empresas/${n.empresaId}` : `/cliente/gestao-conta`;
  }

  return (
    <div className={cn("bg-card border border-border rounded-xl p-5 card-hover", className)}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-lg bg-warning/15 text-warning flex items-center justify-center">
            <AlertTriangle className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-sm">Alertas de consumo de horas</h3>
            <p className="text-[11px] text-muted-foreground">Empresas próximas ou acima do contratado</p>
          </div>
        </div>
      </div>

      <ul className="space-y-2">
        {itens.map((n) => (
          <li key={n.id}>
            <Link
              to={linkFor(n)}
              className={cn(
                "group block border-l-4 pl-3 pr-3 py-2.5 rounded-r-lg hover:bg-secondary/50 transition-colors",
                sevColors[n.severidade]
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium truncate">{n.empresa}</span>
                    <span className={cn("text-[11px] font-data font-semibold", sevText[n.severidade])}>
                      {n.percent}% consumido
                    </span>
                  </div>
                  <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                    <Clock className="h-3 w-3" />
                    <span className="font-data">{n.consumido}h / {n.contratadas}h</span>
                    <span>·</span>
                    <span>{n.quando}</span>
                  </div>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
              </div>

              {/* Barra de progresso */}
              <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    n.severidade === "critical" && "bg-destructive",
                    n.severidade === "warning" && "bg-warning",
                    n.severidade === "info" && "bg-primary",
                  )}
                  style={{ width: `${Math.min(100, n.percent)}%` }}
                />
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
