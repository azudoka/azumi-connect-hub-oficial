import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { CheckCircle2, FileText } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type StatusLeitura = "lido" | "pendente";

interface Politica {
  id: string;
  titulo: string;
  publicado: string;
  status: StatusLeitura;
  texto: string[];
}

const iniciais: Politica[] = [
  {
    id: "p1",
    titulo: "Código de Conduta Ética",
    publicado: "10/01/2026",
    status: "lido",
    texto: [
      "Nosso código de conduta estabelece os princípios fundamentais que orientam o comportamento esperado de todos os colaboradores em suas relações internas e externas.",
      "Tratamos com respeito qualquer pessoa, independentemente de gênero, raça, orientação, religião ou condição. Atos de assédio ou discriminação são intoleráveis e estão sujeitos a desligamento imediato.",
      "Em caso de dúvida ou denúncia, utilize o canal seguro disponível na seção Ajuda ou contate diretamente o RH.",
    ],
  },
  {
    id: "p2",
    titulo: "Política de Home Office e Trabalho Híbrido",
    publicado: "22/02/2026",
    status: "pendente",
    texto: [
      "O regime híbrido permite que cada colaborador trabalhe até 3 dias por semana de forma remota, mediante alinhamento com o líder direto.",
      "Os dias presenciais devem priorizar reuniões, workshops e atividades colaborativas. A escolha dos dias remotos é flexível, respeitando a rotina da equipe.",
      "O auxílio home office é pago mensalmente em folha para custear infraestrutura e energia, conforme tabela vigente.",
    ],
  },
  {
    id: "p3",
    titulo: "Política de Férias",
    publicado: "05/03/2026",
    status: "pendente",
    texto: [
      "As férias devem ser planejadas com antecedência mínima de 30 dias e aprovadas pelo líder direto, considerando a operação da equipe.",
      "É permitido fracionar em até 3 períodos, sendo um deles obrigatoriamente de no mínimo 14 dias corridos.",
      "A solicitação de férias é feita pelo Hub do Colaborador, na seção Férias.",
    ],
  },
  {
    id: "p4",
    titulo: "Política de Segurança da Informação",
    publicado: "18/02/2026",
    status: "lido",
    texto: [
      "Todos os dados de clientes, colaboradores e parceiros são confidenciais e devem ser tratados com o máximo cuidado.",
      "Senhas devem ter no mínimo 12 caracteres, com letras, números e símbolos. Não compartilhe senhas e ative o segundo fator de autenticação em todos os sistemas corporativos.",
      "Em caso de perda ou suspeita de comprometimento de equipamento, comunique imediatamente o time de TI.",
    ],
  },
  {
    id: "p5",
    titulo: "Política de Diversidade e Inclusão",
    publicado: "12/01/2026",
    status: "lido",
    texto: [
      "Acreditamos que ambientes diversos geram melhores resultados. Nossa política reforça o compromisso com equidade de oportunidades em todas as etapas do ciclo de pessoas.",
      "Promovemos ações afirmativas em processos seletivos para grupos historicamente sub-representados, garantindo critérios técnicos e justos.",
      "Treinamentos obrigatórios sobre vieses inconscientes são oferecidos a todas as lideranças anualmente.",
    ],
  },
  {
    id: "p6",
    titulo: "Política de Reembolso de Despesas",
    publicado: "01/04/2026",
    status: "pendente",
    texto: [
      "Despesas de viagem, alimentação em deslocamento e materiais para projetos podem ser reembolsadas mediante apresentação de nota fiscal.",
      "O envio é feito pelo sistema de reembolsos em até 5 dias úteis após a despesa, com o aprovador correto selecionado.",
      "Valores acima de R$ 500,00 exigem aprovação prévia do gestor.",
    ],
  },
];

export default function PoliticasColabPage() {
  const [politicas, setPoliticas] = useState<Politica[]>(iniciais);

  function marcarLido(id: string) {
    setPoliticas((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: "lido" } : p))
    );
    toast.success("Política marcada como lida.");
  }

  const pendentes = politicas.filter((p) => p.status === "pendente").length;

  return (
    <div>
      <PageHeader
        title="Políticas internas"
        subtitle={
          pendentes > 0
            ? `${pendentes} política${pendentes > 1 ? "s" : ""} aguardando sua leitura.`
            : "Todas as políticas estão em dia. Obrigado!"
        }
      />

      <section className="bg-card border border-border rounded-2xl p-2 sm:p-4 shadow-card">
        <Accordion type="single" collapsible className="w-full">
          {politicas.map((p) => (
            <AccordionItem key={p.id} value={p.id}>
              <AccordionTrigger className="px-3 hover:no-underline">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <FileText className="h-4 w-4 text-primary shrink-0" />
                  <div className="text-left min-w-0 flex-1">
                    <div className="text-sm font-medium truncate">{p.titulo}</div>
                    <div className="text-xs text-muted-foreground">Publicado em {p.publicado}</div>
                  </div>
                  <span
                    className={cn(
                      "badge-pill shrink-0 mr-2",
                      p.status === "lido"
                        ? "bg-success/15 text-success border-success/30"
                        : "bg-warning/15 text-warning border-warning/30"
                    )}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
                    {p.status === "lido" ? "Lido" : "Pendente"}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-3 pb-4 space-y-3 text-sm text-muted-foreground leading-relaxed">
                {p.texto.map((par, i) => (
                  <p key={i}>{par}</p>
                ))}
                {p.status === "pendente" && (
                  <div className="pt-2">
                    <Button
                      className="rounded-full"
                      onClick={() => marcarLido(p.id)}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-1.5" />
                      Marcar como lido
                    </Button>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </div>
  );
}
