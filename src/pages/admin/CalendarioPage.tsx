import { useMemo, useState } from "react";
import {
  ChevronLeft, ChevronRight, Plus, X, MapPin, Clock, Users,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type EventoTipo = "feriado_nacional" | "feriado_obrigatorio" | "reuniao" | "entrevista" | "prazo" | "ferias";

interface Evento {
  id: string;
  titulo: string;
  data: string; // YYYY-MM-DD
  hora?: string;
  local?: string;
  participantes?: string[];
  tipo: EventoTipo;
  visibilidade: "interno" | "empresa" | "todos";
  empresa?: string;
}

const TIPO_LABEL: Record<EventoTipo, string> = {
  feriado_nacional:    "Feriado nacional",
  feriado_obrigatorio: "Feriado obrigatório",
  reuniao:             "Reunião",
  entrevista:          "Entrevista",
  prazo:               "Prazo de entregável",
  ferias:              "Férias",
};
const TIPO_COR: Record<EventoTipo, string> = {
  feriado_nacional:    "bg-pink-500",
  feriado_obrigatorio: "bg-red-600",
  reuniao:             "bg-[#3B82F6]",
  entrevista:          "bg-[#8B5CF6]",
  prazo:               "bg-orange-500",
  ferias:              "bg-emerald-500",
};
const TIPO_TXT: Record<EventoTipo, string> = {
  feriado_nacional:    "text-pink-500",
  feriado_obrigatorio: "text-red-600",
  reuniao:             "text-[#3B82F6]",
  entrevista:          "text-[#8B5CF6]",
  prazo:               "text-orange-500",
  ferias:              "text-emerald-500",
};

const HOJE = new Date();
const Y = HOJE.getFullYear();
const M = HOJE.getMonth();
const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const EVENTOS: Evento[] = [
  { id: "EV-1", titulo: "Reunião de Planejamento Q2",  data: fmt(new Date(Y, M, 3)),  hora: "10:00", tipo: "reuniao",             visibilidade: "interno", participantes: ["Marina", "Rafael"] },
  { id: "EV-2", titulo: "Entrevista — Dev Pleno",      data: fmt(new Date(Y, M, 5)),  hora: "14:30", tipo: "entrevista",          visibilidade: "interno" },
  { id: "EV-3", titulo: "Prazo Diagnóstico DISC",      data: fmt(new Date(Y, M, 10)),                tipo: "prazo",               visibilidade: "empresa", empresa: "Empresa X" },
  { id: "EV-4", titulo: "Feriado — Tiradentes",        data: fmt(new Date(Y, M, 21)),                tipo: "feriado_nacional",    visibilidade: "todos" },
  { id: "EV-5", titulo: "Reunião com Empresa X",       data: fmt(new Date(Y, M, 14)),  hora: "09:00", tipo: "reuniao",            visibilidade: "empresa", empresa: "Empresa X" },
  { id: "EV-6", titulo: "Férias — Ana Beatriz",        data: fmt(new Date(Y, M, 18)),                tipo: "ferias",              visibilidade: "interno" },
  { id: "EV-7", titulo: "Entrevista — Designer",       data: fmt(new Date(Y, M, 22)), hora: "16:00", tipo: "entrevista",          visibilidade: "interno" },
  { id: "EV-8", titulo: "Prazo entrega Relatório Q1",  data: fmt(new Date(Y, M, 28)),                tipo: "prazo",               visibilidade: "empresa", empresa: "Grupo Zeta" },
  { id: "EV-9", titulo: "Convenção Coletiva (assinatura)", data: fmt(new Date(Y, M, 26)),            tipo: "feriado_obrigatorio", visibilidade: "todos" },
];

function startOfMonth(y: number, m: number) { return new Date(y, m, 1); }
function endOfMonth(y: number, m: number)   { return new Date(y, m + 1, 0); }
function startOfWeek(d: Date) {
  const r = new Date(d); r.setDate(d.getDate() - d.getDay()); return r;
}

const NOMES_MES = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const DIAS_SEM = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];

