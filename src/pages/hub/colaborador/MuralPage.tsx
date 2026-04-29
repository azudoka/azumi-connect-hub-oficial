import { PageHeader } from "@/components/PageHeader";
import { Megaphone } from "lucide-react";

interface Comunicado {
  id: string;
  titulo: string;
  data: string;
  resumo: string;
}

const comunicados: Comunicado[] = [
  {
    id: "c1",
    titulo: "Confraternização de fim de trimestre",
    data: "28/04/2026",
    resumo: "Vamos celebrar os resultados do Q1 no dia 15/05, a partir das 18h, no rooftop do escritório.",
  },
  {
    id: "c2",
    titulo: "Nova política de home office",
    data: "22/04/2026",
    resumo: "A partir de maio, o regime híbrido passa a permitir até 3 dias remotos por semana.",
  },
  {
    id: "c3",
    titulo: "Treinamento obrigatório de Segurança",
    data: "20/04/2026",
    resumo: "Conclua o módulo de Segurança da Informação na trilha de treinamentos até 10/05.",
  },
  {
    id: "c4",
    titulo: "Boas-vindas aos novos colegas",
    data: "15/04/2026",
    resumo: "Recebemos 4 novos colaboradores neste mês. Confira no Mural quem chegou e dê as boas-vindas.",
  },
  {
    id: "c5",
    titulo: "Pesquisa de clima trimestral",
    data: "10/04/2026",
    resumo: "A pesquisa estará disponível no Termômetro entre 12 e 26 de abril. Sua opinião é anônima.",
  },
  {
    id: "c6",
    titulo: "Atualização do plano de saúde",
    data: "05/04/2026",
    resumo: "Novas opções de plano com cobertura nacional. Veja detalhes na seção Benefícios.",
  },
];

export default function MuralPage() {
  return (
    <div>
      <PageHeader
        title="Mural"
        subtitle="Comunicados e novidades da empresa e do seu time."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {comunicados.map((c) => (
          <article
            key={c.id}
            className="bg-card border border-border rounded-2xl p-5 shadow-card transition-all hover:border-primary/40"
          >
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
