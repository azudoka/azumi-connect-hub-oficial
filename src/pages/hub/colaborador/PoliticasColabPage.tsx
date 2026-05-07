import { PageHeader } from "@/components/PageHeader";
import { useState, useMemo } from "react";
import { politicasMock, type PoliticaCategoria, type PoliticaHub, type PoliticaStatus } from "@/data/hubMock";
import { HubModal } from "@/components/hub/HubModal";
import { FileText, Eye, CheckCircle2, AlertCircle, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const categorias: ("Todas" | PoliticaCategoria)[] = ["Todas", "Governança", "Operação", "Compliance", "RH"];

const statusBar: Record<PoliticaStatus, string> = {
  assinada: "bg-emerald-500",
  visualizada: "bg-amber-500",
  pendente: "bg-blue-500",
  em_revisao: "bg-amber-500",
};

const statusBadge: Record<PoliticaStatus, { label: string; cls: string; icon: any } | null> = {
  assinada: { label: "Assinada", cls: "text-emerald-600", icon: CheckCircle2 },
  visualizada: { label: "Visualizada", cls: "text-amber-600", icon: Eye },
  pendente: null,
  em_revisao: { label: "Em Revisão", cls: "text-amber-600", icon: AlertCircle },
};

export default function PoliticasColabPage() {
  const [filtro, setFiltro] = useState<"Todas" | PoliticaCategoria>("Todas");
  const [politicas, setPoliticas] = useState<PoliticaHub[]>(politicasMock);
  const [aberta, setAberta] = useState<PoliticaHub | null>(null);

  const lista = useMemo(
    () => (filtro === "Todas" ? politicas : politicas.filter((p) => p.categoria === filtro)),
    [politicas, filtro]
  );

  function assinar(id: string) {
    setPoliticas((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, status: "assinada", assinaturas: Math.min(p.total, p.assinaturas + 1) }
          : p
      )
    );
    setAberta((prev) => (prev ? { ...prev, status: "assinada" } : prev));
    toast.success("Ciência registrada com sucesso!");
  }

  return (
    <div>
      <PageHeader
        title="Políticas Internas"
        subtitle="Consulte e dê ciência nas políticas vigentes da empresa."
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="h-4 w-4 text-muted-foreground" />
            {categorias.map((c) => (
              <button
                key={c}
                onClick={() => setFiltro(c)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                  filtro === c
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                )}
              >
                {c}
              </button>
            ))}
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {lista.map((p) => {
          const badge = statusBadge[p.status];
          const Icon = badge?.icon;
          return (
            <button
              key={p.id}
              onClick={() => setAberta(p)}
              className="text-left bg-card border border-border rounded-2xl shadow-card overflow-hidden flex flex-col hover:border-primary/40 transition-colors"
            >
              <div className="aspect-[16/9] bg-muted overflow-hidden">
                <img src={p.capa} alt={p.titulo} className="w-full h-full object-cover" loading="lazy" />
              </div>
              <div className={cn("h-1 w-full", statusBar[p.status])} />
              <div className="p-4 flex flex-col gap-1.5 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-display font-semibold text-base">{p.titulo}</h3>
                  {p.status === "assinada" && <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-1" />}
                </div>
                <div className="text-xs text-muted-foreground">
                  {p.categoria} · {p.tipo} · {p.versao}
                </div>
                <div className="text-xs text-muted-foreground">{p.assinaturas}/{p.total} assinaturas</div>
                {badge && Icon && (
                  <div className={cn("inline-flex items-center gap-1 text-xs font-medium mt-1", badge.cls)}>
                    <Icon className="h-3.5 w-3.5" />
                    {badge.label}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <HubModal open={!!aberta} onClose={() => setAberta(null)} size="md">
        {aberta && (
          <>
            <div className="aspect-[16/9] bg-muted">
              <img src={aberta.capa} alt={aberta.titulo} className="w-full h-full object-cover" />
            </div>
            <div className="p-6 space-y-5">
              <div>
                <h2 className="font-display text-xl font-semibold">{aberta.titulo}</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {aberta.categoria} · {aberta.tipo} · Versão {aberta.versao.replace("v", "")}
                </p>
              </div>

              <button className="w-full border-2 border-dashed border-primary/40 bg-primary/5 hover:bg-primary/10 rounded-xl py-5 flex items-center justify-center gap-2 text-primary font-medium transition-colors">
                <FileText className="h-5 w-5" />
                Visualizar PDF da Política
              </button>

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {aberta.visualizacoes} visualizações · {aberta.assinaturas} assinaturas
                </span>
                <button
                  disabled={aberta.status === "assinada"}
                  onClick={() => assinar(aberta.id)}
                  className={cn(
                    "px-5 py-2 rounded-full text-sm font-medium transition-colors",
                    aberta.status === "assinada"
                      ? "bg-emerald-500/15 text-emerald-600 cursor-default"
                      : "bg-primary text-primary-foreground hover:bg-primary/90"
                  )}
                >
                  {aberta.status === "assinada" ? "Assinada ✓" : "Assinar ciência"}
                </button>
              </div>
            </div>
          </>
        )}
      </HubModal>
    </div>
  );
}
