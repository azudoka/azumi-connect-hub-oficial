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
import { Star } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { iniciaisDe } from "./_timeData";

type StatusCiclo = "andamento" | "encerrado";
type StatusItem = "pendente" | "respondido" | "finalizado";

const statusCicloStyle: Record<StatusCiclo, { label: string; cls: string }> = {
  andamento: { label: "Em andamento", cls: "bg-info/15 text-info border-info/30" },
  encerrado: { label: "Encerrado", cls: "bg-muted text-muted-foreground border-border" },
};
const statusItemStyle: Record<StatusItem, { label: string; cls: string }> = {
  pendente: { label: "Pendente", cls: "bg-warning/15 text-warning border-warning/30" },
  respondido: { label: "Respondido", cls: "bg-info/15 text-info border-info/30" },
  finalizado: { label: "Finalizado", cls: "bg-success/15 text-success border-success/30" },
};

interface ItemAval {
  id: string;
  colaboradorId: string;
  colaboradorNome: string;
  cargo: string;
  status: StatusItem;
}
interface Ciclo {
  id: string;
  nome: string;
  periodo: string;
  status: StatusCiclo;
  itens: ItemAval[];
}

const COMPETENCIAS = [
  "Resultados e entrega",
  "Colaboração e time",
  "Liderança e influência",
  "Aprendizado contínuo",
];

const INICIAL: Ciclo[] = [
  {
    id: "ci1",
    nome: "Avaliação semestral 1S/2026",
    periodo: "Jan – Jun / 2026",
    status: "andamento",
    itens: [
      { id: "a1", colaboradorId: "c1", colaboradorNome: "Marina Costa", cargo: "Analista de RH Sênior", status: "pendente" },
      { id: "a2", colaboradorId: "c2", colaboradorNome: "Pedro Alves", cargo: "Coordenador de Operações", status: "respondido" },
      { id: "a3", colaboradorId: "c3", colaboradorNome: "Lucas Ferreira", cargo: "Analista de DP", status: "pendente" },
      { id: "a4", colaboradorId: "c4", colaboradorNome: "Beatriz Lins", cargo: "Recrutadora Pleno", status: "finalizado" },
    ],
  },
  {
    id: "ci2",
    nome: "Avaliação anual 2025",
    periodo: "Jan – Dez / 2025",
    status: "encerrado",
    itens: [
      { id: "b1", colaboradorId: "c1", colaboradorNome: "Marina Costa", cargo: "Analista de RH Sênior", status: "finalizado" },
      { id: "b2", colaboradorId: "c2", colaboradorNome: "Pedro Alves", cargo: "Coordenador de Operações", status: "finalizado" },
      { id: "b3", colaboradorId: "c5", colaboradorNome: "Rafael Mendes", cargo: "Analista de C&S", status: "finalizado" },
      { id: "b4", colaboradorId: "c6", colaboradorNome: "Juliana Lima", cargo: "Estagiária de RH", status: "finalizado" },
    ],
  },
];

function StarsSelect({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className="p-0.5"
          aria-label={`Nota ${n}`}
        >
          <Star
            className={cn(
              "h-5 w-5 transition-colors",
              n <= value
                ? "fill-warning text-warning"
                : "text-muted-foreground/40 hover:text-warning/60"
            )}
          />
        </button>
      ))}
    </div>
  );
}

export default function AvaliacoesLiderPage() {
  const [ciclos, setCiclos] = useState<Ciclo[]>(INICIAL);
  const [aberto, setAberto] = useState<{
    cicloId: string;
    item: ItemAval;
  } | null>(null);
  const [notas, setNotas] = useState<number[]>([0, 0, 0, 0]);
  const [comentario, setComentario] = useState("");

  function abrir(cicloId: string, item: ItemAval) {
    setAberto({ cicloId, item });
    setNotas([0, 0, 0, 0]);
    setComentario("");
  }

  function salvar() {
    if (!aberto) return;
    if (notas.some((n) => n === 0)) {
      toast.error("Atribua nota a todas as competências.");
      return;
    }
    setCiclos((prev) =>
      prev.map((c) =>
        c.id !== aberto.cicloId
          ? c
          : {
              ...c,
              itens: c.itens.map((i) =>
                i.id === aberto.item.id ? { ...i, status: "finalizado" } : i
              ),
            }
      )
    );
    toast.success(`Avaliação de ${aberto.item.colaboradorNome} salva.`);
    setAberto(null);
  }

  return (
    <div>
      <PageHeader
        title="Avaliações de desempenho"
        subtitle="Ciclos abertos e encerrados do seu time."
      />

      <div className="space-y-5">
        {ciclos.map((c) => {
          const sc = statusCicloStyle[c.status];
          return (
            <section
              key={c.id}
              className="bg-card border border-border rounded-2xl shadow-card overflow-hidden"
            >
              <div className="p-5 border-b border-border flex items-center gap-3 flex-wrap">
                <div className="min-w-0 flex-1">
                  <h2 className="font-display text-lg font-semibold">{c.nome}</h2>
                  <p className="text-xs text-muted-foreground">{c.periodo}</p>
                </div>
                <span className={cn("badge-pill", sc.cls)}>
                  <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
                  {sc.label}
                </span>
              </div>
              <ul className="divide-y divide-border">
                {c.itens.map((i) => {
                  const si = statusItemStyle[i.status];
                  const podeAvaliar =
                    c.status === "andamento" && i.status !== "finalizado";
                  return (
                    <li key={i.id} className="p-4 flex items-center gap-3 flex-wrap">
                      <div className="h-10 w-10 rounded-md bg-secondary text-foreground/80 flex items-center justify-center text-xs font-semibold shrink-0">
                        {iniciaisDe(i.colaboradorNome)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium truncate">
                          {i.colaboradorNome}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">{i.cargo}</div>
                      </div>
                      <span className={cn("badge-pill", si.cls)}>
                        <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
                        {si.label}
                      </span>
                      <Button
                        size="sm"
                        className="rounded-full"
                        disabled={!podeAvaliar}
                        onClick={() => abrir(c.id, i)}
                      >
                        Avaliar
                      </Button>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>

      <Dialog open={!!aberto} onOpenChange={(v) => !v && setAberto(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Avaliar {aberto?.item.colaboradorNome ?? ""}
            </DialogTitle>
            <DialogDescription>
              Atribua nota de 1 a 5 estrelas para cada competência.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {COMPETENCIAS.map((comp, idx) => (
              <div
                key={comp}
                className="flex items-center justify-between gap-4 p-3 rounded-xl border border-border/60"
              >
                <div className="text-sm font-medium">{comp}</div>
                <StarsSelect
                  value={notas[idx]}
                  onChange={(v) => {
                    const novas = [...notas];
                    novas[idx] = v;
                    setNotas(novas);
                  }}
                />
              </div>
            ))}

            <div>
              <Label className="text-xs">Comentário geral (opcional)</Label>
              <Textarea
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                rows={4}
                className="mt-1"
                placeholder="Pontos fortes, oportunidades de evolução, próximos passos…"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" className="rounded-full" onClick={() => setAberto(null)}>
              Cancelar
            </Button>
            <Button className="rounded-full" onClick={salvar}>
              Salvar avaliação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
