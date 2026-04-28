import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Award, BookOpen, Clock, Play, type LucideIcon } from "lucide-react";
import { toast } from "sonner";

type StatusTrein = "disponivel" | "andamento" | "concluido";

const statusStyle: Record<
  StatusTrein,
  { label: string; cls: string; cta: string; icon: LucideIcon }
> = {
  disponivel: {
    label: "Disponível",
    cls: "bg-info/15 text-info border-info/30",
    cta: "Iniciar",
    icon: Play,
  },
  andamento: {
    label: "Em andamento",
    cls: "bg-primary/15 text-primary border-primary/30",
    cta: "Continuar",
    icon: BookOpen,
  },
  concluido: {
    label: "Concluído",
    cls: "bg-success/15 text-success border-success/30",
    cta: "Ver certificado",
    icon: Award,
  },
};

interface Treinamento {
  id: string;
  titulo: string;
  categoria: string;
  cargaHoraria: string;
  status: StatusTrein;
  progresso?: number;
}

const treinamentos: Treinamento[] = [
  {
    id: "t1",
    titulo: "Comunicação não-violenta",
    categoria: "Soft skills",
    cargaHoraria: "8h",
    status: "andamento",
    progresso: 65,
  },
  {
    id: "t2",
    titulo: "Segurança da Informação — LGPD",
    categoria: "Compliance",
    cargaHoraria: "4h",
    status: "concluido",
  },
  {
    id: "t3",
    titulo: "Excel Avançado para RH",
    categoria: "Hard skills",
    cargaHoraria: "12h",
    status: "disponivel",
  },
  {
    id: "t4",
    titulo: "Liderança situacional",
    categoria: "Liderança",
    cargaHoraria: "16h",
    status: "andamento",
    progresso: 25,
  },
  {
    id: "t5",
    titulo: "Diversidade e vieses inconscientes",
    categoria: "Cultura",
    cargaHoraria: "6h",
    status: "concluido",
  },
  {
    id: "t6",
    titulo: "People Analytics — Fundamentos",
    categoria: "Hard skills",
    cargaHoraria: "20h",
    status: "disponivel",
  },
];

export default function TreinamentosColabPage() {
  return (
    <div>
      <PageHeader
        title="Treinamentos"
        subtitle="Sua trilha de desenvolvimento contínuo."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {treinamentos.map((t) => {
          const cfg = statusStyle[t.status];
          const Icon = cfg.icon;
          return (
            <div
              key={t.id}
              className="bg-card border border-border rounded-2xl p-5 shadow-card flex flex-col gap-4 transition-all hover:border-primary/40"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                    {t.categoria}
                  </div>
                  <h3 className="font-display font-semibold mt-0.5">{t.titulo}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    {t.cargaHoraria}
                  </div>
                </div>
                <span className={cn("badge-pill shrink-0", cfg.cls)}>
                  <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
                  {cfg.label}
                </span>
              </div>

              {t.status === "andamento" && typeof t.progresso === "number" && (
                <div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                    <span>Progresso</span>
                    <span className="font-data font-medium text-foreground">
                      {t.progresso}%
                    </span>
                  </div>
                  <Progress value={t.progresso} className="h-2" />
                </div>
              )}

              <div className="mt-auto">
                <Button
                  variant={t.status === "concluido" ? "outline" : "default"}
                  className="rounded-full w-full sm:w-auto"
                  onClick={() => toast.info(`${cfg.cta}: ${t.titulo}`)}
                >
                  <Icon className="h-4 w-4 mr-1.5" />
                  {cfg.cta}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
