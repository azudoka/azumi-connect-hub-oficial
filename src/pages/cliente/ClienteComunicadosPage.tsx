import { useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { Megaphone } from "lucide-react";
import { cn } from "@/lib/utils";
import { listarComunicados, type Comunicado } from "@/services/comunicados";

// TODO: substituir por usuario.empresaId quando Auth real existir.
const CLIENTE_ID = "demo";

const tipoCls: Record<string, string> = {
  Endomarketing: "bg-pink-500/15 text-pink-600",
  Atualização:   "bg-blue-500/15 text-blue-600",
  Aviso:         "bg-amber-500/15 text-amber-600",
  Alerta:        "bg-red-500/15 text-red-600",
  Evento:        "bg-emerald-500/15 text-emerald-600",
};

const statusCls = {
  Enviado:  "bg-emerald-500/15 text-emerald-600",
  Agendado: "bg-amber-500/15 text-amber-600",
} as const;

function formatarData(iso: string): string {
  const [ano, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${ano}`;
}

/** data <= hoje → Enviado; data > hoje → Agendado */
function derivarStatus(iso: string): "Enviado" | "Agendado" {
  return iso <= new Date().toISOString().slice(0, 10) ? "Enviado" : "Agendado";
}

export default function ClienteComunicadosPage() {
  const [comunicados, setComunicados] = useState<Comunicado[]>([]);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    setLoading(true);
    listarComunicados(CLIENTE_ID).then((data) => {
      setComunicados(data);
      setLoading(false);
    });
  }, []);

  return (
    <div>
      <PageHeader
        title="Comunicados"
        subtitle="Comunicações enviadas pela Azumi para sua empresa."
      />

      {loading && (
        <div className="bg-card border border-border rounded-2xl shadow-card overflow-hidden animate-pulse">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="px-5 py-4 flex gap-4 border-b border-border last:border-0">
              <div className="h-3 w-16 bg-muted rounded" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-muted rounded w-1/2" />
                <div className="h-3 bg-muted rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && comunicados.length === 0 && (
        <div className="bg-card border border-border rounded-xl">
          <EmptyState
            icon={Megaphone}
            title="Nenhum comunicado"
            description="Ainda não há comunicados registrados para sua empresa."
          />
        </div>
      )}

      {!loading && comunicados.length > 0 && (
        <div className="bg-card border border-border rounded-2xl shadow-card overflow-hidden">
          <ul className="divide-y divide-border">
            {comunicados.map((c) => {
              const status = derivarStatus(c.data);
              return (
                <li key={c.id} className="px-5 py-4 flex flex-col sm:flex-row sm:items-start gap-3 hover:bg-secondary/20 transition-colors">
                  <div className="shrink-0 w-20 text-xs text-muted-foreground font-data pt-0.5">
                    {formatarData(c.data)}
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <p className="text-sm font-medium leading-snug">{c.titulo}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{c.conteudo}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={cn("text-[11px] font-medium px-2 py-0.5 rounded-full", tipoCls[c.categoria] || "bg-secondary")}>
                      {c.categoria}
                    </span>
                    <span className={cn("text-[11px] font-medium px-2 py-0.5 rounded-full", statusCls[status])}>
                      {status}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
