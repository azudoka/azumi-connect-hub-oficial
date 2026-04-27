import { PageHeader } from "@/components/PageHeader";
import { SectionDivider } from "@/components/SectionDivider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Star, User, Briefcase, Building2, Calendar, UserCog } from "lucide-react";
import { toast } from "sonner";

const dadosPessoais = {
  nome: "Marina Silva Almeida",
  cargo: "Analista de RH Pleno",
  departamento: "Pessoas & Cultura",
  admissao: "12/03/2022",
  liderDireto: "Renata Carvalho",
};

type StatusPDI = "andamento" | "concluida" | "atrasada";
const statusPDIStyle: Record<StatusPDI, { label: string; cls: string }> = {
  andamento: { label: "Em andamento", cls: "bg-info/15 text-info border-info/30" },
  concluida: { label: "Concluída", cls: "bg-success/15 text-success border-success/30" },
  atrasada: { label: "Atrasada", cls: "bg-destructive/15 text-destructive border-destructive/30" },
};

const pdi: { id: string; meta: string; prazo: string; status: StatusPDI }[] = [
  { id: "1", meta: "Concluir certificação em People Analytics", prazo: "30/06/2026", status: "andamento" },
  { id: "2", meta: "Liderar projeto de revisão do programa de onboarding", prazo: "30/04/2026", status: "atrasada" },
  { id: "3", meta: "Treinamento em comunicação não-violenta", prazo: "15/02/2026", status: "concluida" },
  { id: "4", meta: "Apresentar plano de carreira no comitê", prazo: "30/09/2026", status: "andamento" },
];

type StatusAval = "disponivel" | "aguardando" | "concluida" | "futuro";
const statusAvalStyle: Record<StatusAval, { label: string; cls: string }> = {
  disponivel: { label: "Disponível", cls: "bg-success/15 text-success border-success/30" },
  aguardando: { label: "Aguardando", cls: "bg-warning/15 text-warning border-warning/30" },
  concluida: { label: "Concluída", cls: "bg-muted text-muted-foreground border-border" },
  futuro: { label: "Em breve", cls: "bg-info/15 text-info border-info/30" },
};

const avaliacoes: { id: string; periodo: string; nota: number | null; status: StatusAval }[] = [
  { id: "1", periodo: "1º semestre 2025", nota: 4, status: "concluida" },
  { id: "2", periodo: "2º semestre 2025", nota: 5, status: "concluida" },
  { id: "3", periodo: "1º semestre 2026", nota: null, status: "disponivel" },
  { id: "4", periodo: "2º semestre 2026", nota: null, status: "futuro" },
];

function StarsView({ nota }: { nota: number | null }) {
  if (nota === null) return <span className="text-xs text-muted-foreground">—</span>;
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

export default function ColaboradorSobreVoce() {
  return (
    <div>
      <PageHeader
        title="Sobre você"
        subtitle="Suas informações, plano de desenvolvimento e ciclos de avaliação."
      />

      <section className="bg-card border border-border rounded-2xl p-6 shadow-card">
        <h2 className="font-display text-lg font-semibold mb-4">Meus dados</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Field icon={User} label="Nome completo" value={dadosPessoais.nome} />
          <Field icon={Briefcase} label="Cargo" value={dadosPessoais.cargo} />
          <Field icon={Building2} label="Departamento" value={dadosPessoais.departamento} />
          <Field icon={Calendar} label="Data de admissão" value={dadosPessoais.admissao} />
          <Field icon={UserCog} label="Líder direto" value={dadosPessoais.liderDireto} />
        </div>
      </section>

      <SectionDivider>Meu PDI</SectionDivider>

      <section className="bg-card border border-border rounded-2xl p-6 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display text-lg font-semibold">Plano de Desenvolvimento Individual</h2>
            <p className="text-sm text-muted-foreground">Suas metas acordadas com o líder.</p>
          </div>
          <Button
            variant="outline"
            className="rounded-full"
            onClick={() => toast.success("Solicitação enviada ao seu líder.")}
          >
            Solicitar atualização
          </Button>
        </div>

        <ul className="divide-y divide-border">
          {pdi.map((p) => (
            <li key={p.id} className="py-3 flex items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">{p.meta}</div>
                <div className="text-xs text-muted-foreground mt-0.5">Prazo: {p.prazo}</div>
              </div>
              <span className={cn("badge-pill shrink-0", statusPDIStyle[p.status].cls)}>
                <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
                {statusPDIStyle[p.status].label}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <SectionDivider>Minhas avaliações</SectionDivider>

      <section className="bg-card border border-border rounded-2xl p-6 shadow-card">
        <h2 className="font-display text-lg font-semibold mb-4">Ciclos de avaliação</h2>
        <ul className="divide-y divide-border">
          {avaliacoes.map((a) => (
            <li key={a.id} className="py-3 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">{a.periodo}</div>
                <div className="mt-1"><StarsView nota={a.nota} /></div>
              </div>
              <span className={cn("badge-pill shrink-0", statusAvalStyle[a.status].cls)}>
                <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
                {statusAvalStyle[a.status].label}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Field({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl border border-border/60 bg-background/60">
      <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="text-sm font-medium truncate">{value}</div>
      </div>
    </div>
  );
}
