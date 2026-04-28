import { PageHeader } from "@/components/PageHeader";
import { SectionDivider } from "@/components/SectionDivider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Briefcase,
  Star,
  Target,
  ThumbsUp,
  MessageSquare,
} from "lucide-react";
import {
  timeLider,
  statusColabStyle,
  iniciaisDe,
  tempoDeEmpresa,
} from "./_timeData";

interface CargoHist {
  cargo: string;
  periodo: string;
}
interface MetaPDI {
  meta: string;
  prazo: string;
  status: "andamento" | "concluida" | "atrasada";
}
interface AvalPerf {
  periodo: string;
  nota: number;
  comentario: string;
}
interface FeedbackItem {
  data: string;
  tipo: "positivo" | "construtivo";
  texto: string;
}

const statusPDI: Record<MetaPDI["status"], { label: string; cls: string }> = {
  andamento: { label: "Em andamento", cls: "bg-info/15 text-info border-info/30" },
  concluida: { label: "Concluída", cls: "bg-success/15 text-success border-success/30" },
  atrasada: { label: "Atrasada", cls: "bg-destructive/15 text-destructive border-destructive/30" },
};

const tipoFb: Record<FeedbackItem["tipo"], { label: string; cls: string; Icon: typeof ThumbsUp }> = {
  positivo: {
    label: "Positivo",
    cls: "bg-success/15 text-success border-success/30",
    Icon: ThumbsUp,
  },
  construtivo: {
    label: "Construtivo",
    cls: "bg-primary/15 text-primary border-primary/30",
    Icon: MessageSquare,
  },
};

function dadosDe(id: string) {
  // Mock determinístico simples por id
  const historico: CargoHist[] = [
    { cargo: "Cargo atual", periodo: "Atual" },
    { cargo: "Promoção a Pleno", periodo: "Jul/2023 – Atual" },
    { cargo: "Início como Júnior", periodo: "Mar/2022 – Jun/2023" },
  ];
  const pdi: MetaPDI[] = [
    { meta: "Concluir certificação técnica avançada", prazo: "30/06/2026", status: "andamento" },
    { meta: "Liderar revisão do processo de onboarding", prazo: "15/05/2026", status: "atrasada" },
    { meta: "Curso de comunicação não-violenta", prazo: "10/02/2026", status: "concluida" },
  ];
  const avaliacoes: AvalPerf[] = [
    {
      periodo: "2º semestre 2025",
      nota: 5,
      comentario: "Performance excepcional, superou todas as metas e referência técnica para o time.",
    },
    {
      periodo: "1º semestre 2025",
      nota: 4,
      comentario: "Entregas consistentes, oportunidade de evoluir em comunicação com áreas externas.",
    },
  ];
  const feedbacks: FeedbackItem[] = [
    {
      data: "18/04/2026",
      tipo: "positivo",
      texto: "Excelente condução do projeto de revisão de cargos e salários. Time muito engajado.",
    },
    {
      data: "02/04/2026",
      tipo: "construtivo",
      texto: "Atenção aos prazos de devolutiva de candidatos — alinhar cadência semanal.",
    },
    {
      data: "20/03/2026",
      tipo: "positivo",
      texto: "Apresentação clara e estruturada no comitê. Parabéns pela preparação.",
    },
  ];
  return { historico, pdi, avaliacoes, feedbacks };
}

function StarsView({ nota }: { nota: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={cn(
            "h-4 w-4",
            n <= nota ? "fill-warning text-warning" : "text-muted-foreground/40"
          )}
        />
      ))}
    </div>
  );
}

export default function ColaboradorPerfilPage() {
  const { id } = useParams<{ id: string }>();
  const colab = timeLider.find((c) => c.id === id) ?? timeLider[0];
  const s = statusColabStyle[colab.status];
  const { historico, pdi, avaliacoes, feedbacks } = dadosDe(colab.id);

  return (
    <div>
      <Button asChild variant="ghost" size="sm" className="mb-3 -ml-2">
        <Link to="/hub/lider/meu-time">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Voltar ao time
        </Link>
      </Button>

      <section className="bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-card flex flex-col sm:flex-row gap-5">
        <div className="h-24 w-24 rounded-md bg-secondary text-foreground/80 flex items-center justify-center text-3xl font-semibold shrink-0">
          {iniciaisDe(colab.nome)}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="font-display text-2xl font-semibold tracking-tight">{colab.nome}</h1>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
            <Briefcase className="h-4 w-4" />
            {colab.cargo}
          </div>
          <div className="text-sm text-muted-foreground mt-0.5">
            Admissão: {colab.admissao} · {tempoDeEmpresa(colab.admissao)} de empresa
          </div>
          <div className="mt-3">
            <span className={cn("badge-pill", s.cls)}>
              <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
              {s.label}
            </span>
          </div>
        </div>
      </section>

      <SectionDivider>Histórico na empresa</SectionDivider>
      <section className="bg-card border border-border rounded-2xl p-5 shadow-card">
        <ol className="relative border-l border-border ml-2">
          {historico.map((h, i) => (
            <li key={i} className="ml-5 pb-4 last:pb-0">
              <span className="absolute -left-[7px] mt-1.5 h-3 w-3 rounded-full bg-primary border-2 border-card" />
              <div className="text-sm font-medium">{h.cargo}</div>
              <div className="text-xs text-muted-foreground">{h.periodo}</div>
            </li>
          ))}
        </ol>
      </section>

      <SectionDivider>PDI</SectionDivider>
      <section className="bg-card border border-border rounded-2xl p-5 shadow-card">
        <ul className="divide-y divide-border">
          {pdi.map((p, i) => (
            <li key={i} className="py-3 flex items-start gap-4">
              <Target className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">{p.meta}</div>
                <div className="text-xs text-muted-foreground mt-0.5">Prazo: {p.prazo}</div>
              </div>
              <span className={cn("badge-pill shrink-0", statusPDI[p.status].cls)}>
                <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
                {statusPDI[p.status].label}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <SectionDivider>Avaliações de performance</SectionDivider>
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {avaliacoes.map((a, i) => (
          <div key={i} className="bg-card border border-border rounded-2xl p-5 shadow-card">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium">{a.periodo}</div>
              <StarsView nota={a.nota} />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{a.comentario}</p>
          </div>
        ))}
      </section>

      <SectionDivider>Feedbacks registrados</SectionDivider>
      <section className="bg-card border border-border rounded-2xl p-5 shadow-card">
        <ul className="space-y-3">
          {feedbacks.map((f, i) => {
            const t = tipoFb[f.tipo];
            const TIcon = t.Icon;
            return (
              <li key={i} className="flex items-start gap-3 p-3 rounded-xl border border-border/60">
                <div className="h-8 w-8 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <TIcon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn("badge-pill", t.cls)}>
                      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
                      {t.label}
                    </span>
                    <span className="text-xs text-muted-foreground ml-auto">{f.data}</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.texto}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
