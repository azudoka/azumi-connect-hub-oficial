import { Link } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Smile, Meh, Frown, Users, GraduationCap, MessageSquare, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Humor = "bom" | "neutro" | "ruim";

interface Colab {
  id: string;
  nome: string;
  cargo: string;
  humor: Humor;
  ultimoFeedback: string; // ISO date
  pdiAtivo: boolean;
}

const time: Colab[] = [
  { id: "c1", nome: "Marina Costa", cargo: "Analista de RH Sênior", humor: "bom", ultimoFeedback: "2026-04-18", pdiAtivo: true },
  { id: "c2", nome: "Pedro Alves", cargo: "Coordenador de Operações", humor: "neutro", ultimoFeedback: "2026-04-10", pdiAtivo: true },
  { id: "c3", nome: "Lucas Ferreira", cargo: "Analista de DP", humor: "bom", ultimoFeedback: "2026-04-22", pdiAtivo: false },
  { id: "c4", nome: "Beatriz Lins", cargo: "Recrutadora Pleno", humor: "ruim", ultimoFeedback: "2026-03-30", pdiAtivo: true },
  { id: "c5", nome: "Rafael Mendes", cargo: "Analista de Cargos & Salários", humor: "bom", ultimoFeedback: "2026-04-20", pdiAtivo: false },
  { id: "c6", nome: "Juliana Lima", cargo: "Estagiária de RH", humor: "neutro", ultimoFeedback: "2026-04-15", pdiAtivo: true },
];

const humorMap: Record<Humor, { icon: typeof Smile; cls: string; label: string }> = {
  bom: { icon: Smile, cls: "text-success bg-success/15 border-success/30", label: "Bem" },
  neutro: { icon: Meh, cls: "text-warning bg-warning/15 border-warning/30", label: "Neutro" },
  ruim: { icon: Frown, cls: "text-destructive bg-destructive/15 border-destructive/30", label: "Atenção" },
};

function iniciais(nome: string) {
  return nome.split(" ").map(p => p[0]).slice(0, 2).join("").toUpperCase();
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

export default function LiderMeuTime() {
  if (time.length === 0) {
    return (
      <div>
        <PageHeader title="Meu time" subtitle="Acompanhe seus colaboradores diretos" />
        <div className="bg-card border border-border rounded-xl">
          <EmptyState icon={Users} title="Nenhum colaborador no seu time ainda." description="Quando colaboradores forem associados a você, eles aparecerão aqui." />
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Meu time"
        subtitle={`${time.length} colaboradores diretos`}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {time.map((c) => {
          const H = humorMap[c.humor];
          return (
            <div
              key={c.id}
              className="card-hover bg-card border border-border rounded-xl p-5 flex flex-col gap-4"
            >
              <div className="flex items-start gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-gradient-brand text-white text-sm font-semibold">
                    {iniciais(c.nome)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <h3 className="font-display font-semibold truncate">{c.nome}</h3>
                  <p className="text-xs text-muted-foreground truncate">{c.cargo}</p>
                </div>
                <span
                  className={cn(
                    "badge-pill border inline-flex items-center gap-1",
                    H.cls
                  )}
                  title={`Humor do dia: ${H.label}`}
                >
                  <H.icon className="h-3.5 w-3.5" />
                  {H.label}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="flex items-start gap-2">
                  <MessageSquare className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-muted-foreground">Último feedback</div>
                    <div className="font-medium text-foreground">{formatDate(c.ultimoFeedback)}</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <GraduationCap className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-muted-foreground">PDI</div>
                    <div className={cn("font-medium", c.pdiAtivo ? "text-primary" : "text-muted-foreground")}>
                      {c.pdiAtivo ? "Ativo" : "Inativo"}
                    </div>
                  </div>
                </div>
              </div>

              <Button asChild variant="outline" size="sm" className="w-full">
                <Link to={`/hub/lider/meu-time/${c.id}`}>
                  Ver perfil
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
