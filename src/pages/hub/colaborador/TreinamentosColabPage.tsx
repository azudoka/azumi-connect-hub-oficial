import { PageHeader } from "@/components/PageHeader";
import { useState } from "react";
import { treinamentosMock, type TreinamentoHub } from "@/data/hubMock";
import { HubModal } from "@/components/hub/HubModal";
import { Clock, Users, CheckCircle2, GraduationCap, MapPin, Monitor, Download } from "lucide-react";
import { cn } from "@/lib/utils";

export default function TreinamentosColabPage() {
  const [aberto, setAberto] = useState<TreinamentoHub | null>(null);

  return (
    <div>
      <PageHeader title="Treinamentos" subtitle="Trilhas de desenvolvimento disponíveis para você." />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {treinamentosMock.map((t) => {
          const Icon = t.modalidade === "Online" ? Monitor : MapPin;
          return (
            <button
              key={t.id}
              onClick={() => setAberto(t)}
              className="text-left bg-card border border-border rounded-2xl shadow-card overflow-hidden hover:border-primary/40 transition-colors"
            >
              <div className="aspect-[16/7] bg-muted overflow-hidden">
                <img src={t.capa} alt={t.titulo} className="w-full h-full object-cover" loading="lazy" />
              </div>
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border",
                      t.modalidade === "Online"
                        ? "bg-blue-500/15 text-blue-600 border-blue-500/30"
                        : "bg-amber-500/15 text-amber-600 border-amber-500/30"
                    )}
                  >
                    <Icon className="h-3 w-3" />
                    {t.modalidade}
                  </span>
                  <span className="text-xs text-muted-foreground font-data">{t.data}</span>
                </div>
                <div>
                  <h3 className="font-display font-semibold text-base">{t.titulo}</h3>
                  <p className="text-sm text-muted-foreground mt-1">Instrutor: {t.instrutor}</p>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-2">
                  <Mini icon={Clock} value={t.cargaHoraria} />
                  <Mini icon={Users} value={`${t.participantesAtual}/${t.participantesMax}`} />
                  <Mini icon={CheckCircle2} value={`${t.sla}%`} />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <HubModal open={!!aberto} onClose={() => setAberto(null)} size="md">
        {aberto && (
          <div className="p-6">
            <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
              <GraduationCap className="h-6 w-6" />
            </div>
            <h2 className="font-display text-2xl font-semibold mb-2">{aberto.titulo}</h2>
            <div className="flex items-center gap-2 mb-6">
              <span
                className={cn(
                  "inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full",
                  aberto.modalidade === "Online" ? "bg-blue-500/15 text-blue-600" : "bg-amber-500/15 text-amber-600"
                )}
              >
                {aberto.modalidade === "Online" ? <Monitor className="h-3 w-3" /> : <MapPin className="h-3 w-3" />}
                {aberto.modalidade}
              </span>
              <span className="text-sm text-muted-foreground font-data">{aberto.data}</span>
            </div>

            <dl className="space-y-3 border-y border-border py-4 mb-5">
              <Row label="Instrutor" value={aberto.instrutor} />
              <Row label="Carga horária" value={aberto.cargaHoraria} />
              <Row label="Participantes" value={`${aberto.participantesAtual}/${aberto.participantesMax}`} />
              <Row label="SLA de participação" value={`${aberto.sla}%`} />
            </dl>

            <div>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-3">Materiais</div>
              <div className="space-y-2">
                {aberto.materiais.map((m) => (
                  <a
                    key={m.label}
                    href={m.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <Download className="h-4 w-4" />
                    {m.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}
      </HubModal>
    </div>
  );
}

function Mini({ icon: Icon, value }: { icon: any; value: string }) {
  return (
    <div className="bg-secondary/50 rounded-lg py-2 flex flex-col items-center justify-center gap-1">
      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      <div className="text-sm font-semibold">{value}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