export default function CalendarioPage() {
  const [view, setView]   = useState<"mes" | "semana">("mes");
  const [cursor, setCursor] = useState(new Date(Y, M, 1));
  const [evSel, setEvSel] = useState<Evento | null>(null);
  const [novoOpen, setNovoOpen] = useState(false);

  const eventosPorData = useMemo(() => {
    const m = new Map<string, Evento[]>();
    EVENTOS.forEach((e) => {
      const arr = m.get(e.data) ?? [];
      arr.push(e);
      m.set(e.data, arr);
    });
    return m;
  }, []);

  function nav(delta: number) {
    const r = new Date(cursor);
    if (view === "mes") r.setMonth(r.getMonth() + delta);
    else r.setDate(r.getDate() + delta * 7);
    setCursor(r);
  }

  // Build cells
  const cells = useMemo(() => {
    if (view === "mes") {
      const ini = startOfMonth(cursor.getFullYear(), cursor.getMonth());
      const fim = endOfMonth(cursor.getFullYear(), cursor.getMonth());
      const start = startOfWeek(ini);
      const days: Date[] = [];
      const total = Math.ceil((fim.getDate() + ini.getDay()) / 7) * 7;
      for (let i = 0; i < total; i++) {
        const d = new Date(start); d.setDate(start.getDate() + i); days.push(d);
      }
      return days;
    } else {
      const start = startOfWeek(cursor);
      return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(start); d.setDate(start.getDate() + i); return d;
      });
    }
  }, [view, cursor]);

  const titulo = view === "mes"
    ? `${NOMES_MES[cursor.getMonth()]} ${cursor.getFullYear()}`
    : (() => {
        const s = startOfWeek(cursor);
        const e = new Date(s); e.setDate(s.getDate() + 6);
        return `${s.getDate()}/${s.getMonth() + 1} – ${e.getDate()}/${e.getMonth() + 1}, ${e.getFullYear()}`;
      })();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Calendário"
        subtitle="Eventos, prazos, entrevistas e feriados"
        actions={
          <Button onClick={() => setNovoOpen(true)} className="rounded-[100px] bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white">
            <Plus className="h-4 w-4" /> Novo evento
          </Button>
        }
      />

      <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="rounded-[100px] h-9 w-9" onClick={() => nav(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="font-semibold capitalize min-w-[200px] text-center">{titulo}</div>
          <Button variant="outline" size="icon" className="rounded-[100px] h-9 w-9" onClick={() => nav(1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" className="rounded-[100px] ml-2" onClick={() => setCursor(new Date())}>Hoje</Button>
        </div>
        <div className="inline-flex items-center bg-muted rounded-[100px] p-1">
          <button
            onClick={() => setView("mes")}
            className={cn("px-3 py-1 rounded-[100px] text-sm transition", view === "mes" ? "bg-card shadow-sm" : "text-muted-foreground")}
          >
            Mês
          </button>
          <button
            onClick={() => setView("semana")}
            className={cn("px-3 py-1 rounded-[100px] text-sm transition", view === "semana" ? "bg-card shadow-sm" : "text-muted-foreground")}
          >
            Semana
          </button>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="grid grid-cols-7 bg-muted/40">
          {DIAS_SEM.map((d) => (
            <div key={d} className="px-3 py-2 text-xs font-medium text-muted-foreground text-center">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 auto-rows-fr">
          {cells.map((d, i) => {
            const key = fmt(d);
            const evs = eventosPorData.get(key) ?? [];
            const sameMonth = view === "semana" || d.getMonth() === cursor.getMonth();
            const isHoje = key === fmt(new Date());
            return (
              <div
                key={i}
                className={cn(
                  "border-t border-l border-border p-2 min-h-[100px] flex flex-col gap-1",
                  view === "semana" && "min-h-[260px]",
                  i % 7 === 6 && "border-r-0",
                  !sameMonth && "bg-muted/20",
                )}
              >
                <div className={cn(
                  "text-xs font-medium self-end h-6 w-6 flex items-center justify-center rounded-md",
                  isHoje ? "bg-[#3B82F6] text-white" : sameMonth ? "text-foreground" : "text-muted-foreground",
                )}>
                  {d.getDate()}
                </div>
                <div className="flex flex-col gap-1 overflow-hidden">
                  {evs.slice(0, view === "mes" ? 3 : 12).map((e) => (
                    <button
                      key={e.id}
                      onClick={() => setEvSel(e)}
                      className="text-left text-xs px-1.5 py-1 rounded-md bg-card border border-border hover:border-foreground/30 transition flex items-center gap-1.5 truncate"
                    >
                      <span className={cn("h-2 w-2 rounded-sm shrink-0", TIPO_COR[e.tipo])} />
                      <span className="truncate">{e.hora && <span className="text-muted-foreground mr-1">{e.hora}</span>}{e.titulo}</span>
                    </button>
                  ))}
                  {evs.length > 3 && view === "mes" && (
                    <span className="text-[10px] text-muted-foreground px-1.5">+{evs.length - 3} mais</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legenda */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Legenda</div>
        <div className="flex flex-wrap gap-3">
          {(Object.keys(TIPO_LABEL) as EventoTipo[]).map((t) => (
            <span key={t} className="inline-flex items-center gap-1.5 text-sm">
              <span className={cn("h-3 w-3 rounded-sm", TIPO_COR[t])} />
              {TIPO_LABEL[t]}
            </span>
          ))}
        </div>
      </div>

      {/* Detalhe evento */}
      <Dialog open={!!evSel} onOpenChange={(v) => !v && setEvSel(null)}>
        <DialogContent className="sm:max-w-md rounded-xl">
          {evSel && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-start gap-2">
                  <span className={cn("h-3 w-3 rounded-sm mt-1.5", TIPO_COR[evSel.tipo])} />
                  <span>{evSel.titulo}</span>
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-2 text-sm">
                <div className={cn("inline-flex items-center gap-1.5 text-xs font-medium", TIPO_TXT[evSel.tipo])}>
                  {TIPO_LABEL[evSel.tipo]}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{evSel.data}{evSel.hora ? ` · ${evSel.hora}` : ""}</span>
                </div>
                {evSel.local && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />{evSel.local}
                  </div>
                )}
                {evSel.participantes?.length ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4" />{evSel.participantes.join(", ")}
                  </div>
                ) : null}
                {evSel.empresa && (
                  <div className="text-muted-foreground">Empresa: <span className="text-foreground font-medium">{evSel.empresa}</span></div>
                )}
                <div className="text-muted-foreground">Visibilidade: <span className="text-foreground font-medium capitalize">{evSel.visibilidade}</span></div>
              </div>
              <DialogFooter>
                <Button variant="outline" className="rounded-[100px]" onClick={() => setEvSel(null)}>Fechar</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Novo evento */}
      <Dialog open={novoOpen} onOpenChange={setNovoOpen}>
        <DialogContent className="sm:max-w-md rounded-xl">
          <DialogHeader><DialogTitle>Novo evento</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5"><Label>Título</Label><Input placeholder="Nome do evento" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Data</Label><Input type="date" /></div>
              <div className="space-y-1.5"><Label>Hora</Label><Input type="time" /></div>
            </div>
            <div className="space-y-1.5">
              <Label>Tipo</Label>
              <Select>
                <SelectTrigger><SelectValue placeholder="Selecione o tipo" /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(TIPO_LABEL) as EventoTipo[]).map((t) => (
                    <SelectItem key={t} value={t}>{TIPO_LABEL[t]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Visibilidade</Label>
              <Select>
                <SelectTrigger><SelectValue placeholder="Quem pode ver" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="interno">Time interno</SelectItem>
                  <SelectItem value="empresa">Empresa específica</SelectItem>
                  <SelectItem value="todos">Para todos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label>Descrição</Label><Textarea placeholder="Detalhes do evento" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-[100px]" onClick={() => setNovoOpen(false)}>Cancelar</Button>
            <Button className="rounded-[100px] bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white" onClick={() => setNovoOpen(false)}>Criar evento</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
