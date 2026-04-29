import { PageHeader } from "@/components/PageHeader";
import { Megaphone } from "lucide-react";

const comunicados = [
  { id: "m1", titulo: "Reunião mensal do time", data: "28/04/2026", resumo: "Alinhamento de prioridades e celebração das entregas do mês na sexta às 16h." },
  { id: "m2", titulo: "Novo membro chegando", data: "25/04/2026", resumo: "Na próxima segunda recebemos o Felipe como Analista Pleno. Preparem boas-vindas." },
  { id: "m3", titulo: "Ciclo de feedback aberto", data: "20/04/2026", resumo: "Período de feedback 360 abre dia 02/05. Combine os 1:1s com antecedência." },
  { id: "m4", titulo: "Revisão de OKRs do trimestre", data: "15/04/2026", resumo: "Vamos revisar coletivamente o progresso dos OKRs em workshop de 2h." },
  { id: "m5", titulo: "Novo benefício disponível", data: "10/04/2026", resumo: "O time passa a ter acesso a plataforma de cursos. Divulguem para os liderados." },
  { id: "m6", titulo: "Política de home office atualizada", data: "05/04/2026", resumo: "Confira mudanças no regime híbrido e oriente o time sobre a nova rotina." },
];

export default function MuralPage() {
  return (
    <div>
      <PageHeader
        title="Mural do time"
        subtitle="Acompanhe e publique comunicados internos para sua equipe."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {comunicados.map((c) => (
          <article key={c.id} className="bg-card border border-border rounded-2xl p-5 shadow-card transition-all hover:border-primary/40">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Megaphone className="h-4 w-4" />
              </div>
              <span className="text-xs text-muted-foreground font-data">{c.data}</span>
            </div>
            <h3 className="font-display font-semibold text-base mb-2">{c.titulo}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{c.resumo}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
