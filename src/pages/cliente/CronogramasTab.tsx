import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ChevronDown, GripVertical } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  COMPLEX_PILL,
  type ComplexidadeKey,
  type CronogramaCliente,
  formatPrazo,
} from "@/data/projetosCliente";
import {
  aprovarCronograma,
  reordenarCronograma,
  solicitarAjusteCronograma,
} from "@/data/useProjetosClienteStore";
import { cn } from "@/lib/utils";

const PILL_BASE =
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap";

interface Props {
  cronogramas: CronogramaCliente[];
}

export function CronogramasTab({ cronogramas }: Props) {
  const aguardando = useMemo(
    () => cronogramas.filter((c) => c.status === "aguardando_aprovacao_cliente"),
    [cronogramas]
  );
  const [expandido, setExpandido] = useState<string | null>(null);

  if (aguardando.length === 0) {
    return (
      <Card className="glass">
        <CardContent className="p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Nenhum cronograma aguardando aprovação no momento.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {aguardando.map((c) => (
        <Card key={c.id}>
          <CardContent className="p-0">
            <button
              type="button"
              onClick={() => setExpandido((cur) => (cur === c.id ? null : c.id))}
              className="w-full text-left p-4 flex items-start gap-3"
              aria-expanded={expandido === c.id}
            >
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="font-data text-xs text-muted-foreground">{c.codigo}</span>
                  <span className="text-sm font-semibold">{c.nome}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Enviado por {c.consultor} ·{" "}
                  {format(new Date(c.enviadoEm), "dd/MM/yyyy", { locale: ptBR })}
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-primary font-medium">
                Ver e aprovar
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform",
                    expandido === c.id && "rotate-180"
                  )}
                />
              </div>
            </button>

            {expandido === c.id && <CronogramaDetalhe cronograma={c} />}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function CronogramaDetalhe({ cronograma }: { cronograma: CronogramaCliente }) {
  const [confirmAprovar, setConfirmAprovar] = useState(false);
  const [ajusteOpen, setAjusteOpen] = useState(false);
  const [ajusteObs, setAjusteObs] = useState("");
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const limiteAtingido = cronograma.alteracoesUsadas >= 2;

  function handleDragStart(id: string) {
    if (limiteAtingido) {
      toast.error("Limite de 2 alterações atingido. Não é possível reordenar.");
      return;
    }
    setDraggingId(id);
  }

  function handleDrop(targetId: string) {
    if (!draggingId || limiteAtingido) {
      setDraggingId(null);
      return;
    }
    if (draggingId === targetId) {
      setDraggingId(null);
      return;
    }
    const items = cronograma.entregaveis;
    const src = items.find((e) => e.id === draggingId);
    const dst = items.find((e) => e.id === targetId);
    if (!src || !dst) {
      setDraggingId(null);
      return;
    }
    if (src.complexidade !== dst.complexidade) {
      toast.error(
        "Não é possível alterar a ordem entre entregáveis de complexidades diferentes."
      );
      setDraggingId(null);
      return;
    }
    const nova = items.map((e) => e.id);
    const fromIdx = nova.indexOf(draggingId);
    const toIdx = nova.indexOf(targetId);
    nova.splice(fromIdx, 1);
    nova.splice(toIdx, 0, draggingId);
    reordenarCronograma(cronograma.id, nova, true);
    setDraggingId(null);
  }

  function confirmarAjuste() {
    if (ajusteObs.trim().length < 20) {
      toast.error("Descreva o ajuste com pelo menos 20 caracteres.");
      return;
    }
    solicitarAjusteCronograma(cronograma.id, ajusteObs.trim());
    toast.success("Ajuste solicitado. O consultor será notificado.");
    setAjusteOpen(false);
    setAjusteObs("");
  }

  function confirmarAprovacao() {
    const r = aprovarCronograma(cronograma.id);
    setConfirmAprovar(false);
    if (r) {
      toast.success(`Cronograma aprovado — projeto ${r.novoCodigo} criado!`);
    }
  }

  return (
    <div className="px-4 pb-4 pt-0 border-t border-border/60 space-y-4">
      <p className="text-xs text-muted-foreground pt-3">
        Você utilizou{" "}
        <span className="text-foreground font-semibold">{cronograma.alteracoesUsadas}</span> de
        2 alterações disponíveis.
        {limiteAtingido && (
          <span className="block mt-1 text-muted-foreground">
            Limite de alterações atingido.
          </span>
        )}
      </p>

      <ul className="space-y-2">
        {cronograma.entregaveis.map((e) => (
          <li
            key={e.id}
            draggable={!limiteAtingido}
            onDragStart={() => handleDragStart(e.id)}
            onDragOver={(ev) => ev.preventDefault()}
            onDrop={() => handleDrop(e.id)}
            className={cn(
              "flex items-center gap-3 p-3 rounded-lg border bg-card",
              !limiteAtingido && "cursor-grab active:cursor-grabbing",
              draggingId === e.id && "opacity-60 ring-1 ring-primary"
            )}
          >
            <GripVertical
              className={cn(
                "h-4 w-4 shrink-0",
                limiteAtingido ? "text-muted-foreground/30" : "text-muted-foreground"
              )}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{e.nome}</p>
              <p className="text-xs text-muted-foreground">{e.frente}</p>
            </div>
            <span className={cn(PILL_BASE, COMPLEX_PILL[e.complexidade as ComplexidadeKey])}>
              {e.complexidade}
            </span>
            <span className="text-xs text-muted-foreground hidden sm:inline">
              {formatPrazo(e.prazo)}
            </span>
            <span className="text-xs font-data tabular-nums hidden md:inline">
              {e.tempoEstimado}
            </span>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
        <Button
          variant="outline"
          size="sm"
          className="rounded-full"
          onClick={() => setAjusteOpen(true)}
        >
          Solicitar ajuste
        </Button>
        <Button
          size="sm"
          className="rounded-full"
          onClick={() => setConfirmAprovar(true)}
        >
          Aprovar cronograma
        </Button>
      </div>

      {/* Confirmação de aprovação */}
      <Dialog open={confirmAprovar} onOpenChange={setConfirmAprovar}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Aprovar cronograma?</DialogTitle>
            <DialogDescription>
              Ao aprovar, o cronograma se torna um projeto ativo. Essa ação é irreversível.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => setConfirmAprovar(false)}
            >
              Cancelar
            </Button>
            <Button className="rounded-full" onClick={confirmarAprovacao}>
              Confirmar aprovação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Solicitar ajuste */}
      <Dialog open={ajusteOpen} onOpenChange={setAjusteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Solicitar ajuste no cronograma</DialogTitle>
            <DialogDescription>
              Descreva o que precisa ser ajustado (mín. 20 caracteres).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="cron-ajuste-obs">Observação</Label>
            <Textarea
              id="cron-ajuste-obs"
              rows={4}
              className="resize-none"
              value={ajusteObs}
              onChange={(e) => setAjusteObs(e.target.value)}
              placeholder="Ex.: gostaríamos de antecipar a entrega 2 e ajustar o escopo da 4."
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => setAjusteOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              className="rounded-full"
              disabled={ajusteObs.trim().length < 20}
              onClick={confirmarAjuste}
            >
              Confirmar ajuste
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
