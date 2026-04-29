import { PageHeader } from "@/components/PageHeader";
import { cn } from "@/lib/utils";
import { CheckCircle2, Circle, Clock, type LucideIcon } from "lucide-react";

type EtapaStatus = "concluido" | "andamento" | "pendente";

interface Etapa {
  id: string;
  titulo: string;
  descricao: string;
  status: EtapaStatus;
}

const etapas: Etapa[] = [
  {
    id: "e1",
    titulo: "Documentos admissionais",
    descricao: "Envio de RG, CPF, comprovante de residência e demais documentos exigidos pelo DP.",
    status: "concluido",
  },
  {
    id: "e2",
    titulo: "Boas-vindas e tour pela empresa",
    descricao: "Apresentação institucional, conhecer áreas, ferramentas e canais oficiais.",
    status: "concluido",
  },
  {
    id: "e3",
    titulo: "Treinamentos obrigatórios",
    descricao: "Conclusão dos módulos de Código de Conduta, LGPD e Segurança da Informação.",
    status: "andamento",
  },
  {
    id: "e4",
    titulo: "Integração com o time",
    descricao: "Reuniões 1:1 com líder direto e principais pares de trabalho.",
    status: "andamento",
  },
  {
    id: "e5",
    titulo: "Plano de desenvolvimento (30/60/90)",
    descricao: "Definição das metas dos primeiros 90 dias junto com a liderança.",
    status: "pendente",
  },
  {
    id: "e6",
    titulo: "Avaliação de período de experiência",
    descricao: "Feedback estruturado ao final dos 45 e 90 dias com o líder e RH.",
    status: "pendente",
  },
];

const statusMap: Record<EtapaStatus, { label: string; icon: LucideIcon; cls: string }> = {
  concluido: {
    label: "Concluído",
    icon: CheckCircle2,
    cls: "bg-success/15 text-success border-success/30",
  },
  andamento: {
    label: "Em andamento",
    icon: Clock,
    cls: "bg-warning/15 text-warning border-warning/30",
  },
  pendente: {
    label: "Pendente",
    icon: Circle,
    cls: "bg-muted text-muted-foreground border-border",
  },
};

export default function OnboardingPage() {
  const concluidas = etapas.filter((e) => e.status === "concluido").length;
  const total = etapas.length;
  const pct = Math.round((concluidas / total) * 100);

  return (
    <div>
      <PageHeader
        title="Onboarding"
        subtitle={`Acompanhe as etapas da sua chegada — ${concluidas} de ${total} concluídas (${pct}%).`}
      />

      <section className="bg-card border border-border rounded-2xl p-2 sm:p-4 shadow-card">
        <ul className="divide-y divide-border">
          {etapas.map((e) => {
            const s = statusMap[e.status];
            const Icon = s.icon;
            return (
              <li key={e.id} className="flex items-start gap-4 p-4">
                <div
                  className={cn(
                    "h-9 w-9 rounded-lg flex items-center justify-center shrink-0",
                    e.status === "concluido"
                      ? "bg-success/15 text-success"
                      : e.status === "andamento"
                      ? "bg-warning/15 text-warning"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <h3 className="font-display font-semibold text-sm">{e.titulo}</h3>
                    <span className={cn("badge-pill shrink-0", s.cls)}>
                      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
                      {s.label}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{e.descricao}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
