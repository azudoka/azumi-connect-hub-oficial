import { PageHeader } from "@/components/PageHeader";
import { BookOpen, Heart, Clock, Shield, Users, Briefcase } from "lucide-react";

const politicas = [
  { icon: Shield, titulo: "Ética e conduta", resumo: "Princípios de integridade, anticorrupção e relacionamento profissional." },
  { icon: Heart, titulo: "Benefícios", resumo: "Diretrizes sobre saúde, bem-estar e benefícios oferecidos a colaboradores." },
  { icon: Clock, titulo: "Jornada de trabalho", resumo: "Regras sobre horário, banco de horas, home office e flexibilidade." },
  { icon: Users, titulo: "Diversidade e inclusão", resumo: "Compromissos da empresa com equidade, representatividade e respeito." },
  { icon: Briefcase, titulo: "Carreira e mérito", resumo: "Critérios de promoção, avaliação de desempenho e plano de carreira." },
  { icon: BookOpen, titulo: "Educação corporativa", resumo: "Política de incentivo, subsídio e trilhas de desenvolvimento." },
];

export default function PoliticasPage() {
  return (
    <div>
      <PageHeader title="Políticas e diretrizes" subtitle="Resumo executivo das políticas vigentes da empresa." />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {politicas.map((p) => (
          <article key={p.titulo} className="bg-card border border-border rounded-2xl p-5 shadow-card hover:border-primary/40 transition-all">
            <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-3">
              <p.icon className="h-5 w-5" />
            </div>
            <h3 className="font-display font-semibold text-base mb-1">{p.titulo}</h3>
            <p className="text-sm text-muted-foreground">{p.resumo}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
