import { PageHeader } from "@/components/PageHeader";
import { SectionDivider } from "@/components/SectionDivider";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HelpCircle, Send, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type Categoria = "assedio" | "discriminacao" | "fraude" | "outro";
const categoriaLabel: Record<Categoria, string> = {
  assedio: "Assédio",
  discriminacao: "Discriminação",
  fraude: "Fraude",
  outro: "Outro",
};

interface Pergunta {
  id: string;
  pergunta: string;
  resposta: string;
}

const faq: Pergunta[] = [
  {
    id: "f1",
    pergunta: "Como solicito minhas férias?",
    resposta:
      "Acesse o menu Férias no Hub do Colaborador, clique em 'Solicitar férias' e selecione o período desejado. A solicitação é enviada ao seu líder para aprovação. O período mínimo é de 5 dias.",
  },
  {
    id: "f2",
    pergunta: "Onde encontro meus benefícios e como uso?",
    resposta:
      "Na seção Benefícios você vê todos os benefícios ativos, valores e regras de uso. Cartões de vale-alimentação e vale-refeição são creditados todo dia 1º. Em caso de problemas, abra uma solicitação ao RH.",
  },
  {
    id: "f3",
    pergunta: "Como baixo meu holerite?",
    resposta:
      "Vá até Holerites, escolha o ano desejado e clique em 'Baixar PDF' no mês correspondente. Holerites ficam disponíveis até o 5º dia útil do mês seguinte.",
  },
  {
    id: "f4",
    pergunta: "Como funciona o regime de home office?",
    resposta:
      "Permitimos até 3 dias remotos por semana, alinhados com o líder direto. Os dias presenciais devem priorizar atividades colaborativas. Auxílio home office é pago mensalmente em folha.",
  },
  {
    id: "f5",
    pergunta: "Quem é meu contato no RH?",
    resposta:
      "Sua consultora de RH é a Camila Reis. Você também pode abrir solicitações pela seção Solicitações do Hub, que são distribuídas automaticamente conforme o tipo.",
  },
  {
    id: "f6",
    pergunta: "Como funciona o desligamento?",
    resposta:
      "Em caso de desligamento, o RH conduz uma entrevista de saída e formaliza toda a documentação trabalhista (TRCT, GRRF, exames). Verbas rescisórias são pagas no prazo legal de 10 dias corridos.",
  },
];

export default function AjudaPage() {
  const [categoria, setCategoria] = useState<Categoria>("outro");
  const [descricao, setDescricao] = useState("");
  const [protocolo, setProtocolo] = useState<string | null>(null);

  function enviar() {
    if (descricao.trim().length < 20) {
      toast.error("Descreva a situação com pelo menos 20 caracteres.");
      return;
    }
    const proto = `${Math.floor(1000 + Math.random() * 9000)}`;
    setProtocolo(proto);
    setDescricao("");
    setCategoria("outro");
  }

  return (
    <div>
      <PageHeader
        title="Ajuda e canal seguro"
        subtitle="Tire dúvidas e acione o RH com total confidencialidade quando precisar."
      />

      <section className="bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-card">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <HelpCircle className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-display text-lg font-semibold">Perguntas frequentes</h2>
            <p className="text-xs text-muted-foreground">
              Respostas rápidas para as dúvidas mais comuns.
            </p>
          </div>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {faq.map((f) => (
            <AccordionItem key={f.id} value={f.id}>
              <AccordionTrigger className="text-left text-sm font-medium hover:no-underline">
                {f.pergunta}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                {f.resposta}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <SectionDivider>Canal seguro</SectionDivider>

      <section className="rounded-2xl border-2 border-primary/30 bg-primary/5 p-6 sm:p-7 shadow-card">
        <div className="flex items-start gap-4 mb-5">
          <div className="h-12 w-12 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shrink-0">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <h2 className="font-display text-lg font-semibold">Canal de denúncia</h2>
            <p className="text-sm text-muted-foreground leading-relaxed mt-1">
              Sua denúncia é <strong className="text-foreground">100% anônima</strong> e tratada
              por um comitê independente. Nenhum dado de identificação é coletado e nenhuma
              retaliação será tolerada. Use este canal para reportar situações de assédio,
              discriminação, fraude ou qualquer violação ao código de conduta.
            </p>
          </div>
        </div>

        {protocolo ? (
          <div className="rounded-xl border border-success/40 bg-success/10 p-5">
            <div className="flex items-start gap-3">
              <div className="h-9 w-9 rounded-lg bg-success/20 text-success flex items-center justify-center shrink-0">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="font-display font-semibold text-success">
                  Sua denúncia foi recebida com segurança.
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Guarde seu protocolo para acompanhamento futuro:
                </p>
                <div className="font-data text-lg font-semibold mt-2">#{protocolo}</div>
                <Button
                  variant="outline"
                  className="rounded-full mt-4"
                  onClick={() => setProtocolo(null)}
                >
                  Registrar nova denúncia
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label className="text-xs">Categoria</Label>
              <Select
                value={categoria}
                onValueChange={(v) => setCategoria(v as Categoria)}
              >
                <SelectTrigger className="mt-1 bg-card">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(categoriaLabel) as Categoria[]).map((c) => (
                    <SelectItem key={c} value={c}>
                      {categoriaLabel[c]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs">
                Descrição{" "}
                <span className="text-muted-foreground">(mínimo 20 caracteres)</span>
              </Label>
              <Textarea
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                rows={5}
                className="mt-1 bg-card"
                placeholder="Descreva o ocorrido com o máximo de detalhes possível: data, local, pessoas envolvidas, contexto…"
              />
              <div className="text-[11px] text-muted-foreground mt-1">
                {descricao.trim().length}/20
              </div>
            </div>

            <div className="flex justify-end">
              <Button className="rounded-full" onClick={enviar}>
                <Send className="h-4 w-4 mr-1.5" />
                Enviar denúncia
              </Button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
