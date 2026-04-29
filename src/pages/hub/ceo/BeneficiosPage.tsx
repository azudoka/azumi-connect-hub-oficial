import { PageHeader } from "@/components/PageHeader";
import { Heart, Utensils, Sparkles, GraduationCap, Plane, Baby } from "lucide-react";

const beneficios = [
  { icon: Heart, titulo: "Saúde", resumo: "Plano médico e odontológico nacional, com cobertura para dependentes." },
  { icon: Utensils, titulo: "Alimentação", resumo: "Vale refeição e alimentação flexível, ajustável conforme rotina." },
  { icon: Sparkles, titulo: "Bem-estar", resumo: "Plataforma de meditação, terapia online e parcerias de academia." },
  { icon: GraduationCap, titulo: "Educação", resumo: "Subsídio para cursos, idiomas, certificações e pós-graduação." },
  { icon: Plane, titulo: "Flexibilidade", resumo: "Modelo híbrido, day off de aniversário e jornada flexível." },
  { icon: Baby, titulo: "Família", resumo: "Licença parental estendida e auxílio creche para filhos pequenos." },
];

export default function BeneficiosPage() {
  return (
    <div>
      <PageHeader title="Benefícios" subtitle="Resumo executivo do pacote de benefícios oferecido aos colaboradores." />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {beneficios.map((b) => (
          <article key={b.titulo} className="bg-card border border-border rounded-2xl p-5 shadow-card hover:border-primary/40 transition-all">
            <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-3">
              <b.icon className="h-5 w-5" />
            </div>
            <h3 className="font-display font-semibold text-base mb-1">{b.titulo}</h3>
            <p className="text-sm text-muted-foreground">{b.resumo}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
