import { PageHeader } from "@/components/PageHeader";
import { SectionDivider } from "@/components/SectionDivider";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import {
  Bus,
  HeartPulse,
  ShoppingBasket,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";

type StatusBenef = "ativo" | "inativo";
const statusStyle: Record<StatusBenef, { label: string; cls: string }> = {
  ativo: { label: "Ativo", cls: "bg-success/15 text-success border-success/30" },
  inativo: { label: "Inativo", cls: "bg-muted text-muted-foreground border-border" },
};

interface Beneficio {
  id: string;
  nome: string;
  icon: LucideIcon;
  valor: string;
  status: StatusBenef;
  comoUsar: string;
}

const beneficios: Beneficio[] = [
  {
    id: "vt",
    nome: "Vale-transporte",
    icon: Bus,
    valor: "R$ 240,00 / mês",
    status: "ativo",
    comoUsar:
      "Crédito carregado mensalmente no cartão Bilhete Único até o 5º dia útil. Caso identifique problema na recarga, abra uma solicitação na central.",
  },
  {
    id: "va",
    nome: "Vale-alimentação",
    icon: ShoppingBasket,
    valor: "R$ 800,00 / mês",
    status: "ativo",
    comoUsar:
      "Crédito disponível no cartão Flash todo dia 1º. Use em supermercados, mercados e empórios credenciados pela bandeira.",
  },
  {
    id: "vr",
    nome: "Vale-refeição",
    icon: UtensilsCrossed,
    valor: "R$ 600,00 / mês",
    status: "ativo",
    comoUsar:
      "Crédito disponível no cartão Flash todo dia 1º. Use em restaurantes, lanchonetes e padarias credenciadas.",
  },
  {
    id: "ps",
    nome: "Plano de saúde",
    icon: HeartPulse,
    valor: "Coparticipação",
    status: "ativo",
    comoUsar:
      "Plano SulAmérica Apartamento, com cobertura nacional. Carteirinha digital disponível no app SulAmérica Saúde. Inclusão de dependentes via RH.",
  },
];

export default function ColaboradorBeneficios() {
  return (
    <div>
      <PageHeader
        title="Benefícios"
        subtitle="Resumo dos benefícios contratados pela empresa."
        actions={
          <Button
            variant="outline"
            className="rounded-full"
            onClick={() => toast.success("Solicitação enviada ao RH.")}
          >
            Solicitar ajuste
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {beneficios.map((b) => (
          <div
            key={b.id}
            className="bg-card border border-border rounded-2xl p-5 shadow-card card-hover flex flex-col gap-4"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <b.icon className="h-5 w-5" />
              </div>
              <span className={cn("badge-pill shrink-0", statusStyle[b.status].cls)}>
                <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
                {statusStyle[b.status].label}
              </span>
            </div>
            <div>
              <div className="font-display font-semibold">{b.nome}</div>
              <div className="font-data text-sm text-muted-foreground mt-1">{b.valor}</div>
            </div>
          </div>
        ))}
      </div>

      <SectionDivider>Como utilizar</SectionDivider>

      <section className="bg-card border border-border rounded-2xl p-2 sm:p-4 shadow-card">
        <Accordion type="single" collapsible className="w-full">
          {beneficios.map((b) => (
            <AccordionItem key={b.id} value={b.id}>
              <AccordionTrigger className="px-3 hover:no-underline">
                <div className="flex items-center gap-3">
                  <b.icon className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">{b.nome}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-3 text-sm text-muted-foreground leading-relaxed">
                {b.comoUsar}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </div>
  );
}
