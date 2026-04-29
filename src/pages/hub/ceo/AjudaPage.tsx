import { PageHeader } from "@/components/PageHeader";
import { HelpCircle, Mail, Phone, Clock } from "lucide-react";

const faq = [
  { p: "Como solicito um relatório executivo?", r: "Acesse 'Solicitações' e abra uma nova demanda. O time de RH responde em até 3 dias úteis." },
  { p: "Quem aprova mudanças em políticas?", r: "O CEO valida diretrizes estratégicas; o time de RH conduz implementação e comunicação." },
  { p: "Como acompanho indicadores em tempo real?", r: "Use o Dashboard executivo para uma visão consolidada de headcount, clima e financeiro." },
  { p: "Posso falar diretamente com a Azumi?", r: "Sim. Use os canais abaixo para suporte direto da equipe Azumi." },
];

export default function AjudaPage() {
  return (
    <div>
      <PageHeader title="Ajuda" subtitle="Como acionar o time de RH e o suporte da Azumi." />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-2xl shadow-card p-5 lg:col-span-2">
          <div className="flex items-center gap-2 mb-4"><HelpCircle className="h-4 w-4 text-primary" /><h3 className="font-display font-semibold text-sm">Perguntas frequentes</h3></div>
          <div className="space-y-4">
            {faq.map((f) => (
              <div key={f.p}>
                <p className="font-medium text-sm">{f.p}</p>
                <p className="text-sm text-muted-foreground mt-1">{f.r}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl shadow-card p-5">
          <h3 className="font-display font-semibold text-sm mb-4">Contato</h3>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" /> suporte@azumi.com.br</li>
            <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" /> 0800 123 4567</li>
            <li className="flex items-center gap-2"><Clock className="h-4 w-4 text-muted-foreground" /> Seg a sex, 9h às 18h</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
