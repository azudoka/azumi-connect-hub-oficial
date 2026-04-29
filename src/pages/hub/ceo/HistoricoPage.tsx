import { PageHeader } from "@/components/PageHeader";
import { History } from "lucide-react";

const eventos = [
  { data: "Abr/2026", titulo: "Lançamento de programa de clima", descricao: "Início do termômetro mensal e pesquisas de pulso." },
  { data: "Mar/2026", titulo: "Novo plano de benefícios", descricao: "Inclusão de plataforma de bem-estar e auxílio educação." },
  { data: "Jan/2026", titulo: "Reestruturação da área de Operações", descricao: "Criação de duas novas células e novo modelo de liderança." },
  { data: "Nov/2025", titulo: "Revisão da política de home office", descricao: "Modelo híbrido com até 3 dias remotos." },
  { data: "Set/2025", titulo: "Programa de mentoria interna", descricao: "Lançamento da primeira turma com 18 mentores." },
];

export default function HistoricoPage() {
  return (
    <div>
      <PageHeader title="Histórico" subtitle="Linha do tempo das principais iniciativas de RH e pessoas." />
      <div className="bg-card border border-border rounded-2xl shadow-card p-6">
        <ol className="space-y-5">
          {eventos.map((e, i) => (
            <li key={i} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center"><History className="h-4 w-4" /></div>
                {i < eventos.length - 1 && <div className="w-px flex-1 bg-border mt-2" />}
              </div>
              <div className="pb-2">
                <p className="text-xs text-muted-foreground font-data">{e.data}</p>
                <h3 className="font-display font-semibold text-base">{e.titulo}</h3>
                <p className="text-sm text-muted-foreground mt-0.5">{e.descricao}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
