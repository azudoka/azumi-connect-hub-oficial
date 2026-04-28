import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { CheckCircle2, MessageSquare, Send, ThumbsUp } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { timeLider, iniciaisDe } from "./_timeData";

type TipoFb = "positivo" | "construtivo";

interface FbItem {
  id: string;
  colaboradorId: string;
  colaboradorNome: string;
  tipo: TipoFb;
  data: string;
  texto: string;
}

const tipoStyle: Record<TipoFb, { label: string; cls: string; Icon: typeof ThumbsUp }> = {
  positivo: {
    label: "Positivo",
    cls: "bg-success/15 text-success border-success/30",
    Icon: ThumbsUp,
  },
  construtivo: {
    label: "Construtivo",
    cls: "bg-primary/15 text-primary border-primary/30",
    Icon: MessageSquare,
  },
};

const HISTORICO_INICIAL: FbItem[] = [
  { id: "f1", colaboradorId: "c1", colaboradorNome: "Marina Costa", tipo: "positivo", data: "18/04/2026", texto: "Excelente condução do projeto de revisão de cargos e salários — entrega no prazo e com qualidade acima do esperado." },
  { id: "f2", colaboradorId: "c4", colaboradorNome: "Beatriz Lins", tipo: "construtivo", data: "10/04/2026", texto: "Precisamos alinhar a cadência semanal de devolutiva aos candidatos." },
  { id: "f3", colaboradorId: "c2", colaboradorNome: "Pedro Alves", tipo: "positivo", data: "02/04/2026", texto: "Liderança técnica nas operações continua referência para o time." },
  { id: "f4", colaboradorId: "c3", colaboradorNome: "Lucas Ferreira", tipo: "positivo", data: "28/03/2026", texto: "Documentação de DP organizada e processos otimizados após sua entrada." },
  { id: "f5", colaboradorId: "c5", colaboradorNome: "Rafael Mendes", tipo: "construtivo", data: "20/03/2026", texto: "Sugestão: ampliar visibilidade dos estudos de mercado para o time todo." },
  { id: "f6", colaboradorId: "c6", colaboradorNome: "Juliana Lima", tipo: "positivo", data: "15/03/2026", texto: "Postura proativa e ótima curva de aprendizado no estágio." },
  { id: "f7", colaboradorId: "c1", colaboradorNome: "Marina Costa", tipo: "construtivo", data: "08/03/2026", texto: "Atenção a delegação — algumas atividades podem ser passadas para o time." },
  { id: "f8", colaboradorId: "c2", colaboradorNome: "Pedro Alves", tipo: "positivo", data: "01/03/2026", texto: "Apresentação muito clara no comitê de operações." },
];

export default function FeedbackPage() {
  const [historico, setHistorico] = useState<FbItem[]>(HISTORICO_INICIAL);
  const [colab, setColab] = useState("");
  const [tipo, setTipo] = useState<TipoFb>("positivo");
  const [texto, setTexto] = useState("");
  const [confirmado, setConfirmado] = useState(false);

  function reset() {
    setColab("");
    setTipo("positivo");
    setTexto("");
  }

  function enviar() {
    if (!colab) {
      toast.error("Selecione um colaborador.");
      return;
    }
    if (texto.trim().length < 15) {
      toast.error("A mensagem precisa ter ao menos 15 caracteres.");
      return;
    }
    const c = timeLider.find((x) => x.id === colab)!;
    const novo: FbItem = {
      id: `f${Date.now()}`,
      colaboradorId: c.id,
      colaboradorNome: c.nome,
      tipo,
      data: new Date().toLocaleDateString("pt-BR"),
      texto: texto.trim(),
    };
    setHistorico((prev) => [novo, ...prev]);
    setConfirmado(true);
    reset();
    toast.success("Feedback enviado.");
    setTimeout(() => setConfirmado(false), 4000);
  }

  return (
    <div>
      <PageHeader
        title="Feedback"
        subtitle="Envie e acompanhe os feedbacks do seu time."
      />

      <Tabs defaultValue="enviar">
        <TabsList className="rounded-full">
          <TabsTrigger value="enviar" className="rounded-full">
            Enviar feedback
          </TabsTrigger>
          <TabsTrigger value="historico" className="rounded-full">
            Histórico
          </TabsTrigger>
        </TabsList>

        <TabsContent value="enviar" className="mt-5">
          <section className="bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-card max-w-2xl">
            {confirmado && (
              <div className="mb-5 flex items-center gap-2 rounded-xl border border-success/40 bg-success/10 text-success px-4 py-3 text-sm">
                <CheckCircle2 className="h-4 w-4" />
                Feedback enviado com sucesso.
              </div>
            )}

            <div className="space-y-4">
              <div>
                <Label className="text-xs">Colaborador</Label>
                <Select value={colab} onValueChange={setColab}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeLider.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.nome} — {c.cargo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs">Tipo</Label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {(Object.keys(tipoStyle) as TipoFb[]).map((t) => {
                    const cfg = tipoStyle[t];
                    const Icon = cfg.Icon;
                    const ativo = tipo === t;
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTipo(t)}
                        className={cn(
                          "flex items-center justify-center gap-2 px-3 py-2.5 rounded-full border text-sm transition-colors",
                          ativo
                            ? cfg.cls
                            : "border-border hover:bg-secondary/40 text-foreground"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        {cfg.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <Label className="text-xs">
                  Mensagem <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  value={texto}
                  onChange={(e) => setTexto(e.target.value)}
                  rows={5}
                  className="mt-1"
                  placeholder="Escreva o feedback de forma clara e objetiva…"
                />
              </div>

              <div className="flex justify-end">
                <Button className="rounded-full" onClick={enviar}>
                  <Send className="h-4 w-4 mr-1.5" />
                  Enviar feedback
                </Button>
              </div>
            </div>
          </section>
        </TabsContent>

        <TabsContent value="historico" className="mt-5">
          <section className="bg-card border border-border rounded-2xl shadow-card overflow-hidden">
            <ul className="divide-y divide-border">
              {historico.map((f) => {
                const cfg = tipoStyle[f.tipo];
                const Icon = cfg.Icon;
                return (
                  <li key={f.id} className="p-4 flex items-start gap-3">
                    <div className="h-10 w-10 rounded-md bg-secondary text-foreground/80 flex items-center justify-center text-xs font-semibold shrink-0">
                      {iniciaisDe(f.colaboradorNome)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium">{f.colaboradorNome}</span>
                        <span className={cn("badge-pill", cfg.cls)}>
                          <Icon className="h-3 w-3" />
                          {cfg.label}
                        </span>
                        <span className="text-xs text-muted-foreground ml-auto">
                          {f.data}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                        {f.texto}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        </TabsContent>
      </Tabs>
    </div>
  );
}
