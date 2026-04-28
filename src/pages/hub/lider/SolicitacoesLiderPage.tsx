import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Check, HeartPulse, Home, Plane, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { iniciaisDe } from "./_timeData";

type Tipo = "ferias" | "home_office" | "atestado";
type StatusSol = "pendente" | "aprovada" | "recusada";

const tipoStyle: Record<
  Tipo,
  { label: string; cls: string; Icon: typeof Plane }
> = {
  ferias: {
    label: "Férias",
    cls: "bg-info/15 text-info border-info/30",
    Icon: Plane,
  },
  home_office: {
    label: "Home office",
    cls: "bg-primary/15 text-primary border-primary/30",
    Icon: Home,
  },
  atestado: {
    label: "Atestado",
    cls: "bg-warning/15 text-warning border-warning/30",
    Icon: HeartPulse,
  },
};

const statusStyle: Record<StatusSol, { label: string; cls: string }> = {
  pendente: { label: "Pendente", cls: "bg-warning/15 text-warning border-warning/30" },
  aprovada: { label: "Aprovada", cls: "bg-success/15 text-success border-success/30" },
  recusada: { label: "Recusada", cls: "bg-destructive/15 text-destructive border-destructive/30" },
};

interface SolLider {
  id: string;
  colaborador: string;
  tipo: Tipo;
  periodo: string;
  enviado: string;
  status: StatusSol;
}

const INICIAL: SolLider[] = [
  { id: "s1", colaborador: "Marina Costa", tipo: "ferias", periodo: "02/06/2026 a 16/06/2026", enviado: "22/04/2026", status: "pendente" },
  { id: "s2", colaborador: "Pedro Alves", tipo: "home_office", periodo: "29/04/2026 (1 dia)", enviado: "26/04/2026", status: "pendente" },
  { id: "s3", colaborador: "Beatriz Lins", tipo: "atestado", periodo: "20/04/2026 a 26/04/2026", enviado: "20/04/2026", status: "aprovada" },
  { id: "s4", colaborador: "Lucas Ferreira", tipo: "ferias", periodo: "10/07/2026 a 24/07/2026", enviado: "18/04/2026", status: "aprovada" },
  { id: "s5", colaborador: "Juliana Lima", tipo: "home_office", periodo: "05/05/2026 (1 dia)", enviado: "25/04/2026", status: "pendente" },
  { id: "s6", colaborador: "Rafael Mendes", tipo: "atestado", periodo: "15/03/2026 (1 dia)", enviado: "15/03/2026", status: "recusada" },
];

export default function SolicitacoesLiderPage() {
  const [items, setItems] = useState<SolLider[]>(INICIAL);
  const [confirma, setConfirma] = useState<{
    id: string;
    acao: "aprovada" | "recusada";
  } | null>(null);
  const [obs, setObs] = useState("");

  function aplicar() {
    if (!confirma) return;
    setItems((prev) =>
      prev.map((s) =>
        s.id === confirma.id ? { ...s, status: confirma.acao } : s
      )
    );
    toast.success(
      `Solicitação ${confirma.acao === "aprovada" ? "aprovada" : "recusada"}.`
    );
    setConfirma(null);
    setObs("");
  }

  return (
    <div>
      <PageHeader
        title="Solicitações do time"
        subtitle="Aprove ou recuse pedidos enviados pelos seus colaboradores."
      />

      <section className="bg-card border border-border rounded-2xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left font-medium px-4 py-3">Colaborador</th>
                <th className="text-left font-medium px-4 py-3">Tipo</th>
                <th className="text-left font-medium px-4 py-3">Período / Data</th>
                <th className="text-left font-medium px-4 py-3">Enviado em</th>
                <th className="text-left font-medium px-4 py-3">Status</th>
                <th className="text-right font-medium px-4 py-3">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((s) => {
                const t = tipoStyle[s.tipo];
                const TIcon = t.Icon;
                const st = statusStyle[s.status];
                return (
                  <tr key={s.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-md bg-secondary text-foreground/80 flex items-center justify-center text-[10px] font-semibold">
                          {iniciaisDe(s.colaborador)}
                        </div>
                        <span className="font-medium">{s.colaborador}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("badge-pill", t.cls)}>
                        <TIcon className="h-3 w-3" />
                        {t.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-data text-foreground/90">{s.periodo}</td>
                    <td className="px-4 py-3 text-muted-foreground font-data">{s.enviado}</td>
                    <td className="px-4 py-3">
                      <span className={cn("badge-pill", st.cls)}>
                        <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
                        {st.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {s.status === "pendente" ? (
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            className="rounded-full bg-success text-success-foreground hover:bg-success/90"
                            onClick={() => setConfirma({ id: s.id, acao: "aprovada" })}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Aprovar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-full text-destructive border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => setConfirma({ id: s.id, acao: "recusada" })}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Recusar
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground italic flex justify-end">
                          —
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <Dialog
        open={!!confirma}
        onOpenChange={(v) => {
          if (!v) {
            setConfirma(null);
            setObs("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirma?.acao === "aprovada"
                ? "Aprovar solicitação"
                : "Recusar solicitação"}
            </DialogTitle>
            <DialogDescription>
              {confirma?.acao === "aprovada"
                ? "Confirme a aprovação. O colaborador será notificado."
                : "Confirme a recusa. Recomendamos justificar para o colaborador."}
            </DialogDescription>
          </DialogHeader>
          <div>
            <Label className="text-xs">Observação (opcional)</Label>
            <Textarea
              value={obs}
              onChange={(e) => setObs(e.target.value)}
              rows={3}
              className="mt-1"
              placeholder="Mensagem para o colaborador…"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => {
                setConfirma(null);
                setObs("");
              }}
            >
              Cancelar
            </Button>
            <Button
              className={cn(
                "rounded-full",
                confirma?.acao === "recusada" &&
                  "bg-destructive text-destructive-foreground hover:bg-destructive/90"
              )}
              onClick={aplicar}
            >
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
