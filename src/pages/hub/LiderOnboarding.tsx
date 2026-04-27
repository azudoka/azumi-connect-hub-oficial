import { useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Pencil, GraduationCap, Calendar } from "lucide-react";

type Responsavel = "RH" | "Líder" | "Colaborador";

interface Etapa {
  id: string;
  label: string;
  responsavel: Responsavel;
  done: boolean;
}

interface OnboardingItem {
  id: string;
  nome: string;
  inicio: string; // ISO
  etapas: Etapa[];
}

const ETAPAS_BASE: Omit<Etapa, "done">[] = [
  { id: "e1", label: "Boas-vindas e tour da plataforma", responsavel: "RH" },
  { id: "e2", label: "Apresentação ao time", responsavel: "Líder" },
  { id: "e3", label: "Setup de ferramentas", responsavel: "Colaborador" },
  { id: "e4", label: "Reunião 1:1 com líder", responsavel: "Líder" },
  { id: "e5", label: "Leitura do manual", responsavel: "Colaborador" },
];

function makeEtapas(done: boolean[]): Etapa[] {
  return ETAPAS_BASE.map((e, i) => ({ ...e, done: done[i] ?? false }));
}

const INICIAL: OnboardingItem[] = [
  { id: "o1", nome: "Camila Souza", inicio: "2026-04-15", etapas: makeEtapas([true, true, true, false, false]) },
  { id: "o2", nome: "Tiago Ribeiro", inicio: "2026-04-20", etapas: makeEtapas([true, false, false, false, false]) },
  { id: "o3", nome: "Larissa Pinto", inicio: "2026-04-22", etapas: makeEtapas([true, true, false, false, false]) },
];

const respColor: Record<Responsavel, string> = {
  RH: "bg-info/15 text-info border-info/30",
  Líder: "bg-primary/15 text-primary border-primary/30",
  Colaborador: "bg-muted text-muted-foreground border-border",
};

function iniciais(nome: string) {
  return nome.split(" ").map(p => p[0]).slice(0, 2).join("").toUpperCase();
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

export default function LiderOnboarding() {
  const [items, setItems] = useState<OnboardingItem[]>(INICIAL);

  const total = items.length;
  const concluidos = useMemo(
    () => items.filter(i => i.etapas.every(e => e.done)).length,
    [items]
  );

  function toggle(itemId: string, etapaId: string) {
    setItems(prev =>
      prev.map(it =>
        it.id !== itemId
          ? it
          : { ...it, etapas: it.etapas.map(e => e.id === etapaId ? { ...e, done: !e.done } : e) }
      )
    );
  }

  return (
    <div>
      <PageHeader
        title="Onboarding"
        subtitle={`${concluidos}/${total} colaboradores concluíram todas as etapas`}
      />

      <div className="space-y-4">
        {items.map((it) => {
          const totalEt = it.etapas.length;
          const doneEt = it.etapas.filter(e => e.done).length;
          const pct = Math.round((doneEt / totalEt) * 100);

          return (
            <div key={it.id} className="bg-card border border-border rounded-xl p-5 space-y-4">
              <div className="flex items-start gap-3">
                <Avatar className="h-11 w-11">
                  <AvatarFallback className="bg-gradient-brand text-white text-sm font-semibold">
                    {iniciais(it.nome)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <h3 className="font-display font-semibold">{it.nome}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                    <Calendar className="h-3.5 w-3.5" />
                    Início: {formatDate(it.inicio)}
                  </div>
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      disabled
                      className="h-8 w-8 rounded-md text-muted-foreground/60 hover:bg-muted/50 flex items-center justify-center cursor-not-allowed"
                      aria-label="Editar onboarding"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Edição de onboarding em desenvolvimento</TooltipContent>
                </Tooltip>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-muted-foreground">Progresso</span>
                  <span className="font-data font-semibold text-foreground">{pct}%</span>
                </div>
                <Progress value={pct} className="h-2" />
              </div>

              <ul className="space-y-2">
                {it.etapas.map((e) => (
                  <li
                    key={e.id}
                    className="flex items-center gap-3 p-2.5 rounded-lg border border-border/60 hover:bg-muted/30 transition-colors"
                  >
                    <Checkbox
                      checked={e.done}
                      onCheckedChange={() => toggle(it.id, e.id)}
                      id={`${it.id}-${e.id}`}
                    />
                    <label
                      htmlFor={`${it.id}-${e.id}`}
                      className={`flex-1 text-sm cursor-pointer ${e.done ? "line-through text-muted-foreground" : "text-foreground"}`}
                    >
                      {e.label}
                    </label>
                    <span className={`badge-pill border ${respColor[e.responsavel]}`}>
                      <GraduationCap className="h-3 w-3" />
                      {e.responsavel}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
