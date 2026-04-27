import { PageHeader } from "@/components/PageHeader";
import { KpiCard } from "@/components/KpiCard";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  CalendarIcon,
  CalendarCheck,
  CalendarClock,
  CalendarDays,
  Lock,
  Plane,
  Plus,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type StatusFerias = "aprovada" | "pendente" | "recusada";
const statusStyle: Record<StatusFerias, { label: string; cls: string }> = {
  aprovada: { label: "Aprovada", cls: "bg-success/15 text-success border-success/30" },
  pendente: { label: "Pendente", cls: "bg-warning/15 text-warning border-warning/30" },
  recusada: { label: "Recusada", cls: "bg-destructive/15 text-destructive border-destructive/30" },
};

interface Periodo {
  id: string;
  inicio: Date;
  fim: Date;
  status: StatusFerias;
  aprovador: string;
}

const periodosIniciais: Periodo[] = [
  {
    id: "f1",
    inicio: new Date(2026, 6, 1),
    fim: new Date(2026, 6, 10),
    status: "aprovada",
    aprovador: "Renata Carvalho",
  },
  {
    id: "f2",
    inicio: new Date(2026, 11, 20),
    fim: new Date(2026, 11, 30),
    status: "pendente",
    aprovador: "—",
  },
  {
    id: "f3",
    inicio: new Date(2025, 9, 15),
    fim: new Date(2025, 9, 27),
    status: "aprovada",
    aprovador: "Renata Carvalho",
  },
];

function diffDias(a: Date, b: Date) {
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24)) + 1;
}

function sobrepoe(a1: Date, a2: Date, b1: Date, b2: Date) {
  return a1 <= b2 && b1 <= a2;
}

export default function ColaboradorFerias() {
  const [periodos, setPeriodos] = useState<Periodo[]>(periodosIniciais);
  const [open, setOpen] = useState(false);
  const [inicio, setInicio] = useState<Date | undefined>();
  const [fim, setFim] = useState<Date | undefined>();
  const [obs, setObs] = useState("");

  function reset() {
    setInicio(undefined);
    setFim(undefined);
    setObs("");
  }

  function solicitar() {
    if (!inicio || !fim) {
      toast.error("Selecione as datas de início e fim.");
      return;
    }
    if (diffDias(inicio, fim) < 5) {
      toast.error("O período mínimo é de 5 dias.");
      return;
    }
    const conflito = periodos.some(
      (p) => p.status === "aprovada" && sobrepoe(p.inicio, p.fim, inicio, fim)
    );
    if (conflito) {
      toast.error("Período se sobrepõe a férias já aprovadas.");
      return;
    }
    setPeriodos((prev) => [
      ...prev,
      {
        id: `f${Date.now()}`,
        inicio,
        fim,
        status: "pendente",
        aprovador: "—",
      },
    ]);
    toast.success("Solicitação de férias enviada ao seu líder.");
    setOpen(false);
    reset();
  }

  return (
    <TooltipProvider>
      <div>
        <PageHeader
          title="Férias"
          subtitle="Acompanhe seus dias e solicite novos períodos."
          actions={
            <Button className="rounded-full" onClick={() => setOpen(true)}>
              <Plus className="h-4 w-4 mr-1.5" />
              Solicitar férias
            </Button>
          }
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <KpiCard label="Dias disponíveis" value={18} icon={CalendarDays} />
          <KpiCard label="Dias agendados" value={10} icon={CalendarClock} />
          <KpiCard label="Dias usufruídos" value={12} icon={CalendarCheck} />
        </div>

        <section className="bg-card border border-border rounded-2xl shadow-card">
          <div className="p-5 border-b border-border">
            <h2 className="font-display text-lg font-semibold flex items-center gap-2">
              <Plane className="h-4 w-4 text-primary" />
              Períodos solicitados
            </h2>
          </div>
          <ul className="divide-y divide-border">
            {periodos
              .slice()
              .sort((a, b) => b.inicio.getTime() - a.inicio.getTime())
              .map((p) => (
                <li key={p.id} className="p-5 flex flex-wrap items-center gap-4">
                  <div className="flex-1 min-w-[200px]">
                    <div className="text-sm font-medium">
                      {format(p.inicio, "dd/MM/yyyy", { locale: ptBR })} –{" "}
                      {format(p.fim, "dd/MM/yyyy", { locale: ptBR })}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {diffDias(p.inicio, p.fim)} dias · Aprovador: {p.aprovador}
                    </div>
                  </div>
                  <span className={cn("badge-pill shrink-0", statusStyle[p.status].cls)}>
                    <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
                    {statusStyle[p.status].label}
                  </span>
                  {p.status === "aprovada" && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full"
                          disabled
                        >
                          <Lock className="h-3.5 w-3.5 mr-1.5" />
                          Cancelar
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        Para cancelar, entre em contato com seu líder.
                      </TooltipContent>
                    </Tooltip>
                  )}
                </li>
              ))}
          </ul>
        </section>

        <Dialog
          open={open}
          onOpenChange={(v) => {
            setOpen(v);
            if (!v) reset();
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Solicitar férias</DialogTitle>
              <DialogDescription>
                Período mínimo de 5 dias. Sua solicitação será enviada ao líder.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Data início</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full mt-1 justify-start text-left font-normal rounded-lg",
                          !inicio && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        {inicio ? format(inicio, "dd/MM/yyyy", { locale: ptBR }) : "Selecione"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={inicio}
                        onSelect={(d) => {
                          setInicio(d);
                          if (d && fim && diffDias(d, fim) < 5) setFim(undefined);
                        }}
                        disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                        initialFocus
                        locale={ptBR}
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <Label className="text-xs">Data fim</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full mt-1 justify-start text-left font-normal rounded-lg",
                          !fim && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        {fim ? format(fim, "dd/MM/yyyy", { locale: ptBR }) : "Selecione"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={fim}
                        onSelect={setFim}
                        disabled={(d) => {
                          if (!inicio) return true;
                          const min = new Date(inicio);
                          min.setDate(min.getDate() + 4);
                          return d < min;
                        }}
                        initialFocus
                        locale={ptBR}
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div>
                <Label className="text-xs">Observação (opcional)</Label>
                <Textarea
                  value={obs}
                  onChange={(e) => setObs(e.target.value)}
                  placeholder="Algo que seu líder precisa saber?"
                  className="mt-1"
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" className="rounded-full" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button className="rounded-full" onClick={solicitar}>
                Enviar solicitação
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
