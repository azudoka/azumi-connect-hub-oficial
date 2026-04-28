import { PageHeader } from "@/components/PageHeader";
import { Bus, Utensils, Heart, Dumbbell, Gift, type LucideIcon } from "lucide-react";

interface Beneficio {
  id: string;
  nome: string;
  icon: LucideIcon;
  valor: string;
  regras: string;
}

const beneficios: Beneficio[] = [
  {
    id: "vt",
    nome: "Vale-transporte",
    icon: Bus,
    valor: "R$ 240,00 / mês",
    regras: "Carregado no Bilhete Único até o 5º dia útil. Desconto de 6% em folha conforme CLT.",
  },
  {
    id: "va",
    nome: "Vale-alimentação",
    icon: Utensils,
    valor: "R$ 800,00 / mês",
    regras: "Crédito no cartão Flash todo dia 1º. Uso em supermercados e mercados credenciados.",
  },
  {
    id: "ps",
    nome: "Plano de saúde",
    icon: Heart,
    valor: "Coparticipação até 30%",
    regras: "SulAmérica Apartamento, cobertura nacional. Inclusão de dependentes via RH em até 30 dias.",
  },
  {
    id: "gp",
    nome: "Gympass",
    icon: Dumbbell,
    valor: "Plano Basic incluso",
    regras: "Acesso a +12 mil academias e apps de bem-estar. Upgrade de plano disponível com desconto em folha.",
  },
  {
    id: "an",
    nome: "Auxílio aniversário",
    icon: Gift,
    valor: "R$ 150,00 / ano",
    regras: "Crédito automático no mês do aniversário. Pode ser usado em qualquer estabelecimento.",
  },
  {
    id: "hd",
    nome: "Auxílio home office",
    icon: Gift,
    valor: "R$ 120,00 / mês",
    regras: "Pago em folha para colaboradores em regime híbrido ou remoto. Reajustado anualmente.",
  },
];

export default function BeneficiosPage() {
  return (
    <div>
      <PageHeader
        title="Benefícios"
        subtitle="Resumo dos benefícios contratados pela empresa para você."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {beneficios.map((b) => (
          <div
            key={b.id}
            className="bg-card border border-border rounded-2xl p-5 shadow-card flex gap-4 transition-all hover:border-primary/40"
          >
            <div className="h-12 w-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <b.icon className="h-6 w-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3 mb-1">
                <h3 className="font-display font-semibold">{b.nome}</h3>
                <span className="badge-pill bg-success/15 text-success border-success/30 shrink-0">
                  <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
                  Ativo
                </span>
              </div>
              <div className="font-data text-sm text-foreground/90 mb-2">{b.valor}</div>
              <p className="text-xs text-muted-foreground leading-relaxed">{b.regras}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
