import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import {
  BookOpen,
  ChevronDown,
  Users,
  Sparkles,
  UserPlus,
  Clock,
  CheckCircle2,
  Briefcase,
  Headphones,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FaqItem {
  id: string;
  pergunta: string;
  resposta: string;
  categoria: string;
  icon: LucideIcon;
}

const faqMock: FaqItem[] = [
  { id: "q1", categoria: "Plataforma", icon: Users,
    pergunta: "Como meus colaboradores acessam o Hub?",
    resposta: 'Cada colaborador recebe um convite por e-mail com o link de acesso ao Hub. A URL de entrada é /hub/colaborador/inicio. Se precisar reenviar convites ou adicionar novos colaboradores, entre em contato com seu consultor Azumi.' },
  { id: "q2", categoria: "Plataforma", icon: Sparkles,
    pergunta: "Como funciona o período de teste de módulos?",
    resposta: 'Módulos em teste ficam totalmente disponíveis para sua equipe durante o período de trial (você vê as datas em Gestão de Conta → Módulos). Ao final do período, o módulo é automaticamente desativado caso não seja contratado. Nenhum dado é perdido.' },
  { id: "q3", categoria: "Plataforma", icon: UserPlus,
    pergunta: "Como adiciono novos usuários ao Connect?",
    resposta: 'Acesse Gestão de Conta → Usuários e clique em "Convidar usuário". Insira o e-mail e defina o papel (Admin, Gestor, Financeiro). O novo usuário receberá um link de acesso em até 5 minutos.' },
  { id: "q4", categoria: "Projetos e Horas", icon: Clock,
    pergunta: "Como visualizo o relatório de horas do mês?",
    resposta: 'No menu lateral, acesse Horas. Use os filtros de período e colaborador para gerar o relatório. Você pode exportar em CSV clicando no botão "Exportar" no canto superior direito.' },
  { id: "q5", categoria: "Projetos e Horas", icon: CheckCircle2,
    pergunta: "Posso aprovar horas diretamente pela plataforma?",
    resposta: 'Sim. As horas lançadas pelos consultores Azumi ficam disponíveis na aba Horas com status "Pendente". Clique em "Aprovar" para confirmar ou "Solicitar revisão" para pedir ajuste com comentário.' },
  { id: "q6", categoria: "Atração & Hunting", icon: Briefcase,
    pergunta: "Como acompanho o status de uma vaga em aberto?",
    resposta: 'Acesse Atração no menu lateral. Cada vaga exibe a fase atual no funil (Triagem, Entrevista, Proposta). Clique na vaga para ver o pipeline completo com os candidatos em cada etapa.' },
  { id: "q7", categoria: "Suporte", icon: Headphones,
    pergunta: "Como entro em contato com meu consultor responsável?",
    resposta: 'Use a área de Solicitações para abrir um chamado. Seu consultor dedicado recebe a notificação e responde em até 1 dia útil. Para urgências, clique em "Falar com consultor" no rodapé do menu lateral — lá você encontra o contato direto.' },
];

export default function ClienteGuiaPage() {
  const [abertos, setAbertos] = useState<Record<string, boolean>>({});

  function toggle(id: string) {
    setAbertos((p) => ({ ...p, [id]: !p[id] }));
  }

  const categorias = [...new Set(faqMock.map((f) => f.categoria))];

  return (
    <div>
      <PageHeader
        title="Guia / FAQ"
        subtitle="Perguntas frequentes sobre o uso do Azumi Connect e do Hub."
      />

      {faqMock.length === 0 ? (
        <div className="bg-card border border-border rounded-xl">
          <EmptyState
            icon={BookOpen}
            title="Nenhuma pergunta cadastrada"
            description="O guia de perguntas frequentes ainda está sendo preparado."
          />
        </div>
      ) : (
        <div className="space-y-6">
          {categorias.map((cat) => (
            <div key={cat} className="bg-card border border-border rounded-2xl shadow-card overflow-hidden">
              <div className="px-5 py-3 border-b border-border bg-secondary/30 flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" />
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{cat}</span>
              </div>
              <ul className="divide-y divide-border">
                {faqMock.filter((f) => f.categoria === cat).map((f) => {
                  const Icon = f.icon;
                  return (
                    <li key={f.id}>
                      <button
                        onClick={() => toggle(f.id)}
                        className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-secondary/20 transition-colors"
                      >
                        <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                          <Icon className="h-4 w-4" />
                        </div>
                        <span className="flex-1 text-sm font-medium">{f.pergunta}</span>
                        <ChevronDown className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform", abertos[f.id] && "rotate-180")} />
                      </button>
                      {abertos[f.id] && (
                        <div className="px-5 pb-4 pl-16">
                          <p className="text-sm text-muted-foreground leading-relaxed">{f.resposta}</p>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
