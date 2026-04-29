import { PageHeader } from "@/components/PageHeader";
import { Briefcase, Building2, Calendar, User } from "lucide-react";

const responsabilidades = [
  "Acompanhar performance e desenvolvimento dos liderados",
  "Conduzir 1:1s e ciclos de feedback",
  "Validar solicitações da equipe (férias, ausências, benefícios)",
  "Apoiar o onboarding de novos colaboradores",
  "Garantir clima saudável e engajamento do time",
];

const habilidades = ["Liderança", "Comunicação", "Gestão de Pessoas", "Pensamento crítico", "Mentoria", "Foco em resultado"];

export default function SobreVocePage() {
  return (
    <div>
      <PageHeader
        title="Sobre você"
        subtitle="Seu perfil como líder dentro da empresa."
      />

      <div className="bg-card border border-border rounded-2xl shadow-card p-6 mb-4">
        <div className="flex items-start gap-4">
          <div className="h-16 w-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
            <User className="h-7 w-7" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-display text-xl font-semibold">Marina Costa</h2>
            <p className="text-sm text-muted-foreground">Líder de área</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 text-sm">
              <div className="flex items-center gap-2"><Briefcase className="h-4 w-4 text-muted-foreground" /> Gerente de Operações</div>
              <div className="flex items-center gap-2"><Building2 className="h-4 w-4 text-muted-foreground" /> Operações</div>
              <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-muted-foreground" /> 4 anos de casa</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-2xl shadow-card p-6">
          <h3 className="font-display font-semibold mb-3">Responsabilidades como líder</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {responsabilidades.map((r) => (
              <li key={r} className="flex gap-2"><span className="text-primary">•</span> {r}</li>
            ))}
          </ul>
        </div>

        <div className="bg-card border border-border rounded-2xl shadow-card p-6">
          <h3 className="font-display font-semibold mb-3">Habilidades em destaque</h3>
          <div className="flex flex-wrap gap-2">
            {habilidades.map((h) => (
              <span key={h} className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">{h}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
