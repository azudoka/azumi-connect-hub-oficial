import { PageHeader } from "@/components/PageHeader";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Calendar } from "lucide-react";
import { useState } from "react";
import { iniciaisDe } from "./_timeData";

interface Etapa {
  id: string;
  label: string;
  done: boolean;
}
interface OnbItem {
  id: string;
  nome: string;
  cargo: string;
  inicio: string;
  etapas: Etapa[];
}

const ETAPAS_BASE = [
  "Documentação admissional",
  "Acesso aos sistemas e e-mail",
  "Apresentação ao time",
  "Treinamento inicial",
  "Reunião 1:1 com o líder",
];

function makeEtapas(checks: boolean[]): Etapa[] {
  return ETAPAS_BASE.map((label, i) => ({
    id: `e${i}`,
    label,
    done: checks[i] ?? false,
  }));
}

const INICIAL: OnbItem[] = [
  {
    id: "o1",
    nome: "Camila Souza",
    cargo: "Analista de RH Júnior",
    inicio: "15/04/2026",
    etapas: makeEtapas([true, true, true, false, false]),
  },
  {
    id: "o2",
    nome: "Tiago Ribeiro",
    cargo: "Analista de DP Júnior",
    inicio: "20/04/2026",
    etapas: makeEtapas([true, false, false, false, false]),
  },
  {
    id: "o3",
    nome: "Larissa Pinto",
    cargo: "Recrutadora Júnior",
    inicio: "22/04/2026",
    etapas: makeEtapas([true, true, false, false, false]),
  },
];

export default function OnboardingPage() {
  const [items, setItems] = useState<OnbItem[]>(INICIAL);

  function toggle(itemId: string, etapaId: string) {
    setItems((prev) =>
      prev.map((it) =>
        it.id !== itemId
          ? it
          : {
              ...it,
              etapas: it.etapas.map((e) =>
                e.id === etapaId ? { ...e, done: !e.done } : e
              ),
            }
      )
    );
  }

  return (
    <div>
      <PageHeader
        title="Onboarding"
        subtitle={`${items.length} colaboradores em integração no momento.`}
      />

      <div className="space-y-4">
        {items.map((it) => {
          const total = it.etapas.length;
          const done = it.etapas.filter((e) => e.done).length;
          const pct = Math.round((done / total) * 100);

          return (
            <Accordion
              key={it.id}
              type="single"
              collapsible
              className="bg-card border border-border rounded-2xl shadow-card"
            >
              <AccordionItem value={it.id} className="border-b-0">
                <AccordionTrigger className="px-5 py-4 hover:no-underline">
                  <div className="flex items-center gap-4 flex-1 min-w-0 text-left">
                    <div className="h-12 w-12 rounded-md bg-secondary text-foreground/80 flex items-center justify-center text-sm font-semibold shrink-0">
                      {iniciaisDe(it.nome)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-display font-semibold truncate">{it.nome}</div>
                      <div className="text-xs text-muted-foreground truncate">{it.cargo}</div>
                      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-1">
                        <Calendar className="h-3 w-3" />
                        Início: {it.inicio}
                      </div>
                    </div>
                    <div className="hidden sm:block w-40 mr-3">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Conclusão</span>
                        <span className="font-data font-semibold">{pct}%</span>
                      </div>
                      <Progress value={pct} className="h-2" />
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-5 pb-5">
                  <div className="sm:hidden mb-4">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Conclusão</span>
                      <span className="font-data font-semibold">{pct}%</span>
                    </div>
                    <Progress value={pct} className="h-2" />
                  </div>
                  <ul className="space-y-2">
                    {it.etapas.map((e) => (
                      <li
                        key={e.id}
                        className="flex items-center gap-3 p-3 rounded-lg border border-border/60 hover:bg-secondary/40 transition-colors"
                      >
                        <Checkbox
                          checked={e.done}
                          onCheckedChange={() => toggle(it.id, e.id)}
                          id={`${it.id}-${e.id}`}
                        />
                        <label
                          htmlFor={`${it.id}-${e.id}`}
                          className={
                            "flex-1 text-sm cursor-pointer " +
                            (e.done
                              ? "line-through text-muted-foreground"
                              : "text-foreground")
                          }
                        >
                          {e.label}
                        </label>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          );
        })}
      </div>
    </div>
  );
}
