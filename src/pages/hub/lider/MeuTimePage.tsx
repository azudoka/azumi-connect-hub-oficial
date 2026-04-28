import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, ChevronRight } from "lucide-react";
import {
  timeLider,
  statusColabStyle,
  iniciaisDe,
  type StatusColab,
} from "./_timeData";

type Filtro = "todos" | StatusColab;

const filtros: { v: Filtro; label: string }[] = [
  { v: "todos", label: "Todos" },
  { v: "ativo", label: "Ativos" },
  { v: "ferias", label: "Em férias" },
  { v: "afastado", label: "Afastados" },
];

export default function MeuTimePage() {
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const lista = timeLider.filter(
    (c) => filtro === "todos" || c.status === filtro
  );

  return (
    <div>
      <PageHeader
        title="Meu time"
        subtitle={`${timeLider.length} colaboradores diretos.`}
      />

      <div className="flex flex-wrap gap-2 mb-5">
        {filtros.map((f) => (
          <Button
            key={f.v}
            variant={filtro === f.v ? "default" : "outline"}
            className="rounded-full"
            size="sm"
            onClick={() => setFiltro(f.v)}
          >
            {f.label}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {lista.map((c) => {
          const s = statusColabStyle[c.status];
          return (
            <Link
              key={c.id}
              to={`/hub/lider/meu-time/${c.id}`}
              className="bg-card border border-border rounded-2xl p-5 shadow-card flex flex-col gap-4 transition-all hover:border-primary/40 hover:shadow-elevated"
            >
              <div className="flex items-start gap-3">
                <div className="h-14 w-14 rounded-md bg-secondary text-foreground/80 flex items-center justify-center text-base font-semibold shrink-0">
                  {iniciaisDe(c.nome)}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-display font-semibold truncate">{c.nome}</h3>
                  <p className="text-xs text-muted-foreground truncate">{c.cargo}</p>
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-1.5">
                    <Calendar className="h-3 w-3" />
                    Admissão: {c.admissao}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className={cn("badge-pill", s.cls)}>
                  <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
                  {s.label}
                </span>
                <span className="text-xs text-primary font-medium inline-flex items-center gap-1">
                  Ver perfil
                  <ChevronRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
